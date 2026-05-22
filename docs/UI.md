# 🎨 UI/UX Guide — Aurora Glass Design System

This guide covers StudyFlow's modern, vibrant design system inspired by next-gen mobile operating systems and premium AI apps.

## 🎯 Design Philosophy

**"Aurora Glass UI"** — A vibrant, futuristic, premium mobile-first design system that combines:

- ✨ Soft gradients with glowing highlights
- 🔮 Layered glassmorphism cards
- 🌈 Translucent surfaces with depth
- 💫 Smooth animations and micro-interactions
- 🎨 Gen-Z productivity aesthetic

**Inspired by:** Arc Search, Instagram gradients, Spotify layered UI, Todoist flow, Discord surfaces

## 🎯 Design Principles

1. **Vibrant & Futuristic** — NOT plain black/white minimal SaaS
2. **Premium Mobile-First** — Optimized for 390×844 and 430×932
3. **Emotionally Engaging** — Feels like an AI productivity assistant
4. **Glass + Gradient Layered** — Depth through translucency
5. **Smooth & Animated** — Micro-interactions matter
6. **Performance-Conscious** — Lightweight despite visual richness

## 🌈 Color System — Aurora Palette

**NOT plain black.** Use deep navy + neon gradients + soft glows.

### Base Theme Colors

```css
:root {
  /* Backgrounds - Deep Navy Base */
  --bg-main: #081120;
  --bg-secondary: #111827;
  --bg-card: rgba(20, 30, 48, 0.72);
  --bg-frosted-border: rgba(255, 255, 255, 0.08);
  
  /* Accent Gradients */
  --gradient-ai: linear-gradient(135deg, #7C3AED, #3B82F6);
  --gradient-productivity: linear-gradient(135deg, #06B6D4, #3B82F6);
  --gradient-success: linear-gradient(135deg, #22C55E, #10B981);
  --gradient-warning: linear-gradient(135deg, #F59E0B, #FB7185);
  --gradient-user-bubble: linear-gradient(135deg, #3B82F6, #7C3AED);
  
  /* Glow Colors */
  --glow-blue: rgba(59, 130, 246, 0.4);
  --glow-purple: rgba(124, 58, 237, 0.4);
  --glow-green: rgba(34, 197, 94, 0.4);
  --glow-red: rgba(239, 68, 68, 0.4);
  --glow-amber: rgba(245, 158, 11, 0.4);
  
  /* Status Colors */
  --status-done: #22C55E;
  --status-missed: #EF4444;
  --status-partial: #F59E0B;
  --status-today: #3B82F6;
  
  /* Text Colors */
  --text-primary: #FFFFFF;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-tertiary: rgba(255, 255, 255, 0.5);
}
```

### Gradient Usage Guide

| Purpose | Gradient | Usage |
|---------|----------|-------|
| AI Features | Purple → Blue | Chat bubbles, AI cards, suggestions |
| Productivity | Cyan → Blue | Progress rings, completion stats |
| Success | Green → Emerald | Task completion, achievements |
| Warning | Amber → Pink | Urgent tasks, deadlines |
| User Actions | Blue → Purple | Buttons, active states |

### Task Status Visual States

| Status | Visual Effect | CSS |
|--------|---------------|-----|
| Done | Green glow | `box-shadow: 0 0 20px var(--glow-green)` |
| Missed | Red pulse | `animation: pulse-red 2s infinite` |
| Partial | Amber ring | `border: 2px solid #F59E0B; box-shadow: 0 0 16px var(--glow-amber)` |
| Today | Neon blue border | `border: 2px solid #3B82F6; box-shadow: 0 0 24px var(--glow-blue)` |
| No Tasks | Subtle gray | `background: rgba(255, 255, 255, 0.05)` |

### Calendar Date States

```css
/* Done - Green Glow */
.calendar-date.done {
  background: linear-gradient(135deg, #22C55E, #10B981);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
}

/* Missed - Red Pulse */
.calendar-date.missed {
  background: linear-gradient(135deg, #EF4444, #DC2626);
  animation: pulse-red 2s ease-in-out infinite;
}

/* Partial - Amber Ring */
.calendar-date.partial {
  background: rgba(245, 158, 11, 0.1);
  border: 2px solid #F59E0B;
  box-shadow: 0 0 16px rgba(245, 158, 11, 0.3);
}

/* Today - Neon Blue Border */
.calendar-date.today {
  border: 2px solid #3B82F6;
  box-shadow: 0 0 24px rgba(59, 130, 246, 0.5);
}

@keyframes pulse-red {
  0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }
  50% { box-shadow: 0 0 30px rgba(239, 68, 68, 0.6); }
}
```

