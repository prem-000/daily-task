# 📱 Frontend Guide — Aurora Glass UI

This guide covers the Next.js frontend architecture, modern Aurora Glass UI components, and mobile-first routing structure.

## 🎨 UI Design System

StudyFlow uses the **Aurora Glass UI** design system — a vibrant, futuristic, premium mobile-first aesthetic. See the complete design system in [UI Guide](./UI.md).

**Key Features:**
- 🌈 Gradient-based color system (deep navy + neon accents)
- 🔮 Glassmorphism for nav, modals, and floating cards
- 💫 Smooth micro-interactions and animations
- 📱 Mobile-first (390×844 primary target)
- ✨ Gen-Z productivity aesthetic

## 📁 Project Structure

```
app/
├── layout.tsx                  # Root layout with BottomNav
├── page.tsx                    # Landing / login page
├── dashboard/
│   └── page.tsx                # Calendar dashboard
├── chat/
│   └── page.tsx                # AI chat input screen
├── notifications/
│   └── page.tsx                # Notification history
├── settings/
│   └── page.tsx                # User preferences
└── auth/
    └── callback/
        └── route.ts            # Google OAuth callback handler

components/
├── BottomNav.tsx               # Bottom navigation bar
├── CalendarGrid.tsx            # Monthly calendar with color coding
├── ChatBubble.tsx              # Chat message component
├── TaskCard.tsx                # Individual task display
└── NotificationItem.tsx        # Notification list item
```

## 🎯 App Router (Next.js 14)

StudyFlow uses the Next.js 14 App Router with the following routes:

### Public Routes
- `/` — Landing page with Google sign-in

### Protected Routes (require authentication)
- `/dashboard` — Main calendar view
- `/chat` — AI-powered task input
- `/notifications` — Notification history
- `/settings` — User preferences

## 🧩 Core Components — Aurora Glass Style

### 1. BottomNav.tsx — Floating Dock Navigation

Modern floating dock-style navigation inspired by iOS and Arc browser.

```tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, MessageSquare, Bell, Settings, BarChart3 } from 'lucide-react';

export default function BottomNav() {
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
      shadow-2xl z-50
    ">
      <div className="flex justify-around items-center h-full px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`
                relative flex flex-col items-center justify-center
                gap-1 px-4 py-2 rounded-[16px]
                transition-all duration-300
                ${isActive ? 'bg-white/10 scale-110' : 'hover:bg-white/5'}
              `}
            >
              <Icon 
                size={24} 
                className={isActive ? 'text-white' : 'text-white/60'}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`
                text-[10px] font-medium
                ${isActive ? 'text-white' : 'text-white/60'}
              `}>
                {label}
              </span>
              
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

**Features:**
- Floating dock style with 14px bottom margin
- Glass morphism with 20px blur
- Active state with glow indicator
- Smooth scale animations
- 78px height for comfortable touch targets

### 2. CalendarGrid.tsx — Floating Circular Dates

Modern calendar with floating circular dates and glowing active states.

```tsx
interface CalendarGridProps {
  year: number;
  month: number;
  tasks: Task[];
}

