import { AppError } from '../../types';

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];
  private maxLogSize = 100;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Handle different types of errors
  handleError(error: unknown, context: string = 'Unknown'): AppError {
    const appError = this.createAppError(error, context);
    this.logError(appError);
    return appError;
  }

  // Create standardized app error
  private createAppError(error: unknown, context: string): AppError {
    let type: AppError['type'] = 'UNKNOWN_ERROR';
    let message = 'An unknown error occurred';
    let details: any = null;

    if (error instanceof Error) {
      message = error.message;
      details = {
        name: error.name,
        stack: error.stack,
      };

      // Categorize error based on message or type
      if (this.isNetworkError(error)) {
        type = 'NETWORK_ERROR';
      } else if (this.isStorageError(error)) {
        type = 'STORAGE_ERROR';
      } else if (this.isNotificationError(error)) {
        type = 'NOTIFICATION_ERROR';
      } else if (this.isValidationError(error)) {
        type = 'VALIDATION_ERROR';
      }
    } else if (typeof error === 'string') {
      message = error;
    } else {
      details = error;
    }

    return {
      type,
      message,
      details,
      timestamp: Date.now(),
      context,
    };
  }

  // Error type detection
  private isNetworkError(error: Error): boolean {
    const networkKeywords = ['network', 'fetch', 'request', 'connection', 'timeout'];
    return networkKeywords.some(keyword => 
      error.message.toLowerCase().includes(keyword) ||
      error.name.toLowerCase().includes(keyword)
    );
  }

  private isStorageError(error: Error): boolean {
    const storageKeywords = ['storage', 'asyncstorage', 'save', 'load', 'persist'];
    return storageKeywords.some(keyword => 
      error.message.toLowerCase().includes(keyword) ||
      error.name.toLowerCase().includes(keyword)
    );
  }

  private isNotificationError(error: Error): boolean {
    const notificationKeywords = ['notification', 'permission', 'schedule'];
    return notificationKeywords.some(keyword => 
      error.message.toLowerCase().includes(keyword) ||
      error.name.toLowerCase().includes(keyword)
    );
  }

  private isValidationError(error: Error): boolean {
    const validationKeywords = ['validation', 'invalid', 'required', 'format'];
    return validationKeywords.some(keyword => 
      error.message.toLowerCase().includes(keyword) ||
      error.name.toLowerCase().includes(keyword)
    );
  }

  // Log error to internal log
  private logError(error: AppError): void {
    this.errorLog.unshift(error);
    
    // Maintain log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Console log for development
    console.error(`[${error.type}] ${error.context}: ${error.message}`, error.details);
  }

  // Get error log
  getErrorLog(): AppError[] {
    return [...this.errorLog];
  }

  // Get recent errors
  getRecentErrors(minutes: number = 60): AppError[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.errorLog.filter(error => error.timestamp > cutoff);
  }

  // Clear error log
  clearErrorLog(): void {
    this.errorLog = [];
  }

  // Get error statistics
  getErrorStatistics(timeRange?: { start: number; end: number }) {
    let errors = this.errorLog;
    
    if (timeRange) {
      errors = errors.filter(error => 
        error.timestamp >= timeRange.start && error.timestamp <= timeRange.end
      );
    }

    const stats = {
      total: errors.length,
      byType: this.groupBy(errors, 'type'),
      byContext: this.groupBy(errors, 'context'),
      recentErrors: this.getRecentErrors(60), // Last hour
    };

    return stats;
  }

  private groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, number> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      groups[groupKey] = (groups[groupKey] || 0) + 1;
      return groups;
    }, {} as Record<string, number>);
  }
}

// Recovery strategies for different error types
export class ErrorRecovery {
  static async handleStorageError(error: AppError): Promise<'retry' | 'fallback' | 'fail'> {
    // For storage errors, try to clear cache and retry
    if (error.message.includes('corrupted') || error.message.includes('invalid')) {
      try {
        // Clear problematic data
        const { StorageService } = await import('../services/StorageService');
        const storageService = new StorageService();
        await storageService.clearCache();
        return 'retry';
      } catch {
        return 'fallback';
      }
    }
    
    return 'retry';
  }

  static async handleNetworkError(error: AppError): Promise<'retry' | 'fallback' | 'fail'> {
    // For network errors, use cached data if available
    return 'fallback';
  }

  static async handleNotificationError(error: AppError): Promise<'retry' | 'fallback' | 'fail'> {
    // For notification errors, degrade gracefully
    if (error.message.includes('permission')) {
      return 'fallback'; // Continue without notifications
    }
    
    return 'retry';
  }

  static async handleValidationError(error: AppError): Promise<'retry' | 'fallback' | 'fail'> {
    // Validation errors usually require user intervention
    return 'fail';
  }
}

// Error boundary hook for React components
export function useErrorHandler() {
  const errorHandler = ErrorHandler.getInstance();

  const handleError = (error: unknown, context: string = 'Component') => {
    return errorHandler.handleError(error, context);
  };

  const getErrorLog = () => errorHandler.getErrorLog();
  const getRecentErrors = (minutes?: number) => errorHandler.getRecentErrors(minutes);
  const clearErrors = () => errorHandler.clearErrorLog();
  const getErrorStats = (timeRange?: { start: number; end: number }) => 
    errorHandler.getErrorStatistics(timeRange);

  return {
    handleError,
    getErrorLog,
    getRecentErrors,
    clearErrors,
    getErrorStats,
  };
}