import { useState } from "react";
import type { Card } from "../types/card";
import type { TaskList } from "../types/list";
import AddListForm from "./AddListForm";
import Column, { type ColumnData } from "./Column";

interface Props {
  lists: TaskList[];
  cards: Card[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onCardClick: (card: Card) => void;
  onMoveCard: (cardId: number, listId: number, position: number) => void;
  onAddList: (title: string) => Promise<boolean>;
  onRenameList: (listId: number, title: string) => void;
  onDeleteList: (listId: number) => void;
}

export interface DropTarget {
  listId: number;
  index: number;
}

/**
 * リストごとに、そのリストに属するカードを position 順に並べて列を組み立てる。
 * カードが0件のリストも列として表示する（空のリストへもカードを移動できるようにするため）。
 */
function buildColumns(lists: TaskList[], cards: Card[]): ColumnData[] {
  return lists.map((list) => ({
    listId: list.id,
    listTitle: list.title,
    cards: cards
      .filter((card) => card.listId === list.id)
      .sort((a, b) => a.position - b.position),
  }));
}

export default function Board({
  lists,
  cards,
  loading,
  error,
  onRetry,
  onCardClick,
  onMoveCard,
  onAddList,
  onRenameList,
  onDeleteList,
}: Props) {
  const [draggingCardId, setDraggingCardId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  if (loading) {
    return <p className="board-status">読み込み中...</p>;
  }
  if (error) {
    return (
      <p className="board-status board-status--error" role="alert">
        {error}
        <button type="button" className="board-status__retry" onClick={onRetry}>
          再試行
        </button>
      </p>
    );
  }

  const columns = buildColumns(lists, cards);

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
          onRename={onRenameList}
          onDelete={onDeleteList}
        />
      ))}
      <AddListForm onAdd={onAddList} />
    </div>
  );
}
