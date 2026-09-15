import { apiGet } from "./client";
import type { TaskList } from "../types/list";

/**
 * GET /api/lists を呼び出す。
 * バックエンド: backend/src/main/java/com/taskmanagement/backend/controller/TaskListController.java
 */
export function fetchLists(): Promise<TaskList[]> {
  return apiGet<TaskList[]>("/api/lists");
}
