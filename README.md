# Magnetize

Open source lead magnet platform. Build interactive, web-based lead magnet pages with a Notion-like editor, lead gates, analytics, and integrations — fully free and self-hostable.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/athm793/magnetize&env=DATABASE_URL,NEXTAUTH_SECRET,NEXTAUTH_URL,GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,NEXT_PUBLIC_APP_URL&envDescription=Required%20environment%20variables&envLink=https://github.com/athm793/magnetize%23environment-variables)

## Features

- **Notion-like editor** — BlockNote with rich text, images, embeds
- **Multi-tab lead magnets** — organize content across multiple tabs
- **AI content generation** — generate full lead magnets from a prompt (optional, via OpenRouter)
- **3 gate types** — content gate (email wall), popup, and top bar
- **Custom form fields** — name, email, company, phone, job title
- **Analytics** — views, leads, conversion rate, time-series chart, lead table + CSV export
- **Custom domains** — bring your own domain, free for all users
- **Branding** — color picker and logo upload per magnet
- **Integrations** — Zapier webhooks, Google Sheets (leads auto-append), RB2B pixel
- **No billing, no paywalls** — everything is free

## Self-Hosting Cost

| Component | Cost |
|-----------|------|
| Neon PostgreSQL | Free (0.5GB free tier) |
| Vercel Hobby | Free |
| NextAuth, BlockNote, shadcn | Free |
| OpenRouter API (AI generation) | Optional — free models available |

Total: **$0/month** on free tiers.

> Custom domains on Vercel require Vercel Pro ($20/mo). Use Railway, Render, or Fly.io (~$5/mo) to avoid this.

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/athm793/magnetize
cd magnetize
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` — see [Environment Variables](#environment-variables) below.

### 3. Set up the database

Run the SQL schema in your Neon console or any Postgres database:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lead_magnets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  magnet_id UUID NOT NULL REFERENCES lead_magnets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  "order" INT NOT NULL DEFAULT 0,
  content JSONB
);

CREATE TABLE gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  magnet_id UUID NOT NULL REFERENCES lead_magnets(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  trigger JSONB NOT NULL DEFAULT '{}',
  form_fields JSONB NOT NULL DEFAULT '[]',
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  magnet_id UUID NOT NULL REFERENCES lead_magnets(id) ON DELETE CASCADE,
  gate_id UUID REFERENCES gates(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  name TEXT,
  data JSONB NOT NULL DEFAULT '{}',
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  magnet_id UUID NOT NULL REFERENCES lead_magnets(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  magnet_id UUID NOT NULL REFERENCES lead_magnets(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  CONSTRAINT integrations_magnet_type_unique UNIQUE (magnet_id, type)
);

CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  magnet_id UUID REFERENCES lead_magnets(id) ON DELETE SET NULL,
  domain TEXT UNIQUE NOT NULL,
  txt_record TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```bash
# Database (Neon PostgreSQL recommended)
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=        # generate with: openssl rand -base64 32
NEXTAUTH_URL=           # e.g. http://localhost:3000 or https://yourapp.com

# Google OAuth (for login + Sheets integration)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI generation (optional — feature is hidden if not set)
OPENROUTER_API_KEY=     # get at openrouter.ai — free models available
OPENROUTER_MODEL=mistralai/mistral-7b-instruct  # or claude-3-5-sonnet, gpt-4o, etc.

# File uploads (Vercel Blob)
BLOB_READ_WRITE_TOKEN=

# Public URL (used for custom domain routing)
NEXT_PUBLIC_APP_URL=https://yourapp.com
```

## Deploy to Vercel

```bash
npm i -g vercel
vercel deploy --prod
```

Set the environment variables in your Vercel project settings, or pass them during `vercel deploy`.

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable the **Google+ API** and **Google Sheets API**
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://yourapp.com/api/auth/callback/google` (prod)
5. Copy Client ID and Secret to `.env.local`

## License

MIT
