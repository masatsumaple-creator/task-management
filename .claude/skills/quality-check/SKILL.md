---
name: quality-check
description: Run this project's full quality audit — frontend ESLint (installing/fixing the config if missing), a manual backend code-quality review (no static analysis tool is configured), and a doc-vs-implementation consistency check against docs/requirements/*.md and the READMEs. Use whenever asked for a quality check, lint check, code review across the whole project, or to verify the requirements/screen-design docs still match the actual backend/frontend implementation.
---

# 品質チェック（フロント lint + バックエンド手動レビュー + ドキュメント整合性）

このプロジェクトの「全体的な品質チェック」を行うときの標準手順。過去の実行で判明した固有の落とし穴（TypeScriptプレビュー版の混入など）を踏まえている。

## 進め方の原則

- 既定では**チャット回答のみで報告**し、新規レポートファイルは作らない（ユーザーが「ファイルに残して」と言えば`docs/`等に保存する）。
- 見つかった問題は原則としてまず**一覧化して報告**し、ユーザーが「直して」と言ってから実際にコードを修正する。ただし、明らかに機械的で低リスクな修正（stale コメントの訂正、lintエラーの定型的な解消など）は、都度確認しなくても直してよい。
- バージョンダウングレードや依存関係の変更など、元に戻しにくい操作は事前に確認する。

## 1. フロントエンド（`frontend/`）

### 1.1 事前チェック：TypeScriptバージョンの罠

`frontend/package.json` の `typescript` バージョンを確認する。

```bash
cd frontend && npm ls typescript
```

**既知の問題:** このプロジェクトでは過去に `typescript` が安定版ではなく、Microsoftのネイティブ(Go移植)プレビュー版（例: `7.0.x` 系）に固定されてしまったことがある。`typescript-eslint` はこのプレビュー版を明示的に拒否し、`eslint`がエラーで即座に停止する（`typescript-eslint does not support TS 7.0` のようなメッセージ）。
- バージョンが `5.x`/`6.x` の安定版でなければ、まずユーザーに安定版へのダウングレードを提案し、承認を得てから実施する（[frontend/package.json](../../../frontend/package.json)を編集し`npm install`）。
- ダウングレード後は必ず `npx tsc -b` と `npm test` を実行し、ビルド・テストが壊れていないことを確認する。

### 1.2 ESLintの導入・実行

`eslint.config.js` が存在するか確認する（存在すれば`npm run lint`をそのまま実行するだけでよい）。存在しない場合は、Vite公式相当の最小構成で新規導入する。

```bash
cd frontend
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals
```

`eslint.config.js`（flat config）の雛形：

```js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: { ecmaVersion: 2020, globals: globals.browser },
    plugins: { "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
);
```

`frontend/package.json` の `scripts` に `"lint": "eslint ."` を追加し、実行する。

```bash
npm run lint
npm test
npx tsc -b
```

3つとも通ることを確認してから、lintで検出された指摘をユーザーに報告する（`react-hooks/set-state-in-effect` など、Reactの新しいルールに引っかかりやすい箇所に注意）。

## 2. バックエンド（`backend/`）

Checkstyle/Spotless/PMD等の静的解析ツールは導入されていない（`backend/build.gradle.kts` のpluginsを確認して、導入されていれば代わりにそれを実行する）。導入されていない場合は、以下の観点でコードを直接読んでレビューする。新規ツール導入は依頼されない限り行わない。

- **サービス層の有無**: `controller/` のクラスが `repository/` を直接操作していないか（[CardController.java](../../../backend/src/main/java/com/taskmanagement/backend/controller/CardController.java) など）。ビジネスロジック（並び替え・position再採番等）がController内に埋め込まれていないか。
- **例外処理の一元化**: `@ControllerAdvice`/`@ExceptionHandler` があるか。なければ、`ResponseStatusException`や手動nullチェックがControllerごとにバラバラに書かれていないか。
- **テストカバレッジ**: `backend/src/test/`配下にController/Repositoryのテストがあるか（`contextLoads()`のみでないか）。
- **パッケージ構成の一貫性**: 全クラスが適切なパッケージ（`controller`/`service`/`repository`/`entity`/`dto`/`config`）に収まっているか。
- **CORS設定**: [CorsConfig.java](../../../backend/src/main/java/com/taskmanagement/backend/config/CorsConfig.java) のoriginがハードコードされていないか（環境変数/プロファイル切り替え可能か）。
- **バリデーション**: DTOに`@Valid`/Jakarta Bean Validationアノテーションが付与されているか。

最後に `./gradlew test`（Windowsでは `.\gradlew.bat test`。Git Bashから`./gradlew`を直接呼ぶと`ClassNotFoundException: GradleWrapperMain`で失敗することがあるため、その場合はPowerShellの`.\gradlew.bat`を使う）を実行し、既存テストが壊れていないことを確認する。

## 3. ドキュメント整合性チェック

`docs/requirements.md`とその配下（`docs/requirements/*.md`）、および `README.md` / `backend/README.md` / `frontend/README.md` は、**ルート直下のMVP版（`index.html`/`app.js`、localStorage実装）と、`backend`/`frontend`のバックエンド移行版という2つの実装が並存している**ことを前提に読む。「未実装」「対応予定」等の記述は移行版の実装が先行して古くなっていることが多いため、必ず実装側と突き合わせる。

チェック手順：
1. `backend/src/main/java/.../controller/*.java` の実際のエンドポイント一覧を洗い出す。
2. `frontend/src/components/`・`frontend/src/api/` で実装済みの機能（作成/編集/削除/D&D/検索/並び替え等）を洗い出す。
3. 上記1・2と、`docs/requirements/data-model.md`（ER図が「将来構成」のままになっていないか）、`docs/requirements/roadmap.md`（実装済み機能が「候補」のまま残っていないか）、各READMEの「対応済み/未対応」記述を突き合わせ、ズレていれば実態に合わせて修正する。
4. `docs/requirements.md`本体・`screens.md`・`non-functional.md`・`tech-stack.md`はMVP（静的サイト版）の記述が中心なので、バックエンド移行版の話とは切り分けて判断する（無関係に変更しない）。

## 参考

- 直近の実行例: `README.md` / `backend/README.md` / `frontend/README.md` / `docs/requirements/data-model.md` / `docs/requirements/roadmap.md` の更新、および `frontend/eslint.config.js` の新規導入。
