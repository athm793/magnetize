# Magnetize

> **Work in progress.** Core features are live and in active use. Breaking changes may happen without notice.

Free, open-source lead magnet platform built for cold outbound agencies and GTM operators. Build interactive, gated content pages that capture warm leads — then route them straight into your sequences.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/athm793/magnetize&env=DATABASE_URL,NEXTAUTH_SECRET,NEXTAUTH_URL,GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,NEXT_PUBLIC_APP_URL&envDescription=Required%20environment%20variables&envLink=https://github.com/athm793/magnetize%23environment-variables)

---

## Who this is for

Cold outbound teams that want a better alternative to generic PDF downloads:

- **Agencies** running multichannel outreach for clients — give prospects something worth their work email
- **SDR teams** looking for a mid-funnel asset that qualifies leads before a call
- **GTM operators** who want enrichment-ready lead data (LinkedIn, phone, company domain) flowing directly into their stack

If you use La Growth Machine, Smartlead, Instantly, Clay, or similar tools — this fits in front of them.

---

## What it does

### Content types — all gateable

- **Rich text** — Notion-like multi-tab editor (BlockNote). Guides, playbooks, frameworks, swipe files.
- **YouTube video** — gate a video by pasting a YouTube URL; plays inline after the visitor submits
- **Files** — gate a PDF, DOCX, or TXT file hosted anywhere (Google Drive, Dropbox, S3)
- **HTML / iframe / JS embed** — gate any third-party embed: Calendly, Loom, Typeform, custom HTML, raw JavaScript

### Lead gates

Three gate types, all configurable per magnet:

- **Content gate** — blurred content reveal after form submit
- **Popup** — time-based, scroll-based, or immediate trigger
- **Top bar** — persistent banner with an inline form

### Form fields built for outbound data quality

Every field type has purpose-built validation:

- **Work email** — blocks Gmail, Yahoo, Outlook, and 30+ consumer domains by default (toggle off per gate)
- **Phone** — country-code dropdown (26 countries) + digit-count validation
- **Company website** — URL format check
- **LinkedIn URL** — validates `linkedin.com/in/` and `linkedin.com/company/` patterns
- **Custom fields** — any label, any type (text, URL, dropdown)

Field controls per gate:

- Toggle any field required / optional
- Reorder fields up/down
- Add from pre-built templates (name, company, phone, job title, company URL, LinkedIn)
- Add fully custom fields with your own label and type

### Lead routing

- **Zapier webhook** — POST lead data to any catch hook, connect to any tool
- **Google Sheets** — auto-append leads to a spreadsheet
- **RB2B pixel** — identify anonymous visitors by IP
- **CSV export** — download leads from the analytics dashboard

### Analytics

- Views, form submissions, and conversion rate per magnet
- Time-series chart
- Full lead table with timestamps

### Custom domains

- CNAME-based custom domain per magnet
- Verified via DNS TXT record

### AI generation

- Generate a full multi-tab lead magnet from a topic and audience description
- Runs via OpenRouter (any model, optional)

### Branding

- Per-magnet primary color and background color
- Logo upload

---

## Self-hosting cost

| Component | Cost |
|-----------|------|
| Neon PostgreSQL | Free (0.5 GB free tier) |
| Vercel Hobby | Free |
| NextAuth, BlockNote, shadcn | Free |
| OpenRouter (AI generation) | Optional — free models available |

**Total: $0/month** on free tiers.

> Custom domains on Vercel require a Pro plan ($20/mo). Self-host on Railway, Render, or Fly.io (~$5/mo) to avoid this.

---

## Quick start

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

Fill in `.env.local`:

```env
# Database
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=        # openssl rand -base64 32
NEXTAUTH_URL=           # http://localhost:3000 or your domain

# Google OAuth (login + Sheets integration)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI generation (optional — feature is hidden if not set)
OPENROUTER_API_KEY=
OPENROUTER_MODEL=mistralai/mistral-7b-instruct

# File uploads (Vercel Blob)
BLOB_READ_WRITE_TOKEN=

# Public URL (custom domain routing)
NEXT_PUBLIC_APP_URL=https://yourapp.com
```

### 3. Set up the database

Run the schema below against your Neon database (or any Postgres):

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  attempts INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
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
  content JSONB,
  tab_type TEXT NOT NULL DEFAULT 'blocks',
  embed_data JSONB DEFAULT '{}'
);

CREATE TABLE gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  magnet_id UUID NOT NULL REFERENCES lead_magnets(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  trigger_config JSONB NOT NULL DEFAULT '{"type":"immediate"}',
  form_fields JSONB NOT NULL DEFAULT '[]',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  magnet_id UUID NOT NULL REFERENCES lead_magnets(id) ON DELETE CASCADE,
  gate_id UUID REFERENCES gates(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  name TEXT,
  data JSONB NOT NULL DEFAULT '{}',
  session_id TEXT,
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
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
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

### 4. Run locally

```bash
npm run dev
```

---

## Deploy to Vercel

```bash
npm i -g vercel
vercel deploy --prod
```

Set environment variables in your Vercel project settings before deploying.

---

## Google OAuth setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable **Google+ API** and **Google Sheets API**
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://yourapp.com/api/auth/callback/google` (prod)
5. Copy Client ID and Secret into `.env.local`

---

## Planned / in progress

- [ ] File upload directly from the editor (currently requires a hosted URL)
- [ ] Google Sheets integration (wired, OAuth flow in progress)
- [ ] Sequence trigger: auto-add to LGM / Instantly / Smartlead on lead capture
- [ ] Lead deduplication across magnets
- [ ] A/B testing for gate copy and form fields
- [ ] Mobile-optimized gate layouts
- [ ] Webhook delivery logs and retry
- [ ] Team / workspace support (currently single-user per account)
- [ ] Stripe-based access control gate (pay-to-unlock)
- [ ] Notion-style embed block inside the BlockNote editor

---

## Tech stack

- **Next.js 16** (App Router, Turbopack)
- **Neon PostgreSQL** (serverless Postgres)
- **NextAuth v5** — credentials + Google OAuth + email OTP
- **BlockNote** — Notion-style editor
- **Tailwind CSS + shadcn/ui**
- **OpenRouter** — AI content generation (optional)

---

## License

MIT
