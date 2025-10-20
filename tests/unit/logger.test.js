/**
 * Tests for Logger utility
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createLogger } from '../../shared/logger.js';

describe('Logger', () => {
  let consoleLogSpy;
  let consoleWarnSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('createLogger', () => {
    it('should create a logger with namespace', () => {
      const logger = createLogger('test-namespace');
      expect(logger.namespace).toBe('test-namespace');
    });

    it('should respect log level option', () => {
      const logger = createLogger('test', { level: 'WARN' });
      logger.debug('Should not log');
      logger.info('Should not log');
      logger.warn('Should log');

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should support verbose mode', () => {
      const logger = createLogger('test', { verbose: true });
      logger.debug('Should log in verbose mode');

      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('log levels', () => {
    it('should log debug messages when level is DEBUG', () => {
      const logger = createLogger('test', { level: 'DEBUG' });
      logger.debug('Debug message');

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      const logger = createLogger('test');
      logger.info('Info message');

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      const logger = createLogger('test');
      logger.warn('Warning message');

      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      const logger = createLogger('test');
      logger.error('Error message');

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should not log below threshold', () => {
      const logger = createLogger('test', { level: 'ERROR' });

      logger.debug('Should not log');
      logger.info('Should not log');
      logger.warn('Should not log');
      logger.error('Should log');

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('message formatting', () => {
    it('should include namespace in messages', () => {
      const logger = createLogger('my-module');
      logger.info('Test message');

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0];
      expect(logCall.some((arg) => String(arg).includes('[my-module]'))).toBe(true);
    });

    it('should include log level in messages', () => {
      const logger = createLogger('test');
      logger.warn('Warning');

      expect(consoleWarnSpy).toHaveBeenCalled();
      const warnCall = consoleWarnSpy.mock.calls[0];
      expect(warnCall.some((arg) => String(arg).includes('[WARN]'))).toBe(true);
    });

    it('should include timestamps when enabled', () => {
      const logger = createLogger('test', { timestamps: true });
      logger.info('Message');

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0];
      // Check for ISO timestamp pattern
      expect(logCall.some((arg) => String(arg).match(/\d{4}-\d{2}-\d{2}T/))).toBe(true);
    });

    it('should not include timestamps when disabled', () => {
      const logger = createLogger('test', { timestamps: false });
      logger.info('Message');

      expect(consoleLogSpy).toHaveBeenCalled();
      const logCall = consoleLogSpy.mock.calls[0];
      expect(logCall.some((arg) => String(arg).match(/\d{4}-\d{2}-\d{2}T/))).toBe(false);
    });
  });

  describe('child loggers', () => {
    it('should create child logger with sub-namespace', () => {
      const parent = createLogger('parent');
      const child = parent.child('child');

      expect(child.namespace).toBe('parent:child');
    });

    it('should inherit parent log level', () => {
      const parent = createLogger('parent', { level: 'WARN' });
      const child = parent.child('child');

      child.debug('Should not log');
      child.info('Should not log');
      child.warn('Should log');

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe('crash report generation', () => {
    it('should generate crash report with error details', () => {
      const logger = createLogger('test');
      const testError = new Error('Test error');

      const report = logger.generateCrashReport(testError);

      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('error');
      expect(report.error.message).toBe('Test error');
      expect(report.error.stack).toBeDefined();
    });

    it('should include context in crash report', () => {
      const logger = createLogger('test');
      const testError = new Error('Test error');
      const context = { userId: '123', action: 'export' };

      const report = logger.generateCrashReport(testError, context);

      expect(report.context).toMatchObject(context);
      expect(report.context.namespace).toBe('test');
    });

    it('should include environment info', () => {
      const logger = createLogger('test');
      const testError = new Error('Test error');

      const report = logger.generateCrashReport(testError);

      expect(report).toHaveProperty('environment');
      expect(report.environment).toHaveProperty('node');
    });
  });

  describe('setLevel', () => {
    it('should update log level dynamically', () => {
      const logger = createLogger('test', { level: 'INFO' });

      logger.debug('Should not log');
      expect(consoleLogSpy).not.toHaveBeenCalled();

      logger.setLevel('DEBUG');
      logger.debug('Should log now');
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('setVerbose', () => {
    it('should enable verbose mode', () => {
      const logger = createLogger('test', { level: 'INFO' });

      logger.debug('Should not log');
      expect(consoleLogSpy).not.toHaveBeenCalled();

      logger.setVerbose(true);
      logger.debug('Should log in verbose');
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });
});
