# 技術スタック

[← 要件定義書に戻る](../requirements.md)

本アプリで採用する技術スタックを定める。

## 構成

| 分類 | 採用技術 |
| --- | --- |
| バックエンド | Java / Spring Boot |
| フロントエンド | React（Next.jsは対象外） |
| データベース | PostgreSQL |

## 補足・関連ツール

上記スタックに合わせて、以下を標準構成とする。

- ビルドツール（バックエンド）: Gradle
- データアクセス: Spring Data JPA
- フロントエンドのビルド: Vite（Next.jsを使わないSPA構成のため）
- パッケージ管理（フロントエンド）: npm

## バージョン

バックエンド・フロントエンドの実装着手に伴い確定したバージョンは以下の通り。依存パッケージのバージョンを更新した場合は、この表も合わせて更新する。

### バックエンド

| 項目 | バージョン | 出典 |
| --- | --- | --- |
| Java | 17（Eclipse Temurin） | [build.gradle.kts](../../backend/build.gradle.kts) の `JavaLanguageVersion` |
| Spring Boot | 3.3.4 | [build.gradle.kts](../../backend/build.gradle.kts) |
| Spring Dependency Management プラグイン | 1.1.6 | [build.gradle.kts](../../backend/build.gradle.kts) |
| Gradle | 8.10.2（Gradle Wrapper） | [gradle-wrapper.properties](../../backend/gradle/wrapper/gradle-wrapper.properties) |
| Spring Data JPA | Spring Bootが管理するバージョンに追従 | `spring-boot-starter-data-jpa` |
| PostgreSQL（本番／開発用ドライバ） | JDBCドライバはSpring Bootが管理するバージョンに追従 | `org.postgresql:postgresql` |
| H2（疎通確認用インメモリDB） | Spring Bootが管理するバージョンに追従 | `com.h2database:h2` |

### データベース

| 項目 | バージョン | 出典 |
| --- | --- | --- |
| PostgreSQL | 16（`postgres:16-alpine` イメージ） | [docker-compose.yml](../../docker-compose.yml) |

### フロントエンド

| 項目 | バージョン | 出典 |
| --- | --- | --- |
| React | 19.3.0 | [package.json](../../frontend/package.json) |
| React DOM | 19.3.0 | [package.json](../../frontend/package.json) |
| TypeScript | 5.9.3 | [package.json](../../frontend/package.json) |
| Vite | 8.3.0 | [package.json](../../frontend/package.json) |
| @vitejs/plugin-react | 6.1.1 | [package.json](../../frontend/package.json) |
| Vitest | 5.0.0 | [package.json](../../frontend/package.json) |
| Testing Library（React / jest-dom） | 16.3.3 / 7.0.1 | [package.json](../../frontend/package.json) |
| npm（lockfile形式） | lockfileVersion 3（npm 9以降） | [package-lock.json](../../frontend/package-lock.json) |

依存パッケージの詳細な一覧・バージョンは [frontend/package.json](../../frontend/package.json)・[frontend/package-lock.json](../../frontend/package-lock.json) を正とする。上表は主要なものの抜粋。

---

[← 要件定義書に戻る](../requirements.md)
