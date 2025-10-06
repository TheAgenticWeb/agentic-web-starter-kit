# Changelog

All notable changes to the Agentic Web Starter Kit.

## [0.1.1] - 2025-10-06

### ✨ Added
- **Thread Persistence** - Thread states now persist to localStorage across page refreshes
- **ErrorBoundary Integration** - Production-ready error handling wrapped around entire app
- **Thread-Scoped UI State** - Agent UI state is now isolated per conversation thread
- **Conversation Sidebar** - Visual list of all threads with create/switch/delete functionality

### 🐛 Fixed
- Fixed infinite render loop in thread state management
- Proper thread isolation using Cedar's native `useThreadController`

## [0.1.0] - 2025-10-06

### 🎉 Initial Release - Production-Ready Starter Kit

Transformed from a basic Cedar-OS + Mastra template into a comprehensive starter kit for building agentic web applications.

### ✨ New Features

#### Chat History System
- **localStorage adapter** - Works out of the box with zero configuration
- **Supabase adapter** - Production-ready database storage with easy migration
- **useChatHistory hook** - React hook for managing conversations
- **Multi-conversation support** - Create, switch, and manage multiple chat threads
- **Message metadata** - Track tokens, tool calls, errors, and more

#### Web Search Tool (Exa.ai)
- **Production-ready web search** - Real-time web search for agents
- **Smart search** - Neural and keyword search with autoprompt optimization
- **Graceful fallback** - Returns empty results instead of breaking if API key missing
- **Configurable results** - Control number of results, snippets, etc.

#### Authentication (Auth0 for AI Agents)
- **Auth0 integration ready** - Setup guides and helper files included
- **Optional by default** - Enable when needed, works without it
- **Token Vault support** - Securely store third-party API tokens
- **CIBA flow** - Asynchronous authorization for human-in-the-loop
- **Auth0 FGA** - Fine-grained authorization for RAG applications

#### Error Handling
- **ErrorBoundary component** - Catches React errors with user-friendly UI
- **Custom error classes** - AppError, LLMError, ValidationError, etc.
- **Retry utilities** - Exponential backoff, circuit breaker pattern
- **Timeout handling** - Prevent hanging requests
- **User-friendly messages** - Never expose technical errors to users

#### Documentation
- **Comprehensive guides** - 7 detailed documentation files in `/docs`
- **Getting Started** - Step-by-step setup guide
- **Architecture** - Deep dive into system design
- **Chat History** - localStorage to Supabase migration
- **Tools System** - Creating custom agent tools
- **Authentication** - Auth0 integration guide
- **Error Handling** - Production-ready patterns
- **Deployment** - Deploy to Vercel, Netlify, or self-host

### 🔧 Improvements

#### Project Structure
- Reorganized as `agentic-web-starter-kit` (from `cedar-mastra-starter`)
- Added `/docs` folder with complete documentation
- Added `env.template` for easy environment setup
- Created modular `/src/lib` structure for utilities

#### Developer Experience
- Better README with quick start and feature overview
- Environment variable template with all options
- Clear separation of required vs optional features
- Example code and patterns throughout

#### Code Quality
- TypeScript interfaces for all storage adapters
- Zod schemas for validation
- Error handling throughout
- Retry logic for transient failures
- Circuit breaker for external services

### 📁 New Files

```
agentic-web-starter-kit/
├── docs/
│   ├── README.md              # Documentation index
│   ├── getting-started.md     # Setup guide
│   ├── architecture.md        # System design
│   ├── chat-history.md        # Chat persistence
│   ├── tools-system.md        # Custom tools guide
│   ├── authentication.md      # Auth0 setup
│   ├── error-handling.md      # Error patterns
│   └── deployment.md          # Deploy guide
├── src/
│   ├── components/
│   │   ├── ErrorBoundary.tsx  # Error UI
│   │   └── AuthButton.tsx     # Auth component
│   ├── lib/
│   │   ├── storage/
│   │   │   ├── interface.ts   # Storage interface
│   │   │   ├── localStorage.ts # Local storage
│   │   │   ├── supabase.ts    # Supabase storage
│   │   │   └── index.ts       # Factory
│   │   ├── hooks/
│   │   │   └── useChatHistory.tsx # Chat hook
│   │   ├── errors/
│   │   │   └── index.ts       # Error utilities
│   │   ├── utils/
│   │   │   └── retry.ts       # Retry logic
│   │   └── auth/
│   │       └── README.md      # Auth setup
│   └── backend/src/mastra/tools/
│       └── webSearchTool.ts   # Exa search
├── env.template               # Environment template
└── CHANGELOG.md              # This file
```

### 🎯 Design Philosophy

This release focuses on providing:

1. **Production-ready patterns** - Not just examples, but battle-tested code
2. **Easy to extend** - Clear abstractions and interfaces
3. **Optional complexity** - Start simple, add features as needed
4. **Comprehensive docs** - Learn by doing with great guides
5. **Foundation for Pro Kits** - Horizontal base for vertical solutions

### 🚀 What's Next

Future releases will include:

- Pro Kits for specific industries (fintech, e-commerce, support, etc.)
- More built-in tools (calendar, email, databases)
- Advanced agent patterns (multi-agent, handoffs)
- Real-time collaboration features
- Enhanced monitoring and observability

### 📝 Notes

- All new features are **optional** - the basic starter still works with just `OPENAI_API_KEY`
- Auth0 integration is ready but commented out by default
- Supabase is optional - localStorage works great for development
- Exa.ai web search gracefully degrades if API key is missing

---

**For developers at [theagenticweb.dev](https://theagenticweb.dev)**
