// --- 状態管理 ---------------------------------------------------------

const STORAGE_KEY = "task-board-state-v1";

const PRIORITIES = ["high", "medium", "low"];
const DEFAULT_PRIORITY = "medium";

const DEFAULT_STATE = {
  lists: [
    {
      id: uid(),
      title: "To Do",
      cards: [
        { id: uid(), title: "サンプルタスク1", priority: "high", dueDate: "" },
        { id: uid(), title: "サンプルタスク2", priority: "medium", dueDate: "" },
      ],
    },
    { id: uid(), title: "進行中", cards: [] },
    { id: uid(), title: "完了", cards: [] },
  ],
};

let state = loadState();

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.lists)) return structuredClone(DEFAULT_STATE);
    // 旧バージョンのデータに優先度・期限が無い場合は補う
    for (const list of parsed.lists) {
      for (const card of list.cards || []) {
        if (!PRIORITIES.includes(card.priority)) card.priority = DEFAULT_PRIORITY;
        if (typeof card.dueDate !== "string") card.dueDate = "";
      }
    }
    return parsed;
  } catch (e) {
    console.warn("状態の読み込みに失敗したため初期状態を使用します", e);
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function findList(listId) {
  return state.lists.find((l) => l.id === listId);
}

function findCard(cardId) {
  for (const list of state.lists) {
    const card = list.cards.find((c) => c.id === cardId);
    if (card) return { list, card };
  }
  return null;
}

// --- レンダリング -------------------------------------------------------

const board = document.getElementById("board");
const listTemplate = document.getElementById("list-template");
const cardTemplate = document.getElementById("card-template");

function render() {
  board.innerHTML = "";
  for (const list of state.lists) {
    board.appendChild(renderList(list));
  }
  board.appendChild(renderAddListButton());
}

function renderList(list) {
  const node = listTemplate.content.firstElementChild.cloneNode(true);
  node.dataset.listId = list.id;

  const titleInput = node.querySelector(".list-title");
  titleInput.value = list.title;
  titleInput.addEventListener("change", () => {
    list.title = titleInput.value.trim() || "無題のリスト";
    titleInput.value = list.title;
    saveState();
  });

  node.querySelector(".list-delete").addEventListener("click", () => {
    if (list.cards.length > 0 && !confirm(`「${list.title}」を削除しますか？中のカードも削除されます。`)) {
      return;
    }
    state.lists = state.lists.filter((l) => l.id !== list.id);
    saveState();
    render();
  });

  const cardsContainer = node.querySelector(".cards");
  for (const card of list.cards) {
    cardsContainer.appendChild(renderCard(card, list));
  }
  setupDropZone(cardsContainer, list);

  node.querySelector(".add-card").addEventListener("click", () => {
    const card = { id: uid(), title: "", priority: DEFAULT_PRIORITY, dueDate: "" };
    list.cards.push(card);
    saveState();
    render();
    // 新規カードのタイトル入力へフォーカス
    const el = board.querySelector(`[data-card-id="${card.id}"] .card-title`);
    el?.focus();
  });

  return node;
}

function renderCard(card, list) {
  const node = cardTemplate.content.firstElementChild.cloneNode(true);
  node.dataset.cardId = card.id;

  const titleInput = node.querySelector(".card-title");
  titleInput.value = card.title;
  titleInput.placeholder = "カードの内容";
  titleInput.addEventListener("change", () => {
    card.title = titleInput.value.trim();
    saveState();
  });
  titleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") titleInput.blur();
  });

  node.querySelector(".card-delete").addEventListener("click", () => {
    list.cards = list.cards.filter((c) => c.id !== card.id);
    saveState();
    render();
  });

  const prioritySelect = node.querySelector(".card-priority");
  prioritySelect.value = PRIORITIES.includes(card.priority) ? card.priority : DEFAULT_PRIORITY;
  node.dataset.priority = prioritySelect.value;
  prioritySelect.addEventListener("change", () => {
    card.priority = prioritySelect.value;
    node.dataset.priority = card.priority;
    saveState();
  });

  const dueInput = node.querySelector(".card-due");
  dueInput.value = card.dueDate || "";
  updateOverdueState(node, dueInput);
  dueInput.addEventListener("change", () => {
    card.dueDate = dueInput.value;
    updateOverdueState(node, dueInput);
    saveState();
  });

  node.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", card.id);
    e.dataTransfer.effectAllowed = "move";
    node.classList.add("dragging");
  });
  node.addEventListener("dragend", () => {
    node.classList.remove("dragging");
  });

  return node;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function updateOverdueState(cardNode, dueInput) {
  cardNode.classList.toggle("overdue", !!dueInput.value && dueInput.value < todayStr());
}

function setupDropZone(cardsContainer, list) {
  cardsContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    cardsContainer.closest(".list").classList.add("drag-over");
  });
  cardsContainer.addEventListener("dragleave", () => {
    cardsContainer.closest(".list").classList.remove("drag-over");
  });
  cardsContainer.addEventListener("drop", (e) => {
    e.preventDefault();
    cardsContainer.closest(".list").classList.remove("drag-over");
    const cardId = e.dataTransfer.getData("text/plain");
    const found = findCard(cardId);
    if (!found) return;

    // 移動先の挿入位置をマウス位置から判定
    const afterElement = getDragAfterElement(cardsContainer, e.clientY);
    found.list.cards = found.list.cards.filter((c) => c.id !== cardId);
    const insertIndex =
      afterElement == null
        ? list.cards.length
        : list.cards.findIndex((c) => c.id === afterElement.dataset.cardId);

    if (insertIndex === -1) {
      list.cards.push(found.card);
    } else {
      list.cards.splice(insertIndex, 0, found.card);
    }

    saveState();
    render();
  });
}

function getDragAfterElement(container, y) {
  const cards = [...container.querySelectorAll(".card:not(.dragging)")];
  return cards.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      }
      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY, element: null }
  ).element;
}

function renderAddListButton() {
  const wrapper = document.createElement("div");
  wrapper.className = "add-list-form";
  const btn = document.createElement("button");
  btn.className = "add-list-btn";
  btn.textContent = "+ リストを追加";
  btn.addEventListener("click", () => {
    const title = prompt("リスト名を入力してください", "新しいリスト");
    if (title === null) return;
    state.lists.push({ id: uid(), title: title.trim() || "新しいリスト", cards: [] });
    saveState();
    render();
  });
  wrapper.appendChild(btn);
  return wrapper;
}

render();
