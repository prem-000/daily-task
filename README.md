# 📚 StudyFlow — Smart Student Planner

A Progressive Web App for students to manage homework, assignments, and daily tasks — powered by Gemini AI, Supabase, and Web Push Notifications.

![StudyFlow Banner](./docs/assets/banner.png)

## 🌟 Key Features

- 📅 **Smart Calendar** — Floating circular dates with glowing status indicators
- 💬 **AI Chat Input** — Gradient bubbles with voice input and live transcription
- 🔔 **Web Push Notifications** — Morning digest + repeating reminders
- 🔐 **Google Auth** — One-click sign-in via Supabase
- 📱 **PWA** — Installable with Aurora Glass UI design system
- 🎨 **Modern UI** — Vibrant gradients, glassmorphism, and smooth animations

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/studyflow.git
cd studyflow

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your keys

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 📖 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[Frontend Guide](./docs/FRONTEND.md)** — Next.js app structure, Aurora Glass UI components, Settings page
- **[Backend Guide](./docs/BACKEND.md)** — API routes, Supabase integration, and database
- **[PWA Guide](./docs/PWA.md)** — Service workers, manifest, install prompts, and offline support
- **[UI/UX Guide](./docs/UI.md)** — Aurora Glass design system, gradients, and animations
- **[Branding Guide](./docs/BRANDING.md)** — Logo design, app icons, favicon, and visual identity
- **[AI Integration](./docs/AI.md)** — Gemini 2.5 Flash setup and task parsing
- **[Notifications](./docs/NOTIFICATIONS.md)** — Web Push setup and implementation
- **[Deployment](./docs/DEPLOYMENT.md)** — Production deployment guide
- **[Contributing](./docs/CONTRIBUTING.md)** — How to contribute to the project

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database & Auth | Supabase (PostgreSQL) |
| Authentication | Google OAuth via Supabase |
| AI / NLP | Google Gemini 2.5 Flash |
| Notifications | Web Push API + Service Worker |
| Styling | Tailwind CSS |
| PWA | next-pwa + manifest.json |
| Push Library | web-push (VAPID) |

## 🎨 Design System

StudyFlow uses the **Aurora Glass UI** design system:

- 🌈 **Vibrant Gradients** — Deep navy base with neon purple/blue accents
- 🔮 **Glassmorphism** — Translucent cards with backdrop blur
- 💫 **Micro-Interactions** — Smooth animations and hover effects
- 📱 **Mobile-First** — Optimized for 390×844 (iPhone 14/15)
- ✨ **Premium Feel** — Inspired by Arc Search, Instagram, and modern AI apps

See the complete design system in [UI Guide](./docs/UI.md).

## 🔑 Environment Setup

Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini AI (2.5 Flash)
GEMINI_API_KEY=your-gemini-api-key

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_MAILTO=mailto:you@example.com
```

See [Backend Guide](./docs/BACKEND.md) for detailed setup instructions.

## 🛠️ Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📱 Install as PWA

- **Android/Chrome**: Menu → "Add to Home Screen"
- **iOS/Safari**: Share → "Add to Home Screen"
- **Desktop**: Click install icon in address bar

See [PWA Guide](./docs/PWA.md) for more details.

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](./docs/CONTRIBUTING.md) to get started.

## 📄 License

MIT License — free to use and modify.

## 🙋 Support

If you run into issues, check our [Troubleshooting Guide](./docs/TROUBLESHOOTING.md) or open an issue.

---

Built with ❤️ for students who want to stay on top of their studies.
