# CLAUDE.md

このファイルは、このリポジトリでClaude Codeが作業する際の規約を定める。

## 構成

- `backend/` — Spring Boot（Java 17, Gradle）。API: `http://localhost:8080`
- `frontend/` — React + Vite + TypeScript。開発サーバー: `http://localhost:5173`
- ルートの `docker-compose.yml` — PostgreSQL（`db`サービス、`localhost:5432`）

## デフォルトポートの固定運用

各サーバーのデフォルトポートは以下の通り、固定とする。

| サーバー | デフォルトポート |
| --- | --- |
| バックエンド（Spring Boot） | 8080 |
| フロントエンド（Vite dev server） | 5173 |
| PostgreSQL（docker-compose） | 5432 |

**ルール:** 動作確認等でサーバーを起動する際、上記のデフォルトポートが既に別プロセスに使用されていてポート競合が発生した場合は、そのポートを別番号に変更して起動するのではなく、**ポートを使用している既存プロセスを停止し、必ずデフォルトポートで起動し直す**こと。

理由: ポート番号はフロントエンドの `VITE_API_BASE_URL`（デフォルト `http://localhost:8080`）やCORS設定（`backend/src/main/java/com/taskmanagement/backend/config/CorsConfig.java` の `allowedOrigins("http://localhost:5173")`）など複数箇所で前提にされているため、起動のたびにポート番号がずれると設定の不整合や動作確認の混乱を招く。

手順の例（Windows / PowerShell）:
```powershell
# 該当ポートを使用しているプロセスのPIDを確認
Get-NetTCPConnection -LocalPort 8080 -State Listen | Select-Object -ExpandProperty OwningProcess
# そのPIDを停止
Stop-Process -Id <PID> -Force
```
停止後、改めて `./gradlew bootRun`（バックエンド）や `npm run dev`（フロントエンド）をデフォルトポートで起動する。

詳細な手順は [.claude/skills/dev-server-startup/SKILL.md](.claude/skills/dev-server-startup/SKILL.md) を参照。
