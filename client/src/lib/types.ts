export enum TaskPriority {
  Low = 0,
  Medium = 1,
  High = 2,
}

export interface Tag {
  id: string;
  name: string;
  colorHex: string;
}

export interface TaskTag {
  taskId: string;
  tagId: string;
  tag: Tag;
}

export interface SubTask {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  deadline?: string;
  isCompleted: boolean;
  createdAt: string;
  subTasks: SubTask[];
  taskTags: TaskTag[];
}

export interface DailyTaskLog {
  id: string;
  dailyTaskId: string;
  date: string;
  isCompleted: boolean;
}

export interface DailyTask {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  isActive: boolean;
  logs: DailyTaskLog[];
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority: TaskPriority;
  deadline?: string;
}

export interface CreateDailyTaskDto {
  title: string;
  description?: string;
  isActive: boolean;
}

export interface CreateTagDto {
  name: string;
  colorHex: string;
}
