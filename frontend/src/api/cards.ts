import { apiGet, apiPost } from "./client";
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
