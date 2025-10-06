# Deployment Guide

Deploy your agentic web application to production.

## Overview

This guide covers deploying to popular platforms:
- ✅ **Vercel** (Recommended for Next.js)
- ✅ **Netlify**
- ✅ **Cloudflare Pages**
- ✅ **Self-hosted** (Docker, VPS)

## Pre-Deployment Checklist

### 1. Environment Variables

Ensure all required variables are set:

```env
# Required
OPENAI_API_KEY=sk-...

# Optional - Features
EXA_API_KEY=...
AUTH0_SECRET=...
AUTH0_DOMAIN=...
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Production
NODE_ENV=production
```

### 2. Build Test

```bash
pnpm build
```

Ensure build completes without errors.

### 3. Security Review

- [ ] All secrets in environment variables
- [ ] No hardcoded API keys
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] Input validation on all endpoints

## Vercel Deployment (Recommended)

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=your-repo-url)

### Manual Deployment

1. **Install Vercel CLI:**

```bash
pnpm add -g vercel
```

2. **Login:**

```bash
vercel login
```

3. **Deploy:**

```bash
vercel
```

4. **Add Environment Variables:**

Go to Project Settings → Environment Variables and add all variables from `.env`.

5. **Deploy to Production:**

```bash
vercel --prod
```

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["sfo1"],
  "env": {
    "OPENAI_API_KEY": "@openai-api-key"
  }
}
```

## Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Run Migrations

```sql
-- See docs/chat-history.md for complete schema
```

### 3. Update Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Monitoring

### Error Tracking (Sentry)

```bash
pnpm add @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### Analytics

```typescript
// src/lib/analytics.ts
export function trackEvent(event: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    // Add your analytics provider
    // posthog.capture(event, properties);
  }
}
```

## Performance Optimization

### 1. Edge Functions

Deploy API routes to edge for lower latency:

```typescript
// src/app/api/chat/route.ts
export const runtime = 'edge';
```

### 2. Caching

```typescript
// Cache tool results
const cache = new Map();

export const cachedTool = createTool({
  execute: async ({ context }) => {
    const cacheKey = JSON.stringify(context);
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }
    
    const result = await expensiveOperation(context);
    cache.set(cacheKey, result);
    
    return result;
  },
});
```

### 3. Rate Limiting

```typescript
// src/middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function middleware(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }
}
```

## Security Hardening

### 1. CSP Headers

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};
```

### 2. Environment Validation

```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export const env = envSchema.parse(process.env);
```

## Next Steps

- 📖 [Read the architecture docs](./architecture.md)
- 🔐 [Set up authentication](./authentication.md)
- ⚠️ [Configure error handling](./error-handling.md)
