# 🚀 Getting Started Checklist

Follow this checklist to get your AI-powered task manager running!

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

- [ ] **Open http://localhost:3000 and test the task manager**
  - Try: "Create a task to review the project proposal"
  - Try: "Add 3 tasks for launching the website"
  - Try: "Move all high priority tasks to In Progress"

**🎉 Congratulations! Your AI-powered task manager is running!**

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

- [ ] **Test web search with tasks**
  - Try: "Create a task to research the latest AI trends"
  - Try: "Search for project management best practices and create tasks based on what you find"

**🔍 Web search is now enabled!**

---

## ✅ Phase 3: Explore Multi-Thread Boards (5 minutes)

- [ ] **Create multiple boards**
  - Click "New Chat" in the sidebar
  - Create different boards for different projects

- [ ] **Test thread isolation**
  - Add tasks to Board 1
  - Switch to Board 2 (empty)
  - Switch back to Board 1 (tasks preserved!)

- [ ] **Test persistence**
  - Add tasks
  - Refresh the page
  - Tasks are still there!

**🔄 Thread-scoped task boards are working!**

---

## ✅ Phase 4: Customize Your Task Manager (15 minutes)

- [ ] **Read the demo documentation**
  - Open `TASK_MANAGER_DEMO.md` for quick reference
  - Check `docs/task-manager.md` for detailed guide

- [ ] **Experiment with the UI**
  - Try different task prompts
  - Use priorities and tags
  - Organize a real project

- [ ] **Customize the columns**
  - Edit `src/types/task.ts`
  - Update `COLUMN_CONFIG` with your workflow
  - Adjust colors and names

- [ ] **Add your own features**
  - See "Extending This Demo" in `docs/task-manager.md`
  - Quick wins: due dates, assignees, comments
  - Medium: drag & drop, search, filters
  - Advanced: real-time collab, integrations

**🎨 You've customized your task manager!**

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

### Learn the Task Manager
- [ ] Read `TASK_MANAGER_DEMO.md` for quick overview
- [ ] Study `docs/task-manager.md` for deep dive
- [ ] Understand the agent's task breakdown logic
- [ ] Review the thread-scoped state pattern

### Build Your Own App
- [ ] Keep the task manager or build something new
- [ ] Design your custom tools (see `docs/tools-system.md`)
- [ ] Customize the agent instructions
- [ ] Create your own beautiful UI

### Ship It
- [ ] Add error tracking (Sentry)
- [ ] Set up monitoring
- [ ] Deploy to production
- [ ] Share with the community!

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
