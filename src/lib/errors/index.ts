/**
 * Centralized error handling for the application
 * Provides custom error classes and error handling utilities
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTH_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Permission denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests. Please try again later.') {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

export class LLMError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 500, 'LLM_ERROR', details);
    this.name = 'LLMError';
  }
}

export class ToolExecutionError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 500, 'TOOL_ERROR', details);
    this.name = 'ToolExecutionError';
  }
}

/**
 * Handle API errors and return appropriate Response
 */
export function handleApiError(error: unknown): Response {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    return Response.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  // Don't leak internal errors to clients
  return Response.json(
    {
      error: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  );
}

/**
 * Error messages for user-facing errors
 */
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  TIMEOUT_ERROR: 'The request took too long. Please try again.',

  // Authentication errors
  AUTH_REQUIRED: 'Please log in to continue.',
  AUTH_EXPIRED: 'Your session has expired. Please log in again.',
  PERMISSION_DENIED: "You don't have permission to perform this action.",

  // LLM errors
  LLM_RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
  LLM_ERROR: 'Unable to process your request right now. Please try again.',

  // Validation errors
  INVALID_INPUT: 'Please check your input and try again.',
  MESSAGE_TOO_LONG: 'Your message is too long. Please shorten it and try again.',

  // Tool errors
  TOOL_ERROR: 'Unable to complete the action. Please try again.',

  // Generic
  UNKNOWN_ERROR: 'Something went wrong. Please try again.',
} as const;

/**
 * Get user-friendly error message
 */
export function getUserFriendlyError(error: unknown): string {
  if (error instanceof AppError && error.code) {
    const key = error.code as keyof typeof ERROR_MESSAGES;
    return ERROR_MESSAGES[key] || error.message;
  }

  if (error instanceof Error) {
    // Map common error patterns
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    if (error.message.includes('timeout')) {
      return ERROR_MESSAGES.TIMEOUT_ERROR;
    }
    if (error.message.includes('rate limit') || error.message.includes('429')) {
      return ERROR_MESSAGES.LLM_RATE_LIMIT;
    }
    if (error.message.includes('auth')) {
      return ERROR_MESSAGES.AUTH_REQUIRED;
    }
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Track errors (integrate with your monitoring service)
 */
export function trackError(error: Error, context?: Record<string, any>) {
  // In production, send to error tracking service (e.g., Sentry)
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { extra: context });
  }

  // Always log locally
  console.error('Error tracked:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
}
