'use client';

import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Task } from './CalendarGrid';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: 'pending' | 'done' | 'partial') => void;
}

export default function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const cycleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    const statusCycle: ('pending' | 'done' | 'partial')[] = ['pending', 'done', 'partial'];
    const currentIndex = statusCycle.indexOf(task.status);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
    onStatusChange(task.id, nextStatus);
  };

  const statusGlows = {
    pending: '0 4px 16px rgba(59, 130, 246, 0.15)',
    done: '0 4px 16px rgba(34, 197, 94, 0.25)',
    partial: '0 4px 16px rgba(245, 158, 11, 0.25)',
  };

  const priorityColors = {
    high: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    low: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  };

  const renderStatusIcon = (status: 'pending' | 'done' | 'partial') => {
    if (status === 'done') {
      return <CheckCircle2 className="text-emerald-400 w-5 h-5 flex-shrink-0" />;
    }
    if (status === 'partial') {
      return <AlertCircle className="text-amber-400 w-5 h-5 flex-shrink-0" />;
    }
    return <Circle className="text-blue-400/60 w-5 h-5 flex-shrink-0" />;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      onClick={cycleStatus}
      className={`
        relative overflow-hidden
        bg-[rgba(20,30,48,0.72)] backdrop-blur-[16px]
        border border-white/8 rounded-[20px]
        p-4 cursor-pointer w-full
        transition-all duration-300
        hover:scale-[1.02] hover:border-white/20
        active:scale-[0.98]
        flex gap-3 items-start
      `}
      style={{
        boxShadow: statusGlows[task.status],
      }}
    >
      {/* Glow highlight */}
      <div 
        className="absolute top-0 left-0 w-1.5 h-full"
        style={{
          background: task.status === 'done' 
            ? 'linear-gradient(to bottom, #22C55E, #10B981)' 
            : task.status === 'partial'
            ? 'linear-gradient(to bottom, #F59E0B, #FB7185)'
            : 'linear-gradient(to bottom, #3B82F6, #7C3AED)',
        }}
      />

      <div className="flex-1 min-w-0 pl-1">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-semibold text-white text-sm leading-snug truncate">
            {task.title}
          </h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border capitalize ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>

        <div className="flex justify-between items-center mt-2.5">
          <div className="flex flex-col gap-0.5">
            {task.subject && (
              <span className="text-[11px] text-white/50 font-medium">
                📚 {task.subject}
              </span>
            )}
            <span className="text-[10px] text-white/40">
              📅 Due: {formatDate(task.due_date)}
            </span>
          </div>

          <button 
            onClick={cycleStatus}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[12px] bg-white/5 hover:bg-white/10 text-white/80 text-xs font-semibold transition"
          >
            {renderStatusIcon(task.status)}
            <span className="capitalize">{task.status}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
