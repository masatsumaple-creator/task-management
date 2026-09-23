/** バックエンドの Priority enum に対応する値（小文字でシリアライズされる）。 */
export type Priority = "high" | "medium" | "low";

/**
 * GET /api/tasks, GET /api/tasks/{id} が返す TaskResponse に対応する型。
 * バックエンド: backend/src/main/java/com/taskmanagement/backend/dto/TaskResponse.java
 */
export interface Task {
  id: number;
  listId: number;
  listTitle: string;
  title: string;
  priority: Priority;
  dueDate: string | null; // ISO日付文字列（例: "2026-09-20"）、未設定は null
  position: number;
}
