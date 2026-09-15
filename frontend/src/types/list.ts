/**
 * GET /api/lists が返す ListResponse に対応する型。
 * バックエンド: backend/src/main/java/com/taskmanagement/backend/dto/ListResponse.java
 */
export interface TaskList {
  id: number;
  boardId: number;
  title: string;
  position: number;
}
