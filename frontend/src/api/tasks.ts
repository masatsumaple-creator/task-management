import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "./client";
import type { Task, Priority } from "../types/task";

export interface TaskSearchFilters {
  keyword?: string;
  priority?: Priority | "";
  listId?: string;
}

export interface TaskCreateInput {
  listId: number;
  title: string;
  priority: Priority;
  dueDate?: string; // ISO日付文字列（例: "2026-09-20"）、未入力は省略
}

export interface TaskUpdateInput {
  title: string;
  priority: Priority;
  dueDate?: string; // ISO日付文字列（例: "2026-09-20"）、未入力は省略
}

export interface TaskMoveInput {
  listId: number;
  position: number;
}

export interface TaskReorderInput {
  listId: number;
  taskIds: number[];
}

/**
 * GET /api/tasks を検索条件付きで呼び出す。
 * バックエンド: backend/src/main/java/com/taskmanagement/backend/controller/TaskController.java
 */
export function searchTasks(filters: TaskSearchFilters = {}): Promise<Task[]> {
  return apiGet<Task[]>("/api/tasks", {
    keyword: filters.keyword,
    priority: filters.priority || undefined,
    listId: filters.listId,
  });
}

/**
 * POST /api/tasks を呼び出してタスクを新規登録する。
 * バックエンド: backend/src/main/java/com/taskmanagement/backend/controller/TaskController.java
 */
export function createTask(input: TaskCreateInput): Promise<Task> {
  return apiPost<Task>("/api/tasks", {
    listId: input.listId,
    title: input.title,
    priority: input.priority,
    dueDate: input.dueDate || null,
  });
}

/**
 * PUT /api/tasks/{id} を呼び出してタスクの詳細（タイトル・優先度・期日）を更新する。
 * バックエンド: backend/src/main/java/com/taskmanagement/backend/controller/TaskController.java
 */
export function updateTask(id: number, input: TaskUpdateInput): Promise<Task> {
  return apiPut<Task>(`/api/tasks/${id}`, {
    title: input.title,
    priority: input.priority,
    dueDate: input.dueDate || null,
  });
}

/**
 * PATCH /api/tasks/{id}/position を呼び出してタスクをドラッグ&ドロップで移動する。
 * バックエンド: backend/src/main/java/com/taskmanagement/backend/controller/TaskController.java
 */
export function moveTask(id: number, input: TaskMoveInput): Promise<Task> {
  return apiPatch<Task>(`/api/tasks/${id}/position`, {
    listId: input.listId,
    position: input.position,
  });
}

/**
 * PUT /api/tasks/reorder を呼び出して、リスト内のタスクを指定順に一括で並び替える。
 * バックエンド: backend/src/main/java/com/taskmanagement/backend/controller/TaskController.java
 */
export function reorderTasks(input: TaskReorderInput): Promise<void> {
  return apiPut<void>("/api/tasks/reorder", {
    listId: input.listId,
    taskIds: input.taskIds,
  });
}

/**
 * DELETE /api/tasks/{id} を呼び出してタスクを物理削除する。
 * バックエンド: backend/src/main/java/com/taskmanagement/backend/controller/TaskController.java
 */
export function deleteTask(id: number): Promise<void> {
  return apiDelete(`/api/tasks/${id}`);
}
