"use client";

import { useState, useEffect, useCallback } from "react";
import { getTags, createTag, deleteTag } from "@/lib/api";
import { Tag } from "@/lib/types";
import Modal from "@/components/Modal";

const PRESET_COLORS = [
  "#7c6af7", "#4caf79", "#f0a04b", "#e05c6c",
  "#4db6e5", "#e070c3", "#a0c97a", "#f7c262",
  "#6c8efb", "#ff7f7f",
];

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTags(await getTags());
    } catch {
      // API offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) { setError("Name is required."); return; }
    setCreating(true);
    setError("");
    try {
      await createTag({ name: newName.trim(), colorHex: newColor });
      setNewName("");
      setNewColor(PRESET_COLORS[0]);
      setShowCreate(false);
      load();
    } catch {
      setError("Failed to create tag.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete tag "${name}"? It will be removed from all tasks.`)) return;
    await deleteTag(id);
    load();
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tags</h1>
          <p className="page-subtitle">{tags.length} tag{tags.length !== 1 ? "s" : ""}</p>
        </div>
        <button id="tags-new" className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1z" clipRule="evenodd" />
          </svg>
          New Tag
        </button>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 64, borderRadius: "var(--radius-md)" }} />
          ))}
        </div>
      ) : tags.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M17.707 9.293a1 1 0 0 1 0 1.414l-7 7a1 1 0 0 1-1.414 0l-7-7A.997.997 0 0 1 2 10V5a3 3 0 0 1 3-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" clipRule="evenodd" />
          </svg>
          <h3>No tags yet</h3>
          <p>Create tags to organize and filter your tasks</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowCreate(true)}>
            Create your first tag
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                borderLeft: `3px solid ${tag.colorHex}`,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: tag.colorHex + "25",
                  border: `2px solid ${tag.colorHex}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill={tag.colorHex}>
                  <path fillRule="evenodd" d="M17.707 9.293a1 1 0 0 1 0 1.414l-7 7a1 1 0 0 1-1.414 0l-7-7A.997.997 0 0 1 2 10V5a3 3 0 0 1 3-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {tag.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                  {tag.colorHex}
                </div>
              </div>
              <button
                className="btn-icon"
                style={{ padding: 4, border: "none", flexShrink: 0 }}
                onClick={() => handleDelete(tag.id, tag.name)}
                aria-label="Delete tag"
              >
                <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 0 0-.894.553L7.382 4H4a1 1 0 0 0 0 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a1 1 0 1 0 0-2h-3.382l-.724-1.447A1 1 0 0 0 11 2H9z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <Modal title="New Tag" onClose={() => setShowCreate(false)} width={380}>
          <form onSubmit={handleCreate}>
            {error && (
              <div style={{ background: "var(--danger-dim)", color: "var(--danger)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="input-label">Tag Name *</label>
              <input
                id="tag-name"
                className="input"
                placeholder="e.g. Coding, Health, Personal..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="input-label">Color</label>
              <div className="color-swatch-grid">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`color-swatch ${newColor === c ? "selected" : ""}`}
                    style={{ background: c }}
                    onClick={() => setNewColor(c)}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  style={{ width: 36, height: 36, border: "none", background: "none", cursor: "pointer", padding: 0 }}
                />
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Or pick a custom color</span>
              </div>

              {/* Preview */}
              <div style={{ marginTop: 12 }}>
                <span className="input-label">Preview</span>
                <span
                  className="tag-chip"
                  style={{ background: newColor + "25", color: newColor, display: "inline-flex", marginTop: 4 }}
                >
                  {newName || "Tag Name"}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              <button id="create-tag-submit" type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? <span className="spinner" /> : null}
                Create Tag
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
