# GitHub接続手順

## 新規リポジトリの作成と接続

1. GitHubでリポジトリを新規作成します（README、.gitignore、LICENSE等の初期化はせずに空のリポジトリを作成）
2. 以下のコマンドを実行して接続します：

```bash
# GitHubで作成したリポジトリのURLを設定（あなたのユーザー名とリポジトリ名に置き換えてください）
git remote add origin https://github.com/あなたのユーザー名/trello-discord-bot.git

# メインブランチをプッシュ
git push -u origin main
```

3. その後GitHubの認証情報を入力すれば、リポジトリがGitHubに公開されます。

## 既存リポジトリからのクローン

すでにGitHubにリポジトリを作成済みの場合、別環境で作業するには：

```bash
# リポジトリをクローン
git clone https://github.com/あなたのユーザー名/trello-discord-bot.git

# クローンしたディレクトリに移動
cd trello-discord-bot

# 依存関係のインストール
npm install
```

## 注意点

`.env`ファイル及び`.env.dev`ファイルは`.gitignore`に含まれているため、GitHubにはアップロードされません。
別のマシンでデプロイする際は、`.env.example`や`.env.dev.example`を参考に新しく環境設定ファイルを作成してください。

## GitHub Actions（CI/CD）

将来的に継続的インテグレーション/継続的デリバリー（CI/CD）を設定する場合は、`.github/workflows`ディレクトリを作成し、そこにワークフローファイルを追加してください。

例：
```yaml
# .github/workflows/docker-build.yml
name: Docker Build

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker-compose build
```
