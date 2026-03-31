"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

export default function Modal({ title, onClose, children, width = 480 }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    // Prevent scrolling behind modal
    document.body.style.overflow = "hidden";
    
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="modal-overlay"
      ref={overlayRef}
      onMouseDown={(e) => {
        // use onMouseDown to avoid accidental closing if user starts drag inside and ends outside
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="modal" style={{ width }}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button
            className="btn-icon"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="1" y1="1" x2="13" y2="13" />
              <line x1="13" y1="1" x2="1" y2="13" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

