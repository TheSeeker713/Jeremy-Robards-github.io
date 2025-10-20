/**
 * Runtime Logger
 * Provides leveled logging with timestamps and togglable verbose mode
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 4,
};

const LOG_COLORS = {
  DEBUG: '#64748b', // gray
  INFO: '#0ea5e9', // blue
  WARN: '#f59e0b', // amber
  ERROR: '#ef4444', // red
};

class Logger {
  constructor(namespace = 'app', options = {}) {
    this.namespace = namespace;
    this.level =
      LOG_LEVELS[options.level?.toUpperCase()] ?? LOG_LEVELS[this.getDefaultLevel()];
    this.timestamps = options.timestamps ?? true;
    this.verbose = options.verbose ?? false;
  }

  getDefaultLevel() {
    if (typeof window !== 'undefined') {
      // Browser environment
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('debug') === 'true') {return 'DEBUG';}
      if (urlParams.get('verbose') === 'true') {return 'DEBUG';}
    }

    if (typeof process !== 'undefined') {
      // Node environment
      if (process.env.DEBUG === 'true') {return 'DEBUG';}
      if (process.env.VERBOSE === 'true') {return 'DEBUG';}
      if (process.env.NODE_ENV === 'production') {return 'WARN';}
    }

    return 'INFO';
  }

  setLevel(level) {
    const upperLevel = level.toUpperCase();
    if (LOG_LEVELS[upperLevel] !== undefined) {
      this.level = LOG_LEVELS[upperLevel];
    }
  }

  setVerbose(verbose) {
    this.verbose = verbose;
    if (verbose) {
      this.level = LOG_LEVELS.DEBUG;
    }
  }

  formatMessage(level, ...args) {
    const parts = [];

    if (this.timestamps) {
      const now = new Date();
      const timestamp = now.toISOString();
      parts.push(`[${timestamp}]`);
    }

    parts.push(`[${this.namespace}]`);
    parts.push(`[${level}]`);

    return { prefix: parts.join(' '), args };
  }

  shouldLog(level) {
    return LOG_LEVELS[level] >= this.level;
  }

  debug(...args) {
    if (!this.shouldLog('DEBUG')) {return;}

    const { prefix, args: msgArgs } = this.formatMessage('DEBUG', ...args);

    if (typeof window !== 'undefined') {
      console.log(`%c${prefix}`, `color: ${LOG_COLORS.DEBUG}`, ...msgArgs);
    } else {
      console.log(prefix, ...msgArgs);
    }
  }

  info(...args) {
    if (!this.shouldLog('INFO')) {return;}

    const { prefix, args: msgArgs } = this.formatMessage('INFO', ...args);

    if (typeof window !== 'undefined') {
      console.log(`%c${prefix}`, `color: ${LOG_COLORS.INFO}; font-weight: 600`, ...msgArgs);
    } else {
      console.log(prefix, ...msgArgs);
    }
  }

  warn(...args) {
    if (!this.shouldLog('WARN')) {return;}

    const { prefix, args: msgArgs } = this.formatMessage('WARN', ...args);

    if (typeof window !== 'undefined') {
      console.warn(`%c${prefix}`, `color: ${LOG_COLORS.WARN}; font-weight: 700`, ...msgArgs);
    } else {
      console.warn(prefix, ...msgArgs);
    }
  }

  error(...args) {
    if (!this.shouldLog('ERROR')) {return;}

    const { prefix, args: msgArgs } = this.formatMessage('ERROR', ...args);

    if (typeof window !== 'undefined') {
      console.error(`%c${prefix}`, `color: ${LOG_COLORS.ERROR}; font-weight: 700`, ...msgArgs);
    } else {
      console.error(prefix, ...msgArgs);
    }
  }

  group(label) {
    if (this.shouldLog('INFO')) {
      console.group(label);
    }
  }

  groupEnd() {
    if (this.shouldLog('INFO')) {
      console.groupEnd();
    }
  }

  table(data) {
    if (this.shouldLog('DEBUG')) {
      console.table(data);
    }
  }

  time(label) {
    if (this.shouldLog('DEBUG')) {
      console.time(label);
    }
  }

  timeEnd(label) {
    if (this.shouldLog('DEBUG')) {
      console.timeEnd(label);
    }
  }

  /**
   * Create a child logger with a sub-namespace
   */
  child(subNamespace) {
    return new Logger(`${this.namespace}:${subNamespace}`, {
      level: Object.keys(LOG_LEVELS).find((key) => LOG_LEVELS[key] === this.level),
      timestamps: this.timestamps,
      verbose: this.verbose,
    });
  }

  /**
   * Generate crash report artifact
   */
  generateCrashReport(error, context = {}) {
    const report = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      context: {
        namespace: this.namespace,
        ...context,
      },
      environment:
        typeof window !== 'undefined'
          ? {
              userAgent: navigator.userAgent,
              url: window.location.href,
              viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
              },
            }
          : {
              node: process.version,
              platform: process.platform,
              arch: process.arch,
            },
    };

    this.error('Crash report generated:', report);
    return report;
  }
}

// Export factory function
export function createLogger(namespace, options) {
  return new Logger(namespace, options);
}

// Export default instance
export default new Logger('portfolio-cms');
