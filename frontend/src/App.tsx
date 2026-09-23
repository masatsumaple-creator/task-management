import { useEffect, useState } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import SortBar from "./components/SortBar";
import Board from "./components/Board";
import ErrorBanner from "./components/ErrorBanner";
import TaskForm from "./components/TaskForm";
import TaskDetailModal from "./components/TaskDetailModal";
import { moveTask, reorderTasks, searchTasks, type TaskSearchFilters } from "./api/tasks";
import { createList, deleteList, fetchLists, updateList } from "./api/lists";
import type { Task } from "./types/task";
import type { TaskList } from "./types/list";
import { sortTasks, type SortCriteria } from "./utils/sort";

export default function App() {
  const [filters, setFilters] = useState<TaskSearchFilters>({});
  const [lists, setLists] = useState<TaskList[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  // 一覧の取得失敗はボード領域に（再試行つきで）、移動・並び替えの失敗はバナーで表示する。
  // 後者はボードを置き換えないので、表示中のタスクは失われない。
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sorting, setSorting] = useState(false);

  async function handleMoveTask(taskId: number, listId: number, position: number) {
    setActionError(null);
    try {
      await moveTask(taskId, { listId, position });
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleAddList(title: string): Promise<boolean> {
    setActionError(null);
    try {
      await createList(title);
      setRefreshKey((key) => key + 1);
      return true;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
      return false;
    }
  }

  async function handleRenameList(listId: number, title: string) {
    setActionError(null);
    try {
      await updateList(listId, title);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      // 失敗時も再取得して、入力欄の表示をサーバー上のリスト名に戻す。
      setRefreshKey((key) => key + 1);
    }
  }

  async function handleDeleteList(listId: number) {
    setActionError(null);
    try {
      await deleteList(listId);
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleSort(criteria: SortCriteria) {
    setSorting(true);
    setActionError(null);
    try {
      // 絞り込み中でもリスト全体を正しく並び替えられるよう、検索条件を無視した全タスクを取得する。
      const allTasks = await searchTasks();
      const listIds = [...new Set(allTasks.map((task) => task.listId))];

      await Promise.all(
        listIds.map((listId) => {
          const tasksInList = allTasks.filter((task) => task.listId === listId);
          const sortedIds = sortTasks(tasksInList, criteria).map((task) => task.id);
          return reorderTasks({ listId, taskIds: sortedIds });
        })
      );
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setSorting(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const [listResult, taskResult] = await Promise.all([fetchLists(), searchTasks(filters)]);
        if (!cancelled) {
          setLists(listResult);
          setTasks(taskResult);
        }
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : String(err));
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

  // リストIDで絞り込み中は、そのリストの列だけを表示する。
  const visibleLists = filters.listId
    ? lists.filter((list) => String(list.id) === filters.listId)
    : lists;

  return (
    <div className="app">
      <Header />
      <main className="app-main">
        <TaskForm lists={lists} onCreated={() => setRefreshKey((key) => key + 1)} />
        <SearchBar filters={filters} onChange={setFilters} />
        <SortBar onSort={handleSort} sorting={sorting} />
        {actionError && <ErrorBanner message={actionError} onDismiss={() => setActionError(null)} />}
        <Board
          lists={visibleLists}
          tasks={tasks}
          loading={loading}
          error={loadError}
          onRetry={() => setRefreshKey((key) => key + 1)}
          onTaskClick={setSelectedTask}
          onMoveTask={handleMoveTask}
          onAddList={handleAddList}
          onRenameList={handleRenameList}
          onDeleteList={handleDeleteList}
        />
      </main>
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdated={() => setRefreshKey((key) => key + 1)}
          onDeleted={() => setRefreshKey((key) => key + 1)}
        />
      )}
    </div>
  );
}
