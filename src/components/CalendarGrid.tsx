'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Task {
  id: string;
  user_id?: string | null;
  title: string;
  subject: string | null;
  due_date: string; // ISO date format YYYY-MM-DD
  status: 'pending' | 'done' | 'partial';
  priority: 'low' | 'medium' | 'high';
  created_at?: string;
}

interface CalendarGridProps {
  initialYear: number;
  initialMonth: number;
  tasks: Task[];
  onDayClick: (date: Date) => void;
}

export default function CalendarGrid({ initialYear, initialMonth, tasks, onDayClick }: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date(initialYear, initialMonth, 1));
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfWeek = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getMonthName = (m: number) => {
    return new Date(year, m, 1).toLocaleString('default', { month: 'long' });
  };

  const isSameDay = (dateStr: string, dateObj: Date) => {
    const d1 = new Date(dateStr + 'T00:00:00');
    return (
      d1.getFullYear() === dateObj.getFullYear() &&
      d1.getMonth() === dateObj.getMonth() &&
      d1.getDate() === dateObj.getDate()
    );
  };

  const isPastDay = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() < today.getTime();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getDayStyle = (date: Date) => {
    const dayTasks = tasks.filter(t => isSameDay(t.due_date, date));
    
    if (dayTasks.length === 0) {
      return {
        bg: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        shadow: 'none',
        animation: '',
      };
    }
    
    const allDone = dayTasks.every(t => t.status === 'done');
    const someDone = dayTasks.some(t => t.status === 'done');
    const anyPending = dayTasks.some(t => t.status === 'pending' || t.status === 'partial');
    const todayCheck = isToday(date);
    
    if (allDone) {
      return {
        bg: 'linear-gradient(135deg, #22C55E, #10B981)',
        border: 'none',
        shadow: '0 0 20px rgba(34, 197, 94, 0.4)',
        animation: '',
      };
    }
    
    if (someDone && anyPending) {
      return {
        bg: 'rgba(245, 158, 11, 0.1)',
        border: '2px solid #F59E0B',
        shadow: '0 0 16px rgba(245, 158, 11, 0.3)',
        animation: '',
      };
    }
    
    if (isPastDay(date) && anyPending) {
      return {
        bg: 'linear-gradient(135deg, #EF4444, #DC2626)',
        border: 'none',
        shadow: '0 0 20px rgba(239, 68, 68, 0.4)',
        animation: 'animate-pulse-red',
      };
    }
    
    if (todayCheck) {
      return {
        bg: 'rgba(0, 212, 170, 0.1)',
        border: '2px solid #00D4AA',
        shadow: '0 0 24px rgba(0, 212, 170, 0.5)',
        animation: '',
      };
    }
    
    return {
      bg: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      shadow: 'none',
      animation: '',
    };
  };

  return (
    <div className="bg-[rgba(20,30,48,0.72)] backdrop-blur-[24px] border border-white/8 rounded-[24px] p-4 glass-card w-full max-w-sm mx-auto shadow-2xl overflow-y-auto">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={previousMonth}
          className="p-2 rounded-full hover:bg-white/10 transition magnetic-button"
        >
          <ChevronLeft className="text-white" />
        </button>
        <h2 className="text-xl font-bold text-white tracking-tight">
          {getMonthName(month)} {year}
        </h2>
        <button 
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-white/10 transition magnetic-button"
        >
          <ChevronRight className="text-white" />
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-2 mb-2 min-w-0">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-center text-xs font-semibold text-white/50 truncate">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days - Circular Floating Style */}
      <div className="grid grid-cols-7 gap-2 min-w-0">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="w-full aspect-square min-w-0" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);
          const style = getDayStyle(date);
          const todayCheck = isToday(date);

          return (
            <button
              key={day}
              onClick={() => onDayClick(date)}
              className={`
                w-full aspect-square rounded-full min-w-0
                flex items-center justify-center
                text-xs md:text-sm font-medium text-white
                transition-all duration-300
                hover:scale-110 active:scale-95 z-10
                ${style.animation}
                ${todayCheck && style.border === 'none' ? 'ring-2 ring-[#00D4AA]' : ''}
              `}
              style={{
                background: style.bg,
                border: style.border,
                boxShadow: style.shadow,
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-x-3 gap-y-1.5 text-[10px]">
        <LegendItem color="linear-gradient(135deg, #22C55E, #10B981)" label="All Done" />
        <LegendItem color="rgba(245, 158, 11, 0.2)" label="Partial" border="#F59E0B" />
        <LegendItem color="linear-gradient(135deg, #EF4444, #DC2626)" label="Missed" />
        <LegendItem color="rgba(0, 212, 170, 0.1)" label="Today" border="#00D4AA" />
        <LegendItem color="rgba(255, 255, 255, 0.05)" label="No Tasks" />
      </div>
    </div>
  );
}

function LegendItem({ color, label, border }: { color: string; label: string; border?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div 
        className="w-3 h-3 rounded-full"
        style={{ 
          background: color,
          border: border ? `1px solid ${border}` : 'none',
        }}
      />
      <span className="text-white/60 font-medium">{label}</span>
    </div>
  );
}