export default function CalendarGrid({ year, month, tasks }: CalendarGridProps) {
  const getDayStyle = (date: Date) => {
    const dayTasks = tasks.filter(t => isSameDay(t.due_date, date));
    
    if (dayTasks.length === 0) {
      return {
        bg: 'rgba(255, 255, 255, 0.05)',
        shadow: 'none',
      };
    }
    
    const allDone = dayTasks.every(t => t.status === 'done');
    const someDone = dayTasks.some(t => t.status === 'done');
    const anyPending = dayTasks.some(t => t.status === 'pending');
    const isToday = isSameDay(date, new Date());
    
    if (allDone) {
      return {
        bg: 'linear-gradient(135deg, #22C55E, #10B981)',
        shadow: '0 0 20px rgba(34, 197, 94, 0.4)',
      };
    }
    
    if (someDone && anyPending) {
      return {
        bg: 'rgba(245, 158, 11, 0.1)',
        border: '2px solid #F59E0B',
        shadow: '0 0 16px rgba(245, 158, 11, 0.3)',
      };
    }
    
    if (isPast(date) && anyPending) {
      return {
        bg: 'linear-gradient(135deg, #EF4444, #DC2626)',
        shadow: '0 0 20px rgba(239, 68, 68, 0.4)',
        animation: 'pulse-red 2s infinite',
      };
    }
    
    if (isToday) {
      return {
        bg: 'rgba(59, 130, 246, 0.1)',
        border: '2px solid #3B82F6',
        shadow: '0 0 24px rgba(59, 130, 246, 0.5)',
      };
    }
    
    return {
      bg: 'rgba(255, 255, 255, 0.05)',
      shadow: 'none',
    };
  };

  return (
    <div className="bg-[rgba(20,30,48,0.72)] backdrop-blur-[24px] border border-white/8 rounded-[24px] p-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={previousMonth}
          className="p-2 rounded-full hover:bg-white/10 transition"
        >
          <ChevronLeft className="text-white" />
        </button>
        <h2 className="text-xl font-bold text-white">
          {getMonthName(month)} {year}
        </h2>
        <button 
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-white/10 transition"
        >
          <ChevronRight className="text-white" />
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-center text-sm font-medium text-white/60">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days - Circular Floating Style */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);
          const style = getDayStyle(date);
          const isToday = isSameDay(date, new Date());

          return (
            <button
              key={day}
              onClick={() => onDayClick(day)}
              className="
                aspect-square rounded-full
                flex items-center justify-center
                text-sm font-medium text-white
                transition-all duration-300
                hover:scale-110 active:scale-95
              "
              style={{
                background: style.bg,
                border: style.border,
                boxShadow: style.shadow,
                animation: style.animation,
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <LegendItem color="linear-gradient(135deg, #22C55E, #10B981)" label="All Done" />
        <LegendItem color="rgba(245, 158, 11, 0.3)" label="Partial" border="#F59E0B" />
        <LegendItem color="linear-gradient(135deg, #EF4444, #DC2626)" label="Missed" />
        <LegendItem color="rgba(255, 255, 255, 0.05)" label="No Tasks" />
      </div>
    </div>
  );
}

function LegendItem({ color, label, border }: { color: string; label: string; border?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div 
        className="w-4 h-4 rounded-full"
        style={{ 
          background: color,
          border: border ? `2px solid ${border}` : 'none',
        }}
      />
      <span className="text-white/60">{label}</span>
    </div>
  );
}
```

**Features:**
- Circular floating dates (not boring grid)
- Glowing active states with box-shadow
- Color-coded task indicators
- Pulsing animation for missed tasks
- Neon blue border for today
- Smooth hover/active animations

### 3. ChatBubble.tsx

Chat message component for AI conversation.

```tsx
interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatBubble({ message, isUser, timestamp }: ChatBubbleProps) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] rounded-lg p-3 ${
        isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'
      }`}>
        <p>{message}</p>
        <span className="text-xs opacity-70">
          {timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
```

### 4. TaskCard.tsx

Individual task display with status toggle.

```tsx
interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export default function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const cycleStatus = () => {
    const statusCycle: TaskStatus[] = ['pending', 'done', 'partial'];
    const currentIndex = statusCycle.indexOf(task.status);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
    onStatusChange(task.id, nextStatus);
  };

  return (
    <div 
      onClick={cycleStatus}
      className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{task.title}</h3>
        <StatusBadge status={task.status} />
      </div>
      <p className="text-sm text-gray-600">{task.subject}</p>
      <p className="text-xs text-gray-500">Due: {formatDate(task.due_date)}</p>
    </div>
  );
}
```

### 5. NotificationItem.tsx

Notification list item component.

```tsx
interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

export default function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  return (
    <div className={`p-4 border-b ${notification.read ? 'bg-white' : 'bg-blue-50'}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm">{notification.message}</p>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(notification.sent_at)} ago
          </span>
        </div>
        {!notification.read && (
          <button
            onClick={() => onMarkRead(notification.id)}
            className="text-blue-500 text-xs"
          >
            Mark read
          </button>
        )}
      </div>
    </div>
  );
}
```

## 🔐 Authentication Flow

### 1. Login Page (`app/page.tsx`)

```tsx
'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const supabase = createClientComponentClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <button
        onClick={handleGoogleLogin}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg"
      >
        Sign in with Google
      </button>
    </div>
  );
}
```

### 2. Auth Callback (`app/auth/callback/route.ts`)

```tsx
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL('/dashboard', request.url));
}
```

### 3. Protected Route Middleware

Create `middleware.ts` in the root:

```tsx
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect to login if not authenticated
  if (!session && !req.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/chat/:path*', '/notifications/:path*', '/settings/:path*'],
};
```

## 🎨 Styling with Tailwind CSS

### Configuration (`tailwind.config.js`)

```js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
    },
  },
  plugins: [],
};
```

### Custom CSS (`app/globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-4;
  }
}
```

## ⚙️ Settings Page — Complete Implementation

### Settings Page Structure

```
SETTINGS PAGE
├── PROFILE CARD
├── NOTIFICATIONS
├── APPEARANCE
├── AI SETTINGS
├── APP & DEVICE
│   ├── Install App
│   ├── Offline Mode
│   └── Storage Usage
├── ACCOUNT
└── ABOUT
```

### Complete Settings Page Component

```tsx
'use client';