## 📐 Typography — Modern Font System

### Font Stack

**Recommended:** Inter, Satoshi, or SF Pro

```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
               'Roboto', 'Helvetica Neue', sans-serif;
  --font-display: 'Satoshi', 'Inter', sans-serif;
  --font-mono: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
}

/* Import Inter */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

### Type Scale

```css
.text-xs { font-size: 0.75rem; line-height: 1rem; }      /* 12px */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }  /* 14px */
.text-base { font-size: 1rem; line-height: 1.5rem; }     /* 16px */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }  /* 18px */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }   /* 20px */
.text-2xl { font-size: 1.5rem; line-height: 2rem; }      /* 24px */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; } /* 30px */
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }   /* 36px */
```

### Font Weights — Usage Guide

| Usage | Weight | Class |
|-------|--------|-------|
| Headings | 700 | `font-bold` |
| Card Titles | 600 | `font-semibold` |
| Metadata | 500 | `font-medium` |
| Body Text | 400 | `font-normal` |

```css
.heading { font-weight: 700; }
.card-title { font-weight: 600; }
.body { font-weight: 400; }
.metadata { font-weight: 500; }
```

## 📏 Mobile Spacing System

Optimized for mobile devices (390×844 and 430×932).

### Global Mobile Spacing

| Element | Size | Usage |
|---------|------|-------|
| App Padding | 16px | Main container padding |
| Card Radius | 24px | Card border radius |
| Button Radius | 18px | Button border radius |
| Input Height | 56px | Touch-friendly input height |
| Bottom Nav Height | 78px | Bottom navigation bar |

```css
:root {
  --spacing-app: 16px;
  --radius-card: 24px;
  --radius-button: 18px;
  --height-input: 56px;
  --height-bottom-nav: 78px;
  --margin-bottom-nav: 14px;
}

.app-container {
  padding: var(--spacing-app);
}

.glass-card {
  border-radius: var(--radius-card);
}

