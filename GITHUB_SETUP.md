# GitHub接続手順

GitHubでリポジトリを作成した後、以下のコマンドを実行して接続します：

```bash
# GitHubで作成したリポジトリのURLを設定（あなたのユーザー名とリポジトリ名に置き換えてください）
git remote add origin https://github.com/あなたのユーザー名/trello-discord-bot.git

# メインブランチをプッシュ
git push -u origin main
```

その後GitHubの認証情報を入力すれば、リポジトリがGitHubに公開されます。

## 注意点

`.env`ファイルは`.gitignore`に含まれているため、GitHubにはアップロードされません。
別のマシンでデプロイする際は、`.env.example`を参考に新しく`.env`ファイルを作成してください。
