# マルチステージビルドを使用して最終イメージを軽量化

# ビルドステージ
FROM node:18-alpine AS builder
WORKDIR /build

# アプリケーション情報
LABEL maintainer="開発チーム <dev@example.com>"
LABEL description="Trello Discord 連携ボット（本番環境用）"
LABEL version="1.0.0"

# 依存関係ファイルのコピーとインストール
COPY package*.json ./
# --no-fund と --no-audit フラグを追加して不要な出力を抑制し、ビルド速度を向上
RUN npm ci --no-fund --no-audit

# TypeScriptソースコードと設定ファイルのコピー
COPY tsconfig.json ./
COPY src/ ./src/
COPY scripts/ ./scripts/

# TypeScriptのビルド
RUN npm run build

# 実行ステージ
FROM node:18-alpine
WORKDIR /app

# アプリケーション情報
LABEL maintainer="開発チーム <dev@example.com>"
LABEL description="Trello Discord 連携ボット（本番環境用）"
LABEL version="1.0.0"

# 環境変数の設定（実行時に.envまたは環境変数から上書き可能）
ENV NODE_ENV="production"
ENV DISCORD_TOKEN=""
ENV DISCORD_CHANNEL_ID=""
ENV CLIENT_ID=""
ENV GUILD_ID=""
ENV TRELLO_API_KEY=""
ENV TRELLO_TOKEN=""
ENV TRELLO_BOARD_ID=""
ENV CONFIG_DIR="/app/config"

# 運用に必要なパッケージのみインストール
COPY package*.json ./
RUN npm ci --only=production --no-fund --no-audit

# スクリプトディレクトリのコピー（コマンド登録に必要）
COPY scripts/ ./scripts/

# ビルドステージからビルド済みのファイルをコピー
COPY --from=builder /build/dist ./dist

# 設定ディレクトリと必要なディレクトリを作成
RUN mkdir -p "${CONFIG_DIR}" && \
    mkdir -p /app/logs && \
    chown -R node:node "${CONFIG_DIR}" && \
    chown -R node:node /app/logs

# 非rootユーザーに切り替え
USER node

# 実際のアプリケーション状態をチェックするヘルスチェック
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "const http = require('http'); const options = { timeout: 2000 }; const req = http.request('http://localhost:8080/health', options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => { process.exit(1); }); req.end();"

# アプリケーションの実行
CMD ["npm", "start"]
