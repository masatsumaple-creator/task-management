import { apiDelete, apiGet, apiPost, apiPut } from "./client";
import type { TaskList } from "../types/list";

/**
 * GET /api/lists を呼び出す。
 * バックエンド: backend/src/main/java/com/taskmanagement/backend/controller/TaskListController.java
 */
export function fetchLists(): Promise<TaskList[]> {
  return apiGet<TaskList[]>("/api/lists");
}

/**
 * POST /api/lists を呼び出してリストを末尾に追加する。
 * バックエンド: backend/src/main/java/com/taskmanagement/backend/controller/TaskListController.java
 */
export function createList(title: string): Promise<TaskList> {
  return apiPost<TaskList>("/api/lists", { title });
}

/**
 * PUT /api/lists/{id} を呼び出してリスト名を更新する。
 * バックエンド: backend/src/main/java/com/taskmanagement/backend/controller/TaskListController.java
 */
export function updateList(id: number, title: string): Promise<TaskList> {
  return apiPut<TaskList>(`/api/lists/${id}`, { title });
}

/**
 * DELETE /api/lists/{id} を呼び出してリストを削除する（リスト内のカードも削除される）。
 * バックエンド: backend/src/main/java/com/taskmanagement/backend/controller/TaskListController.java
 */
export function deleteList(id: number): Promise<void> {
  return apiDelete(`/api/lists/${id}`);
}
