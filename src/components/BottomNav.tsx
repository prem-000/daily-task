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
    <nav className={`
      fixed bottom-[14px] left-4 right-4
      h-[78px] rounded-[28px]
      bg-[rgba(17,24,39,0.8)] backdrop-blur-[20px]
      border border-white/8
      shadow-2xl z-50
      glass-nav
    `}>
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
                  className="absolute -bottom-1 w-1 h-1 rounded-full animate-pulse"
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
