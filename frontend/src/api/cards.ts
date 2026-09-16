import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "./client";
import type { Card, Priority } from "../types/card";

export interface CardSearchFilters {
  keyword?: string;
  priority?: Priority | "";
  listId?: string;
}

export interface CardCreateInput {
  listId: number;
  title: string;
  priority: Priority;
  dueDate?: string; // ISO日付文字列（例: "2026-09-20"）、未入力は省略
}

export interface CardUpdateInput {
  title: string;
  priority: Priority;
  dueDate?: string; // ISO日付文字列（例: "2026-09-20"）、未入力は省略
}

export interface CardMoveInput {
  listId: number;
  position: number;
}

export interface CardReorderInput {
  listId: number;
  cardIds: number[];
}

/**
 * GET /api/cards を検索条件付きで呼び出す。
 * バックエンド: backend/src/main/java/com/taskmanagement/backend/controller/CardController.java
 */
export function searchCards(filters: CardSearchFilters = {}): Promise<Card[]> {
  return apiGet<Card[]>("/api/cards", {
    keyword: filters.keyword,
    priority: filters.priority || undefined,
    listId: filters.listId,
  });
}

/**
 * POST /api/cards を呼び出してカードを新規登録する。
 * バックエンド: backend/src/main/java/com/taskmanagement/backend/controller/CardController.java
 */
export function createCard(input: CardCreateInput): Promise<Card> {
  return apiPost<Card>("/api/cards", {
    listId: input.listId,
    title: input.title,
    priority: input.priority,
    dueDate: input.dueDate || null,
  });
}

/**
 * PUT /api/cards/{id} を呼び出してカードの詳細（タイトル・優先度・期日）を更新する。
 * バックエンド: backend/src/main/java/com/taskmanagement/backend/controller/CardController.java
 */
export function updateCard(id: number, input: CardUpdateInput): Promise<Card> {
  return apiPut<Card>(`/api/cards/${id}`, {
    title: input.title,
    priority: input.priority,
    dueDate: input.dueDate || null,
  });
}

/**
 * PATCH /api/cards/{id}/position を呼び出してカードをドラッグ&ドロップで移動する。
 * バックエンド: backend/src/main/java/com/taskmanagement/backend/controller/CardController.java
 */
export function moveCard(id: number, input: CardMoveInput): Promise<Card> {
  return apiPatch<Card>(`/api/cards/${id}/position`, {
    listId: input.listId,
    position: input.position,
  });
}

/**
 * PUT /api/cards/reorder を呼び出して、リスト内のカードを指定順に一括で並び替える。
 * バックエンド: backend/src/main/java/com/taskmanagement/backend/controller/CardController.java
 */
export function reorderCards(input: CardReorderInput): Promise<void> {
  return apiPut<void>("/api/cards/reorder", {
    listId: input.listId,
    cardIds: input.cardIds,
  });
}

/**
 * DELETE /api/cards/{id} を呼び出してカードを物理削除する。
 * バックエンド: backend/src/main/java/com/taskmanagement/backend/controller/CardController.java
 */
export function deleteCard(id: number): Promise<void> {
  return apiDelete(`/api/cards/${id}`);
}
