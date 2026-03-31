"use client";

import { useEffect, useState, useCallback } from "react";
import { getTasks, getDailyTasks } from "@/lib/api";
import { TaskItem, DailyTask, TaskPriority } from "@/lib/types";
import TaskCard from "@/components/TaskCard";
import CreateTaskModal from "@/components/CreateTaskModal";
import Link from "next/link";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [habits, setHabits] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, h] = await Promise.all([getTasks(), getDailyTasks()]);
      setTasks(t);
      setHabits(h);
    } catch {
      // API not connected yet — show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const incompleteTasks = tasks.filter((t) => !t.isCompleted);
  const completedToday = tasks.filter(
    (t) => t.isCompleted && t.createdAt.slice(0, 10) === todayStr
  );
  const highPriority = incompleteTasks.filter((t) => t.priority === TaskPriority.High);
  const overdue = incompleteTasks.filter(
    (t) => t.deadline && new Date(t.deadline) < today
  );

  const activeHabits = habits.filter((h) => h.isActive);
  const habitsCompletedToday = activeHabits.filter((h) =>
    h.logs.some((l) => {
      const d = new Date(l.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return key === todayStr && l.isCompleted;
    })
  );

  const upcomingTasks = incompleteTasks
    .filter((t) => t.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 5);

  const recentTasks = incompleteTasks.slice(0, 5);

  const statCards = [
    {
      label: "Open Tasks",
      value: incompleteTasks.length,
      sub: `${tasks.length} total`,
      color: "var(--accent)",
    },
    {
      label: "High Priority",
      value: highPriority.length,
      sub: "need attention",
      color: "var(--danger)",
    },
    {
      label: "Overdue",
      value: overdue.length,
      sub: "past deadline",
      color: "var(--warning)",
    },
    {
      label: "Habits Today",
      value: `${habitsCompletedToday.length}/${activeHabits.length}`,
      sub: "completed",
      color: "var(--success)",
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            {today.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <button
          id="dashboard-new-task"
          className="btn btn-primary"
          onClick={() => setShowCreate(true)}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1z"
              clipRule="evenodd"
            />
          </svg>
          New Task
        </button>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card">
              <div className="skeleton" style={{ height: 12, width: "50%", marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 28, width: "30%" }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="stats-grid">
          {statCards.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-card-label">{s.label}</div>
              <div className="stat-card-value" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="stat-card-sub">{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Two-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Recent Tasks */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <h2 className="section-header" style={{ margin: 0 }}>
              Recent Tasks
            </h2>
            <Link
              href="/tasks"
              style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none" }}
            >
              View all →
            </Link>
          </div>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 72, borderRadius: "var(--radius-md)" }} />
              ))}
            </div>
          ) : recentTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 16px" }}>
              <svg width="32" height="32" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 0 0 0 2h2a1 1 0 1 0 0-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 0 1 2-2 3 3 0 0 0 3 3h2a3 3 0 0 0 3-3 2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5z" clipRule="evenodd" />
              </svg>
              <h3>No tasks yet</h3>
              <p>Create your first task to get started</p>
            </div>
          ) : (
            <div className="tasks-list">
              {recentTasks.map((t) => (
                <TaskCard key={t.id} task={t} onUpdate={load} />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <h2 className="section-header" style={{ margin: 0 }}>
              Upcoming Deadlines
            </h2>
            <Link
              href="/habits"
              style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none" }}
            >
              Habits →
            </Link>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 72, borderRadius: "var(--radius-md)" }} />
              ))}
            </div>
          ) : upcomingTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 16px" }}>
              <svg width="32" height="32" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 0 0-1 1v1H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1V3a1 1 0 1 0-2 0v1H7V3a1 1 0 0 0-1-1zM6 7a1 1 0 0 0 0 2h8a1 1 0 1 0 0-2H6z" clipRule="evenodd" />
              </svg>
              <h3>No upcoming deadlines</h3>
              <p>Tasks with deadlines will appear here</p>
            </div>
          ) : (
            <div className="tasks-list">
              {upcomingTasks.map((t) => (
                <TaskCard key={t.id} task={t} onUpdate={load} />
              ))}
            </div>
          )}

          {/* Today's Habits */}
          {!loading && activeHabits.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h2 className="section-header">Today's Habits</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {activeHabits.map((h) => {
                  const done = h.logs.some((l) => {
                    const d = new Date(l.date);
                    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                    return key === todayStr && l.isCompleted;
                  });
                  return (
                    <div
                      key={h.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 14px",
                        background: "var(--bg-surface)",
                        border: `1px solid ${done ? "var(--success)" : "var(--bg-border)"}`,
                        borderRadius: "var(--radius-sm)",
                        transition: "border-color 0.15s",
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: done ? "var(--success)" : "var(--text-muted)",
                          transition: "background 0.2s",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 13,
                          color: done ? "var(--text-secondary)" : "var(--text-primary)",
                          textDecoration: done ? "line-through" : "none",
                        }}
                      >
                        {h.title}
                      </span>
                      {done && (
                        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--success)" }}>
                          ✓ Done
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateTaskModal onClose={() => setShowCreate(false)} onCreated={load} />
      )}
    </>
  );
}
