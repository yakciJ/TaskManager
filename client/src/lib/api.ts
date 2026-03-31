import {
  TaskItem,
  SubTask,
  Tag,
  DailyTask,
  DailyTaskLog,
  CreateTaskDto,
  CreateDailyTaskDto,
  CreateTagDto,
} from "./types";

const API_BASE = "http://localhost:5174/api";

async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  
  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}

// ── Tasks ──────────────────────────────────────────────────────────────────
export const getTasks = () => request<TaskItem[]>("/tasks");
export const getTask = (id: string) => request<TaskItem>(`/tasks/${id}`);
export const createTask = (data: CreateTaskDto) =>
  request<TaskItem>("/tasks", { method: "POST", body: JSON.stringify(data) });
export const updateTask = (
  id: string,
  data: { title: string; description?: string; priority: number; deadline?: string; isCompleted: boolean }
) =>
  request<void>(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const deleteTask = (id: string) =>
  request<void>(`/tasks/${id}`, { method: "DELETE" });

// ── SubTasks ───────────────────────────────────────────────────────────────
export const createSubTask = (taskId: string, data: { title: string }) =>
  request<SubTask>(`/tasks/${taskId}/subtasks`, {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateSubTask = (subId: string, data: { title: string; isCompleted: boolean }) =>
  request<void>(`/subtasks/${subId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const deleteSubTask = (subId: string) =>
  request<void>(`/subtasks/${subId}`, { method: "DELETE" });

// ── Tags ───────────────────────────────────────────────────────────────────
export const getTags = () => request<Tag[]>("/tags");
export const createTag = (data: CreateTagDto) =>
  request<Tag>("/tags", { method: "POST", body: JSON.stringify(data) });
export const deleteTag = (id: string) =>
  request<void>(`/tags/${id}`, { method: "DELETE" });

// ── Task Tags ──────────────────────────────────────────────────────────────
export const addTagToTask = (taskId: string, tagId: string) =>
  request<void>(`/tasks/${taskId}/tags/${tagId}`, { method: "POST" });
export const removeTagFromTask = (taskId: string, tagId: string) =>
  request<void>(`/tasks/${taskId}/tags/${tagId}`, { method: "DELETE" });

// ── Daily Tasks ────────────────────────────────────────────────────────────
export const getDailyTasks = () => request<DailyTask[]>("/dailytasks");
export const createDailyTask = (data: CreateDailyTaskDto) =>
  request<DailyTask>("/dailytasks", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const deleteDailyTask = (id: string) =>
  request<void>(`/dailytasks/${id}`, { method: "DELETE" });
export const getCalendarStats = (month: string) =>
  request<DailyTaskLog[]>(`/dailytasks/calendar?month=${month}`);
export const logDailyTask = (id: string, date: string, isCompleted: boolean) =>
  request<void>(`/dailytasks/${id}/log`, {
    method: "POST",
    body: JSON.stringify({ date, isCompleted }),
  });
