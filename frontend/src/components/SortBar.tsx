import type { SortCriteria } from "../utils/sort";

interface Props {
  onSort: (criteria: SortCriteria) => void;
  sorting: boolean;
}

export default function SortBar({ onSort, sorting }: Props) {
  return (
    <div className="sort-bar">
      <span className="sort-bar__label">並び替え:</span>
      <button type="button" onClick={() => onSort("priority")} disabled={sorting}>
        優先度順
      </button>
      <button type="button" onClick={() => onSort("dueDate")} disabled={sorting}>
        期限順
      </button>
    </div>
  );
}
