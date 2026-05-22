import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRouteClient } from "@/lib/supabase-server";
import { getAuthUser } from "@/lib/auth";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthUser(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await request.json();
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const supabase = await createRouteClient();

    // 1. Insert user message into database
    const { data: userMsgData, error: userMsgErr } = await supabase
      .from("chat_messages")
      .insert({
        user_id: session.userId,
        role: "user",
        content: message.trim(),
      })
      .select()
      .single();

    if (userMsgErr) {
      console.error("Error inserting user message:", userMsgErr);
    }

    if (!genAI) {
      return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
    }

    // 2. Call Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    });

    const todayStr = new Date().toISOString().split("T")[0];
    const nowISO = new Date().toISOString();

    const systemPrompt = `You are a student task assistant. Analyze the student's message and extract task details. Return ONLY a JSON object:
{
  "title": "string",
  "subject": "Math" | "Science" | "English" | "History" | "Other",
  "due_date": "YYYY-MM-DD",
  "due_time": "HH:MM" or null,
  "priority": "high" | "medium" | "low",
  "description": "string"
}

IMPORTANT RULES:
- Today is ${todayStr}. Current time (UTC) is ${nowISO}.
- If no date is mentioned, assume today (${todayStr}).
- If the user provides a due_date that is BEFORE today, or a due_date of today with a due_time that is already in the past, you must still extract the JSON faithfully — the app will reject it and inform the user. Do NOT silently change the date.
- If the user explicitly asks for a past date or time, extract it as-is; the app will show them an error and ask for a future date/time.
- Prefer the user's literal words. Only infer a date when none is given.
Return ONLY the JSON, no extra text.`;

    const chatSession = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I will parse all student messages and return only the structured JSON task representation." }],
        },
      ],
    });

    const result = await chatSession.sendMessage(message.trim());
    const aiResponseText = result.response.text().trim();

    // 3. Parse JSON
    let taskJson = null;
    let assistantContent = "I extracted a new task for your planner. Review the details below to add it to your calendar!";
    
    try {
      taskJson = JSON.parse(aiResponseText);
      // Basic validation
      if (!taskJson.title) {
        taskJson = null;
        assistantContent = "I listened, but I couldn't extract any specific task title. Try saying something like: 'Math homework due tomorrow at 5 PM'.";
      }
    } catch (parseErr) {
      console.error("Gemini output parsing error. Raw output:", aiResponseText);
      assistantContent = "Sorry, I couldn't structure that task successfully. Could you please specify the subject and due date more clearly?";
    }

    // 4. Insert assistant response into chat_messages
    const { data: assistantMsgData, error: assistantMsgErr } = await supabase
      .from("chat_messages")
      .insert({
        user_id: session.userId,
        role: "assistant",
        content: assistantContent,
        task_json: taskJson,
      })
      .select()
      .single();

    if (assistantMsgErr) {
      console.error("Error inserting assistant message:", assistantMsgErr);
      return NextResponse.json({ error: "Failed to store message history" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      userMessage: userMsgData,
      assistantMessage: assistantMsgData,
    });

  } catch (error) {
    console.error("Chat API route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
