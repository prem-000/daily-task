"use client"

import React, { useState, useEffect } from 'react'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { useToast } from '@/components/ui/toast'
import { Download, X } from 'lucide-react'

const DISMISSED_KEY = 'pwa-banner-dismissed'
const DISMISS_DURATION_MS = 3 * 24 * 60 * 60 * 1000 // 3 days

export default function PWAInstallBanner() {
  const { isInstallable, triggerInstall } = usePWAInstall()
  const { showToast } = useToast()
  const [visible, setVisible] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    if (!isInstallable) return

    // Check if dismissed recently
    try {
      const dismissedAt = localStorage.getItem(DISMISSED_KEY)
      if (dismissedAt) {
        const elapsed = Date.now() - parseInt(dismissedAt, 10)
        if (elapsed < DISMISS_DURATION_MS) return // still within 3-day window
      }
    } catch {
      // localStorage may be blocked in some contexts
    }

    // Small delay to avoid jarring flash on load
    const timer = setTimeout(() => setVisible(true), 1500)
    return () => clearTimeout(timer)
  }, [isInstallable])

  const handleDismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem(DISMISSED_KEY, Date.now().toString())
    } catch {
      // ignore
    }
  }

  const handleInstall = async () => {
    setInstalling(true)
    try {
      const accepted = await triggerInstall()
      if (accepted) {
        showToast('App installed successfully! 🎉', 'success')
        setVisible(false)
      }
    } finally {
      setInstalling(false)
    }
  }

  if (!visible) return null

  return (
    <>
      {/* Backdrop blur overlay hint on mobile */}
      <div
        style={{
          position: 'fixed',
          // Mobile: full-width above bottom nav; Desktop: bottom-right corner
          bottom: 'calc(64px + 12px)',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          paddingLeft: '12px',
          paddingRight: '12px',
          zIndex: 9999,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            // On desktop shift to right
          }}
        >
          <div
            className="pwa-banner"
            style={{ pointerEvents: 'auto' }}
          >
            {/* Left: icon + text */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
              {/* App icon */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: 'rgba(0,212,170,0.15)',
                  border: '1.5px solid rgba(0,212,170,0.30)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src="/icon-192.png"
                  alt="StudyFlow"
                  style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 8 }}
                />
              </div>

              {/* Text */}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#F0F4FF', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                  Install StudyFlow
                </div>
                <div style={{ fontSize: 11, color: '#8B95B0', marginTop: 2, whiteSpace: 'nowrap' }}>
                  Add to home screen
                </div>
              </div>
            </div>

            {/* Right: Install + close */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <button
                onClick={handleInstall}
                disabled={installing}
                style={{
                  width: 80,
                  height: 34,
                  borderRadius: 999,
                  background: 'linear-gradient(135deg, #00D4AA, #00b896)',
                  border: 'none',
                  color: '#000',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: installing ? 'not-allowed' : 'pointer',
                  opacity: installing ? 0.7 : 1,
                  transition: 'transform 0.15s, opacity 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}
                onMouseEnter={e => { if (!installing) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
              >
                {installing ? (
                  <span style={{ fontSize: 10 }}>...</span>
                ) : (
                  <>
                    <Download size={11} strokeWidth={2.5} />
                    Install
                  </>
                )}
              </button>

              <button
                onClick={handleDismiss}
                aria-label="Dismiss install banner"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  border: 'none',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.45)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s, color 0.15s',
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  const btn = e.currentTarget as HTMLButtonElement
                  btn.style.background = 'rgba(255,255,255,0.12)'
                  btn.style.color = 'rgba(255,255,255,0.8)'
                }}
                onMouseLeave={e => {
                  const btn = e.currentTarget as HTMLButtonElement
                  btn.style.background = 'rgba(255,255,255,0.06)'
                  btn.style.color = 'rgba(255,255,255,0.45)'
                }}
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inline styles for animation + design */}
      <style>{`
        .pwa-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(17, 24, 39, 0.95);
          border: 1px solid rgba(0, 212, 170, 0.30);
          border-radius: 16px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 212, 170, 0.08);
          animation: bannerSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          min-height: 72px;
        }

        @keyframes bannerSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (min-width: 640px) {
          .pwa-banner-outer {
            justify-content: flex-end;
          }
        }
      `}</style>
    </>
  )
}
