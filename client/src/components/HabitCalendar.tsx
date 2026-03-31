"use client";

import { useState } from "react";
import { DailyTask } from "@/lib/types";
import { logDailyTask, deleteDailyTask } from "@/lib/api";

interface HabitCalendarProps {
  habit: DailyTask;
  year: number;
  month: number; // 0-indexed
  onUpdate: () => void;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function HabitCalendar({
  habit,
  onUpdate,
}: { habit: DailyTask; onUpdate: () => void }) {
  const [viewDate, setViewDate] = useState(new Date());
  const [loading, setLoading] = useState<number | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const today = new Date();

  const prevMonth = () => {
    setViewDate((d) => {
      const n = new Date(d);
      n.setMonth(n.getMonth() - 1);
      return n;
    });
  };

  const nextMonth = () => {
    setViewDate((d) => {
      const n = new Date(d);
      n.setMonth(n.getMonth() + 1);
      return n;
    });
  };

  // ... (mapping logic)
  const logMap = new Map<string, boolean>();
  habit.logs.forEach((log) => {
    const d = new Date(log.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    logMap.set(key, log.isCompleted);
  });

  const handleDayClick = async (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const current = logMap.get(dateStr) ?? false;
    setLoading(day);
    try {
      await logDailyTask(habit.id, dateStr, !current);
      onUpdate();
    } finally {
      setLoading(null);
    }
  };

  const monthCompletions = Array.from({ length: daysInMonth }, (_, i) => {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
    return logMap.get(key) ? 1 : 0;
  }).reduce((a: number, b) => a + b, 0);

  return (
    <div className="habit-stats">
      {/* Month Navigator */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn-icon" onClick={prevMonth}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 0 1 0 1.414L9.414 10l3.293 3.293a1 1 0 0 1-1.414 1.414l-4-4a1 1 0 0 1 0-1.414l4-4a1 1 0 0 1 1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            {MONTH_NAMES[month]} {year}
          </span>
          <button className="btn-icon" onClick={nextMonth} disabled={viewDate >= new Date()}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 0 1 0-1.414L10.586 10 7.293 6.707a1 1 0 0 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          <span style={{ color: "var(--accent)", fontWeight: 700 }}>{monthCompletions}</span> completions
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="calendar-grid" style={{ marginBottom: 4 }}>
        {DAY_LABELS.map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>
            {d}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isCompleted = logMap.get(key) ?? false;
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
          const isFuture = new Date(year, month, day) > today;

          return (
            <button
              key={day}
              className={`calendar-day ${isCompleted ? "completed" : ""} ${isToday ? "today" : ""}`}
              onClick={() => !isFuture && handleDayClick(day)}
              disabled={isFuture || loading === day}
              style={{ opacity: isFuture ? 0.25 : 1 }}
            >
              {loading === day ? <span className="spinner-sm" /> : day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
