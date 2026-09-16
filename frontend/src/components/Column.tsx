import { useRef } from "react";
import type { Card } from "../types/card";
import type { DropTarget } from "./Board";
import CardItem from "./CardItem";

export interface ColumnData {
  listId: number;
  listTitle: string;
  cards: Card[];
}

interface Props {
  column: ColumnData;
  onCardClick: (card: Card) => void;
  draggingCardId: number | null;
  dropTarget: DropTarget | null;
  onDragStartCard: (cardId: number) => void;
  onDragEnd: () => void;
  onDragOverColumn: (index: number) => void;
  onDrop: () => void;
}

export default function Column({
  column,
  onCardClick,
  draggingCardId,
  dropTarget,
  onDragStartCard,
  onDragEnd,
  onDragOverColumn,
  onDrop,
}: Props) {
  const listRef = useRef<HTMLUListElement>(null);

  function handleDragStart(cardId: number) {
    return (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(cardId));
      onDragStartCard(cardId);
    };
  }

  function handleDragOver(e: React.DragEvent<HTMLUListElement>) {
    e.preventDefault();
    const index = computeDropIndex(listRef.current, e.clientY, draggingCardId);
    onDragOverColumn(index);
  }

  function handleDrop(e: React.DragEvent<HTMLUListElement>) {
    e.preventDefault();
    onDrop();
  }

  const showIndicator = dropTarget != null && dropTarget.listId === column.listId;

  return (
    <section className="column">
      <h2 className="column__title">{column.listTitle}</h2>
      <ul
        className="column__cards"
        ref={listRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnd={onDragEnd}
      >
        {column.cards.map((card, index) => (
          <li key={card.id} className="column__card-slot" data-card-id={card.id}>
            {showIndicator && dropTarget!.index === index && <div className="drop-indicator" />}
            <CardItem
              card={card}
              dragging={card.id === draggingCardId}
              onClick={() => onCardClick(card)}
              onDragStart={handleDragStart(card.id)}
            />
          </li>
        ))}
        {showIndicator && dropTarget!.index >= column.cards.length && (
          <li className="column__card-slot column__card-slot--indicator">
            <div className="drop-indicator" />
          </li>
        )}
      </ul>
    </section>
  );
}

/**
 * ドロップ位置(Y座標)から、カード同士の中間点を基準に挿入インデックスを求める。
 * ドラッグ中のカード自身は計算から除外し、挿入先の見た目とインデックスがずれないようにする。
 */
function computeDropIndex(
  list: HTMLUListElement | null,
  clientY: number,
  draggingCardId: number | null
): number {
  if (!list) return 0;

  const slots = [
    ...list.querySelectorAll<HTMLElement>(
      ":scope > .column__card-slot:not(.column__card-slot--indicator)"
    ),
  ].filter((slot) => Number(slot.dataset.cardId) !== draggingCardId);

  let index = slots.length;
  for (let i = 0; i < slots.length; i++) {
    const rect = slots[i].getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    if (clientY < midpoint) {
      index = i;
      break;
    }
  }
  return index;
}
