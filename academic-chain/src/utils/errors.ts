/**
 * Error handling and logging utilities
 * Centralizes consistent error handling across the application
 */

/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Error context information
 */
export interface ErrorContext {
  context: string;
  userId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

/**
 * Standardized error logging
 */
export function logError(
  error: Error | unknown,
  context: ErrorContext,
  level: LogLevel = 'error'
): void {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  const logData = {
    timestamp,
    level,
    context: context.context,
    message: errorMessage,
    stack: errorStack,
    userId: context.userId,
    component: context.component,
    action: context.action,
    metadata: context.metadata,
  };

  // Log based on environment
  if (process.env.NODE_ENV === 'development') {
    console[level === 'error' ? 'error' : level]('[' + context.context + ']', logData);
  } else {
    console.error('[' + context.context + ']', logData);
  }
}

/**
 * Format error message for display to user
 */
export function formatErrorForUser(error: Error | unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

/**
 * Safely execute async function with standardized error handling
 */
export async function executeWithErrorHandler<T>(
  fn: () => Promise<T>,
  context: ErrorContext
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    logError(error, context);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
