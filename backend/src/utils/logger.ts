// ============================================
// Maya Backend — Logger Utility
// ============================================

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

class Logger {
  private level: number;

  constructor(level: LogLevel = 'info') {
    this.level = LEVELS[level] || LEVELS.info;
  }

  private log(levelName: LogLevel, color: string, args: unknown[]): void {
    if (LEVELS[levelName] <= this.level) {
      const timestamp = new Date().toISOString();
      const prefix = `${color}[${timestamp}] [${levelName.toUpperCase()}]${COLORS.reset}`;
      console.log(prefix, ...args);
    }
  }

  error(...args: unknown[]): void {
    this.log('error', COLORS.red, args);
  }

  warn(...args: unknown[]): void {
    this.log('warn', COLORS.yellow, args);
  }

  info(...args: unknown[]): void {
    this.log('info', COLORS.cyan, args);
  }

  debug(...args: unknown[]): void {
    this.log('debug', COLORS.gray, args);
  }
}

export const logger = new Logger(LOG_LEVEL as LogLevel);
