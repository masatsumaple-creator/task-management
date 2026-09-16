import { useState } from "react";
import type { Card } from "../types/card";
import Column, { type ColumnData } from "./Column";

interface Props {
  cards: Card[];
  loading: boolean;
  error: string | null;
  onCardClick: (card: Card) => void;
  onMoveCard: (cardId: number, listId: number, position: number) => void;
}

export interface DropTarget {
  listId: number;
  index: number;
}

/**
 * 検索結果のカード配列を listId でグルーピングして列（リスト）に組み立てる。
 *
 * 既知の制約: /api/lists のようなリスト一覧取得APIが存在しないため、
 * 検索条件に一致するカードが1件もないリストは列自体が表示されない。
 */
function groupByList(cards: Card[]): ColumnData[] {
  const map = new Map<number, ColumnData>();
  for (const card of cards) {
    if (!map.has(card.listId)) {
      map.set(card.listId, { listId: card.listId, listTitle: card.listTitle, cards: [] });
    }
    map.get(card.listId)!.cards.push(card);
  }
  return [...map.values()].sort((a, b) => a.listId - b.listId);
}

export default function Board({ cards, loading, error, onCardClick, onMoveCard }: Props) {
  const [draggingCardId, setDraggingCardId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  if (loading) {
    return <p className="board-status">読み込み中...</p>;
  }
  if (error) {
    return <p className="board-status board-status--error">エラー: {error}</p>;
  }

  const columns = groupByList(cards);

  if (columns.length === 0) {
    return <p className="board-status">該当するカードがありません。</p>;
  }

  function handleDrop() {
    if (draggingCardId != null && dropTarget != null) {
      onMoveCard(draggingCardId, dropTarget.listId, dropTarget.index);
    }
    setDraggingCardId(null);
    setDropTarget(null);
  }

  return (
    <div className="board">
      {columns.map((column) => (
        <Column
          key={column.listId}
          column={column}
          onCardClick={onCardClick}
          draggingCardId={draggingCardId}
          dropTarget={dropTarget}
          onDragStartCard={setDraggingCardId}
          onDragEnd={() => {
            setDraggingCardId(null);
            setDropTarget(null);
          }}
          onDragOverColumn={(index) => setDropTarget({ listId: column.listId, index })}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}