.gradient-button {
  border-radius: var(--radius-button);
  min-height: 48px; /* Touch target */
}
```

## 🧊 Glassmorphism System

**Rule:** Use glass ONLY for nav bars, modals, floating cards, and AI widgets. Too much blur kills readability.

### Glass Card Base

```css
.glass-card {
  background: rgba(20, 30, 48, 0.72);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.glass-nav {
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.glass-modal {
  background: rgba(20, 30, 48, 0.85);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### When to Use Glass

| Element | Use Glass? | Blur Amount |
|---------|-----------|-------------|
| Bottom Nav | ✅ Yes | 20px |
| Modals | ✅ Yes | 32px |
| Floating Cards | ✅ Yes | 24px |
| AI Widgets | ✅ Yes | 24px |
| Task Cards | ❌ No | Use solid with glow |
| Buttons | ❌ No | Use gradients |
| Full Backgrounds | ❌ No | Use solid colors |

## 🔘 Button Components — Gradient Style

### Gradient Button (Primary)

```tsx
export function GradientButton({ 
  children, 
  onClick, 
  disabled = false,
  loading = false,
  variant = 'ai'
}: GradientButtonProps) {
  const gradients = {
    ai: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
    productivity: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
    success: 'linear-gradient(135deg, #22C55E, #10B981)',
    warning: 'linear-gradient(135deg, #F59E0B, #FB7185)',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="
        relative overflow-hidden
        px-6 py-3 rounded-[18px]
        font-semibold text-white
        transition-all duration-300
        hover:scale-105 hover:shadow-lg
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
      "
      style={{
        background: gradients[variant],
        boxShadow: '0 4px 20px rgba(124, 58, 237, 0.3)',
      }}
    >
      {loading && <Spinner className="mr-2" />}
      {children}
    </button>
  );
}
```

### Glass Button (Secondary)

```tsx
export function GlassButton({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        px-6 py-3 rounded-[18px]
        bg-white/10 backdrop-blur-md
        border border-white/20
        font-medium text-white
        hover:bg-white/20 hover:border-white/30
        transition-all duration-300
      "
    >
      {children}
    </button>
  );
}
```

## 📝 Input Components

### Text Input

```tsx
export function Input({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = 'text',
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          px-3 py-2 rounded-lg border
          ${error ? 'border-red-500' : 'border-gray-300'}
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-shadow duration-200
        `}
      />
      {error && (
        <span className="text-sm text-red-500">{error}</span>
      )}
    </div>
  );
}
```

### Select Dropdown

```tsx
export function Select({
  label,
  value,
  onChange,
  options,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className="
          px-3 py-2 rounded-lg border border-gray-300
          focus:outline-none focus:ring-2 focus:ring-blue-500
          bg-white cursor-pointer
        "
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
```

## 🃏 Card Components — Glass & Gradient

### Glass Card (Base)

```tsx
export function GlassCard({ 
  children, 
  className = '',
  glow = false,
  glowColor = 'blue'
}: GlassCardProps) {
  const glowColors = {
    blue: '0 0 20px rgba(59, 130, 246, 0.3)',
    purple: '0 0 20px rgba(124, 58, 237, 0.3)',
    green: '0 0 20px rgba(34, 197, 94, 0.3)',
  };

  return (
    <div 
      className={`
        bg-[rgba(20,30,48,0.72)] backdrop-blur-[24px]
        border border-white/8 rounded-[24px]
        p-4 shadow-lg
        ${className}
      `}
      style={{
        boxShadow: glow ? glowColors[glowColor] : '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    >
      {children}
    </div>
  );
}
```

### AI Summary Card

```tsx
export function AISummaryCard({ tasks, insights }: AISummaryProps) {
  return (
    <div 
      className="
        h-[110px] rounded-[24px] p-4
        relative overflow-hidden
      "
      style={{
        background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
        boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4)',
      }}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 opacity-30 animate-gradient" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/80 text-sm font-medium">Today</span>
          <span className="text-white font-bold text-2xl">{tasks.length}</span>
        </div>
        
        <p className="text-white/90 text-sm">
          {insights || "You're most productive after 7 PM."}
        </p>
      </div>
    </div>
  );
}
```

### Task Card (Floating Style)

```tsx
export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const statusGlows = {
    pending: '0 4px 16px rgba(59, 130, 246, 0.2)',
    done: '0 4px 16px rgba(34, 197, 94, 0.3)',
    partial: '0 4px 16px rgba(245, 158, 11, 0.3)',
  };

  const priorityIcons = {
    high: '🔴',
    medium: '🟡',
    low: '🔵',
  };

  return (
    <div
      onClick={() => onStatusChange(task.id)}
      className="
        bg-[rgba(20,30,48,0.72)] backdrop-blur-[16px]
        border border-white/8 rounded-[20px]
        p-4 cursor-pointer
        transition-all duration-300
        hover:scale-[1.02] hover:border-white/20
        active:scale-[0.98]
      "
      style={{
        boxShadow: statusGlows[task.status],
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{priorityIcons[task.priority]}</span>
            <h3 className="font-semibold text-white">{task.title}</h3>
          </div>
          {task.subject && (
            <span className="text-sm text-white/60">{task.subject}</span>
          )}
        </div>
        <StatusBadge status={task.status} />
      </div>
      
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-white/50">
          Due: {formatDate(task.due_date)}
        </span>
        <SwipeIndicator />
      </div>
    </div>
  );
}
```

## 🏷️ Badge Components

### Status Badge

```tsx
export function StatusBadge({ status }: { status: TaskStatus }) {
  const styles = {
    pending: 'bg-blue-100 text-blue-800',
    done: 'bg-green-100 text-green-800',
    partial: 'bg-amber-100 text-amber-800',
  };

  const labels = {
    pending: 'Pending',
    done: 'Done',
    partial: 'Partial',
  };

  return (
    <span className={`
      px-2 py-1 rounded-full text-xs font-medium
      ${styles[status]}
    `}>
      {labels[status]}
    </span>
  );
}
```

### Priority Badge

```tsx
export function PriorityBadge({ priority }: { priority: Priority }) {
  const styles = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-amber-100 text-amber-800',
    low: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={`
      px-2 py-1 rounded-full text-xs font-medium uppercase
      ${styles[priority]}
    `}>
      {priority}
    </span>
  );
}
```

## 📅 Calendar Component

### Calendar Grid

```tsx
export function CalendarGrid({ year, month, tasks }: CalendarGridProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);

  const getDayColor = (day: number) => {
    const date = new Date(year, month, day);
    const dayTasks = tasks.filter(t => isSameDay(t.due_date, date));

    if (dayTasks.length === 0) return 'bg-gray-100';
    
    const allDone = dayTasks.every(t => t.status === 'done');
    const someDone = dayTasks.some(t => t.status === 'done');
    const isPastDue = isPast(date);

    if (allDone) return 'bg-green-200';
    if (someDone) return 'bg-amber-200';
    if (isPastDue) return 'bg-red-200';
    return 'bg-white';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Month header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={previousMonth}>
          <ChevronLeft />
        </button>
        <h2 className="text-xl font-bold">
          {getMonthName(month)} {year}
        </h2>
        <button onClick={nextMonth}>
          <ChevronRight />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = isToday(new Date(year, month, day));

          return (
            <button
              key={day}
              onClick={() => onDayClick(day)}
              className={`
                aspect-square rounded-lg p-2
                ${getDayColor(day)}
                ${isToday ? 'ring-2 ring-blue-500' : ''}
                hover:opacity-80 transition-opacity
                flex items-center justify-center
                text-sm font-medium
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-200 rounded" />
          <span>All Done</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-amber-200 rounded" />
          <span>Partial</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-200 rounded" />
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-100 rounded" />
          <span>No Tasks</span>
        </div>
      </div>
    </div>
  );
}
```

## 💬 Chat Components — Modern Gradient Style

### User Chat Bubble (Gradient)

```tsx
export function UserChatBubble({ message, timestamp }: ChatBubbleProps) {
  return (
    <div className="flex justify-end mb-4">
      <div 
        className="
          max-w-[80%] rounded-[20px] rounded-br-[8px]
          px-4 py-3 shadow-lg
        "
        style={{
          background: 'linear-gradient(135deg, #3B82F6, #7C3AED)',
          boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
        }}
      >
        <p className="text-white text-sm leading-relaxed">{message}</p>
        <span className="text-white/70 text-xs mt-1 block">
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );
}
```

### AI Chat Bubble (Glass)

```tsx
export function AIChatBubble({ message, timestamp }: ChatBubbleProps) {
  return (
    <div className="flex justify-start mb-4">
      <div className="
        max-w-[80%] rounded-[20px] rounded-bl-[8px]
        px-4 py-3
        bg-[rgba(20,30,48,0.72)] backdrop-blur-[24px]
        border border-white/8
        shadow-lg
      ">
        <p className="text-white text-sm leading-relaxed">{message}</p>
        <span className="text-white/50 text-xs mt-1 block">
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );
}
```

### AI Extraction Card (Signature Feature)

```tsx
export function AIExtractionCard({ task, onEdit, onSave, onIgnore }: ExtractionCardProps) {
  return (
    <div className="
      bg-[rgba(20,30,48,0.72)] backdrop-blur-[24px]
      border border-white/8 rounded-[20px]
      p-4 mb-3
      shadow-lg
    ">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-white font-semibold mb-1">{task.title}</h4>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <span>{task.subject || 'General'}</span>
            <span>•</span>
            <span>{formatDate(task.due_date)}</span>
          </div>
        </div>
        <PriorityBadge priority={task.priority} />
      </div>
      
      {/* Confidence Score */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-white/50 mb-1">
          <span>AI Confidence</span>
          <span>{task.confidence}%</span>
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            style={{ width: `${task.confidence}%` }}
          />
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 py-2 rounded-[12px] bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition"
        >
          Edit
        </button>
        <button
          onClick={onSave}
          className="flex-1 py-2 rounded-[12px] text-white text-sm font-semibold transition"
          style={{
            background: 'linear-gradient(135deg, #22C55E, #10B981)',
          }}
        >
          Save
        </button>
        <button
          onClick={onIgnore}
          className="px-4 py-2 rounded-[12px] bg-white/5 text-white/50 text-sm hover:bg-white/10 transition"
        >
          Ignore
        </button>
      </div>
    </div>
  );
}
```

### Chat Input Bar (Floating Glass)

```tsx
export function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="
        fixed bottom-[94px] left-4 right-4
        bg-[rgba(20,30,48,0.85)] backdrop-blur-[24px]
        border border-white/10 rounded-[24px]
        p-3 shadow-2xl
      "
    >
      <div className="flex items-center gap-2">
        {/* Mic Button */}
        <button
          type="button"
          onClick={() => setIsRecording(!isRecording)}
          className={`
            p-3 rounded-full transition-all
            ${isRecording 
              ? 'bg-red-500 animate-pulse' 
              : 'bg-white/10 hover:bg-white/20'
            }
          `}
        >
          <Mic size={20} className="text-white" />
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your tasks..."
          className="
            flex-1 bg-transparent text-white placeholder-white/40
            focus:outline-none text-sm
          "
        />

        {/* Attachment Button */}
        <button
          type="button"
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          <Paperclip size={20} className="text-white" />
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim()}
          className="
            p-3 rounded-full transition-all
            disabled:opacity-30 disabled:cursor-not-allowed
          "
          style={{
            background: message.trim() 
              ? 'linear-gradient(135deg, #7C3AED, #3B82F6)' 
              : 'rgba(255,255,255,0.1)',
          }}
        >
          <Send size={20} className="text-white" />
        </button>
      </div>

      {/* Voice Recording UI */}
      {isRecording && (
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1">
            <WaveformVisualizer />
          </div>
          <span className="text-white/60 text-sm">Recording...</span>
        </div>
      )}
    </form>
  );
}
```

## 🔔 Notification Components

### Notification Item

```tsx
export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  return (
    <div className={`
      p-4 border-b border-gray-200
      ${notification.read ? 'bg-white' : 'bg-blue-50'}
      hover:bg-gray-50 transition-colors
    `}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {notification.read ? (
            <Bell size={20} className="text-gray-400" />
          ) : (
            <Bell size={20} className="text-blue-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900">{notification.message}</p>
          <p className="text-xs text-gray-500 mt-1">
            {formatDistanceToNow(notification.sent_at)} ago
          </p>
        </div>
        {!notification.read && (
          <button
            onClick={() => onMarkRead(notification.id)}
            className="text-blue-500 text-xs font-medium hover:underline"
          >
            Mark read
          </button>
        )}
      </div>
    </div>
  );
}
```

## 🧭 Navigation Components — Floating Dock Style

### Bottom Navigation (Floating Glass Dock)

```tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, MessageSquare, Bell, Settings, BarChart3 } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/chat', icon: MessageSquare, label: 'Chat' },
    { href: '/analytics', icon: BarChart3, label: 'Stats' },
    { href: '/notifications', icon: Bell, label: 'Alerts' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="
      fixed bottom-[14px] left-4 right-4
      h-[78px] rounded-[28px]
      bg-[rgba(17,24,39,0.8)] backdrop-blur-[20px]
      border border-white/8
      shadow-2xl
      safe-area-inset-bottom
    ">
      <div className="flex justify-around items-center h-full px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex flex-col items-center justify-center
                gap-1 px-4 py-2 rounded-[16px]
                transition-all duration-300
                ${isActive 
                  ? 'bg-white/10 scale-110' 
                  : 'hover:bg-white/5'
                }
              `}
            >
              <div className={`
                transition-all duration-300
                ${isActive ? 'scale-110' : ''}
              `}>
                <Icon 
                  size={24} 
                  className={isActive ? 'text-white' : 'text-white/60'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className={`
                text-[10px] font-medium transition-all
                ${isActive ? 'text-white' : 'text-white/60'}
              `}>
                {label}
              </span>
              
              {/* Active Indicator Glow */}
              {isActive && (
                <div 
                  className="absolute -bottom-1 w-1 h-1 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
                    boxShadow: '0 0 12px rgba(124, 58, 237, 0.8)',
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

## ⚡ Loading States

### Spinner

```tsx
export function Spinner({ size = 'md' }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`
      ${sizes[size]}
      border-2 border-gray-200 border-t-blue-500
      rounded-full animate-spin
    `} />
  );
}
```

### Skeleton Loader

```tsx
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="h-3 bg-gray-200 rounded w-1/4" />
    </div>
  );
}
```

## ♿ Accessibility

### Focus Styles

```css
/* Global focus styles */
*:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Skip to main content link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #3b82f6;
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### ARIA Labels

```tsx
// Always include aria-label for icon buttons
<button aria-label="Close dialog">
  <X size={20} />
</button>

// Use aria-live for dynamic content
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Mark required fields
<input aria-required="true" />
```

## 📱 Mobile Responsive Design

### Target Devices

- **Primary:** 390×844 (iPhone 14/15)
- **Secondary:** 430×932 (iPhone 14/15 Pro Max)
- **Tablets:** 768px+ (iPad)

### Breakpoints

```css
/* Mobile First (default) */
.container {
  padding: 16px;
}

/* Small devices (<380px) */
@media (max-width: 380px) {
  .container {
    padding: 12px;
  }
  
  .card {
    padding: 12px;
  }
  
  .chart {
    height: 200px;
  }
}

/* Tablets (>768px) */
@media (min-width: 768px) {
  .dashboard {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  
  .calendar {
    grid-column: 1 / -1;
  }
  
  .bottom-nav {
    display: none; /* Use sidebar instead */
  }
}

/* Desktop (>1024px) */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px;
  }
  
  .dashboard {
    grid-template-columns: 2fr 1fr;
  }
}
```

### Touch Target Sizes

```css
/* Minimum 44×44px for touch targets */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-center;
}

/* Buttons */
.button {
  min-height: 48px;
  padding: 12px 24px;
}

/* Input fields */
.input {
  height: 56px;
  padding: 0 16px;
}
```

## 🎭 Animations & Micro-Interactions

**These matter more than giant animations.** Subtle, smooth interactions create premium feel.

### 1. Task Completion Animation

```css
@keyframes check-ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes glow-fade {
  0% {
    box-shadow: 0 0 30px rgba(34, 197, 94, 0.8);
  }
  100% {
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.2);
  }
}

.task-complete {
  animation: check-ripple 0.6s ease-out, glow-fade 0.8s ease-out;
}
```

### 2. Notification Arrival

```css
@keyframes slide-in-bounce {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  60% {
    transform: translateY(10px);
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes pulse-border {
  0%, 100% {
    border-color: rgba(59, 130, 246, 0.5);
  }
  50% {
    border-color: rgba(59, 130, 246, 1);
  }
}

.notification-arrive {
  animation: slide-in-bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55),
             pulse-border 2s ease-in-out infinite;
}
```

### 3. Calendar Date Selection

```css
@keyframes magnetic-scale {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1.1);
  }
}

.calendar-date:active {
  animation: magnetic-scale 0.3s ease-out;
}
```

### 4. AI Processing Loader

```tsx
export function AIProcessingLoader() {
  return (
    <div className="flex items-center gap-2">
      <div 
        className="w-8 h-8 rounded-full animate-spin"
        style={{
          background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
          maskImage: 'radial-gradient(circle at 30% 30%, transparent 40%, black 40%)',
        }}
      />
      <span className="text-white/60 text-sm">AI is thinking...</span>
    </div>
  );
}
```

### 5. Button Hover Effects

```css
.gradient-button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.gradient-button:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 30px rgba(124, 58, 237, 0.5);
}

.gradient-button:active {
  transform: scale(0.95);
}
```

### 6. Swipe Gesture Indicator

```tsx
export function SwipeIndicator() {
  return (
    <div className="flex gap-1">
      <div className="w-1 h-1 rounded-full bg-white/30 animate-pulse" />
      <div className="w-1 h-1 rounded-full bg-white/30 animate-pulse delay-100" />
      <div className="w-1 h-1 rounded-full bg-white/30 animate-pulse delay-200" />
    </div>
  );
}
```

### 7. Floating Animation (for cards)

```css
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.floating-card {
  animation: float 3s ease-in-out infinite;
}
```

### 8. Gradient Animation

```css
@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animated-gradient {
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
}
```

## 📚 Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/) — Advanced animations
- [Lucide Icons](https://lucide.dev/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Mobile Design Best Practices](https://web.dev/mobile/)

## 🎨 Design Inspiration

- **Arc Search** — Glass UI and smooth interactions
- **Instagram** — Modern gradients and stories UI
- **Spotify** — Layered cards and music player
- **Todoist** — Clean productivity flow
- **Discord** — Dark surfaces and chat bubbles
- **Linear** — Premium SaaS aesthetics
- **Notion** — Smooth animations

## 🔗 Related Guides

- [Frontend Guide](./FRONTEND.md) — Component implementation with Aurora Glass UI
- [PWA Guide](./PWA.md) — Mobile app experience
- [Contributing](./CONTRIBUTING.md) — Design contribution guidelines

---

**Final UI Direction:** Your app should feel like an **AI productivity assistant + premium mobile operating system + modern student planner**.

**NOT:** Corporate dashboard, old-school to-do app, boring calendar clone, or plain dark admin panel.
