# Auth0 for AI Agents - Setup Guide

This directory contains Auth0 integration files for securing your agentic web application.

## Quick Start

Auth0 is **optional** in this starter kit. To enable it:

### 1. Install Dependencies

```bash
pnpm add @auth0/nextjs-auth0
```

### 2. Sign Up for Auth0

1. Visit [Auth0 for AI Agents](https://auth0.com/signup?onboard_app=genai)
2. Create a new tenant
3. Create a Single Page Application

### 3. Configure Environment Variables

Add to your `.env` file:

```env
AUTH0_SECRET=use-openssl-rand-hex-32-to-generate
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-app.us.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://your-api-audience
```

Generate the secret:
```bash
openssl rand -hex 32
```

### 4. Uncomment Integration Files

The starter kit includes Auth0 integration files that are commented out by default. To enable:

1. Uncomment code in `src/app/api/auth/[auth0]/route.ts`
2. Uncomment `UserProvider` in `src/app/layout.tsx`
3. Use `src/components/AuthButton.tsx` in your UI

## Documentation

See [/docs/authentication.md](../../../docs/authentication.md) for complete integration guide.

## Features

- ✅ User authentication with Universal Login
- ✅ Protected API routes
- ✅ Token Vault for third-party APIs
- ✅ Asynchronous authorization (CIBA)
- ✅ Fine-grained authorization (Auth0 FGA)
