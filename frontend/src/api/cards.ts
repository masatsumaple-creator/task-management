import { apiGet } from "./client";
import type { Card, Priority } from "../types/card";

export interface CardSearchFilters {
  keyword?: string;
  priority?: Priority | "";
  listId?: string;
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
