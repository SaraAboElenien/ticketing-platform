/**
 * Modal — accessible dialog overlay.
 * Closes on Escape key and backdrop click.
 */

import React, { useEffect, useRef } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Maximum width class (default: "max-w-md") */
  maxWidth?: string;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={`w-full ${maxWidth} rounded-xl bg-bg2 border border-[rgba(255,255,255,.07)] shadow-xl`}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,.07)] px-6 py-4">
            <h2 className="text-lg font-semibold text-[#F8F9FF]">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-[rgba(248,249,255,.45)] hover:bg-[rgba(255,255,255,.05)] hover:text-[#F8F9FF]"
              aria-label="Close dialog"
            >
              {/* X icon */}
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {/* Body */}
        <div className="px-6 py-4 text-[#F8F9FF]">{children}</div>
      </div>
    </div>
  );
}

