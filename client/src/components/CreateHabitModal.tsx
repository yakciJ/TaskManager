"use client";

import { useState } from "react";
import Modal from "./Modal";
import { createDailyTask } from "@/lib/api";

interface CreateHabitModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateHabitModal({ onClose, onCreated }: CreateHabitModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    setLoading(true);
    setError("");
    try {
      await createDailyTask({ title: title.trim(), description: description.trim() || undefined, isActive: true });
      onCreated();
      onClose();
    } catch {
      setError("Failed to create habit. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="New Habit" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ background: "var(--danger-dim)", color: "var(--danger)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}
        <div className="form-group">
          <label className="input-label">Habit Name *</label>
          <input
            id="habit-title"
            className="input"
            placeholder="e.g. 30 min exercise, Duolingo..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>
        <div className="form-group">
          <label className="input-label">Description</label>
          <textarea
            id="habit-desc"
            className="input"
            placeholder="Optional details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button id="create-habit-submit" type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            Add Habit
          </button>
        </div>
      </form>
    </Modal>
  );
}
