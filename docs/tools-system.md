# Tools System

Learn how to create and use tools in your agentic web application.

## Overview

Tools are how your AI agent interacts with the world. The starter kit includes:

- ✅ **Frontend Tools** - Execute in the browser (UI updates, local actions)
- ✅ **Backend Tools** - Execute on the server (API calls, databases, external services)
- ✅ **State Setters** - Special tools for updating Cedar state
- ✅ **Web Search** - Built-in Exa.ai integration for web searches

## Tool Types

### 1. Frontend Tools

Execute in the browser, perfect for UI updates:

```typescript
// src/app/page.tsx
import { useRegisterFrontendTool } from 'cedar-os';

useRegisterFrontendTool({
  name: 'addNewTextLine',
  description: 'Add a new line of text to the screen',
  argsSchema: z.object({
    text: z.string().describe('The text to add'),
    style: z.enum(['normal', 'bold', 'italic']).optional(),
  }),
  execute: async (args) => {
    setTextLines(prev => [...prev, args.text]);
  },
});
```

### 2. Backend Tools

Execute on the server for external APIs:

```typescript
// src/backend/src/mastra/tools/webSearchTool.ts
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const webSearchTool = createTool({
  id: 'web-search',
  description: 'Search the web for current information',
  inputSchema: z.object({
    query: z.string().describe('The search query'),
    numResults: z.number().optional().describe('Number of results to return'),
  }),
  outputSchema: z.object({
    results: z.array(z.object({
      title: z.string(),
      url: z.string(),
      snippet: z.string(),
    })),
  }),
  execute: async ({ context }) => {
    const { query, numResults = 5 } = context;
    const results = await exaSearch(query, numResults);
    return { results };
  },
});
```

### 3. State Setters

Update Cedar state from the agent:

```typescript
// src/app/page.tsx
useRegisterState({
  key: 'mainText',
  value: mainText,
  setValue: setMainText,
  stateSetters: {
    changeText: {
      name: 'changeText',
      description: 'Change the main text',
      argsSchema: z.object({
        newText: z.string().describe('The new text'),
      }),
      execute: (currentText, setValue, args) => {
        setValue(args.newText);
      },
    },
  },
});

// Subscribe to backend
useSubscribeStateToAgentContext('mainText', 
  (mainText) => ({ mainText }),
  { showInChat: true }
);
```

## Built-in Tools

### Web Search (Exa.ai)

The starter kit includes a production-ready web search tool:

```typescript
// Usage in agent
const searchResult = await webSearchTool.execute({
  query: 'latest news about AI agents',
  numResults: 5,
});

// Returns
{
  results: [
    {
      title: "AI Agents Transform Software Development",
      url: "https://example.com/article",
      snippet: "Recent advances in AI agents...",
      publishedDate: "2025-01-15"
    },
    // ... more results
  ]
}
```

**Setup:**
1. Get an API key from [Exa.ai](https://exa.ai)
2. Add to `.env`: `EXA_API_KEY=your-key-here`
3. Tool auto-enables when key is present

## Creating Custom Tools

### Example: Weather Tool

```typescript
// src/backend/src/mastra/tools/weatherTool.ts
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get current weather for a location',
  inputSchema: z.object({
    location: z.string().describe('City name or zip code'),
    units: z.enum(['metric', 'imperial']).optional().default('metric'),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    condition: z.string(),
    humidity: z.number(),
    location: z.string(),
  }),
  execute: async ({ context }) => {
    const { location, units } = context;
    
    // Call weather API
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${location}`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      temperature: units === 'metric' ? data.current.temp_c : data.current.temp_f,
      condition: data.current.condition.text,
      humidity: data.current.humidity,
      location: data.location.name,
    };
  },
});
```

### Example: Database Query Tool

```typescript
// src/backend/src/mastra/tools/databaseTool.ts
export const queryUsersTool = createTool({
  id: 'query-users',
  description: 'Query users from the database',
  inputSchema: z.object({
    search: z.string().optional().describe('Search term for name or email'),
    limit: z.number().optional().default(10),
  }),
  outputSchema: z.object({
    users: z.array(z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    })),
  }),
  execute: async ({ context }) => {
    const { search, limit } = context;
    
    // Query Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
    
    let query = supabase
      .from('users')
      .select('id, name, email')
      .limit(limit);
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return { users: data };
  },
});
```

## Registering Tools

### 1. Add to Tool Registry

```typescript
// src/backend/src/mastra/tools/toolDefinitions.ts
export const TOOL_REGISTRY = {
  textManipulation: {
    changeTextTool,
    addNewTextLineTool,
  },
  webSearch: {
    webSearchTool,
  },
  weather: {
    weatherTool,
  },
  database: {
    queryUsersTool,
  },
};

export const ALL_TOOLS = [
  changeTextTool,
  addNewTextLineTool,
  webSearchTool,
  weatherTool,
  queryUsersTool,
];
```

### 2. Update Agent

```typescript
// src/backend/src/mastra/agents/starterAgent.ts
import { ALL_TOOLS, TOOL_REGISTRY } from '../tools/toolDefinitions';

