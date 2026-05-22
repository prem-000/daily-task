"use client";

import React, { useState, useEffect, useRef } from "react";
import NavigationWrapper from "@/components/NavigationWrapper";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/ui/auth-provider";
import { useToast } from "@/components/ui/toast";
import { 
  Send, Sparkles, AlertCircle, Calendar, Clock, Check, Plus, Loader2 
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  task_json: {
    title: string;
    subject: "Math" | "Science" | "English" | "History" | "Other";
    due_date: string;
    due_time: string | null;
    priority: "high" | "medium" | "low";
    description: string;
  } | null;
  created_at: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const supabase = createClient();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [addedTaskIds, setAddedTaskIds] = useState<Record<string, boolean>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load chat history on mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Failed to load chat history:", error);
        } else if (data) {
          setMessages(data as ChatMessage[]);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };

    fetchChatHistory();
  }, [user, supabase]);

  // Scroll to bottom when messages or loading state changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading || !user) return;

    setLoading(true);
    setInputValue("");

    // Optimistically add user message to UI
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text,
      task_json: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to send message" }));
        throw new Error(errorData.error || "Failed to send message");
      }

      const data = await response.json();
      if (data.success) {
        // Replace temp message with real database messages
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
          return [...filtered, data.userMessage, data.assistantMessage];
        });
      } else {
        throw new Error(data.error || "Failed to process chat message");
      }
    } catch (error: any) {
      console.error("Send message error:", error);
      showToast(error.message || "Failed to send message", "error");
      
      // Remove temp message and add error feedback
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I ran into an error. Please make sure your database is configured and try again.",
          task_json: null,
          created_at: new Date().toISOString(),
        };
        return [...filtered, errorMsg];
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddExtractedTask = async (msgId: string, task: NonNullable<ChatMessage["task_json"]>) => {
    if (!user) {
      showToast("Please log in to add tasks", "error");
      return;
    }

    console.log("Adding task to calendar:", task);

    // ── Date / Time Validation ──────────────────────────────────────────────
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`; // "YYYY-MM-DD" in local time
    const taskDateStr = task.due_date; // "YYYY-MM-DD"

    const showRejectionMessage = (reason: string) => {
      showToast(reason, "error");
      // Append an assistant bubble so the user sees the rejection in chat
      setMessages((prev) => [
        ...prev,
        {
          id: `reject-${Date.now()}`,
          role: "assistant",
          content:
            "⚠️ I couldn't add this task because the due date or time has already passed. Please give me a future date and time.",
          task_json: null,
          created_at: new Date().toISOString(),
        },
      ]);
    };

    // Rule 1 — due_date is strictly in the past
    if (taskDateStr < todayStr) {
      showRejectionMessage("Cannot add task — due date is in the past.");
      return;
    }

    // Rule 2 — due_date is today AND due_time is already past
    if (taskDateStr === todayStr && task.due_time) {
      const [hours, minutes] = task.due_time.split(":").map(Number);
      const taskDateTime = new Date();
      taskDateTime.setHours(hours, minutes, 0, 0);

      if (taskDateTime < now) {
        showRejectionMessage("Cannot add task — the time has already passed today.");
        return;
      }
    }
    // ── End Validation ──────────────────────────────────────────────────────

    try {
      // Build task data with only optional fields that have values
      let taskData: Record<string, any> = {
        user_id: user.id,
        title: task.title,
        subject: task.subject,
        due_date: task.due_date,
        priority: task.priority,
        status: "pending",
      };

      if (task.due_time) taskData.due_time = task.due_time;
      if (task.description) taskData.description = task.description;

      // Retry loop: drop columns that the DB doesn't have (PGRST204)
      let lastError: any = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        const { data, error } = await supabase
          .from("tasks")
          .insert(taskData)
          .select();

        if (!error) {
          console.log("Task added successfully:", data);
          showToast("Added to Calendar ✓", "success");
          setAddedTaskIds((prev) => ({ ...prev, [msgId]: true }));
          return;
        }

        lastError = error;
        console.error(`Insert task error (attempt ${attempt + 1}):`, error);

        // If a column is missing from the schema, drop it and retry
        if (error.code === "PGRST204") {
          // Extract column name from the error message, e.g. "Could not find the 'due_time' column..."
          const match = error.message?.match(/Could not find the '(\w+)' column/);
          if (match) {
            const missingCol = match[1];
            console.log(`Retrying without '${missingCol}' field...`);
            const { [missingCol]: _dropped, ...rest } = taskData;
            taskData = rest;
            continue; // retry with reduced taskData
          }
        }

        // For any other error, stop immediately
        break;
      }

      console.error("Failed to add task after retries:", lastError);
      showToast(`Failed to add task: ${lastError?.message ?? "Unknown error"}`, "error");
    } catch (err: any) {
      console.error("Insert task error:", err);
      showToast(err.message || "An unexpected error occurred", "error");
    }
  };

  const suggestionChips = [
    "Math homework due Friday",
    "Science project next week",
    "Read English chapter 3",
  ];

  const subjectColors: Record<string, string> = {
    Math: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    Science: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    English: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    History: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    Other: "bg-zinc-500/20 text-zinc-400 border border-zinc-500/30",
  };

  const priorityColors = {
    high: "bg-red-500/10 text-red-400 border border-red-500/20",
    medium: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    low: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  };

  return (
    <NavigationWrapper>
      <div className="flex flex-col h-screen bg-[#0A0F1E] relative">
        {/* Top Header */}
        <header className="p-4 md:p-6 border-b border-white/5 bg-black/10 backdrop-blur-md flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#00D4AA]/30 to-[#00D4AA] shadow-md shadow-[#00D4AA]/10">
              <Sparkles size={18} className="text-black" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Study Assistant</h2>
              <p className="text-[10px] text-white/50">Gemini 1.5 Flash task extractor</p>
            </div>
          </div>
        </header>

        {/* Message Panel */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.length === 0 && !loading ? (
            <div className="h-full flex flex-col justify-center items-center text-center max-w-sm mx-auto px-4">
              <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/5 mb-6">
                <Sparkles className="h-10 w-10 text-[#00D4AA]" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight mb-2">
                What's on your plate today?
              </h1>
              <p className="text-xs text-white/40 leading-relaxed mb-8">
                Type what study assignments, tasks, or exams you need to set up in plain English.
              </p>

              {/* Suggestion Chips */}
              <div className="flex flex-col gap-2.5 w-full">
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(chip)}
                    className="w-full text-left py-3.5 px-5 text-xs text-white/60 bg-white/[0.02] hover:bg-white/[0.05] hover:text-white border border-white/5 rounded-2xl cursor-pointer transition-all duration-200"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-2xl mx-auto pb-12">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed border transition-all ${
                        isUser
                          ? "bg-[#00D4AA] border-[#00D4AA]/20 text-black font-semibold rounded-tr-none"
                          : "bg-white/[0.03] border-white/5 text-white rounded-tl-none"
                      }`}
                    >
                      <p>{msg.content}</p>

                      {/* Display Task Card if present in Assistant Msg */}
                      {!isUser && msg.task_json && (
                        <div className="mt-4 p-4 rounded-2xl bg-black/45 border border-white/10 flex flex-col gap-3">
                          <div className="flex justify-between items-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${subjectColors[msg.task_json.subject] || subjectColors.Other}`}>
                              {msg.task_json.subject}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${priorityColors[msg.task_json.priority]}`}>
                              {msg.task_json.priority} Priority
                            </span>
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-white">{msg.task_json.title}</h4>
                            {msg.task_json.description && (
                              <p className="text-xs text-white/40 mt-1 leading-relaxed">{msg.task_json.description}</p>
                            )}
                          </div>

                          <div className="flex flex-col gap-1 border-t border-white/[0.05] pt-2 mt-1">
                            <div className="flex items-center gap-1.5 text-[10px] text-white/50">
                              <Calendar className="h-3 w-3 text-[#00D4AA]" />
                              Due: {msg.task_json.due_date}
                            </div>
                            {msg.task_json.due_time && (
                              <div className="flex items-center gap-1.5 text-[10px] text-white/50">
                                <Clock className="h-3 w-3 text-[#00D4AA]" />
                                Time: {msg.task_json.due_time}
                              </div>
                            )}
                          </div>

                          {/* [+ Add to Calendar] button */}
                          <button
                            onClick={() => handleAddExtractedTask(msg.id, msg.task_json!)}
                            disabled={addedTaskIds[msg.id]}
                            className={`w-full py-2.5 rounded-xl font-extrabold text-[10px] tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              addedTaskIds[msg.id]
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 pointer-events-none"
                                : "bg-gradient-to-r from-[#00D4AA] to-emerald-500 text-black hover:scale-[1.01]"
                            }`}
                          >
                            {addedTaskIds[msg.id] ? (
                              <>
                                <Check className="h-3 w-3 stroke-[3]" /> Added ✓
                              </>
                            ) : (
                              <>
                                <Plus className="h-3 w-3 stroke-[3]" /> Add to Calendar
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <span className="text-[9px] text-white/20 font-semibold uppercase tracking-wider mt-1 px-1.5">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {loading && (
                <div className="flex flex-col items-start">
                  <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#00D4AA] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 bg-[#00D4AA] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 bg-[#00D4AA] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}
        </main>

        {/* Input box */}
        <div className="p-4 md:p-6 border-t border-white/5 bg-black/10 backdrop-blur-md z-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="flex items-center gap-3 max-w-2xl mx-auto"
          >
            <input
              type="text"
              disabled={loading}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. Schedule Math homework due Friday at 2 PM..."
              className="flex-1 px-5 py-4 rounded-2xl bg-white/[0.02] border border-white/10 text-sm text-white placeholder-white/30 focus:border-[#00D4AA] focus:outline-none transition-all disabled:opacity-50"
            />
            
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="p-4 rounded-2xl bg-gradient-to-tr from-[#00D4AA] to-emerald-500 text-black hover:scale-105 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send size={18} strokeWidth={2.5} />
            </button>
          </form>
        </div>
      </div>
    </NavigationWrapper>
  );
}
