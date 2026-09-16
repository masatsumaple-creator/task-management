const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

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

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
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

async function apiSend<T>(method: string, path: string, body: unknown): Promise<T> {
  const url = new URL(path, BASE_URL);
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}
