import { useEffect, useState } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import SortBar from "./components/SortBar";
import Board from "./components/Board";
import CardForm from "./components/CardForm";
import CardDetailModal from "./components/CardDetailModal";
import { moveCard, reorderCards, searchCards, type CardSearchFilters } from "./api/cards";
import type { Card } from "./types/card";
import { sortCards, type SortCriteria } from "./utils/sort";

export default function App() {
  const [filters, setFilters] = useState<CardSearchFilters>({});
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [sorting, setSorting] = useState(false);

  async function handleMoveCard(cardId: number, listId: number, position: number) {
    try {
      await moveCard(cardId, { listId, position });
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleSort(criteria: SortCriteria) {
    setSorting(true);
    setError(null);
    try {
      // 絞り込み中でもリスト全体を正しく並び替えられるよう、検索条件を無視した全カードを取得する。
      const allCards = await searchCards();
      const listIds = [...new Set(allCards.map((card) => card.listId))];

      await Promise.all(
        listIds.map((listId) => {
          const cardsInList = allCards.filter((card) => card.listId === listId);
          const sortedIds = sortCards(cardsInList, criteria).map((card) => card.id);
          return reorderCards({ listId, cardIds: sortedIds });
        })
      );
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSorting(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await searchCards(filters);
        if (!cancelled) setCards(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

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
        <SortBar onSort={handleSort} sorting={sorting} />
        <Board
          cards={cards}
          loading={loading}
          error={error}
          onCardClick={setSelectedCard}
          onMoveCard={handleMoveCard}
        />
      </main>
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdated={() => setRefreshKey((key) => key + 1)}
          onDeleted={() => setRefreshKey((key) => key + 1)}
        />
      )}
    </div>
  );
}
