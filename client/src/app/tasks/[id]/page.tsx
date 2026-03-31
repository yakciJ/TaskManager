"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getTask,
  updateTask,
  deleteTask,
  createSubTask,
  updateSubTask,
  deleteSubTask,
  getTags,
  addTagToTask,
  removeTagFromTask,
} from "@/lib/api";
import { TaskItem, SubTask, Tag, TaskPriority } from "@/lib/types";
import Link from "next/link";

const PRIORITY_LABELS = ["Low", "Medium", "High"];
const PRIORITY_CLASSES = ["low", "medium", "high"];

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [task, setTask] = useState<TaskItem | null>(null);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPriority, setEditPriority] = useState<TaskPriority>(TaskPriority.Medium);
  const [editDeadline, setEditDeadline] = useState("");
  const [saving, setSaving] = useState(false);
  const [newSubTask, setNewSubTask] = useState("");
  const [addingSubTask, setAddingSubTask] = useState(false);

  const load = useCallback(async () => {
    try {
      const [t, tags] = await Promise.all([getTask(id), getTags()]);
      setTask(t);
      setAllTags(tags);
      setEditTitle(t.title);
      setEditDesc(t.description ?? "");
      setEditPriority(t.priority);
      setEditDeadline(t.deadline ? t.deadline.slice(0, 10) : "");
    } catch {
      router.push("/tasks");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!task) return;
    setSaving(true);
    await updateTask(task.id, {
      title: editTitle,
      description: editDesc || undefined,
      priority: editPriority,
      deadline: editDeadline || undefined,
      isCompleted: task.isCompleted,
    });
    await load();
    setEditing(false);
    setSaving(false);
  };

  const handleToggleComplete = async () => {
    if (!task) return;
    await updateTask(task.id, {
      title: task.title,
      description: task.description,
      priority: task.priority,
      deadline: task.deadline?.slice(0, 10),
      isCompleted: !task.isCompleted,
    });
    load();
  };

  const handleDelete = async () => {
    if (!task || !confirm("Delete this task?")) return;
    await deleteTask(task.id);
    router.push("/tasks");
  };

  const handleAddSubTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newSubTask.trim()) return;
    setAddingSubTask(true);
    await createSubTask(task.id, { title: newSubTask.trim() });
    setNewSubTask("");
    await load();
    setAddingSubTask(false);
  };

  const handleToggleSubTask = async (sub: SubTask) => {
    await updateSubTask(sub.id, { title: sub.title, isCompleted: !sub.isCompleted });
    load();
  };

  const handleDeleteSubTask = async (subId: string) => {
    await deleteSubTask(subId);
    load();
  };

  const handleTagToggle = async (tagId: string) => {
    if (!task) return;
    const has = task.taskTags.some((tt) => tt.tagId === tagId);
    if (has) {
      await removeTagFromTask(task.id, tagId);
    } else {
      await addTagToTask(task.id, tagId);
    }
    load();
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh" }}>
        <span className="spinner" />
      </div>
    );
  }

  if (!task) return null;

  const completedSubs = task.subTasks.filter((s) => s.isCompleted).length;
  const totalSubs = task.subTasks.length;
  const isOverdue = task.deadline && !task.isCompleted && new Date(task.deadline) < new Date();

  return (
    <>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>
        <Link href="/tasks" style={{ color: "var(--text-secondary)", fontSize: 13, textDecoration: "none" }}>
          Tasks
        </Link>
        <span style={{ color: "var(--text-muted)" }}>/</span>
        <span style={{ color: "var(--text-primary)", fontSize: 13 }}>{task.title}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, alignItems: "start" }}>
        {/* Main Content */}
        <div>
          {/* Title row */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 24 }}>
            <button
              className={`checkbox ${task.isCompleted ? "checked" : ""}`}
              style={{ marginTop: 4 }}
              onClick={handleToggleComplete}
            >
              {task.isCompleted && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1.5,5 4,7.5 8.5,2.5" />
                </svg>
              )}
            </button>
            <div style={{ flex: 1 }}>
              {editing ? (
                <input
                  className="input"
                  style={{ fontSize: 20, fontWeight: 700, background: "transparent", padding: "4px 8px" }}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  autoFocus
                />
              ) : (
                <h1
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: task.isCompleted ? "var(--text-muted)" : "var(--text-primary)",
                    textDecoration: task.isCompleted ? "line-through" : "none",
                    lineHeight: 1.3,
                    letterSpacing: "-0.3px",
                    cursor: "text",
                  }}
                  onClick={() => setEditing(true)}
                  title="Click to edit"
                >
                  {task.title}
                </h1>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <span className={`badge badge-priority-${PRIORITY_CLASSES[task.priority]}`}>
                  {PRIORITY_LABELS[task.priority]}
                </span>
                {task.deadline && (
                  <span style={{ fontSize: 12, color: isOverdue ? "var(--danger)" : "var(--text-secondary)" }}>
                    📅 Due {new Date(task.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {editing ? (
                <>
                  <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                    {saving ? <span className="spinner" style={{ width: 12, height: 12 }} /> : "Save"}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                </>
              ) : (
                <>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="section-header">Description</div>
            {editing ? (
              <textarea
                className="input"
                style={{ minHeight: 100 }}
                value={editDesc}
                placeholder="Add a description..."
                onChange={(e) => setEditDesc(e.target.value)}
              />
            ) : (
              <p style={{ fontSize: 13.5, color: task.description ? "var(--text-secondary)" : "var(--text-muted)", lineHeight: 1.7 }}>
                {task.description || "No description. Click Edit to add one."}
              </p>
            )}

            {editing && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
                <div className="form-group">
                  <label className="input-label">Priority</label>
                  <select
                    className="select"
                    value={editPriority}
                    onChange={(e) => setEditPriority(Number(e.target.value) as TaskPriority)}
                  >
                    <option value={TaskPriority.Low}>🟢 Low</option>
                    <option value={TaskPriority.Medium}>🟡 Medium</option>
                    <option value={TaskPriority.High}>🔴 High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="input-label">Deadline</label>
                  <input
                    type="date"
                    className="input"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* SubTasks */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div className="section-header" style={{ margin: 0 }}>
                Sub-tasks {totalSubs > 0 && `(${completedSubs}/${totalSubs})`}
              </div>
            </div>

            {totalSubs > 0 && (
              <div className="progress-bar" style={{ marginBottom: 16 }}>
                <div className="progress-fill" style={{ width: `${(completedSubs / totalSubs) * 100}%` }} />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {task.subTasks.map((sub) => (
                <div
                  key={sub.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-base)",
                    border: "1px solid var(--bg-border)",
                    transition: "border-color 0.15s",
                  }}
                >
                  <button
                    className={`checkbox ${sub.isCompleted ? "checked" : ""}`}
                    style={{ width: 16, height: 16 }}
                    onClick={() => handleToggleSubTask(sub)}
                  >
                    {sub.isCompleted && (
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1.5,5 4,7.5 8.5,2.5" />
                      </svg>
                    )}
                  </button>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 13,
                      color: sub.isCompleted ? "var(--text-muted)" : "var(--text-primary)",
                      textDecoration: sub.isCompleted ? "line-through" : "none",
                    }}
                  >
                    {sub.title}
                  </span>
                  <button
                    className="btn-icon"
                    style={{ padding: 4, border: "none" }}
                    onClick={() => handleDeleteSubTask(sub.id)}
                  >
                    <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 0 0-.894.553L7.382 4H4a1 1 0 0 0 0 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a1 1 0 1 0 0-2h-3.382l-.724-1.447A1 1 0 0 0 11 2H9z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddSubTask} style={{ display: "flex", gap: 8 }}>
              <input
                id="new-subtask-input"
                className="input"
                placeholder="Add a sub-task..."
                value={newSubTask}
                onChange={(e) => setNewSubTask(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" disabled={addingSubTask || !newSubTask.trim()}>
                Add
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Tags */}
          <div className="card">
            <div className="section-header">Tags</div>
            {allTags.length === 0 ? (
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                No tags yet. <Link href="/tags" style={{ color: "var(--accent)" }}>Create one</Link>
              </p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {allTags.map((tag) => {
                  const assigned = task.taskTags.some((tt) => tt.tagId === tag.id);
                  return (
                    <button
                      key={tag.id}
                      className="tag-chip"
                      onClick={() => handleTagToggle(tag.id)}
                      style={{
                        background: assigned ? tag.colorHex + "30" : "var(--bg-base)",
                        color: assigned ? tag.colorHex : "var(--text-muted)",
                        border: `1px solid ${assigned ? tag.colorHex : "var(--bg-border)"}`,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="card">
            <div className="section-header">Details</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Created", value: new Date(task.createdAt).toLocaleString() },
                { label: "Status", value: task.isCompleted ? "✅ Completed" : "⏳ In Progress" },
                {
                  label: "Deadline",
                  value: task.deadline
                    ? new Date(task.deadline).toLocaleDateString()
                    : "None",
                },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 2 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