export const starterAgent = new Agent({
  name: 'Starter Agent',
  instructions: `
    ...
    ${generateCategorizedToolDescriptions(
      TOOL_REGISTRY,
      Object.keys(TOOL_REGISTRY).reduce((acc, key) => {
        acc[key] = key;
        return acc;
      }, {})
    )}
  `,
  tools: Object.fromEntries(ALL_TOOLS.map(tool => [tool.id, tool])),
  memory,
});
```

## Tool Organization

### Categorize Tools

Organize tools by category for better agent understanding:

```typescript
export const TOOL_REGISTRY = {
  // UI Manipulation
  ui: {
    changeTextTool,
    addComponentTool,
  },
  
  // External Data
  data: {
    webSearchTool,
    weatherTool,
  },
  
  // Database Operations
  database: {
    queryUsersTool,
    createUserTool,
  },
  
  // Communication
  communication: {
    sendEmailTool,
    sendSlackTool,
  },
};
```

### Conditional Tools

Enable/disable tools based on environment:

```typescript
const availableTools = [];

// Always include basic tools
availableTools.push(...[changeTextTool, addNewTextLineTool]);

// Add search if API key present
if (process.env.EXA_API_KEY) {
  availableTools.push(webSearchTool);
}

// Add weather if configured
if (process.env.WEATHER_API_KEY) {
  availableTools.push(weatherTool);
}

// Add database tools only in production
if (process.env.NODE_ENV === 'production') {
  availableTools.push(queryUsersTool);
}

export const ALL_TOOLS = availableTools;
```

## Advanced Patterns

### Streaming Tool Results

Show progress for long-running tools:

```typescript
export const longRunningTool = createTool({
  id: 'analyze-document',
  description: 'Analyze a large document',
  inputSchema: z.object({ documentUrl: z.string() }),
  outputSchema: z.object({ analysis: z.string() }),
  execute: async ({ context, runtimeContext }) => {
    const controller = runtimeContext.get('streamController');
    
    // Stream progress updates
    streamJSONEvent(controller, 'tool-progress', {
      tool: 'analyze-document',
      status: 'downloading',
      progress: 0.1,
    });
    
    const doc = await downloadDocument(context.documentUrl);
    
    streamJSONEvent(controller, 'tool-progress', {
      tool: 'analyze-document',
      status: 'processing',
      progress: 0.5,
    });
    
    const analysis = await processDocument(doc);
    
    streamJSONEvent(controller, 'tool-progress', {
      tool: 'analyze-document',
      status: 'complete',
      progress: 1.0,
    });
    
    return { analysis };
  },
});
```

### Tool Chaining

Use tool results in other tools:

```typescript
// Agent can chain: search web -> summarize results
const searchResults = await webSearchTool.execute({ 
  query: 'AI agents 2025' 
});

const summary = await summarizeTool.execute({
  texts: searchResults.results.map(r => r.snippet),
});
```

### Error Handling in Tools

```typescript
export const apiTool = createTool({
  id: 'api-call',
  description: 'Call external API',
  inputSchema: z.object({ endpoint: z.string() }),
  outputSchema: z.object({ data: z.any() }),
  execute: async ({ context }) => {
    try {
      const response = await fetch(context.endpoint);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { data };
      
    } catch (error) {
      // Log error for debugging
      console.error('API tool error:', error);
      
      // Return user-friendly error
      if (error instanceof Error) {
        throw new Error(`Failed to call API: ${error.message}`);
      }
      throw new Error('Unknown API error');
    }
  },
});
```

### Tool Permissions

Implement authorization checks:

```typescript
export const adminTool = createTool({
  id: 'admin-action',
  description: 'Perform admin action',
  inputSchema: z.object({ action: z.string() }),
  outputSchema: z.object({ success: z.boolean() }),
  execute: async ({ context, runtimeContext }) => {
    // Get user from context
    const user = runtimeContext.get('user');
    
    // Check permissions
    if (!user?.isAdmin) {
      throw new Error('This action requires admin permissions');
    }
    
    // Perform action
    await performAdminAction(context.action);
    return { success: true };
  },
});
```

## Testing Tools

```typescript
// Example test
describe('weatherTool', () => {
  it('should return weather data', async () => {
    const result = await weatherTool.execute({
      context: { location: 'San Francisco', units: 'metric' },
    });
    
    expect(result).toHaveProperty('temperature');
    expect(result).toHaveProperty('condition');
    expect(result.location).toBe('San Francisco');
  });
  
  it('should handle invalid location', async () => {
    await expect(
      weatherTool.execute({ context: { location: 'InvalidCity123' } })
    ).rejects.toThrow();
  });
});
```

## Best Practices

### 1. Clear Descriptions
Write descriptions that help the agent understand when to use the tool:

```typescript
// ❌ Bad
description: 'Gets weather'

// ✅ Good
description: 'Get current weather conditions for any city or location. Use this when the user asks about weather, temperature, or outdoor conditions.'
```

### 2. Validate Inputs
Use Zod schemas for validation:

```typescript
inputSchema: z.object({
  email: z.string().email('Must be valid email'),
  age: z.number().min(0).max(150),
  country: z.enum(['US', 'CA', 'UK']),
})
```

### 3. Handle Errors Gracefully
```typescript
try {
  return await externalAPI.call();
} catch (error) {
  // Don't expose internal errors to agent
  throw new Error('Unable to complete action. Please try again.');
}
```

### 4. Document Output Schema
```typescript
outputSchema: z.object({
  results: z.array(z.object({
    id: z.string().describe('Unique result ID'),
    score: z.number().describe('Relevance score 0-1'),
  })),
})
```

## Next Steps

- 🏗️ [Learn about the architecture](./architecture.md)
- 💾 [Set up chat history](./chat-history.md)
- 🔐 [Add authentication](./authentication.md)
- ⚠️ [Error handling patterns](./error-handling.md)
