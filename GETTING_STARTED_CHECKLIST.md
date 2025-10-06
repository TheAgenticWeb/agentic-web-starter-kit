# 🚀 Getting Started Checklist

Follow this checklist to get your agentic web app up and running!

## ✅ Phase 1: Basic Setup (5 minutes)

- [ ] **Install dependencies**
  ```bash
  pnpm install
  cd src/backend && pnpm install && cd ../..
  ```

- [ ] **Set up environment variables**
  ```bash
  cp env.template .env
  ```

- [ ] **Add your OpenAI API key to `.env`**
  ```env
  OPENAI_API_KEY=sk-your-key-here
  ```

- [ ] **Start the development servers**
  ```bash
  pnpm dev
  ```

- [ ] **Open http://localhost:3000 and test the chat**
  - Try: "Change the text to 'Hello World'"
  - Try: "Add a new line saying 'This is awesome'"

**🎉 Congratulations! Your basic agentic web app is running!**

---

## ✅ Phase 2: Enable Web Search (Optional - 5 minutes)

- [ ] **Sign up for Exa.ai**
  - Visit: https://exa.ai
  - Get your API key

- [ ] **Add to `.env`**
  ```env
  EXA_API_KEY=your-exa-key-here
  ```

- [ ] **Restart the dev server**
  ```bash
  pnpm dev
  ```

- [ ] **Test web search**
  - Try: "Search the web for latest AI news"
  - Try: "What are the top AI developments in 2025?"

**🔍 Web search is now enabled!**

---

## ✅ Phase 3: Explore Chat History (Optional - 10 minutes)

- [ ] **Check the implementation**
  - Open `src/lib/hooks/useChatHistory.tsx`
  - Open `src/lib/storage/localStorage.ts`

- [ ] **Test in your browser**
  - Chat messages automatically save to localStorage
  - Refresh the page - messages persist!
  - Open DevTools → Application → Local Storage to see data

- [ ] **Read the migration guide**
  - See `docs/chat-history.md` for Supabase setup
  - When ready for production, follow the migration steps

**💾 Chat history is working with localStorage!**

---

## ✅ Phase 4: Add Your First Custom Tool (15 minutes)

- [ ] **Create a new tool file**
  ```bash
  touch src/backend/src/mastra/tools/myCustomTool.ts
  ```

- [ ] **Copy the weather tool example**
  - See `docs/examples/README.md` for the template
  - Or follow `docs/tools-system.md` guide

- [ ] **Add to toolDefinitions.ts**
  ```typescript
  import { myCustomTool } from './myCustomTool';
  
  export const TOOL_REGISTRY = {
    // ... existing tools
    custom: {
      myCustomTool,
    },
  };
  
  export const ALL_TOOLS = [..., myCustomTool];
  ```

- [ ] **Test your new tool**
  - Restart dev server
  - Chat with the agent to test your tool

**🔧 You've created your first custom tool!**

---

## ✅ Phase 5: Production Setup (When Ready)

### Database (Supabase)

- [ ] **Create Supabase project**
  - Visit: https://supabase.com
  - Create new project

- [ ] **Run SQL migrations**
  - Copy schema from `docs/chat-history.md`
  - Run in Supabase SQL editor

- [ ] **Add credentials to `.env`**
  ```env
  NEXT_PUBLIC_SUPABASE_URL=your-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
  ```

- [ ] **Test Supabase connection**
  - Install: `pnpm add @supabase/supabase-js`
  - App automatically uses Supabase when configured

### Authentication (Auth0 - Optional)

- [ ] **Sign up for Auth0**
  - Visit: https://auth0.com/signup?onboard_app=genai

- [ ] **Follow setup guide**
  - See `docs/authentication.md`
  - Configure Auth0 application
  - Add credentials to `.env`

- [ ] **Install Auth0 SDK**
  ```bash
  pnpm add @auth0/nextjs-auth0
  ```

- [ ] **Uncomment integration code**
  - See `src/lib/auth/README.md`

### Deployment

- [ ] **Choose your platform**
  - Vercel (recommended)
  - Netlify
  - Self-hosted

- [ ] **Follow deployment guide**
  - See `docs/deployment.md`
  - Set environment variables in platform
  - Deploy!

**🚀 Your app is production-ready!**

---

## 📖 Next Steps

### Learn the Architecture
- [ ] Read `docs/architecture.md` to understand the system
- [ ] Explore the `src/backend/src/mastra/` folder
- [ ] Study the existing tools and workflows

### Build Your App
- [ ] Define your use case
- [ ] Design your custom tools
- [ ] Customize the agent instructions
- [ ] Build your UI

### Ship It
- [ ] Add error tracking (Sentry)
- [ ] Set up monitoring
- [ ] Deploy to production
- [ ] Share with users!

---

## 🆘 Need Help?

- **Documentation**: Check the `/docs` folder
- **Examples**: See `/docs/examples/README.md`
- **Community**: Visit [theagenticweb.dev](https://theagenticweb.dev)

---

## 🎯 Recommended Path

**For Learning:**
1. ✅ Basic Setup
2. ✅ Enable Web Search
3. ✅ Create Custom Tool
4. Read all documentation

**For Production:**
1. ✅ Basic Setup
2. ✅ Create Your Tools
3. ✅ Set Up Supabase
4. ✅ Add Auth0
5. ✅ Deploy

**For Quick Prototype:**
1. ✅ Basic Setup
2. ✅ Enable Web Search
3. Start building!

---

**Happy building! 🚀**
