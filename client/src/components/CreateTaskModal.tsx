"use client";

import { useState } from "react";
import Modal from "./Modal";
import { createTask } from "@/lib/api";
import { TaskPriority } from "@/lib/types";

interface CreateTaskModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateTaskModal({ onClose, onCreated }: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.Medium);
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    setLoading(true);
    setError("");
    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        deadline: deadline || undefined,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError("Failed to create task. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="New Task" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              background: "var(--danger-dim)",
              color: "var(--danger)",
              borderRadius: "var(--radius-sm)",
              padding: "10px 14px",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="input-label">Title *</label>
          <input
            id="task-title"
            className="input"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="input-label">Description</label>
          <textarea
            id="task-desc"
            className="input"
            placeholder="Add some details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="form-group">
            <label className="input-label">Priority</label>
            <select
              id="task-priority"
              className="select"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value) as TaskPriority)}
            >
              <option value={TaskPriority.Low}>🟢 Low</option>
              <option value={TaskPriority.Medium}>🟡 Medium</option>
              <option value={TaskPriority.High}>🔴 High</option>
            </select>
          </div>

          <div className="form-group">
            <label className="input-label">Deadline</label>
            <input
              id="task-deadline"
              type="date"
              className="input"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              style={{ colorScheme: "dark" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            id="create-task-submit"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : null}
            Create Task
          </button>
        </div>
      </form>
    </Modal>
  );
}
