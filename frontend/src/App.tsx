import { useEffect, useState } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import Board from "./components/Board";
import CardForm from "./components/CardForm";
import { searchCards, type CardSearchFilters } from "./api/cards";
import type { Card } from "./types/card";

export default function App() {
  const [filters, setFilters] = useState<CardSearchFilters>({});
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    searchCards(filters)
      .then((result) => {
        if (!cancelled) setCards(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // filters をキーで比較すると無限ループしないため依存配列にそのまま指定する
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.keyword, filters.priority, filters.listId, refreshKey]);

  return (
    <div className="app">
      <Header />
      <main className="app-main">
        <CardForm onCreated={() => setRefreshKey((key) => key + 1)} />
        <SearchBar filters={filters} onChange={setFilters} />
        <Board cards={cards} loading={loading} error={error} />
      </main>
    </div>
  );
}
