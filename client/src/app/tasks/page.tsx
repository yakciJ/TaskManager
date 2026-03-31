"use client";

import { useState, useEffect, useCallback } from "react";
import { getTasks, getTags } from "@/lib/api";
import { TaskItem, Tag, TaskPriority } from "@/lib/types";
import TaskCard from "@/components/TaskCard";
import CreateTaskModal from "@/components/CreateTaskModal";

type Filter = "all" | "active" | "completed" | "high" | "overdue";

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, tg] = await Promise.all([getTasks(), getTags()]);
      setTasks(t);
      setTags(tg);
    } catch {
      // API offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const now = new Date();

  const filtered = tasks.filter((t) => {
    if (filter === "active" && t.isCompleted) return false;
    if (filter === "completed" && !t.isCompleted) return false;
    if (filter === "high" && t.priority !== TaskPriority.High) return false;
    if (filter === "overdue" && (!t.deadline || new Date(t.deadline) >= now || t.isCompleted)) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedTag && !t.taskTags.some((tt) => tt.tagId === selectedTag)) return false;
    return true;
  });

  const filters: { key: Filter; label: string; count?: number }[] = [
    { key: "all", label: "All", count: tasks.length },
    { key: "active", label: "Active", count: tasks.filter((t) => !t.isCompleted).length },
    { key: "completed", label: "Completed", count: tasks.filter((t) => t.isCompleted).length },
    { key: "high", label: "High Priority", count: tasks.filter((t) => t.priority === TaskPriority.High && !t.isCompleted).length },
    { key: "overdue", label: "Overdue", count: tasks.filter((t) => t.deadline && new Date(t.deadline) < now && !t.isCompleted).length },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{tasks.filter((t) => !t.isCompleted).length} remaining</p>
        </div>
        <button id="tasks-new" className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1z" clipRule="evenodd" />
          </svg>
          New Task
        </button>
      </div>

      {/* Filter + Search bar */}
      <div className="filter-bar">
        <div className="search-bar">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.9 14.32a8 8 0 1 1 1.41-1.41l4.38 4.39a1 1 0 0 1-1.41 1.41l-4.38-4.39zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z" clipRule="evenodd" />
          </svg>
          <input
            id="tasks-search"
            className="input"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filters.map((f) => (
          <button
            key={f.key}
            className={`filter-chip ${filter === f.key ? "active" : ""}`}
            onClick={() => setFilter(f.key)}
            id={`filter-${f.key}`}
          >
            {f.label}
            {f.count !== undefined && f.count > 0 && (
              <span className="nav-badge" style={{ marginLeft: 4 }}>{f.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tag filters */}
      {tags.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          <button
            className={`filter-chip btn-sm ${selectedTag === null ? "active" : ""}`}
            onClick={() => setSelectedTag(null)}
          >
            All Tags
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              className={`filter-chip btn-sm ${selectedTag === tag.id ? "active" : ""}`}
              onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
              style={selectedTag === tag.id ? { borderColor: tag.colorHex, color: tag.colorHex } : {}}
            >
              <span style={{ width: 7, height: 7, background: tag.colorHex, borderRadius: "50%", display: "inline-block" }} />
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Task List */}
      {loading ? (
        <div className="tasks-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: "var(--radius-md)" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 0 0 0 2h2a1 1 0 1 0 0-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 0 1 2-2 3 3 0 0 0 3 3h2a3 3 0 0 0 3-3 2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5zm9.707 5.707a1 1 0 0 0-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <h3>No tasks found</h3>
          <p>{filter === "all" ? "Create your first task to get started!" : "Try a different filter."}</p>
        </div>
      ) : (
        <div className="tasks-list">
          {filtered.map((t) => (
            <TaskCard key={t.id} task={t} onUpdate={load} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateTaskModal onClose={() => setShowCreate(false)} onCreated={load} />
      )}
    </>
  );
}
