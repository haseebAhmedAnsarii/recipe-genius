# 🍳 RecipeGenius – Smart Recipe Generator & Meal Planner

A full-stack AI-powered recipe generation and meal planning application built with Next.js 14 (App Router), Tailwind CSS, and Firebase. RecipeGenius uses a multi-model AI fallback chain to ensure reliable recipe generation across four different AI providers.

## ✨ Features

- **🥘 Ingredient-Based Recipe Generation** – Add ingredients you have on hand and get AI-generated recipes with detailed instructions, nutrition info, and pro tips
- **📅 7-Day Meal Planning** – Generate complete weekly dinner plans with customizable dietary preferences
- **⚡ Multi-AI Fallback Chain** – Tries up to 4 AI providers (Gemini → Cloudflare → Hugging Face → Ollama) to guarantee a response
- **✍️ Simulated Streaming** – Instructions appear one by one with a typing effect for an engaging UX
- **❤️ Save to Favorites** – Authenticated users can save recipes and meal plans to their personal Firestore collection
- **🔐 Firebase Auth** – Google Sign-In and email/password authentication
- **📱 Responsive Design** – Beautiful, mobile-first layout with glassmorphism effects

## 🏗️ Architecture

```
┌──────────────────────────────────────────┐
│                 Client                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Home    │ │ Meal Plan│ │  Saved   │ │
│  │(Generate)│ │(Calendar)│ │(Firestore│ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ │
│       │             │            │       │
│  ┌────┴─────────────┴────┐  ┌────┴─────┐ │
│  │   API Routes          │  │ Firebase │ │
│  │ /api/generate-recipe  │  │ Auth +   │ │
│  │ /api/generate-meal-plan│  │ Firestore│ │
│  └────┬──────────────────┘  └──────────┘ │
└───────┼──────────────────────────────────┘
        │
        ▼  (Fallback Chain)
 ┌──────────────┐
 │ 1. Gemini    │──fail──┐
 └──────────────┘        ▼
                  ┌──────────────┐
                  │ 2. Cloudflare│──fail──┐
                  └──────────────┘        ▼
                                  ┌──────────────┐
                                  │ 3. Hugging   │──fail──┐
                                  │    Face      │        ▼
                                  └──────────────┘ ┌──────────────┐
                                                   │ 4. Ollama    │
                                                   │   (local)    │
                                                   └──────────────┘
```

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with AuthProvider
│   ├── page.tsx                # Home – recipe generator
│   ├── globals.css             # Tailwind CSS + custom animations
│   ├── meal-plan/
│   │   └── page.tsx            # 7-day meal planner
│   ├── saved/
│   │   └── page.tsx            # Saved recipes (protected)
│   └── api/
│       ├── generate-recipe/
│       │   └── route.ts        # Recipe generation API
│       └── generate-meal-plan/
│           └── route.ts        # Meal plan generation API
├── components/
│   ├── AuthProvider.tsx        # Firebase auth context
│   ├── Header.tsx              # Navigation + auth UI
│   ├── IngredientInput.tsx     # Tag-based ingredient input
│   ├── RecipeCard.tsx          # Recipe display with typing effect
│   └── MealPlanCalendar.tsx    # 7-day calendar grid
└── lib/
    └── firebase.ts             # Firebase initialization
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- A Firebase project with Authentication and Firestore enabled
- At least one AI provider API key (Gemini recommended)

### 1. Clone & Install

```bash
git clone <repo-url>
cd RecipeGenius
npm install
```

### 2. Configure Environment

Copy `.env.local` and fill in your credentials:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# AI Provider Keys (at least one required)
GEMINI_API_KEY=your_gemini_api_key
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
HF_API_TOKEN=your_huggingface_api_token
OLLAMA_URL=http://localhost:11434
```

### 3. Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** → Google Sign-In and Email/Password
3. Enable **Cloud Firestore** in production mode
4. Deploy the security rules from `firestore.rules`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🤖 AI Fallback Chain

RecipeGenius tries four AI providers in sequence until one returns a valid response:

| Priority | Provider | Model | Type |
|----------|----------|-------|------|
| 1 | Google Gemini | gemini-2.0-flash | Cloud API |
| 2 | Cloudflare Workers AI | @cf/meta/llama-3-8b-instruct | Cloud API |
| 3 | Hugging Face | Mistral-7B-Instruct-v0.2 | Cloud API |
| 4 | Ollama | llama3 | Local |

If a provider's API key is not configured, it's skipped. If all four fail, the app returns a 503 error. You only need **one** provider configured to use the app.

## 🔒 Firestore Security Rules

The app uses user-scoped security rules:
- Each user can only read/write their own data
- Recipes are stored at `users/{uid}/recipes`
- Meal plans are stored at `users/{uid}/mealPlans`

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v4
- **Auth & DB**: Firebase v10+ (modular SDK)
- **AI**: Google Gemini SDK, Cloudflare Workers AI, Hugging Face Inference, Ollama
- **Language**: TypeScript
- **State**: React hooks (no external state libraries)

## 📝 License

MIT
