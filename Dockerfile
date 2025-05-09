FROM node:18-alpine

WORKDIR /app

# 環境変数の設定（実行時に.envまたは環境変数から上書き可能）
ENV DISCORD_TOKEN=""
ENV DISCORD_CHANNEL_ID=""
ENV TRELLO_API_KEY=""
ENV TRELLO_TOKEN=""
ENV TRELLO_BOARD_ID=""
ENV CONFIG_DIR="/app/config"

# 依存関係ファイルのコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm install

# TypeScriptソースコードと設定ファイルのコピー
COPY tsconfig.json ./
COPY src/ ./src/

# TypeScriptのビルド
RUN npm run build

# アプリケーションの実行
CMD ["npm", "start"]
