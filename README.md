# 🚀 Smart Bookmark App

A modern, real-time bookmark manager built with **Next.js (App Router)**, **Supabase**, and **Tailwind CSS**, featuring secure Google OAuth authentication and per-user data isolation.

---

## 🌐 Live Demo

🔗 https://your-vercel-url.vercel.app

---

## 📖 Overview

Smart Bookmark is a production-ready full-stack application that allows users to:

- Sign in securely using **Google OAuth**
- Add personal bookmarks (Title + URL)
- Delete bookmarks
- View updates in **real-time without page refresh**
- Access strictly private data (RLS enforced)

Each user's bookmarks are fully isolated using database-level security policies.

---

## 🛠 Tech Stack

### Frontend
- Next.js 16 (App Router)
- React (Client Components)
- TypeScript
- Tailwind CSS

### Backend (BaaS)
- Supabase Auth (Google OAuth)
- Supabase PostgreSQL
- Supabase Realtime
- Row Level Security (RLS)

### Deployment
- Vercel

---

## 🔐 Authentication

- Google OAuth only (no email/password)
- Secure OAuth flow handled via Supabase
- Environment variables configured for both local and production

---

## 🗄 Database Schema

### Table: `bookmarks`

| Column      | Type         | Description                          |
|-------------|-------------|--------------------------------------|
| id          | uuid        | Primary key                          |
| user_id     | uuid        | References authenticated user        |
| title       | text        | Bookmark title                       |
| url         | text        | Bookmark URL                         |
| created_at  | timestamptz | Auto-generated timestamp             |

---

## 🔒 Row Level Security (RLS)

RLS is enabled to ensure strict per-user data access.

### Policies Implemented

- Users can SELECT only their own bookmarks
- Users can INSERT only their own bookmarks
- Users can DELETE only their own bookmarks

Example policy:

```sql
auth.uid() = user_id
```

This ensures complete data isolation at the database level.

---

## ⚡ Real-Time Updates

Implemented using Supabase Realtime subscriptions.

- Subscribed to `postgres_changes`
- Filtered per `user_id`
- Instant sync across multiple browser tabs
- Optimistic UI updates for immediate feedback

Example subscription filter:

```ts
filter: `user_id=eq.${user.id}`
```

---

## 🎨 UI Highlights

- Modern glassmorphism design
- Eye-friendly gradient background
- Responsive layout
- Smooth hover animations
- Optimistic UI updates
- Loading state handling
- Empty state messaging
- Secure external link handling (`rel="noopener noreferrer"`)

---

## 🧠 Engineering Decisions

### Why Supabase?
- Built-in Auth + Postgres + Realtime
- Eliminates need for custom backend
- Production-ready security policies

### Why Optimistic UI?
- Improves perceived performance
- Provides instant feedback
- Maintains eventual consistency via realtime sync

### Why App Router?
- Modern Next.js architecture
- Clean separation of concerns

---

## 📁 Project Structure

```
src/
 ├── app/
 │    └── page.tsx
 │
 ├── lib/
 │    └── supabase.ts
```

---

## 🔧 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## ▶️ Run Locally

```bash
git clone <repository-url>
cd smart-bookmark
npm install
npm run dev
```

---

## 🌍 Deployment Steps

1. Push project to GitHub
2. Import repository in Vercel
3. Add environment variables in Vercel dashboard
4. Update:
   - Google OAuth Authorized Origins
   - Supabase Site URL
   - Supabase Redirect URLs

---

## 📈 Key Learnings

- Implementing secure OAuth flows
- Database-level access control using RLS
- Real-time event subscriptions
- Optimistic UI design pattern
- Production deployment configuration
- Managing local vs production environments

---

## 🚀 Future Improvements

- Edit bookmark functionality
- Tagging and categorization
- Drag-and-drop sorting
- Dark/Light theme toggle
- PWA support

---

## 👨‍💻 Author

**Amul Tiwary**  
MCA | NIT-BHOPAL  |  FULL STACK DEVELOPER  
Passionate about scalable systems and real-time applications.

---

## ⭐ Project Highlights

✔ Secure Authentication  
✔ Private Per-User Data  
✔ Real-Time Sync  
✔ Modern UI  
✔ Production Deployment  
✔ Clean Architecture  
