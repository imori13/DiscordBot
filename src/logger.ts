/**
 * ログ機能モジュール
 * アプリケーションの一貫したログ記録を提供
 */
import * as fs from 'fs';
import * as path from 'path';
import { ENV } from './config';

// ログレベル定義
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

// 現在のログレベル
let currentLogLevel = LogLevel.INFO;

// ログレベル文字列とLevelのマッピング
const LOG_LEVEL_MAP: { [key: string]: LogLevel } = {
  'debug': LogLevel.DEBUG,
  'info': LogLevel.INFO,
  'warn': LogLevel.WARN,
  'error': LogLevel.ERROR,
  'fatal': LogLevel.FATAL
};

// 環境変数からログレベルを設定
if (ENV.LOG_LEVEL && LOG_LEVEL_MAP[ENV.LOG_LEVEL.toLowerCase()]) {
  currentLogLevel = LOG_LEVEL_MAP[ENV.LOG_LEVEL.toLowerCase()];
}

// ログファイルパス
const LOG_DIR = ENV.LOGS_DIR;
const LOG_FILE = path.join(LOG_DIR, `app-${new Date().toISOString().split('T')[0]}.log`);

// ログディレクトリが存在しない場合は作成
if (!fs.existsSync(LOG_DIR)) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    console.log(`ログディレクトリを作成しました: ${LOG_DIR}`);
  } catch (error) {
    console.error(`ログディレクトリの作成に失敗しました: ${error}`);
  }
}

/**
 * ログエントリを作成
 */
function createLogEntry(level: string, message: string, data?: any): string {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] [${level}] ${message}`;
  
  if (data) {
    if (typeof data === 'object') {
      try {
        logMessage += ` ${JSON.stringify(data)}`;
      } catch (e) {
        logMessage += ` [Object]`;
      }
    } else {
      logMessage += ` ${data}`;
    }
  }
  
  return logMessage;
}

/**
 * ファイルにログを書き込む
 */
function writeToLogFile(message: string): void {
  try {
    fs.appendFileSync(LOG_FILE, message + '\n');
  } catch (error) {
    console.error(`ログファイルへの書き込みに失敗しました: ${error}`);
  }
}

/**
 * ログメッセージを記録
 */
function logMessage(level: LogLevel, levelString: string, message: string, data?: any): void {
  if (level >= currentLogLevel) {
    const logEntry = createLogEntry(levelString, message, data);
    
    // コンソールに出力
    if (level === LogLevel.ERROR || level === LogLevel.FATAL) {
      console.error(logEntry);
    } else if (level === LogLevel.WARN) {
      console.warn(logEntry);
    } else {
      console.log(logEntry);
    }
    
    // ファイルに書き込み
    writeToLogFile(logEntry);
  }
}

// ロガーインターフェース
export const logger = {
  debug: (message: string, data?: any): void => {
    logMessage(LogLevel.DEBUG, 'DEBUG', message, data);
  },
  
  info: (message: string, data?: any): void => {
    logMessage(LogLevel.INFO, 'INFO', message, data);
  },
  
  warn: (message: string, data?: any): void => {
    logMessage(LogLevel.WARN, 'WARN', message, data);
  },
  
  error: (message: string, error?: any): void => {
    let errorData;
    
    if (error instanceof Error) {
      errorData = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    } else {
      errorData = error;
    }
    
    logMessage(LogLevel.ERROR, 'ERROR', message, errorData);
  },
  
  fatal: (message: string, error?: any): void => {
    logMessage(LogLevel.FATAL, 'FATAL', message, error);
  },
  
  setLogLevel: (level: LogLevel | string): void => {
    if (typeof level === 'string') {
      const normalizedLevel = level.toLowerCase();
      if (normalizedLevel in LOG_LEVEL_MAP) {
        currentLogLevel = LOG_LEVEL_MAP[normalizedLevel];
      }
    } else if (typeof level === 'number') {
      currentLogLevel = level;
    }
  }
};
