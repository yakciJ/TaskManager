"use client";

import { useState } from "react";
import { DailyTask } from "@/lib/types";
import { logDailyTask } from "@/lib/api";
import Modal from "./Modal";
import HabitCalendar from "./HabitCalendar";

interface HabitCardProps {
  habit: DailyTask;
  onUpdate: () => void;
}

export default function HabitCard({ habit, onUpdate }: HabitCardProps) {
  const [loading, setLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  
  const isCompletedToday = habit.logs.some(l => {
    const d = new Date(l.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return key === todayStr && l.isCompleted;
  });

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await logDailyTask(habit.id, todayStr, !isCompletedToday);
      onUpdate();
    } finally {
      setLoading(false);
    }
  };

  // Streak calculation
  let streak = 0;
  const logMap = new Map<string, boolean>();
  habit.logs.forEach((log) => {
    const d = new Date(log.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    logMap.set(key, log.isCompleted);
  });

  let checkDate = new Date(today);
  while (true) {
    const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, "0")}-${String(checkDate.getDate()).padStart(2, "0")}`;
    if (logMap.get(key)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else break;
  }

  return (
    <div className={`task-card habit-card ${isCompletedToday ? "completed" : ""}`}>
      {/* Checkbox */}
      <button
        className={`checkbox ${isCompletedToday ? "checked" : ""}`}
        onClick={handleToggle}
        disabled={loading}
        aria-label="Toggle complete today"
      >
        {isCompletedToday && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1.5,5 4,7.5 8.5,2.5" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div>
            <h3 style={{ 
              fontSize: 14, 
              fontWeight: 600, 
              color: isCompletedToday ? "var(--text-muted)" : "var(--text-primary)",
              textDecoration: isCompletedToday ? "line-through" : "none"
            }}>
              {habit.title}
            </h3>
            {habit.description && (
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                {habit.description}
              </p>
            )}
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: streak > 0 ? "var(--warning)" : "var(--text-muted)" }}>
                {streak}🔥
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>streak</div>
            </div>
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={() => setShowStats(true)}
              style={{ padding: "4px 8px" }}
            >
              Stats
            </button>
          </div>
        </div>
      </div>

      {showStats && (
        <Modal title={`${habit.title} - Tracking`} onClose={() => setShowStats(false)}>
          <div style={{ padding: 20 }}>
            <HabitCalendar 
              habit={habit} 
              onUpdate={onUpdate} 
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
