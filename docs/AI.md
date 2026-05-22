# 🤖 AI Integration Guide — Gemini 2.5 Flash

This guide covers the integration of Google's Gemini 2.5 Flash model for natural language task parsing in StudyFlow.

## 🎯 Overview

StudyFlow uses **Gemini 2.5 Flash** to parse natural language input and extract structured task data. Students can type tasks conversationally, and the AI automatically identifies:

- Task titles
- Subject/category
- Due dates (relative and absolute)
- Priority levels

## 🔑 Setup

### 1. Get API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key

### 2. Add to Environment

```env
GEMINI_API_KEY=your-api-key-here
```

### 3. Install SDK

```bash
npm install @google/generative-ai
```

## 📦 Gemini Client Implementation

### `lib/gemini.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ParsedTask {
  title: string;
  subject?: string;
  due_date: string; // ISO format: YYYY-MM-DD
  priority: 'low' | 'medium' | 'high';
}

export async function parseTasksFromMessage(
  message: string,
  currentDate: Date = new Date()
): Promise<ParsedTask[]> {
  // Use Gemini 2.5 Flash model
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.3, // Lower temperature for more consistent output
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
```

## 🔌 API Route Integration

### `app/api/parse-task/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { parseTasksFromMessage } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const { message } = await request.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Rate limiting check (optional)
    const rateLimitOk = await checkRateLimit(session.user.id);
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    // Parse tasks using Gemini 2.5 Flash
    const parsedTasks = await parseTasksFromMessage(message);

    if (parsedTasks.length === 0) {
      return NextResponse.json({
        success: true,
        tasks: [],
        message: 'No tasks found in your message. Try being more specific!',
      });
    }

    // Insert tasks into database
    const tasksToInsert = parsedTasks.map((task) => ({
      ...task,
      user_id: session.user.id,
      status: 'pending' as const,
    }));

    const { data: insertedTasks, error } = await supabase
      .from('tasks')
      .insert(tasksToInsert)
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save tasks' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tasks: insertedTasks,
      count: insertedTasks.length,
      message: `Successfully added ${insertedTasks.length} task(s)!`,
    });
  } catch (error) {
    console.error('Parse task error:', error);
    
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'AI service configuration error' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Simple in-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, number[]>();

async function checkRateLimit(userId: string): Promise<boolean> {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10; // 10 requests per minute

  const userRequests = rateLimitMap.get(userId) || [];
  const recentRequests = userRequests.filter((time) => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return false;
  }

  recentRequests.push(now);
  rateLimitMap.set(userId, recentRequests);

  return true;
}
```

## 💬 Frontend Integration

### Chat Page (`app/chat/page.tsx`)

```tsx
'use client';

import { useState } from 'react';
import { ChatBubble } from '@/components/ChatBubble';
import { ChatInput } from '@/components/ChatInput';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! Tell me about your homework and I\'ll add it to your calendar. Try: "Math homework due tomorrow and science project due Friday"',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (message: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);

    try {
      // Call API
      const response = await fetch('/api/parse-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message || `Added ${data.count} task(s) to your calendar!`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Show task summary
      if (data.tasks && data.tasks.length > 0) {
        const summary = data.tasks
          .map((t: any) => `• ${t.title} (${t.subject || 'General'}) - Due: ${t.due_date}`)
          .join('\n');

        const summaryMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: summary,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, summaryMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, something went wrong. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg.text}
            isUser={msg.isUser}
            timestamp={msg.timestamp}
          />
        ))}
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 rounded-2xl px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  );
}
```

## 📝 Example Inputs & Outputs

### Example 1: Simple Task

**Input:**
```
Math homework chapter 5 due tomorrow
```

**Output:**
```json
[
  {
    "title": "Math Homework - Chapter 5",
    "subject": "Math",
    "due_date": "2025-05-22",
    "priority": "medium"
  }
]
```

### Example 2: Multiple Tasks

**Input:**
```
I have science project due Friday, English essay due next Monday, and math quiz on Wednesday
```

**Output:**
```json
[
  {
    "title": "Science Project",
    "subject": "Science",
    "due_date": "2025-05-23",
    "priority": "medium"
  },
  {
    "title": "English Essay",
    "subject": "English",
    "due_date": "2025-05-26",
    "priority": "medium"
  },
  {
    "title": "Math Quiz",
    "subject": "Math",
    "due_date": "2025-05-28",
    "priority": "medium"
  }
]
```

### Example 3: Priority Detection

**Input:**
```
URGENT: History presentation tomorrow! Also, optional reading for next week.
```

**Output:**
```json
[
  {
    "title": "History Presentation",
    "subject": "History",
    "due_date": "2025-05-22",
    "priority": "high"
  },
  {
    "title": "Optional Reading",
    "subject": null,
    "due_date": "2025-05-28",
    "priority": "low"
  }
]
```

## 🧪 Testing

### Unit Tests (`__tests__/lib/gemini.test.ts`)

```typescript
import { parseTasksFromMessage } from '@/lib/gemini';

