export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient } from '../../../lib/supabase-server';
import { parseTasksFromMessage } from '../../../lib/gemini';

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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteClient();

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

    // Rate limiting check
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

    const { data: insertedTasks, error } = await (supabase.from('tasks') as any)
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
  } catch (error: any) {
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
