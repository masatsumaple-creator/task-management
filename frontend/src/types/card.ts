/** バックエンドの Priority enum に対応する値（小文字でシリアライズされる）。 */
export type Priority = "high" | "medium" | "low";

/**
 * GET /api/cards, GET /api/cards/{id} が返す CardResponse に対応する型。
 * バックエンド: backend/src/main/java/com/taskmanagement/backend/dto/CardResponse.java
 */
export interface Card {
  id: number;
  listId: number;
  listTitle: string;
  title: string;
  priority: Priority;
  dueDate: string | null; // ISO日付文字列（例: "2026-09-20"）、未設定は null
  position: number;
}
