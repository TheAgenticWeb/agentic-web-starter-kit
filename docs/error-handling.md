# Error Handling

Production-ready error handling patterns for your agentic web application.

## Overview

Robust error handling is critical for AI applications. This guide covers:

- ✅ **Frontend Error Boundaries** - Catch and handle React errors
- ✅ **API Error Handling** - Graceful API failures
- ✅ **LLM Error Patterns** - Handle model errors, rate limits
- ✅ **Tool Error Recovery** - Retry logic and fallbacks
- ✅ **User-Friendly Messages** - Never expose technical errors to users

## Error Architecture

```
┌─────────────────────────────────────────┐
│         Frontend Error Boundary         │
│  Catches: React errors, rendering issues│
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         API Error Handling              │
│  Catches: Network, HTTP, validation     │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Agent Error Handling            │
│  Catches: LLM errors, timeouts          │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Tool Error Handling             │
│  Catches: External API errors, failures │
└─────────────────────────────────────────┘
```

## Frontend Error Handling

### 1. React Error Boundary

```typescript
// src/components/ErrorBoundary.tsx
'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Send to analytics/monitoring
    if (typeof window !== 'undefined') {
      // trackError(error, errorInfo);
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>We're sorry for the inconvenience. Please try again.</p>
          <button onClick={this.reset}>Try Again</button>
          {process.env.NODE_ENV === 'development' && (
            <details>
              <summary>Error Details</summary>
              <pre>{this.state.error.message}</pre>
              <pre>{this.state.error.stack}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 2. Usage in App

```typescript
// src/app/layout.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary
          fallback={(error, reset) => (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Oops!</h1>
                <p className="text-gray-600 mb-4">
                  Something went wrong. Please try refreshing the page.
                </p>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        >
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### 3. Chat-Specific Error Handling

```typescript
// src/components/ChatInterface.tsx
'use client';

import { useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

export function ChatInterface() {
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (message: string) => {
    setError(null);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      // Handle success
      
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unexpected error occurred';
      
      setError(errorMessage);
      
      // Log for debugging
      console.error('Chat error:', err);
    }
  };

  return (
    <ErrorBoundary>
      <div className="chat-container">
        {error && (
          <div className="error-message bg-red-50 border border-red-200 p-4 rounded">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 underline mt-2"
            >
              Dismiss
            </button>
          </div>
        )}
        {/* Chat UI */}
      </div>
    </ErrorBoundary>
  );
}
```

## API Error Handling

### 1. Centralized Error Handler

```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTH_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

export class LLMError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 500, 'LLM_ERROR', details);
  }
}

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

  // Unknown errors - don't leak details
  return Response.json(
    {
      error: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  );
}
```

### 2. API Route Error Handling

```typescript
// src/app/api/chat/route.ts
import { handleApiError, ValidationError, LLMError } from '@/lib/errors';
import { z } from 'zod';

const RequestSchema = z.object({
  prompt: z.string().min(1).max(10000),
  temperature: z.number().min(0).max(2).optional(),
});

export async function POST(request: Request) {
  try {
    // Validate input
    const body = await request.json();
    const validated = RequestSchema.parse(body);
    
    // Process request
    const result = await processChat(validated);
    
    return Response.json(result);
    
  } catch (error) {
    // Zod validation errors
    if (error instanceof z.ZodError) {
      return handleApiError(
        new ValidationError('Invalid request', error.errors)
      );
    }
    
    // Handle all errors
    return handleApiError(error);
  }
}
```

### 3. Streaming Error Handling

```typescript
// src/backend/src/utils/streamUtils.ts
export async function handleStreamError(
  error: unknown,
  controller: ReadableStreamDefaultController
) {
  console.error('Stream error:', error);

  const errorMessage = error instanceof Error
    ? error.message
    : 'An error occurred during streaming';

  try {
    // Send error to client
    streamJSONEvent(controller, 'error', {
      message: errorMessage,
      code: 'STREAM_ERROR',
    });

    // Close stream
    controller.close();
  } catch (closeError) {
    // Already closed
    console.error('Error closing stream:', closeError);
  }
}

// Usage in workflow
try {
  const result = await starterAgent.streamVNext(messages, options);
  
  for await (const chunk of result.fullStream) {
    // Process chunks
  }
} catch (error) {
  await handleStreamError(error, streamController);
}
```

## LLM Error Handling

### 1. Rate Limit Handling

```typescript
// src/backend/src/utils/llmUtils.ts
export async function callLLMWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Check if it's a rate limit error
      if (isRateLimitError(error)) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`Rate limited. Retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }

      // Don't retry non-retryable errors
      if (!isRetryableError(error)) {
        throw error;
      }

      // Wait before retry
      if (attempt < maxRetries - 1) {
        await sleep(baseDelay * Math.pow(2, attempt));
      }
    }
  }

  throw new LLMError(`Failed after ${maxRetries} retries`, { 
    originalError: lastError 
  });
}

