import type { Priority } from "../types/card";
import type { CardSearchFilters } from "../api/cards";

interface Props {
  filters: CardSearchFilters;
  onChange: (filters: CardSearchFilters) => void;
}

const PRIORITY_OPTIONS: { value: Priority | ""; label: string }[] = [
  { value: "", label: "すべて" },
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
];

export default function SearchBar({ filters, onChange }: Props) {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="キーワードで検索（タイトル）"
        value={filters.keyword ?? ""}
        onChange={(e) => onChange({ ...filters, keyword: e.target.value })}
        aria-label="キーワード検索"
      />
      <select
        value={filters.priority ?? ""}
        onChange={(e) =>
          onChange({ ...filters, priority: e.target.value as Priority | "" })
        }
        aria-label="優先度で絞り込み"
      >
        {PRIORITY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            優先度: {opt.label}
          </option>
        ))}
      </select>
      <input
        type="number"
        placeholder="リストID"
        value={filters.listId ?? ""}
        onChange={(e) => onChange({ ...filters, listId: e.target.value })}
        aria-label="リストIDで絞り込み"
      />
    </div>
  );
}