describe('Gemini Task Parser', () => {
  it('parses single task', async () => {
    const result = await parseTasksFromMessage(
      'Math homework due tomorrow',
      new Date('2025-05-21')
    );

    expect(result).toHaveLength(1);
    expect(result[0].title).toContain('Math');
    expect(result[0].subject).toBe('Math');
    expect(result[0].due_date).toBe('2025-05-22');
  });

  it('parses multiple tasks', async () => {
    const result = await parseTasksFromMessage(
      'Science project Friday and English essay Monday',
      new Date('2025-05-21')
    );

    expect(result).toHaveLength(2);
  });

  it('detects high priority', async () => {
    const result = await parseTasksFromMessage(
      'URGENT: Submit report today',
      new Date('2025-05-21')
    );

    expect(result[0].priority).toBe('high');
  });
});
```

## 💰 Cost Optimization

### Gemini 2.5 Flash Pricing (as of 2025)

- **Input:** $0.075 per 1M tokens
- **Output:** $0.30 per 1M tokens

### Optimization Strategies

1. **Use Flash Model** — Gemini 2.5 Flash is 10x cheaper than Pro
2. **Limit Token Count** — Keep prompts concise
3. **Cache Responses** — Cache common patterns
4. **Rate Limiting** — Prevent abuse
5. **Batch Processing** — Process multiple messages together

### Example Cost Calculation

```
Average prompt: ~300 tokens
Average response: ~100 tokens
Cost per request: ~$0.00004

10,000 requests/month = $0.40/month
```

## 🔒 Security Best Practices

### 1. API Key Protection

```typescript
// ✅ Good: Server-side only
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ❌ Bad: Never expose in client
// const genAI = new GoogleGenerativeAI('AIza...');
```

### 2. Input Validation

```typescript
function sanitizeInput(message: string): string {
  // Remove excessive whitespace
  message = message.trim().replace(/\s+/g, ' ');

  // Limit length
  if (message.length > 500) {
    message = message.substring(0, 500);
  }

  return message;
}
```

### 3. Rate Limiting

Use Redis or similar for production:

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});

const { success } = await ratelimit.limit(userId);
if (!success) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
}
```

## 🐛 Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `API key not valid` | Invalid/missing key | Check `.env.local` |
| `Resource exhausted` | Rate limit hit | Implement backoff |
| `Invalid JSON` | Parsing failed | Improve prompt |
| `Model not found` | Wrong model name | Use `gemini-2.5-flash` |

### Retry Logic

```typescript
async function parseWithRetry(
  message: string,
  maxRetries = 3
): Promise<ParsedTask[]> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await parseTasksFromMessage(message);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff
      await new Promise((resolve) => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
  throw new Error('Max retries exceeded');
}
```

## 📚 Additional Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Gemini 2.5 Flash Model Card](https://ai.google.dev/models/gemini)
- [Google AI Studio](https://makersuite.google.com/)
- [Prompt Engineering Guide](https://ai.google.dev/docs/prompt_best_practices)

## 🔗 Related Guides

- [Backend Guide](./BACKEND.md) — API routes
- [Frontend Guide](./FRONTEND.md) — Chat UI
- [Deployment Guide](./DEPLOYMENT.md) — Environment setup