function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('rate limit') ||
           error.message.includes('429') ||
           error.message.includes('quota');
  }
  return false;
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    // Network errors, timeouts, 5xx errors are retryable
    return error.message.includes('network') ||
           error.message.includes('timeout') ||
           error.message.includes('500') ||
           error.message.includes('502') ||
           error.message.includes('503');
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### 2. Usage in Agent

```typescript
// src/backend/src/mastra/workflows/chatWorkflow.ts
const callAgent = createStep({
  id: 'callAgent',
  execute: async ({ inputData }) => {
    try {
      const result = await callLLMWithRetry(async () => {
        return await starterAgent.streamVNext(
          inputData.prompt,
          { ...options }
        );
      });

      return result;
      
    } catch (error) {
      // Log detailed error
      console.error('Agent call failed:', error);

      // Return user-friendly error
      throw new LLMError(
        'Unable to process your request right now. Please try again in a moment.'
      );
    }
  },
});
```

### 3. Model Fallback

```typescript
// src/backend/src/mastra/agents/resilientAgent.ts
export async function callAgentWithFallback(
  prompt: string,
  options: any
) {
  const models = [
    openai('gpt-4o-mini'),
    openai('gpt-4'),
    openai('gpt-3.5-turbo'),
  ];

  let lastError: Error | undefined;

  for (const model of models) {
    try {
      const agent = new Agent({
        ...agentConfig,
        model,
      });

      return await agent.streamVNext(prompt, options);
      
    } catch (error) {
      console.warn(`Model ${model} failed:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error');
      continue;
    }
  }

  throw new LLMError('All models failed', { originalError: lastError });
}
```

## Tool Error Handling

### 1. Graceful Tool Failures

```typescript
// src/backend/src/mastra/tools/webSearchTool.ts
export const webSearchTool = createTool({
  id: 'web-search',
  description: 'Search the web',
  inputSchema: z.object({ query: z.string() }),
  outputSchema: z.object({
    results: z.array(z.any()),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const results = await exaSearch(context.query);
      return { results };
      
    } catch (error) {
      console.error('Web search failed:', error);

      // Return empty results with error message
      // Agent can decide how to handle
      return {
        results: [],
        error: 'Web search temporarily unavailable. Please try rephrasing your question.',
      };
    }
  },
});
```

### 2. Tool Timeout

```typescript
// src/lib/utils/timeout.ts
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });

  return Promise.race([promise, timeout]);
}

// Usage in tool
execute: async ({ context }) => {
  try {
    const result = await withTimeout(
      externalAPI.call(context),
      30000, // 30 second timeout
      'External API request timed out'
    );
    
    return result;
    
  } catch (error) {
    if (error instanceof Error && error.message.includes('timed out')) {
      return {
        success: false,
        error: 'The request took too long. Please try again.',
      };
    }
    throw error;
  }
}
```

### 3. Circuit Breaker Pattern

```typescript
// src/lib/utils/circuitBreaker.ts
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private threshold = 5,
    private timeout = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }
}

