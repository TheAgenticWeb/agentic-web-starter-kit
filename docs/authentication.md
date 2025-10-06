# Authentication with Auth0 for AI Agents

Secure your agentic web application with Auth0 for AI Agents.

## Overview

Auth0 for AI Agents provides specialized authentication and authorization features for AI applications:

- ✅ **User Authentication** - Secure login with Universal Login
- ✅ **API Access** - Call your APIs on behalf of users
- ✅ **Token Vault** - Securely store and use third-party API tokens
- ✅ **Asynchronous Authorization** - Human-in-the-loop approvals (CIBA)
- ✅ **Fine-Grained Authorization** - Auth0 FGA for RAG security

## Quick Start

### 1. Sign Up for Auth0

1. Visit [Auth0 for AI Agents](https://auth0.com/signup?onboard_app=genai)
2. Create a new tenant for your application
3. Note your domain (e.g., `your-app.us.auth0.com`)

### 2. Configure Application

In your Auth0 dashboard:

1. Create a new **Single Page Application**
2. Note the **Client ID**
3. Add allowed callback URLs:
   - `http://localhost:3000/api/auth/callback`
   - `https://your-domain.com/api/auth/callback`
4. Add allowed logout URLs:
   - `http://localhost:3000`
   - `https://your-domain.com`

### 3. Set Environment Variables

```env
# Auth0 Configuration
AUTH0_SECRET=use-openssl-rand-hex-32-to-generate
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-app.us.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://your-api-audience

# Optional: Token Vault
AUTH0_TOKEN_VAULT_URL=your-token-vault-url
```

Generate the secret:
```bash
openssl rand -hex 32
```

### 4. Install Dependencies

```bash
pnpm add @auth0/nextjs-auth0 @auth0/auth0-ai
```

## Implementation

### Frontend Authentication

#### 1. Set Up Auth0 Provider

```typescript
// src/app/layout.tsx
import { UserProvider } from '@auth0/nextjs-auth0/client';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
```

#### 2. Create Auth API Routes

```typescript
// src/app/api/auth/[auth0]/route.ts
import { handleAuth } from '@auth0/nextjs-auth0';

export const GET = handleAuth();
```

#### 3. Add Login/Logout UI

```typescript
// src/components/AuthButton.tsx
'use client';

import { useUser } from '@auth0/nextjs-auth0/client';

export function AuthButton() {
  const { user, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span>Welcome, {user.name}</span>
        <a href="/api/auth/logout" className="btn-secondary">
          Logout
        </a>
      </div>
    );
  }

  return (
    <a href="/api/auth/login" className="btn-primary">
      Login
    </a>
  );
}
```

#### 4. Protect Pages

```typescript
// src/app/dashboard/page.tsx
import { withPageAuthRequired } from '@auth0/nextjs-auth0';

export default withPageAuthRequired(function Dashboard() {
  return <div>Protected Dashboard</div>;
});

// Or client-side
'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';

export default function ProtectedPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  if (isLoading) return <div>Loading...</div>;
  
  if (!user) {
    router.push('/api/auth/login');
    return null;
  }

  return <div>Protected Content</div>;
}
```

### Backend Authentication

#### 1. Protect API Routes

```typescript
// src/app/api/chat/route.ts
import { getSession } from '@auth0/nextjs-auth0';

export async function POST(request: Request) {
  const session = await getSession();
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const user = session.user;
  
  // Process chat with user context
  const result = await chatWorkflow.execute({
    prompt: await request.json(),
    userId: user.sub,
  });

  return Response.json(result);
}
```

#### 2. Pass User Context to Agent

```typescript
// src/backend/src/mastra/workflows/chatWorkflow.ts
const callAgent = createStep({
  id: 'callAgent',
  execute: async ({ inputData }) => {
    const { prompt, userId, userName } = inputData;
    
    const runtimeContext = new RuntimeContext();
    runtimeContext.set('user', { id: userId, name: userName });
    
    const result = await starterAgent.streamVNext(prompt, {
      runtimeContext,
      memory: {
        thread: userId, // Per-user conversation threads
        resource: 'chat',
      },
    });
    
    return result;
  },
});
```

#### 3. User-Specific Tools

```typescript
// src/backend/src/mastra/tools/userDataTool.ts
export const getUserDataTool = createTool({
  id: 'get-user-data',
  description: 'Get data specific to the current user',
  inputSchema: z.object({}),
  outputSchema: z.object({
    preferences: z.any(),
    history: z.array(z.any()),
  }),
  execute: async ({ runtimeContext }) => {
    const user = runtimeContext.get('user');
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Fetch user-specific data
    const userData = await fetchUserData(user.id);
    
    return userData;
  },
});
```

## Advanced Features

### Token Vault

Securely store and use third-party API tokens (Gmail, Google Calendar, etc.)

#### 1. Configure Token Vault

```typescript
// src/lib/auth0/tokenVault.ts
import { TokenVault } from '@auth0/auth0-ai';

export const tokenVault = new TokenVault({
  domain: process.env.AUTH0_DOMAIN!,
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  tokenVaultUrl: process.env.AUTH0_TOKEN_VAULT_URL!,
});
```

#### 2. Store Tokens

```typescript
// After user connects their Google account
await tokenVault.storeToken({
  userId: user.sub,
  provider: 'google',
  accessToken: googleAccessToken,
  refreshToken: googleRefreshToken,
  expiresAt: expiresAt,
});
```

#### 3. Use Tokens in Tools

```typescript
// src/backend/src/mastra/tools/gmailTool.ts
export const sendEmailTool = createTool({
  id: 'send-email',
  description: 'Send an email via Gmail',
  inputSchema: z.object({
    to: z.string().email(),
    subject: z.string(),
    body: z.string(),
  }),
  execute: async ({ context, runtimeContext }) => {
    const user = runtimeContext.get('user');
    
    // Get user's Gmail token from Token Vault
    const token = await tokenVault.getToken({
      userId: user.id,
      provider: 'google',
    });
    
    // Use token to send email
    const result = await sendGmailEmail({
      accessToken: token.accessToken,
      to: context.to,
      subject: context.subject,
      body: context.body,
    });
    
    return { success: true, messageId: result.id };
  },
});
```

### Asynchronous Authorization (CIBA)

Require human approval for sensitive actions:

```typescript
// src/backend/src/mastra/tools/sensitiveActionTool.ts
import { requestApproval } from '@auth0/auth0-ai';

export const deleteDataTool = createTool({
  id: 'delete-user-data',
  description: 'Delete user data (requires approval)',
  inputSchema: z.object({ dataId: z.string() }),
  execute: async ({ context, runtimeContext }) => {
    const user = runtimeContext.get('user');
    
    // Request approval via CIBA
    const approval = await requestApproval({
      userId: user.id,
      action: 'delete-data',
      message: `Approve deletion of data: ${context.dataId}?`,
      timeout: 120, // 2 minutes to approve
    });
    
    if (!approval.approved) {
      throw new Error('Action not approved by user');
    }
    
    // Proceed with deletion
    await deleteData(context.dataId);
    
    return { success: true };
  },
});
```

### Fine-Grained Authorization (Auth0 FGA)

Secure RAG applications with relationship-based access control:

```typescript
// src/lib/auth0/fga.ts
import { Auth0FGA } from '@auth0/auth0-ai';

export const fga = new Auth0FGA({
  storeId: process.env.AUTH0_FGA_STORE_ID!,
  clientId: process.env.AUTH0_FGA_CLIENT_ID!,
  clientSecret: process.env.AUTH0_FGA_CLIENT_SECRET!,
});

// Define authorization model
await fga.writeAuthorizationModel({
  schema_version: '1.1',
  type_definitions: [
    {
      type: 'document',
      relations: {
        owner: { this: {} },
        viewer: { this: {} },
        editor: { this: {} },
      },
    },
  ],
});
```

```typescript
// src/backend/src/mastra/tools/ragTool.ts
export const queryDocumentsTool = createTool({
  id: 'query-documents',
  description: 'Search documents user has access to',
  inputSchema: z.object({ query: z.string() }),
  execute: async ({ context, runtimeContext }) => {
    const user = runtimeContext.get('user');
    
    // Get all documents from vector DB
    const allDocs = await vectorSearch(context.query);
    
    // Filter by user permissions
    const authorizedDocs = [];
    for (const doc of allDocs) {
      const canRead = await fga.check({
        user: user.id,
        relation: 'viewer',
        object: `document:${doc.id}`,
      });
      
      if (canRead.allowed) {
        authorizedDocs.push(doc);
      }
    }
    
    return { documents: authorizedDocs };
  },
});
```

## Integration with Chat History

Store chat history per user:

```typescript
// src/lib/storage/supabase.ts
export class SupabaseChatAdapter implements ChatStorageAdapter {
  async saveMessage(conversationId: string, message: Message, userId: string) {
    const { error } = await this.supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        user_id: userId, // Ensure user owns this conversation
        role: message.role,
        content: message.content,
        created_at: message.timestamp,
      });
    
    if (error) throw error;
  }
  
  async getMessages(conversationId: string, userId: string) {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId) // Only user's messages
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data.map(this.mapToMessage);
  }
}
```

## Security Best Practices

### 1. Never Expose Secrets

```typescript
// ❌ Bad - exposing secret
const apiKey = process.env.SECRET_KEY; // Sent to frontend

// ✅ Good - keep on server
// src/app/api/secure-action/route.ts
export async function POST() {
  const apiKey = process.env.SECRET_KEY; // Server-side only
  // ...
}
```

### 2. Validate All Inputs

```typescript
const schema = z.object({
  userId: z.string().uuid(),
  action: z.enum(['read', 'write', 'delete']),
});

const validated = schema.parse(input);
```

### 3. Implement Rate Limiting

```typescript
// src/middleware.ts
import { rateLimit } from '@/lib/rateLimit';

export async function middleware(request: Request) {
  const user = await getSession();
  
  const allowed = await rateLimit(user?.sub || request.ip, {
    max: 100,
    window: '1m',
  });
  
  if (!allowed) {
    return new Response('Too many requests', { status: 429 });
  }
}
```

### 4. Audit Sensitive Actions

```typescript
await auditLog({
  userId: user.id,
  action: 'delete-data',
  resource: dataId,
  timestamp: new Date(),
  approved: approval.approved,
});
```

## Testing

```typescript
// Mock authentication in tests
jest.mock('@auth0/nextjs-auth0', () => ({
  getSession: jest.fn(() => ({
    user: {
      sub: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
    },
  })),
}));

describe('Authenticated API', () => {
  it('should require authentication', async () => {
    getSession.mockResolvedValue(null);
    
    const response = await POST(request);
    expect(response.status).toBe(401);
  });
  
  it('should process request for authenticated user', async () => {
    getSession.mockResolvedValue({
      user: { sub: 'user-123' },
    });
    
    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
```

## Resources

- [Auth0 for AI Agents Documentation](https://auth0.com/ai/docs/intro/overview)
- [Next.js Auth0 SDK](https://auth0.com/docs/quickstart/webapp/nextjs)
- [Token Vault Guide](https://auth0.com/ai/docs/intro/token-vault)
- [CIBA Flow](https://auth0.com/docs/get-started/authentication-and-authorization-flow/client-initiated-backchannel-authentication-flow)
- [Auth0 FGA](https://auth0.com/fine-grained-authorization)

## Next Steps

- 💾 [Set up chat history](./chat-history.md)
- ⚠️ [Error handling patterns](./error-handling.md)
- 🚀 [Deploy your app](./deployment.md)
