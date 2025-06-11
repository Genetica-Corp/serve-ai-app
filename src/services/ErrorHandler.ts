import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppError, ErrorType, RecoveryAction, ServiceResponse } from '../types';

/**
 * Comprehensive error handling and recovery system for the notification service
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];
  private recoveryStrategies: Map<ErrorType, RecoveryAction[]> = new Map();

  private constructor() {
    this.initializeRecoveryStrategies();
    this.loadErrorLog();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Main error handling algorithm based on pseudocode specifications
   */
  public async handleError(
    error: Error | AppError, 
    context: string, 
    userAction?: string
  ): Promise<ServiceResponse<RecoveryAction>> {
    try {
      const appError = this.normalizeError(error, context);
      
      // Log the error
      await this.logError(appError, userAction);
      
      // Determine recovery action
      const recoveryAction = this.determineRecoveryAction(appError);
      
      // Execute recovery strategy
      const recoveryResult = await this.executeRecovery(appError, recoveryAction);
      
      return {
        success: recoveryResult.success,
        data: recoveryAction,
        error: recoveryResult.success ? undefined : recoveryResult.error,
        timestamp: new Date()
      };
    } catch (recoveryError) {
      return {
        success: false,
        error: `Recovery failed: ${recoveryError}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Handle network-related errors
   */
  public async handleNetworkError(error: Error, context: string): Promise<ServiceResponse<RecoveryAction>> {
    console.log('🌐 Handling network error:', error.message);
    
    // Check if cached data is available
    const hasCachedData = await this.checkCachedData(context);
    
    if (hasCachedData) {
      await this.showCachedData(context);
      this.showOfflineBanner();
      return {
        success: true,
        data: 'SHOW_CACHED',
        timestamp: new Date()
      };
    } else {
      this.showNetworkErrorMessage();
      return {
        success: false,
        data: 'RETRY_PROMPT',
        error: 'No cached data available',
        timestamp: new Date()
      };
    }
  }

  /**
   * Handle storage-related errors
   */
  public async handleStorageError(error: Error, context: string): Promise<ServiceResponse<RecoveryAction>> {
    console.log('💾 Handling storage error:', error.message);
    
    try {
      // Attempt to clear corrupted data
      await this.clearCorruptedData(context);
      
      // Reinitialize storage
      await this.reinitializeStorage();
      
      return {
        success: true,
        data: 'REINITIALIZE',
        timestamp: new Date()
      };
    } catch (reinitError) {
      return {
        success: false,
        data: 'RESTART_REQUIRED',
        error: `Storage recovery failed: ${reinitError}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Handle notification permission errors
   */
  public async handleNotificationError(error: Error, context: string): Promise<ServiceResponse<RecoveryAction>> {
    console.log('🔔 Handling notification error:', error.message);
    
    // Disable notifications gracefully
    await this.disableNotifications();
    
    // Show informative message to user
    this.showNotificationErrorMessage();
    
    return {
      success: true,
      data: 'DEGRADE_GRACEFULLY',
      timestamp: new Date()
    };
  }

  /**
   * Handle permission-related errors
   */
  public async handlePermissionError(error: Error, context: string): Promise<ServiceResponse<RecoveryAction>> {
    console.log('🔐 Handling permission error:', error.message);
    
    // Provide alternative workflows
    await this.enableAlternativeWorkflow();
    
    // Show permission guidance
    this.showPermissionGuidance();
    
    return {
      success: true,
      data: 'DEGRADE_GRACEFULLY',
      timestamp: new Date()
    };
  }

  /**
   * Get error recovery suggestions for user
   */
  public getRecoverySuggestions(errorType: ErrorType): string[] {
    const suggestions = {
      NETWORK_ERROR: [
        'Check your internet connection',
        'Try again in a few moments',
        'Switch to mobile data if using WiFi',
        'Restart the app if problem persists'
      ],
      STORAGE_ERROR: [
        'Restart the app to clear temporary data',
        'Ensure device has sufficient storage space',
        'Try clearing app cache',
        'Contact support if issue continues'
      ],
      NOTIFICATION_ERROR: [
        'Check notification permissions in device settings',
        'Enable notifications for this app',
        'Restart the app to refresh permissions',
        'You can still view alerts within the app'
      ],
      PERMISSION_ERROR: [
        'Grant necessary permissions in device settings',
        'Some features may be limited without permissions',
        'Restart the app after changing permissions',
        'Alternative workflows are available'
      ]
    };

    return suggestions[errorType] || ['Please try restarting the app'];
  }

  /**
   * Check if error is recoverable
   */
  public isErrorRecoverable(error: AppError): boolean {
    return error.recoverable;
  }

  /**
   * Get error statistics for monitoring
   */
  public getErrorStatistics(): {
    totalErrors: number;
    errorsByType: Record<ErrorType, number>;
    recentErrors: AppError[];
    recoverySuccessRate: number;
  } {
    const errorsByType = this.errorLog.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {} as Record<ErrorType, number>);

    const recentErrors = this.errorLog
      .filter(error => {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return error.timestamp > oneDayAgo;
      })
      .slice(-10);

    const recoverableErrors = this.errorLog.filter(error => error.recoverable);
    const recoverySuccessRate = recoverableErrors.length / Math.max(this.errorLog.length, 1);

    return {
      totalErrors: this.errorLog.length,
      errorsByType,
      recentErrors,
      recoverySuccessRate
    };
  }

  /**
   * Clear error log
   */
  public async clearErrorLog(): Promise<void> {
    this.errorLog = [];
    await this.saveErrorLog();
  }

  // Private methods

  /**
   * Initialize recovery strategies for different error types
   */
  private initializeRecoveryStrategies(): void {
    this.recoveryStrategies.set('NETWORK_ERROR', ['SHOW_CACHED', 'RETRY_PROMPT']);
    this.recoveryStrategies.set('STORAGE_ERROR', ['REINITIALIZE', 'RESTART_REQUIRED']);
    this.recoveryStrategies.set('NOTIFICATION_ERROR', ['DEGRADE_GRACEFULLY']);
    this.recoveryStrategies.set('PERMISSION_ERROR', ['DEGRADE_GRACEFULLY']);
  }

  /**
   * Normalize different error types to AppError
   */
  private normalizeError(error: Error | AppError, context: string): AppError {
    if ('type' in error) {
      return error as AppError;
    }

    // Determine error type from error message/context
    let errorType: ErrorType = 'NETWORK_ERROR';
    
    if (error.message.includes('storage') || error.message.includes('AsyncStorage')) {
      errorType = 'STORAGE_ERROR';
    } else if (error.message.includes('notification') || error.message.includes('permission')) {
      errorType = 'NOTIFICATION_ERROR';
    } else if (error.message.includes('permission')) {
      errorType = 'PERMISSION_ERROR';
    }

    return {
      type: errorType,
      message: error.message,
      context,
      timestamp: new Date(),
      recoverable: errorType !== 'STORAGE_ERROR'
    };
  }

  /**
   * Log error for analytics and debugging
   */
  private async logError(error: AppError, userAction?: string): Promise<void> {
    console.error(`🚨 Error logged:`, {
      type: error.type,
      message: error.message,
      context: error.context,
      timestamp: error.timestamp,
      userAction,
      recoverable: error.recoverable
    });

    this.errorLog.push(error);
    
    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    await this.saveErrorLog();
  }

  /**
   * Determine appropriate recovery action
   */
  private determineRecoveryAction(error: AppError): RecoveryAction {
    const strategies = this.recoveryStrategies.get(error.type);
    
    if (!strategies || strategies.length === 0) {
      return 'RESTART_REQUIRED';
    }

    // For now, return the first strategy. In a more complex system,
    // you could implement logic to choose based on error frequency, etc.
    return strategies[0];
  }

  /**
   * Execute the recovery strategy
   */
  private async executeRecovery(error: AppError, action: RecoveryAction): Promise<ServiceResponse<boolean>> {
    try {
      switch (action) {
        case 'SHOW_CACHED':
          await this.showCachedData(error.context || '');
          this.showOfflineBanner();
          break;
        case 'RETRY_PROMPT':
          this.showRetryPrompt();
          break;
        case 'REINITIALIZE':
          await this.reinitializeStorage();
          break;
        case 'DEGRADE_GRACEFULLY':
          await this.enableDegradedMode();
          break;
        case 'RESTART_REQUIRED':
          this.showRestartMessage();
          break;
      }

      return {
        success: true,
        data: true,
        timestamp: new Date()
      };
    } catch (recoveryError) {
      return {
        success: false,
        error: `Recovery execution failed: ${recoveryError}`,
        timestamp: new Date()
      };
    }
  }

  /**
   * Check if cached data is available for context
   */
  private async checkCachedData(context: string): Promise<boolean> {
    try {
      const cached = await AsyncStorage.getItem(`cached_${context}`);
      return cached !== null;
    } catch {
      return false;
    }
  }

  /**
   * Show cached data to user
   */
  private async showCachedData(context: string): Promise<void> {
    console.log(`📱 Showing cached data for context: ${context}`);
    // Implementation would load and display cached data
  }

  /**
   * Show offline banner
   */
  private showOfflineBanner(): void {
    console.log('📱 Showing offline banner');
    // Implementation would show offline indicator in UI
  }

  /**
   * Show network error message
   */
  private showNetworkErrorMessage(): void {
    console.log('📱 Showing network error message');
    // Implementation would show user-friendly network error message
  }

  /**
   * Clear corrupted data
   */
  private async clearCorruptedData(context: string): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const contextKeys = keys.filter(key => key.includes(context));
      
      if (contextKeys.length > 0) {
        await AsyncStorage.multiRemove(contextKeys);
      }
      
      console.log(`🧹 Cleared corrupted data for context: ${context}`);
    } catch (error) {
      console.error('Failed to clear corrupted data:', error);
    }
  }

  /**
   * Reinitialize storage
   */
  private async reinitializeStorage(): Promise<void> {
    console.log('🔄 Reinitializing storage');
    // Implementation would reinitialize storage with default values
  }

  /**
   * Disable notifications gracefully
   */
  private async disableNotifications(): Promise<void> {
    console.log('🔔 Disabling notifications gracefully');
    // Implementation would disable notification features
  }

  /**
   * Show notification error message
   */
  private showNotificationErrorMessage(): void {
    console.log('📱 Showing notification error message');
    // Implementation would show user-friendly notification error message
  }

  /**
   * Enable alternative workflow
   */
  private async enableAlternativeWorkflow(): Promise<void> {
    console.log('🔄 Enabling alternative workflow');
    // Implementation would enable alternative app workflows
  }

  /**
   * Show permission guidance
   */
  private showPermissionGuidance(): void {
    console.log('📱 Showing permission guidance');
    // Implementation would show permission guidance to user
  }

  /**
   * Show retry prompt
   */
  private showRetryPrompt(): void {
    console.log('📱 Showing retry prompt');
    // Implementation would show retry button/prompt
  }

  /**
   * Enable degraded mode
   */
  private async enableDegradedMode(): Promise<void> {
    console.log('⚠️ Enabling degraded mode');
    // Implementation would enable limited functionality mode
  }

  /**
   * Show restart message
   */
  private showRestartMessage(): void {
    console.log('📱 Showing restart message');
    // Implementation would show app restart guidance
  }

  /**
   * Load error log from storage
   */
  private async loadErrorLog(): Promise<void> {
    try {
      const savedLog = await AsyncStorage.getItem('error_log');
      if (savedLog) {
        this.errorLog = JSON.parse(savedLog);
      }
    } catch (error) {
      console.error('Failed to load error log:', error);
    }
  }

  /**
   * Save error log to storage
   */
  private async saveErrorLog(): Promise<void> {
    try {
      await AsyncStorage.setItem('error_log', JSON.stringify(this.errorLog));
    } catch (error) {
      console.error('Failed to save error log:', error);
    }
  }
}