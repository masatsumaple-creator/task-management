const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

/** API呼び出し失敗の種別。 */
export type ApiErrorKind = "network" | "client" | "server";

/**
 * API呼び出しの失敗を表すエラー。`message` はそのまま画面に表示できる日本語文言。
 * 4xx/5xx は原因をユーザーに伝えるため、ステータスコードから文言を決める
 * （バックエンドの既定設定ではエラー本文にメッセージが含まれないため）。
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

function errorFromStatus(status: number): ApiError {
  if (status >= 500) {
    return new ApiError(
      "server",
      "サーバーでエラーが発生しました。時間をおいて再度お試しください。",
      status
    );
  }
  if (status === 404) {
    return new ApiError(
      "client",
      "対象のデータが見つかりません。他の操作で削除された可能性があります。画面を更新してください。",
      status
    );
  }
  return new ApiError(
    "client",
    "リクエストの内容が正しくありません。入力内容を確認してください。",
    status
  );
}

/**
 * fetch のラッパー。接続できない場合（サーバー停止・オフラインなど）と
 * 4xx/5xx 応答を ApiError に変換して投げる。
 */
async function request(url: URL, init?: RequestInit): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new ApiError(
      "network",
      "サーバーに接続できません。ネットワーク接続やサーバーの起動状態を確認して、再度お試しください。"
    );
  }
  if (!response.ok) {
    throw errorFromStatus(response.status);
  }
  return response;
}

/**
 * バックエンドAPIへの GET リクエストを行う共通関数。
 * 値が空文字/undefinedのクエリパラメータは送信しない。
 */
export async function apiGet<T>(
  path: string,
  params?: Record<string, string | undefined>
): Promise<T> {
  const url = new URL(path, BASE_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) url.searchParams.set(key, value);
    }
  }

  const response = await request(url);
  return response.json() as Promise<T>;
}

/**
 * バックエンドAPIへの POST リクエストを行う共通関数。
 * body は JSON としてシリアライズして送信する。
 */
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiSend<T>("POST", path, body);
}

/**
 * バックエンドAPIへの PUT リクエストを行う共通関数。
 * body は JSON としてシリアライズして送信する。
 */
export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  return apiSend<T>("PUT", path, body);
}

/**
 * バックエンドAPIへの PATCH リクエストを行う共通関数。
 * body は JSON としてシリアライズして送信する。
 */
export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return apiSend<T>("PATCH", path, body);
}

/**
 * バックエンドAPIへの DELETE リクエストを行う共通関数。
 */
export async function apiDelete(path: string): Promise<void> {
  const url = new URL(path, BASE_URL);
  await request(url, { method: "DELETE" });
}

async function apiSend<T>(method: string, path: string, body: unknown): Promise<T> {
  const url = new URL(path, BASE_URL);
  const response = await request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}
