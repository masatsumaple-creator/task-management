import type { Card, Priority } from "../types/card";

export type SortCriteria = "priority" | "dueDate";

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

/** 優先度順（高→低）に比較する。 */
function comparePriority(a: Card, b: Card): number {
  return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
}

/** 期限順（早い→遅い、未設定は末尾）に比較する。 */
function compareDueDate(a: Card, b: Card): number {
  if (a.dueDate === b.dueDate) return 0;
  if (a.dueDate === null) return 1;
  if (b.dueDate === null) return -1;
  return a.dueDate < b.dueDate ? -1 : 1;
}

/** 指定した基準でカード配列をソートした新しい配列を返す。 */
export function sortCards(cards: Card[], criteria: SortCriteria): Card[] {
  const compare = criteria === "priority" ? comparePriority : compareDueDate;
  return [...cards].sort(compare);
}
