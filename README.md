# Agentic Web Starter Kit

A production-ready starter kit for building AI agent applications with modern web technologies. Built with [Cedar-OS](https://cedar.ai) for beautiful chat UI and [Mastra](https://mastra.ai) for powerful agent orchestration.

**Perfect for developers at [theagenticweb.dev](https://theagenticweb.dev) who want to build agentic web apps fast.**

## ✨ Features

### Core Features
- **🤖 AI Chat Integration** - Built-in chat workflows powered by OpenAI through Mastra agents
- **⚡ Real-time Streaming** - Server-sent events (SSE) for streaming AI responses with progress updates
- **🎨 Beautiful UI** - Cedar-OS components with 3D effects and modern design
- **🔧 Type-safe Workflows** - Mastra-based backend with full TypeScript support
- **💬 Multi-Thread Conversations** - Cedar-native thread management with persistence across page refreshes
- **🎯 Thread-Scoped State** - UI state isolated per conversation thread
- **🔍 Web Search** - Built-in Exa.ai integration for real-time web search
- **🔐 Auth Ready** - Auth0 for AI Agents integration (optional)
- **⚠️ Error Handling** - Production-ready error boundaries and retry logic
- **📚 Comprehensive Docs** - Complete documentation in `/docs` folder

## Quick Start

The fastest way to get started:

```bash
npx cedar-os-cli plant-seed
```

Then select this template when prompted. This will set up the entire project structure and dependencies automatically.

This template contains the Cedar chat connected to a mastra backend to demonstrate what endpoints need to be implemented.

For more details, see the [Cedar Getting Started Guide](https://docs.cedarcopilot.com/getting-started/getting-started).

## Manual Setup

### Prerequisites

- **Node.js** 18+ (20+ recommended)
- **OpenAI API key** - [Get one here](https://platform.openai.com/api-keys)
- **pnpm** (recommended) or npm

### Installation

1. **Clone and install dependencies:**

```bash
git clone <repository-url>
cd agentic-web-starter-kit
pnpm install
cd src/backend && pnpm install && cd ../..
```

2. **Set up environment variables:**

Copy the template and add your API keys:

```bash
cp env.template .env
```

**Minimum required** (to get started):
```env
OPENAI_API_KEY=your-openai-api-key-here
```

**Optional features** (add when needed):
```env
# Web search capability
EXA_API_KEY=your-exa-api-key

# Production chat history
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Authentication (see docs/authentication.md)
AUTH0_SECRET=generate-with-openssl
AUTH0_DOMAIN=your-domain.auth0.com
# ... more Auth0 vars
```

3. **Start the development servers:**

```bash
pnpm dev
```

This runs both:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4111

4. **Try it out!**

Open http://localhost:3000 and start chatting with your AI agent. Try:
- "Change the main text to 'Hello World'"
- "Add a new line saying 'This is awesome'"
- "Search the web for latest AI news" (if EXA_API_KEY is set)

## Project Architecture

### Frontend (Next.js + Cedar-OS)

- **Simple Chat UI**: See Cedar OS components in action in a pre-configured chat interface
- **Cedar-OS Components**: Cedar-OS Components installed in shadcn style for local changes
- **Tailwind CSS, Typescript, NextJS**: Patterns you're used to in any NextJS project

### Backend (Mastra)

- **Chat Workflow**: Example of a Mastra workflow – a chained sequence of tasks including LLM calls
- **Streaming Utils**: Examples of streaming text, status updates, and objects like tool calls
- **API Routes**: Examples of registering endpoint handlers for interacting with the backend

## API Endpoints (Mastra backend)

### Non-streaming Chat

```bash
POST /chat/execute-function
Content-Type: application/json

{
  "prompt": "Hello, how can you help me?",
  "temperature": 0.7,
  "maxTokens": 1000,
  "systemPrompt": "You are a helpful assistant."
}
```

### Streaming Chat

```bash
POST /chat/execute-function/stream
Content-Type: application/json

{
  "prompt": "Tell me a story",
  "temperature": 0.7
}
```

Returns Server-Sent Events with:

- **JSON Objects**: `{ type: 'stage_update', status: 'update_begin', message: 'Generating response...'}`
- **Text Chunks**: Streamed AI response text
- **Completion**: `event: done` signal

## Development

### Running the Project

```bash
# Start both frontend and backend
npm run dev

# Run frontend only
npm run dev:next

# Run backend only
npm run dev:mastra
```

## 📖 Documentation

Comprehensive guides in the `/docs` folder:

- **[Getting Started](./docs/getting-started.md)** - Detailed setup and installation
- **[Architecture Overview](./docs/architecture.md)** - Understanding the system design
- **[Chat History](./docs/chat-history.md)** - Persist conversations with localStorage/Supabase
- **[Tools System](./docs/tools-system.md)** - Create custom tools for your agents
- **[Authentication](./docs/authentication.md)** - Secure your app with Auth0 for AI Agents
- **[Error Handling](./docs/error-handling.md)** - Production-ready error patterns
- **[Deployment](./docs/deployment.md)** - Deploy to Vercel, Netlify, or self-host

## 🎯 What's Included

```
agentic-web-starter-kit/
├── docs/                        # 📚 Complete documentation
├── src/
│   ├── app/                    # Next.js app (frontend)
│   ├── backend/                # Mastra backend
│   │   └── src/mastra/
│   │       ├── agents/         # AI agents
│   │       ├── tools/          # Agent tools (web search, etc.)
│   │       └── workflows/      # Multi-step orchestration
│   ├── components/             # React components
│   │   ├── ErrorBoundary.tsx  # Error handling
│   │   └── AuthButton.tsx     # Auth0 integration (optional)
│   ├── lib/
│   │   ├── storage/           # Chat history adapters
│   │   ├── hooks/             # React hooks (useChatHistory)
│   │   ├── errors/            # Error utilities
│   │   └── utils/             # Retry, timeout, etc.
│   └── cedar/                  # Cedar-OS components
└── env.template                # Environment variables template
```

## 🚀 Next Steps

1. **Explore the examples** - Try the demo tools and modify them
2. **Add your first custom tool** - See [docs/tools-system.md](./docs/tools-system.md)
3. **Enable web search** - Add EXA_API_KEY to search the web
4. **Set up chat history** - Migrate to Supabase for production: [docs/chat-history.md](./docs/chat-history.md)
5. **Add authentication** - Secure your app: [docs/authentication.md](./docs/authentication.md)
6. **Deploy** - Ship to production: [docs/deployment.md](./docs/deployment.md)

## 🔧 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **UI Components**: Cedar-OS, Radix UI, Lucide Icons
- **Backend**: Mastra, OpenAI SDK
- **Tools**: Exa.ai (web search)
- **Auth**: Auth0 for AI Agents (optional)
- **Storage**: localStorage (dev), Supabase (production)

## 💡 Pro Kits (Coming Soon)

Looking for industry-specific features? Pro kits will include:

- **💰 Financial Technology** - Payments, transactions, compliance
- **🛍️ E-commerce** - Product catalogs, cart management, orders
- **📞 Customer Support** - Ticketing, knowledge bases, escalation
- **📊 Marketing** - Campaigns, analytics, content generation
- **👁️ Vision Apps** - Image processing, OCR, visual analysis

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Resources

- [Cedar-OS Documentation](https://docs.cedarcopilot.com/)
- [Mastra Documentation](https://mastra.ai/docs)
- [Auth0 for AI Agents](https://auth0.com/ai/docs/intro/overview)
- [The Agentic Web](https://theagenticweb.dev)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Built for developers who want to ship agentic web apps fast.** 🚀
