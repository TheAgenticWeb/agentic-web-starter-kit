# Getting Started

Get up and running with the Agentic Web Starter Kit in minutes.

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- **pnpm** (recommended) or npm
- **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)

## Installation Methods

### Method 1: Using Cedar CLI (Recommended)

The fastest way to get started:

```bash
npx cedar-os-cli plant-seed
```

Select this template when prompted. This will set up the entire project structure and dependencies automatically.

### Method 2: Manual Setup

1. **Clone the repository:**

```bash
git clone <repository-url>
cd agentic-web-starter-kit
```

2. **Install dependencies:**

```bash
pnpm install
cd src/backend
pnpm install
cd ../..
```

3. **Set up environment variables:**

Create a `.env` file in the root directory:

```env
# Required
OPENAI_API_KEY=your-openai-api-key-here

# Optional - Exa AI for web search
EXA_API_KEY=your-exa-api-key-here

# Optional - Auth0 for AI Agents (when you're ready)
AUTH0_DOMAIN=your-auth0-domain
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
AUTH0_AUDIENCE=your-auth0-api-audience

# Optional - Supabase (for production chat history)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. **Start the development servers:**

```bash
pnpm dev
```

This runs both:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4111

## Verify Installation

1. Open http://localhost:3000 in your browser
2. You should see the Cedar chat interface
3. Try chatting: "Hello, can you change the text on screen?"
4. The agent should respond and modify the UI

## Next Steps

- 📖 [Learn about the architecture](./architecture.md)
- 🔧 [Add your first custom tool](./tools-system.md)
- 💾 [Set up chat history](./chat-history.md)
- 🔐 [Configure authentication](./authentication.md)

## Troubleshooting

### Port Already in Use

If port 3000 or 4111 is already in use:

```bash
# Change Next.js port
PORT=3001 pnpm dev:next

# Change Mastra port (edit src/backend/mastra.config.ts)
```

### Dependencies Not Installing

```bash
# Clear caches and reinstall
rm -rf node_modules pnpm-lock.yaml
rm -rf src/backend/node_modules src/backend/pnpm-lock.yaml
pnpm install
cd src/backend && pnpm install
```

### OpenAI API Errors

- Verify your API key is correct
- Check you have credits in your OpenAI account
- Ensure the `.env` file is in the root directory

## Development Scripts

```bash
# Run both frontend and backend
pnpm dev

# Run frontend only
pnpm dev:next

# Run backend only
pnpm dev:mastra

# Build for production
pnpm build

# Format code
pnpm pretty

# Lint code
pnpm lint
```

## Project Structure

```
agentic-web-starter-kit/
├── docs/                    # Documentation
├── src/
│   ├── app/                # Next.js app router
│   ├── backend/            # Mastra backend
│   │   └── src/
│   │       ├── mastra/     # Agents, tools, workflows
│   │       └── utils/      # Helper utilities
│   ├── cedar/              # Cedar-OS components
│   ├── components/         # React components
│   ├── lib/                # Utilities and hooks
│   └── utils/              # Shared utilities
├── public/                 # Static assets
└── .env                    # Environment variables
```

## Need Help?

- 📖 Check the [documentation](./README.md)
- 💬 Visit [theagenticweb.dev](https://theagenticweb.dev)
- 🐛 [Report an issue](https://github.com/your-repo/issues)