// Usage
const externalAPIBreaker = new CircuitBreaker(5, 60000);

export const apiTool = createTool({
  execute: async ({ context }) => {
    try {
      return await externalAPIBreaker.execute(async () => {
        return await callExternalAPI(context);
      });
    } catch (error) {
      return {
        success: false,
        error: 'Service temporarily unavailable',
      };
    }
  },
});
```

## User-Friendly Error Messages

### Error Message Guidelines

```typescript
// src/lib/errors/messages.ts
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  TIMEOUT_ERROR: 'The request took too long. Please try again.',
  
  // Authentication errors
  AUTH_REQUIRED: 'Please log in to continue.',
  AUTH_EXPIRED: 'Your session has expired. Please log in again.',
  PERMISSION_DENIED: 'You don't have permission to perform this action.',
  
  // LLM errors
  LLM_RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
  LLM_ERROR: 'Unable to process your request right now. Please try again.',
  
  // Validation errors
  INVALID_INPUT: 'Please check your input and try again.',
  MESSAGE_TOO_LONG: 'Your message is too long. Please shorten it and try again.',
  
  // Generic
  UNKNOWN_ERROR: 'Something went wrong. Please try again.',
};

export function getUserFriendlyError(error: unknown): string {
  if (error instanceof AppError && error.code) {
    return ERROR_MESSAGES[error.code] || error.message;
  }

  if (error instanceof Error) {
    // Map common error patterns
    if (error.message.includes('network')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    if (error.message.includes('timeout')) {
      return ERROR_MESSAGES.TIMEOUT_ERROR;
    }
    if (error.message.includes('rate limit')) {
      return ERROR_MESSAGES.LLM_RATE_LIMIT;
    }
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
}
```

## Monitoring & Logging

### 1. Error Tracking

```typescript
// src/lib/monitoring.ts
export function trackError(error: Error, context?: Record<string, any>) {
  // In production, send to error tracking service
  // e.g., Sentry, LogRocket, etc.
  
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error, { extra: context });
  }

  // Always log locally
  console.error('Error tracked:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
}
```

### 2. Usage Metrics

```typescript
// Track tool failures
export const trackedTool = createTool({
  execute: async ({ context }) => {
    const startTime = Date.now();
    try {
      const result = await performAction(context);
      
      // Track success
      trackMetric('tool.success', {
        tool: 'my-tool',
        duration: Date.now() - startTime,
      });
      
      return result;
    } catch (error) {
      // Track failure
      trackMetric('tool.failure', {
        tool: 'my-tool',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'unknown',
      });
      
      throw error;
    }
  },
});
```

## Testing Error Scenarios

```typescript
// tests/errorHandling.test.ts
describe('Error Handling', () => {
  it('should handle LLM rate limit errors', async () => {
    const mockLLM = jest.fn()
      .mockRejectedValueOnce(new Error('rate limit'))
      .mockResolvedValueOnce({ text: 'Success' });

    const result = await callLLMWithRetry(mockLLM);

    expect(mockLLM).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ text: 'Success' });
  });

  it('should return user-friendly errors', async () => {
    const error = new LLMError('Internal model error');
    const message = getUserFriendlyError(error);

    expect(message).not.toContain('Internal');
    expect(message).toContain('Unable to process');
  });
});
```

## Best Practices

1. **Never expose internal errors** to users
2. **Always log errors** for debugging
3. **Implement retries** for transient failures
4. **Use circuit breakers** for unreliable services
5. **Provide actionable messages** to users
6. **Track error metrics** for monitoring
7. **Test error scenarios** thoroughly

## Next Steps

- 🏗️ [Learn about the architecture](./architecture.md)
- 🔧 [Build custom tools](./tools-system.md)
- 🚀 [Deploy your app](./deployment.md)
