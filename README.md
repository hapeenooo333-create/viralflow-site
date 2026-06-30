# ViralFlow AI

This repository contains a scaffold for the ViralFlow AI web app (Next.js + Tailwind + Supabase).

Quickstart (local):

1. Copy .env.example to .env.local and fill in credentials (Supabase, OpenAI, ElevenLabs).
2. Install dependencies:
   npm install
3. Run dev server:
   npm run dev

Deploy:
- Connect this repo to Vercel, set environment variables in the Vercel dashboard, and deploy.
- Create a Supabase project and run any migrations (initial tables are included in README/SQL).
- Configure LemonSqueezy webhook to point to /api/lemonsqueezy/webhook

