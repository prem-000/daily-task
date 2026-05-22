'use client';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: string | Date;
}

export default function ChatBubble({ message, isUser, timestamp }: ChatBubbleProps) {
  const time = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 w-full`}>
      <div 
        className={`
          max-w-[80%] rounded-[20px] px-4 py-3 shadow-lg transition-all duration-300
          ${isUser 
            ? 'rounded-br-[8px] text-white hover:brightness-110' 
            : 'rounded-bl-[8px] bg-[rgba(20,30,48,0.72)] backdrop-blur-[24px] border border-white/8 text-white hover:border-white/20'
          }
        `}
        style={{
          background: isUser ? 'linear-gradient(135deg, #3B82F6, #7C3AED)' : undefined,
          boxShadow: isUser ? '0 4px 16px rgba(59, 130, 246, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
        <span className="text-[10px] opacity-60 mt-1.5 block text-right">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
