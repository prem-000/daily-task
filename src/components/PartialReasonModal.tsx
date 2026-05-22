'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface PartialReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string | null) => void;
}

export default function PartialReasonModal({ isOpen, onClose, onSubmit }: PartialReasonModalProps) {
  const [reason, setReason] = useState('');

  // Reset textarea when modal opens
  useEffect(() => {
    if (isOpen) setReason('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSkip = () => {
    onSubmit(null);
    onClose();
    setReason('');
  };

  const handleSubmit = () => {
    onSubmit(reason.trim() || null);
    onClose();
    setReason('');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center"
        onClick={onClose}
      >
        {/* Sheet / Modal container — stop propagation so clicks inside don't close */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`
            w-full md:w-[400px]
            bg-[#111827]
            rounded-[20px_20px_0_0] md:rounded-2xl
            px-5 py-6 md:px-6 md:py-7
            flex flex-col gap-4
            animate-slide-up
          `}
          style={{
            minHeight: 'auto',
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white leading-snug">
                Why is this partial?
              </h2>
              <p className="text-xs text-white/40 mt-1 leading-relaxed">
                This won't be shown anywhere, just for tracking
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer shrink-0 mt-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, 200))}
              placeholder="e.g. Ran out of time, had other work..."
              maxLength={200}
              style={{
                height: '100px',
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: '10px',
                padding: '10px 12px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                color: '#F0F4FF',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) =>
                (e.currentTarget.style.border = '1px solid rgba(0,212,170,0.50)')
              }
              onBlur={(e) =>
                (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.10)')
              }
            />
            {/* Character counter */}
            <span
              className="absolute bottom-2.5 right-3 text-[10px] font-semibold pointer-events-none"
              style={{ color: reason.length >= 180 ? '#FFB347' : 'rgba(255,255,255,0.30)' }}
            >
              {reason.length} / 200
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-1">
            {/* Skip */}
            <button
              onClick={handleSkip}
              className={`
                flex-1 h-[42px] rounded-2xl
                border border-white/15
                text-white/70 hover:text-white hover:border-white/30
                text-sm font-bold
                transition-all cursor-pointer
                bg-transparent hover:bg-white/5
              `}
            >
              Skip
            </button>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              className={`
                flex-1 h-[42px] rounded-2xl
                bg-gradient-to-r from-[#00D4AA] to-emerald-500
                text-black font-extrabold text-sm
                hover:brightness-110 hover:scale-[1.02]
                active:scale-[0.98]
                transition-all cursor-pointer
                shadow-lg shadow-[#00D4AA]/20
              `}
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Slide-up animation */}
      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
        @media (min-width: 768px) {
          @keyframes slide-up {
            from { transform: scale(0.95) translateY(8px); opacity: 0; }
            to   { transform: scale(1)    translateY(0);   opacity: 1; }
          }
        }
      `}</style>
    </>
  );
}
