FROM node:18-alpine

WORKDIR /app

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