import { useState } from 'react';
import { 
  User, Bell, Palette, Brain, Smartphone, 
  UserCircle, Info, Trash2, Download, HardDrive,
  Wifi, WifiOff, Check
} from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#081120] pb-24">
      {/* Header */}
      <div className="p-6">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-white/60">Manage your preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4 px-4">
        <ProfileCard />
        <NotificationSettings />
        <AppearanceSettings />
        <AISettings />
        <AppDeviceSettings />
        <AccountSettings />
        <AboutSection />
      </div>
    </div>
  );
}
```

### Profile Card (Gradient)

```tsx
function ProfileCard() {
  const user = useUser(); // Your auth hook

  return (
    <div 
      className="
        relative overflow-hidden
        rounded-[24px] p-6
        border border-white/8
      "
      style={{
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(59, 130, 246, 0.2))',
      }}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <img
            src={user.avatar_url || '/default-avatar.png'}
            alt={user.full_name}
            className="w-20 h-20 rounded-full border-2 border-white/20"
          />
          <div 
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-[#081120] flex items-center justify-center"
          >
            <Check size={14} className="text-white" />
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg">{user.full_name}</h3>
          <p className="text-white/60 text-sm">{user.email}</p>
          
          {/* Stats */}
          <div className="flex gap-4 mt-2">
            <StatBadge label="Streak" value="7🔥" />
            <StatBadge label="Tasks" value="142" />
            <StatBadge label="Score" value="95%" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/10 rounded-[12px] px-3 py-1">
      <p className="text-white/50 text-xs">{label}</p>
      <p className="text-white font-semibold text-sm">{value}</p>
    </div>
  );
}
```

### Notification Settings (Blue Accent)

```tsx
function NotificationSettings() {
  const [enabled, setEnabled] = useState(true);
  const [interval, setInterval] = useState(30);

  return (
    <SettingsSection
      title="Notifications"
      icon={<Bell size={20} />}
      accentColor="#3B82F6"
    >
      <SettingToggle
        label="Push Notifications"
        description="Receive task reminders"
        enabled={enabled}
        onChange={setEnabled}
        accentColor="#3B82F6"
      />

      <SettingSelect
        label="Reminder Interval"
        description="How often to remind you"
        value={interval}
        onChange={setInterval}
        options={[
          { value: 15, label: '15 minutes' },
          { value: 30, label: '30 minutes' },
          { value: 60, label: '1 hour' },
          { value: 90, label: '90 minutes' },
        ]}
      />

      <SettingToggle
        label="Morning Digest"
        description="Daily summary at 7:00 AM"
        enabled={true}
        onChange={() => {}}
        accentColor="#3B82F6"
      />
    </SettingsSection>
  );
}
```

### AI Settings (Purple Accent)

```tsx
function AISettings() {
  const [autoExtract, setAutoExtract] = useState(true);
  const [confidence, setConfidence] = useState(80);

  return (
    <SettingsSection
      title="AI Settings"
      icon={<Brain size={20} />}
      accentColor="#7C3AED"
    >
      <SettingToggle
        label="Auto Task Extraction"
        description="Automatically parse tasks from messages"
        enabled={autoExtract}
        onChange={setAutoExtract}
        accentColor="#7C3AED"
      />

      <SettingSlider
        label="Confidence Threshold"
        description={`Only save tasks with ${confidence}%+ confidence`}
        value={confidence}
        onChange={setConfidence}
        min={50}
        max={100}
        accentColor="#7C3AED"
      />

      <SettingToggle
        label="AI Suggestions"
        description="Get productivity insights"
        enabled={true}
        onChange={() => {}}
        accentColor="#7C3AED"
      />
    </SettingsSection>
  );
}
```

### App & Device Settings (Cyan Accent)

```tsx
function AppDeviceSettings() {
  const [offlineMode, setOfflineMode] = useState(false);
  const [storageUsed, setStorageUsed] = useState(24); // MB

  return (
    <SettingsSection
      title="App & Device"
      icon={<Smartphone size={20} />}
      accentColor="#06B6D4"
    >
      {/* Install App Card */}
      <InstallAppCard />

      {/* Offline Mode */}
      <SettingToggle
        label="Offline Mode"
        description="Cache data for offline access"
        enabled={offlineMode}
        onChange={setOfflineMode}
        accentColor="#06B6D4"
        icon={offlineMode ? <WifiOff size={18} /> : <Wifi size={18} />}
      />

      {/* Storage Usage */}
      <div className="bg-white/5 rounded-[16px] p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <HardDrive size={18} className="text-cyan-400" />
            <span className="text-white font-medium">Storage Usage</span>
          </div>
          <span className="text-white/60 text-sm">{storageUsed} MB</span>
        </div>

        {/* Storage Bar */}
        <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
          <div 
            className="h-full rounded-full"
            style={{
              width: `${(storageUsed / 100) * 100}%`,
              background: 'linear-gradient(90deg, #06B6D4, #3B82F6)',
            }}
          />
        </div>

        {/* Clear Cache Button */}
        <button className="
          w-full py-2 rounded-[12px]
          bg-white/10 hover:bg-white/20
          text-white text-sm font-medium
          transition-all duration-300
        ">
          <Trash2 size={16} className="inline mr-2" />
          Clear Cache
        </button>
      </div>

      {/* Sync Status */}
      <div className="bg-white/5 rounded-[16px] p-4">
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-sm">Last synced</span>
          <span className="text-cyan-400 text-sm font-medium">2 mins ago</span>
        </div>
      </div>
    </SettingsSection>
  );
}
```

### Reusable Setting Components

```tsx
function SettingsSection({ 
  title, 
  icon, 
  accentColor, 
  children 
}: SettingsSectionProps) {
  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center gap-2 px-2">
        <div 
          className="p-2 rounded-[12px]"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <div style={{ color: accentColor }}>
            {icon}
          </div>
        </div>
        <h2 className="text-white font-bold text-lg">{title}</h2>
      </div>

      {/* Section Content */}
      <div className="
        bg-[rgba(20,30,48,0.72)] backdrop-blur-[24px]
        border border-white/8 rounded-[24px]
        p-4 space-y-4
      ">
        {children}
      </div>
    </div>
  );
}

