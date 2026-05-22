'use client';

import { Bell, BellOff, Check } from 'lucide-react';

export interface NotificationLogItem {
  id: string;
  user_id?: string | null;
  task_id?: string | null;
  message: string;
  sent_at: string;
  read: boolean;
}

interface NotificationItemProps {
  notification: NotificationLogItem;
  onMarkRead: (id: string) => void;
}

export default function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const formatTimeAgo = (dateStr: string) => {
    try {
      const past = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - past.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div 
      className={`
        p-4 rounded-[20px] border transition-all duration-300 w-full flex items-start gap-3
        ${notification.read 
          ? 'bg-white/5 border-white/5 opacity-70' 
          : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20'
        }
      `}
      style={{
        boxShadow: !notification.read ? '0 4px 16px rgba(59, 130, 246, 0.1)' : 'none'
      }}
    >
      <div className={`p-2 rounded-[12px] ${notification.read ? 'bg-white/5 text-white/40' : 'bg-blue-500/20 text-blue-400'}`}>
        {notification.read ? <BellOff size={16} /> : <Bell size={16} className="animate-bounce" />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
          {notification.message}
        </p>
        <span className="text-[10px] text-white/40 mt-1 block">
          {formatTimeAgo(notification.sent_at)}
        </span>
      </div>

      {!notification.read && (
        <button
          onClick={() => onMarkRead(notification.id)}
          className={`
            flex items-center justify-center p-1.5 rounded-full
            bg-white/10 hover:bg-white/20 text-white hover:scale-105 active:scale-95 transition-all
          `}
          title="Mark as read"
        >
          <Check size={14} />
        </button>
      )}
    </div>
  );
}
