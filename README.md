# PagePilot 🚀
### Enterprise SaaS for Facebook Page Management & Automation (Official Meta Graph API v21.0)

PagePilot is a production-ready SaaS application designed for community managers, brands, and agencies to automate and manage Facebook Pages strictly through the **official Meta Graph API**.

---

## 🛡️ Important Safety & Architecture Principles

PagePilot is architected with strict adherence to Meta's Platform Terms:

* **Zero Password Ingestion:** The application NEVER asks for, intercepts, or stores Facebook passwords. Authentication occurs exclusively through Meta OAuth / Facebook Login.
* **No Browser Automation:** Zero usage of Selenium, Playwright, Puppeteer, headless browsers, or simulated clicks.
* **No Unofficial Endpoints:** All actions use documented Meta Graph API v21.0 endpoints.
* **Server-side AES-256-GCM Encryption:** Access tokens are encrypted at rest with initialization vectors and authentication tags. Tokens are never exposed to browser clients.
* **Signed Webhooks Only:** Incoming Webhook events are cryptographically verified via HMAC-SHA256 signatures (`X-Hub-Signature-256`).
* **Official Enforcement:** Actions not supported by Meta (such as automated bot post reactions) are disabled by architecture, showing: *"Automatic reactions for this action are not currently supported by the official Meta API."*

---

## 📋 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Dependency Installation](#2-dependency-installation)
3. [PostgreSQL Database Setup](#3-postgresql-database-setup)
4. [Redis & Queue Configuration](#4-redis--queue-configuration)
5. [Creating Your Meta Developer App](#5-creating-your-meta-developer-app)
6. [Configuring Facebook Login](#6-configuring-facebook-login)
7. [Configuring OAuth Redirect URIs](#7-configuring-oauth-redirect-uris)
8. [Configuring Required Meta Graph API Permissions](#8-configuring-required-meta-graph-api-permissions)
9. [Configuring Meta Webhooks](#9-configuring-meta-webhooks)
10. [Environment Variables Setup](#10-environment-variables-setup)
11. [Running Prisma Database Migrations](#11-running-prisma-database-migrations)
12. [Starting the Development Server](#12-starting-the-development-server)
13. [Production Deployment](#13-production-deployment)

---

## 1. Prerequisites

* **Node.js:** v18.0.0 or higher
* **PostgreSQL:** v14+ (or hosted provider like Neon, Supabase, Cloud SQL)
* **Redis:** v6.2+ (or hosted Redis / Upstash)
* **Meta Developer Account:** [https://developers.facebook.com](https://developers.facebook.com)

---

## 2. Dependency Installation

Clone the repository and install npm packages:

```bash
npm install
```

---

## 3. PostgreSQL Database Setup

1. Start your local PostgreSQL server or create a cloud PostgreSQL instance:

```bash
# Example local database creation:
createdb pagepilot
```

2. Format the connection string for your `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/pagepilot?schema=public"
```

---

## 4. Redis & Queue Configuration

Redis powers background queues and scheduled post workers:

```bash
# Start local Redis server:
redis-server

# Or with Docker:
docker run -d --name pagepilot-redis -p 6379:6379 redis:alpine
```

Set `REDIS_URL` in `.env`:

```env
REDIS_URL="redis://localhost:6379"
```

---

## 5. Creating Your Meta Developer App

1. Navigate to the **Meta for Developers Portal**: [https://developers.facebook.com/apps](https://developers.facebook.com/apps).
2. Click **Create App**.
3. Select **Other** as the use case, then choose **Business** as the app type.
4. Name your application (e.g. `PagePilot Suite`) and provide your contact email.
5. In the App Dashboard, note down your **App ID** and **App Secret** (under *App Settings → Basic*).

---

## 6. Configuring Facebook Login

1. In your Meta App Dashboard, find **Add Products to Your App**.
2. Click **Set Up** on **Facebook Login for Business**.
3. Under *Facebook Login → Settings*, configure:
   * **Client OAuth Login:** `Yes`
   * **Web OAuth Login:** `Yes`
   * **Enforce HTTPS:** `Yes`

---

## 7. Configuring OAuth Redirect URIs

Add your application's callback URLs to **Valid OAuth Redirect URIs**:

* **Development:**
  `https://ais-dev-fvzz7nklnvxrhhryg3uzph-82637198223.asia-southeast1.run.app/auth/callback`
* **Shared / Production:**
  `https://ais-pre-fvzz7nklnvxrhhryg3uzph-82637198223.asia-southeast1.run.app/auth/callback`
* **Localhost (if running locally):**
  `http://localhost:3000/auth/callback`

> **Note:** Trailing slash variations like `/auth/callback/` are handled automatically by the server.

---

## 8. Configuring Required Meta Graph API Permissions

Request and grant the following official permissions in the Meta App Review / Permissions panel:

| Permission | Description |
|---|---|
| `pages_show_list` | Retrieves the list of Facebook Pages managed by the user. |
| `pages_read_engagement` | Reads post impressions, reactions, follower count, and comments. |
| `pages_manage_posts` | Publishes text, link, photo, and video posts to Page feeds. |
| `pages_manage_metadata` | Subscribes your app to Page webhooks for real-time events. |
| `pages_read_user_content` | Reads user comments for keyword automation rules. |
| `public_profile` | Authenticates basic profile and identity. |
| `email` | Provides account notifications. |

---

## 9. Configuring Meta Webhooks

1. In Meta App Dashboard, go to **Webhooks → Page**.
2. Click **Subscribe to this object**.
3. Set **Callback URL**:
   `https://<YOUR_APP_URL>/api/webhooks/facebook`
4. Set **Verify Token**:
   The value of `META_WEBHOOK_VERIFY_TOKEN` (default: `pagepilot_meta_webhook_secret_token_2026`).
5. Subscribe to the following fields:
   * `feed` (fires on new comments and posts)
   * `mention` (fires on user mentions)

---

## 10. Environment Variables Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Populate the variables:

```env
# Meta Graph API Credentials
META_APP_ID="YOUR_META_APP_ID"
META_APP_SECRET="YOUR_META_APP_SECRET"
META_API_VERSION="v21.0"
META_REDIRECT_URI="https://<YOUR_APP_URL>/auth/callback"
META_WEBHOOK_VERIFY_TOKEN="your_secure_verify_token_here"

# Database & Queue
DATABASE_URL="postgresql://postgres:password@localhost:5432/pagepilot"
REDIS_URL="redis://localhost:6379"

# 32-Byte Secret for AES-256-GCM Token Encryption
TOKEN_ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# Application URL
APP_URL="https://ais-dev-fvzz7nklnvxrhhryg3uzph-82637198223.asia-southeast1.run.app"
```

---

## 11. Running Prisma Database Migrations

Generate client and run schema migration:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

To inspect your database visually:
```bash
npx prisma studio
```

---

## 12. Starting the Development Server

Start the full-stack server running Vite middlewares on port 3000:

```bash
npm run dev
```

Visit `http://localhost:3000` or your Cloud container URL.

---

## 13. Production Deployment

1. Build the Vite frontend:
```bash
npm run build
```

2. Start the production Express server:
```bash
npm run start
```

---

## 📄 License
PagePilot is licensed under the Apache-2.0 License.