function SettingToggle({ 
  label, 
  description, 
  enabled, 
  onChange, 
  accentColor,
  icon 
}: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {icon}
          <h4 className="text-white font-semibold">{label}</h4>
        </div>
        <p className="text-white/60 text-sm mt-1">{description}</p>
      </div>

      {/* Glowing Toggle */}
      <button
        onClick={() => onChange(!enabled)}
        className="
          relative w-14 h-8 rounded-full
          transition-all duration-300
          hover:scale-105
        "
        style={{
          backgroundColor: enabled ? accentColor : 'rgba(255,255,255,0.1)',
          boxShadow: enabled ? `0 0 20px ${accentColor}40` : 'none',
        }}
      >
        <div 
          className="
            absolute top-1 w-6 h-6 rounded-full bg-white
            transition-all duration-300
            shadow-lg
          "
          style={{
            left: enabled ? 'calc(100% - 28px)' : '4px',
          }}
        />
      </button>
    </div>
  );
}

function SettingSelect({ 
  label, 
  description, 
  value, 
  onChange, 
  options 
}: SettingSelectProps) {
  return (
    <div>
      <h4 className="text-white font-semibold mb-1">{label}</h4>
      <p className="text-white/60 text-sm mb-3">{description}</p>
      
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="
          w-full px-4 py-3 rounded-[16px]
          bg-white/10 border border-white/20
          text-white font-medium
          focus:outline-none focus:border-white/40
          transition-all duration-300
        "
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SettingSlider({ 
  label, 
  description, 
  value, 
  onChange, 
  min, 
  max, 
  accentColor 
}: SettingSliderProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-white font-semibold">{label}</h4>
        <span className="text-white/80 font-bold">{value}%</span>
      </div>
      <p className="text-white/60 text-sm mb-3">{description}</p>
      
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${value}%, rgba(255,255,255,0.1) ${value}%, rgba(255,255,255,0.1) 100%)`,
        }}
      />
    </div>
  );
}
```

### Micro-Interactions CSS

```css
/* Glowing Toggle Animation */
@keyframes toggle-glow {
  0%, 100% {
    box-shadow: 0 0 15px var(--accent-color);
  }
  50% {
    box-shadow: 0 0 25px var(--accent-color);
  }
}

.toggle-active {
  animation: toggle-glow 2s ease-in-out infinite;
}

/* Magnetic Button Effect */
.magnetic-button {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.magnetic-button:hover {
  transform: scale(1.05);
}

.magnetic-button:active {
  transform: scale(0.95);
}

/* Install Button Pulse */
@keyframes install-pulse {
  0%, 100% {
    box-shadow: 0 4px 20px rgba(6, 182, 212, 0.4);
  }
  50% {
    box-shadow: 0 4px 30px rgba(6, 182, 212, 0.6);
  }
}

.install-button {
  animation: install-pulse 2s ease-in-out infinite;
}

/* Subtle Hover Blur */
.hover-blur {
  transition: filter 0.3s ease;
}

.hover-blur:hover {
  filter: brightness(1.1) blur(0.5px);
}
```

### Example: Task State

```tsx
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Initial fetch
    fetchTasks();

    // Real-time subscription
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => [...prev, payload.new as Task]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) =>
              prev.map((t) => (t.id === payload.new.id ? (payload.new as Task) : t))
            );
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true });
    
    if (data) setTasks(data);
  };

  return (
    <div>
      {/* Render tasks */}
    </div>
  );
}
```

## 🔄 Data Fetching Patterns

### Server Components (Recommended)

```tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .order('due_date', { ascending: true });

  return (
    <div>
      {tasks?.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
```

### Client Components (for interactivity)

```tsx
'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const supabase = createClientComponentClient();

  const handleSubmit = async () => {
    // Send to AI API
    const response = await fetch('/api/parse-task', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    
    const { tasks } = await response.json();
    
    // Save to database
    for (const task of tasks) {
      await supabase.from('tasks').insert(task);
    }
  };

  return (
    <div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your tasks..."
      />
      <button onClick={handleSubmit}>Send</button>
    </div>
  );
}
```

## 🧪 Testing

### Component Testing with Jest

```tsx
import { render, screen } from '@testing-library/react';
import TaskCard from '@/components/TaskCard';

describe('TaskCard', () => {
  it('renders task title', () => {
    const task = {
      id: '1',
      title: 'Math Homework',
      subject: 'Math',
      due_date: '2025-05-22',
      status: 'pending',
    };

    render(<TaskCard task={task} onStatusChange={() => {}} />);
    
    expect(screen.getByText('Math Homework')).toBeInTheDocument();
  });
});
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

## 🔗 Related Guides

- [Backend Guide](./BACKEND.md) — API routes and database
- [UI/UX Guide](./UI.md) — Design system and components
- [PWA Guide](./PWA.md) — Progressive Web App features
