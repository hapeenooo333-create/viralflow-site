# ViralFlow AI - additional setup

This file documents the added migrations, worker, and API routes for teams, projects, generations, LemonSqueezy integration, and a job worker.

Migrations
- migrations/001_init.sql: initial schema (profiles, organizations, organization_members, projects, generations, subscriptions, usage_records, social_connections, calendar_events)
- migrations/002_rls.sql: example Row Level Security policies to restrict access by auth.uid()

Apply migrations in Supabase SQL editor or via your preferred migration tooling.

Worker
- server/worker/index.js: BullMQ worker that processes queued generation jobs. Requires REDIS_URL and SUPABASE service key. Run this on a VM or Cloud Run.

Queue
- The scaffold enqueues if REDIS_URL is present. For local dev without Redis, generation is processed inline synchronously.

LemonSqueezy
- app/api/lemonsqueezy/webhook/route.ts validates webhook payloads using LEMONSQUEEZY_WEBHOOK_SECRET if set.

Next steps
- Run migrations in your Supabase project and set RLS policies as needed.
- Provision Redis (Upstash or managed Redis) and set REDIS_URL to enable job queue processing.
- Deploy worker in an environment that can run Node and connect to Redis and Supabase (Cloud Run or a small VM).

