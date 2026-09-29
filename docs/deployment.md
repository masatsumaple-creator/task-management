# AWSデプロイ手順

このプロジェクトをAWS上にデプロイするための構成・手順をまとめる。TerraformでIaC(Infrastructure as Code)として管理し、AWSマネジメントコンソールの手動操作は初回のIAMユーザー作成のみに限定する。

## 前提・方針

- 個人利用・認証なしの学習用アプリであり、不特定多数への公開は想定しない。
- スクール課題としての実施のため、**無料枠(クレジット制)に収まる範囲**の構成に限定する。
- ALB、NAT Gateway、RDS、ECS/App Runner等の常時課金が発生するマネージドサービスは使わない。

## 構成

EC2インスタンス1台の上で、Docker Composeによりフロントエンド・バックエンド・DBをまとめて動かす。

```
自分のPC(許可したグローバルIPのみ) → EC2 t3.micro(Elastic IP)
                                       └ docker compose
                                           ├ frontend(nginx): 静的ファイル配信 + /api/ をbackendへプロキシ
                                           ├ backend(Spring Boot)
                                           └ db(PostgreSQL、EBSボリュームに永続化)
```

- **アクセス制限**: セキュリティグループで80番ポートを自分のグローバルIPのみに許可。全世界公開はしない。
- **サーバーへのログイン**: SSHではなくAWS Systems Manager (SSM) Session Managerを使用。22番ポートは開放しない。
- **DBパスワード**: EC2起動時のuser_dataスクリプト内でランダム生成し、リポジトリにもTerraformのstateにも残さない。
- **コスト監視**: AWS Budgetsで月$1を超えたらメール通知する設定を入れている。

## ディレクトリ構成

| パス | 役割 |
| --- | --- |
| `infra/main.tf` | EC2、セキュリティグループ、IAMロール(SSM用)、Elastic IP、予算アラートの定義 |
| `infra/variables.tf` | リージョン、インスタンスタイプ、許可IP、通知先メール等の変数定義 |
| `infra/outputs.tf` | apply後に表示されるアプリURL・インスタンスID |
| `infra/user_data.sh.tftpl` | EC2初回起動時に実行されるスクリプト(スワップ追加、Docker導入、リポジトリclone、`docker compose up`) |
| `infra/terraform.tfvars` | 実際の値(自分のIP、通知先メール)。**gitignore対象、リポジトリには含まれない** |
| `infra/terraform.tfvars.example` | `terraform.tfvars`のひな形 |
| `backend/Dockerfile` | Spring Bootのビルド・実行用イメージ |
| `frontend/Dockerfile` | Reactのビルド + nginxでの配信用イメージ |
| `frontend/nginx.conf` | `/api/`をbackendコンテナへプロキシする設定 |
| `docker-compose.prod.yml` | EC2上で3コンテナ(frontend/backend/db)を起動する構成 |

## AWSアカウントとの認証設定

1. IAMで管理者権限を持つCLI専用ユーザーを作成(コンソールログインは許可しない)し、アクセスキーを発行。
2. ローカルで `aws configure` を実行し、アクセスキー・シークレットキー・リージョン(`ap-northeast-1`)・出力形式(`json`)を設定。
3. `aws sts get-caller-identity` でアカウントID・ユーザーARNが返ることを確認。

Terraformはこのローカルの認証情報(`~/.aws/credentials`)をそのまま利用する。

## 操作コマンド

`infra/` ディレクトリで実行する。

```powershell
# 初回のみ: プロバイダのダウンロード等
terraform init

# 変更内容の確認(ドライラン、何も作成・変更されない)
terraform plan

# 実際にAWS上へ反映(課金対象のリソースが作成される)
terraform apply

# 使い終わったら全リソースを削除
terraform destroy
```

`terraform.tfvars` に以下を設定しておく必要がある(値は各自の環境に合わせる)。

```hcl
my_ip_cidr   = "<自分のグローバルIP>/32"
budget_email = "<通知先メールアドレス>"
```

## 現在の状態

- [x] AWS CLI / Terraformのインストール
- [x] IAMユーザー作成・認証設定・動作確認
- [x] Dockerfile / docker-compose.prod.yml / Terraformコードの作成、`main`へのマージ
- [x] `terraform plan` による内容確認(作成予定7リソース、エラーなし)
- [ ] `terraform apply` の実行
- [ ] EC2上でのアプリ起動確認(`http://<Elastic IP>` へのアクセス)
- [ ] 課題提出後の `terraform destroy` によるリソース削除

## 注意点

- 無料枠の条件はAWSアカウントの作成時期によって異なる(2025年7月以降作成のアカウントは期間限定のクレジット制)。Billingコンソールの「Free Tier」ページで自分のアカウントの条件を確認すること。
- 無料枠を超えるとEC2はおよそ月$10程度の課金が発生する。Budgetsの通知はその保険であり、上限を強制的に止めるものではない。
- Elastic IPはインスタンス起動中は無料枠内だが、インスタンスを停止したまま放置すると課金対象になるため、使い終わったら `terraform destroy` するか再アタッチすること。
- `terraform.tfvars` にはグローバルIPやメールアドレスが含まれるため、リポジトリにコミットしない(`.gitignore`で除外済み)。
