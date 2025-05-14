/**
 * ヘルスチェックサーバーモジュール
 * Dockerコンテナのヘルスチェック用HTTPサーバーを提供
 */
import http from 'http';
import { ENV } from './config';

// アプリケーションの状態
let appState = {
  healthy: true,
  lastNotificationCheck: null as Date | null,
  lastCommandExecution: null as Date | null,
  uptime: 0,
  errors: [] as string[]
};

// エラー記録（最大5件）
export function recordError(error: string): void {
  appState.errors.unshift(error);
  if (appState.errors.length > 5) {
    appState.errors.pop();
  }
  
  // 重大なエラーが多すぎる場合はヘルスステータスを変更
  if (appState.errors.length >= 3) {
    appState.healthy = false;
  }
}

// 通知チェック時間の更新
export function updateNotificationCheck(): void {
  appState.lastNotificationCheck = new Date();
}

// コマンド実行時間の更新
export function updateCommandExecution(): void {
  appState.lastCommandExecution = new Date();
}

// ヘルスステータスのリセット
export function resetHealthStatus(): void {
  appState.healthy = true;
  appState.errors = [];
}

/**
 * ヘルスチェックHTTPサーバーの開始
 */
export function startHealthCheckServer(): void {
  const PORT = ENV.HEALTH_CHECK_PORT;
  
  // 起動時刻を記録
  const startTime = Date.now();
  
  const server = http.createServer((req, res) => {
    // アップタイムを更新
    appState.uptime = Math.floor((Date.now() - startTime) / 1000);
    
    // エンドポイントに応じてレスポンスを返す
    if (req.url === '/health') {
      // /health エンドポイント: シンプルなステータス確認用
      if (appState.healthy) {
        res.statusCode = 200;
        res.end('OK');
      } else {
        res.statusCode = 503;
        res.end('Service Unavailable');
      }
    } else if (req.url === '/status') {
      // /status エンドポイント: 詳細な状態情報を提供
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify({
        status: appState.healthy ? 'healthy' : 'unhealthy',
        uptime: appState.uptime,
        lastNotificationCheck: appState.lastNotificationCheck,
        lastCommandExecution: appState.lastCommandExecution,
        errors: appState.errors,
        env: ENV.NODE_ENV
      }));
    } else {
      // その他のエンドポイント: 404を返す
      res.statusCode = 404;
      res.end('Not Found');
    }
  });
  
  // エラーハンドリング
  server.on('error', (error) => {
    console.error('ヘルスチェックサーバーエラー:', error);
  });
  
  // サーバー起動
  server.listen(PORT, () => {
    console.log(`ヘルスチェックサーバーを開始しました (port: ${PORT})`);
  });
  
  return;
}
