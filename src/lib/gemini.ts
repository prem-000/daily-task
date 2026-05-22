import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client with safe API key check
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface ParsedTask {
  title: string;
  subject: string | null;
  due_date: string; // ISO format: YYYY-MM-DD
  priority: 'low' | 'medium' | 'high';
}

export async function parseTasksFromMessage(
  message: string,
  currentDate: Date = new Date()
): Promise<ParsedTask[]> {
  if (!genAI) {
    console.error('Gemini API key is not configured.');
    throw new Error('AI service configuration error: GEMINI_API_KEY is missing');
  }

  // Use Gemini 2.5 Flash model
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.3, // Low temperature for consistent JSON output
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
  });

  const prompt = buildPrompt(message, currentDate);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return parseResponse(text);
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to parse tasks with AI');
  }
}

function buildPrompt(message: string, currentDate: Date): string {
  const today = currentDate.toISOString().split('T')[0];
  const tomorrow = new Date(currentDate.getTime() + 86400000)
    .toISOString()
    .split('T')[0];

  return `
You are a task extraction assistant for a student planner app called StudyFlow.

**Current Date:** ${today}
**Tomorrow's Date:** ${tomorrow}

**Your Task:**
Extract all homework, assignments, and tasks from the user's message.
Return a JSON array of tasks with the following structure:

\`\`\`json
[
  {
    "title": "Clear, concise task description",
    "subject": "Subject name or null",
    "due_date": "YYYY-MM-DD",
    "priority": "low" | "medium" | "high"
  }
]
\`\`\`

**Rules:**

1. **Date Parsing:**
   - "today" → ${today}
   - "tomorrow" → ${tomorrow}
   - "next week" → 7 days from today
   - "Monday", "Tuesday", etc. → next occurrence of that day
   - "in 3 days" → 3 days from today
   - If no date mentioned, assume tomorrow

2. **Subject Detection:**
   - Extract from context: "Math homework" → subject: "Math"
   - Common subjects: Math, Science, English, History, etc.
   - If unclear, set to null

3. **Priority Inference:**
   - Keywords like "urgent", "ASAP", "important" → "high"
   - Keywords like "when you can", "optional" → "low"
   - Default → "medium"

4. **Multiple Tasks:**
   - Extract ALL tasks mentioned
   - Use "and", "also", commas as separators

5. **Output Format:**
   - Return ONLY valid JSON array
   - No markdown code blocks
   - No explanations or comments

**User Message:**
"${message}"

**JSON Output:**
`;
}

function parseResponse(text: string): ParsedTask[] {
  try {
    // Remove markdown code blocks if present
    let cleanText = text.trim();
    cleanText = cleanText.replace(/```json\n?/g, '');
    cleanText = cleanText.replace(/```\n?/g, '');
    cleanText = cleanText.trim();

    const parsed = JSON.parse(cleanText);
    
    // Ensure it's an array
    const tasks = Array.isArray(parsed) ? parsed : [parsed];

    // Validate each task
    return tasks.map(validateTask).filter(Boolean) as ParsedTask[];
  } catch (error) {
    console.error('Failed to parse Gemini response:', text);
    throw new Error('Invalid AI response format');
  }
}

function validateTask(task: any): ParsedTask | null {
  if (!task.title || typeof task.title !== 'string') {
    return null;
  }

  if (!task.due_date || !isValidDate(task.due_date)) {
    return null;
  }

  const priority = ['low', 'medium', 'high'].includes(task.priority)
    ? task.priority
    : 'medium';

  return {
    title: task.title.trim(),
    subject: task.subject || null,
    due_date: task.due_date,
    priority,
  };
}

function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}
