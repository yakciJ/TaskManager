"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TaskItem, TaskPriority } from "@/lib/types";
import { updateTask, deleteTask } from "@/lib/api";

interface TaskCardProps {
  task: TaskItem;
  onUpdate: () => void;
}

const priorityLabel = ["Low", "Medium", "High"];
const priorityClass = ["low", "medium", "high"];

export default function TaskCard({ task, onUpdate }: TaskCardProps) {
  const router = useRouter();
  const [toggling, setToggling] = useState(false);

  const completedSubs = task.subTasks.filter((s) => s.isCompleted).length;
  const totalSubs = task.subTasks.length;
  const progress = totalSubs > 0 ? (completedSubs / totalSubs) * 100 : 0;

  const isOverdue =
    task.deadline &&
    !task.isCompleted &&
    new Date(task.deadline) < new Date();

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setToggling(true);
    try {
      await updateTask(task.id, {
        title: task.title,
        description: task.description,
        priority: task.priority,
        deadline: task.deadline?.slice(0, 10),
        isCompleted: !task.isCompleted,
      });
      onUpdate();
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this task?")) return;
    await deleteTask(task.id);
    onUpdate();
  };

  return (
    <div
      className={`task-card priority-${priorityClass[task.priority]} ${
        task.isCompleted ? "completed" : ""
      }`}
      onClick={() => router.push(`/tasks/${task.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/tasks/${task.id}`)}
    >
      {/* Checkbox */}
      <button
        className={`checkbox ${task.isCompleted ? "checked" : ""}`}
        onClick={handleToggle}
        disabled={toggling}
        aria-label="Toggle complete"
      >
        {task.isCompleted && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="1.5,5 4,7.5 8.5,2.5" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: task.isCompleted
                ? "var(--text-muted)"
                : "var(--text-primary)",
              textDecoration: task.isCompleted ? "line-through" : "none",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {task.title}
          </h3>
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <span
              className={`badge badge-priority-${priorityClass[task.priority]}`}
            >
              {priorityLabel[task.priority]}
            </span>
          </div>
        </div>

        {task.description && (
          <p
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              marginTop: 3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.taskTags.length > 0 && (
          <div
            style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}
          >
            {task.taskTags.map((tt) => (
              <span
                key={tt.tagId}
                className="tag-chip"
                style={{
                  background: tt.tag.colorHex + "25",
                  color: tt.tag.colorHex,
                }}
              >
                {tt.tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 10,
          }}
        >
          {totalSubs > 0 && (
            <span
              style={{ fontSize: 11, color: "var(--text-muted)" }}
            >{`${completedSubs}/${totalSubs} subtasks`}</span>
          )}
          {task.deadline && (
            <span
              style={{
                fontSize: 11,
                color: isOverdue ? "var(--danger)" : "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 0 0-1 1v1H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1V3a1 1 0 1 0-2 0v1H7V3a1 1 0 0 0-1-1zm0 5a1 1 0 0 0 0 2h8a1 1 0 1 0 0-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              {new Date(task.deadline).toLocaleDateString()}
            </span>
          )}
          <span
            style={{
              marginLeft: "auto",
              fontSize: 11,
              color: "var(--text-muted)",
            }}
          >
            {new Date(task.createdAt).toLocaleDateString()}
          </span>
          <button
            className="btn-icon btn-sm"
            style={{ padding: "3px", border: "none" }}
            onClick={handleDelete}
            aria-label="Delete task"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 0 0-.894.553L7.382 4H4a1 1 0 0 0 0 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a1 1 0 1 0 0-2h-3.382l-.724-1.447A1 1 0 0 0 11 2H9zM7 8a1 1 0 0 1 2 0v6a1 1 0 1 1-2 0V8zm4 0a1 1 0 1 1 2 0v6a1 1 0 1 1-2 0V8z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Progress bar for subtasks */}
        {totalSubs > 0 && (
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
