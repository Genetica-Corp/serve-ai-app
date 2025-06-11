import { useState, useCallback, useRef, useEffect } from 'react';

export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
  operation?: string;
}

interface LoadingManager {
  setLoading: (loading: boolean, operation?: string, message?: string) => void;
  setProgress: (progress: number) => void;
  setMessage: (message: string) => void;
  startOperation: (operation: string, message?: string) => void;
  completeOperation: () => void;
  state: LoadingState;
}

// Global loading state manager
class GlobalLoadingManager {
  private static instance: GlobalLoadingManager;
  private subscribers: Set<(state: LoadingState) => void> = new Set();
  private state: LoadingState = { isLoading: false };
  private operationQueue: string[] = [];

  static getInstance(): GlobalLoadingManager {
    if (!GlobalLoadingManager.instance) {
      GlobalLoadingManager.instance = new GlobalLoadingManager();
    }
    return GlobalLoadingManager.instance;
  }

  subscribe(callback: (state: LoadingState) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notify(): void {
    this.subscribers.forEach(callback => callback(this.state));
  }

  setLoading(loading: boolean, operation?: string, message?: string): void {
    if (loading) {
      if (operation) this.operationQueue.push(operation);
      this.state = {
        isLoading: true,
        operation: operation || this.operationQueue[this.operationQueue.length - 1],
        message,
        progress: undefined,
      };
    } else {
      if (operation) {
        const index = this.operationQueue.indexOf(operation);
        if (index > -1) this.operationQueue.splice(index, 1);
      }
      
      if (this.operationQueue.length === 0) {
        this.state = { isLoading: false };
      } else {
        this.state = {
          ...this.state,
          operation: this.operationQueue[this.operationQueue.length - 1],
        };
      }
    }
    
    this.notify();
  }

  setProgress(progress: number): void {
    this.state = { ...this.state, progress };
    this.notify();
  }

  setMessage(message: string): void {
    this.state = { ...this.state, message };
    this.notify();
  }

  getState(): LoadingState {
    return this.state;
  }

  isOperationActive(operation: string): boolean {
    return this.operationQueue.includes(operation);
  }
}

// Hook for component-level loading state
export function useLoadingState(initialLoading = false): LoadingManager {
  const [state, setState] = useState<LoadingState>({ isLoading: initialLoading });
  const operationRef = useRef<string | null>(null);

  const setLoading = useCallback((loading: boolean, operation?: string, message?: string) => {
    if (loading) {
      operationRef.current = operation || null;
      setState({
        isLoading: true,
        operation,
        message,
        progress: undefined,
      });
    } else {
      setState({ isLoading: false });
      operationRef.current = null;
    }
  }, []);

  const setProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, progress }));
  }, []);

  const setMessage = useCallback((message: string) => {
    setState(prev => ({ ...prev, message }));
  }, []);

  const startOperation = useCallback((operation: string, message?: string) => {
    setLoading(true, operation, message);
  }, [setLoading]);

  const completeOperation = useCallback(() => {
    setLoading(false);
  }, [setLoading]);

  return {
    setLoading,
    setProgress,
    setMessage,
    startOperation,
    completeOperation,
    state,
  };
}

// Hook for global loading state
export function useGlobalLoadingState(): LoadingManager & { 
  isOperationActive: (operation: string) => boolean 
} {
  const [state, setState] = useState<LoadingState>(() => 
    GlobalLoadingManager.getInstance().getState()
  );
  
  const manager = GlobalLoadingManager.getInstance();

  useEffect(() => {
    const unsubscribe = manager.subscribe(setState);
    return unsubscribe;
  }, [manager]);

  const setLoading = useCallback((loading: boolean, operation?: string, message?: string) => {
    manager.setLoading(loading, operation, message);
  }, [manager]);

  const setProgress = useCallback((progress: number) => {
    manager.setProgress(progress);
  }, [manager]);

  const setMessage = useCallback((message: string) => {
    manager.setMessage(message);
  }, [manager]);

  const startOperation = useCallback((operation: string, message?: string) => {
    manager.setLoading(true, operation, message);
  }, [manager]);

  const completeOperation = useCallback(() => {
    if (state.operation) {
      manager.setLoading(false, state.operation);
    }
  }, [manager, state.operation]);

  const isOperationActive = useCallback((operation: string) => {
    return manager.isOperationActive(operation);
  }, [manager]);

  return {
    setLoading,
    setProgress,
    setMessage,
    startOperation,
    completeOperation,
    isOperationActive,
    state,
  };
}

// Higher-order function for wrapping async operations with loading state
export function withLoading<T extends any[], R>(
  asyncFn: (...args: T) => Promise<R>,
  operation: string,
  useGlobal = false
) {
  return async (...args: T): Promise<R> => {
    const manager = useGlobal 
      ? GlobalLoadingManager.getInstance()
      : null;

    try {
      if (manager) {
        manager.setLoading(true, operation);
      }
      
      const result = await asyncFn(...args);
      
      if (manager) {
        manager.setLoading(false, operation);
      }
      
      return result;
    } catch (error) {
      if (manager) {
        manager.setLoading(false, operation);
      }
      throw error;
    }
  };
}

// Progress tracking utility for operations with known steps
export class ProgressTracker {
  private totalSteps: number;
  private currentStep: number = 0;
  private onProgress?: (progress: number, step: string) => void;

  constructor(totalSteps: number, onProgress?: (progress: number, step: string) => void) {
    this.totalSteps = totalSteps;
    this.onProgress = onProgress;
  }

  nextStep(stepName: string): void {
    this.currentStep++;
    const progress = Math.round((this.currentStep / this.totalSteps) * 100);
    this.onProgress?.(progress, stepName);
  }

  setStep(step: number, stepName: string): void {
    this.currentStep = Math.max(0, Math.min(step, this.totalSteps));
    const progress = Math.round((this.currentStep / this.totalSteps) * 100);
    this.onProgress?.(progress, stepName);
  }

  complete(): void {
    this.currentStep = this.totalSteps;
    this.onProgress?.(100, 'Complete');
  }

  reset(): void {
    this.currentStep = 0;
  }

  getProgress(): number {
    return Math.round((this.currentStep / this.totalSteps) * 100);
  }
}

// Hook for progress tracking
export function useProgressTracker(
  totalSteps: number,
  onProgress?: (progress: number, step: string) => void
): ProgressTracker {
  const trackerRef = useRef<ProgressTracker>();
  
  if (!trackerRef.current) {
    trackerRef.current = new ProgressTracker(totalSteps, onProgress);
  }

  return trackerRef.current;
}

// Predefined operation names for consistency
export const OPERATIONS = {
  INITIALIZING_APP: 'INITIALIZING_APP',
  LOADING_ALERTS: 'LOADING_ALERTS',
  GENERATING_ALERTS: 'GENERATING_ALERTS',
  SAVING_DATA: 'SAVING_DATA',
  LOADING_DATA: 'LOADING_DATA',
  BACKING_UP_DATA: 'BACKING_UP_DATA',
  RESTORING_DATA: 'RESTORING_DATA',
  SYNCING: 'SYNCING',
  PROCESSING_NOTIFICATION: 'PROCESSING_NOTIFICATION',
  UPDATING_SETTINGS: 'UPDATING_SETTINGS',
  CLEARING_DATA: 'CLEARING_DATA',
  VALIDATING_DATA: 'VALIDATING_DATA',
} as const;

export type OperationType = typeof OPERATIONS[keyof typeof OPERATIONS];