"use client";

import { useState, useEffect, useCallback } from "react";
import { getDailyTasks } from "@/lib/api";
import { DailyTask } from "@/lib/types";
import HabitCard from "@/components/HabitCard";
import CreateHabitModal from "@/components/CreateHabitModal";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function HabitsPage() {
  const [habits, setHabits] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDailyTasks();
      setHabits(data);
    } catch {
      // API offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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

  const activeHabits = habits.filter((h) => h.isActive);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const completedToday = activeHabits.filter((h) =>
    h.logs.some((l) => {
      const d = new Date(l.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return key === todayStr && l.isCompleted;
    })
  ).length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Habits</h1>
          <p className="page-subtitle">
            {completedToday}/{activeHabits.length} completed today
          </p>
        </div>
        <button
          id="habits-new"
          className="btn btn-primary"
          onClick={() => setShowCreate(true)}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1z" clipRule="evenodd" />
          </svg>
          New Habit
        </button>
      </div>

      {/* Habits List */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 80, borderRadius: "var(--radius-md)" }}
            />
          ))}
        </div>
      ) : activeHabits.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 0 0-1 1v1H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1V3a1 1 0 1 0-2 0v1H7V3a1 1 0 0 0-1-1zm0 5a1 1 0 0 0 0 2h8a1 1 0 1 0 0-2H6z" clipRule="evenodd" />
          </svg>
          <h3>No habits yet</h3>
          <p>Add a daily habit to start tracking your streaks</p>
          <button
            className="btn btn-primary"
            style={{ marginTop: 16 }}
            onClick={() => setShowCreate(true)}
          >
            Add your first habit
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {activeHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onUpdate={load}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateHabitModal onClose={() => setShowCreate(false)} onCreated={load} />
      )}
    </>
  );
}
