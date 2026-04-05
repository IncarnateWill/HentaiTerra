# HentaiTerra v2.0

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Website](https://img.shields.io/badge/Website-hentaiterra.ro-purple)](https://hentaiterra.ro)
[![Based on anime-streaming](https://img.shields.io/badge/Based%20on-anime--streaming-green)](https://github.com/VenkatLohithDasari/anime-streaming)

HentaiTerra v2.0 is a high-performance, modern hentai streaming platform built with Next.js 14+, tailored for the Romanian community.

> [!CAUTION]
> **NOT PRODUCTION READY.** Acest repository este oferit "ca atare" și nu a mai fost mentenat de mult timp. Este foarte probabil să existe vulnerabilități de securitate și dependențe învechite. Utilizarea acestui cod în medii de producție se face pe propriul risc.
>
> **NOT PRODUCTION READY.** This repository is provided "as is" and has not been maintained for a long time. It is highly likely that security vulnerabilities and outdated dependencies are present. Use this code in production environments at your own risk.

> [!IMPORTANT]
> This project is based on the [anime-streaming](https://github.com/VenkatLohithDasari/anime-streaming) repository by **VenkatLohithDasari**. We are grateful for their foundational work.

## Features

- **Blazing Fast**: Optimized with Next.js and Turbopack for instant loading.
- **High Quality**: Lossless encoding for 360p, 720p, and 1080p streaming.
- **Clean UI**: A premium, ad-free experience with modern aesthetics.
- **Community Driven**: Watchlist tracking, Discord notification system, and analytics.
- **Responsive**: Works perfectly on mobile, tablet, and desktop (PWA ready).

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: TailwindCSS
- **Database**: MongoDB (via Mongoose)
- **Caching**: Redis (ioredis)
- **Auth**: Clerk
- **Icons**: React Icons (Fa, Hi, Si)
- **Animations**: Framer Motion

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/hentaiterra-v2.git
   cd hentaiterra-v2
   ```
2. **Install dependencies**:
   ```bash
   npm install
   # or
   bun install
   ```
3. **Configure Environment**:
   Copy `.env.example` to `.env.local` and fill in your credentials.
4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Environment Variables

The following environment variables are required for the application to function:

| Variable | Description |
|---|---|
| `MONGODB_URI` | Connection string for MongoDB |
| `REDIS_URL` | Connection string for Redis |
| `CLERK_SECRET_KEY` | Clerk private API key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public API key |
| `NEXT_PUBLIC_SITE_URL` | The public URL of your deployment (e.g., https://hentaiterra.ro) |
| `NEXT_PUBLIC_SITE_NAME` | The name of your site (e.g., HentaiTerra) |
| `NEXT_PUBLIC_DISCORD_URL` | Your Discord server invite link |
| `NEXT_PUBLIC_MANGA_URL` | (Optional) Link to your partner manga site |
| `NEXT_PUBLIC_ANIME_URL` | (Optional) Link to your partner anime site |
| `INDEXNOW_KEY` | Your IndexNow API key for indexing |
| `DISCORD_WEBHOOK_ANIME` | Webhook URL for new anime/hentai notifications |
| `DISCORD_WEBHOOK_EPISODE` | Webhook URL for new episode notifications |
| `DISCORD_WEBHOOK_LOG` | Webhook URL for system logs and error reporting |
| `DISCORD_WEBHOOK_SUGGEST` | Webhook URL for user suggestions |
| `DISCORD_WEBHOOK_RECRUIT` | Webhook URL for staff applications |
| `DISCORD_WEBHOOK_REPORT` | Webhook URL for episode reports |
| `DISCORD_ROLE_ANIME` | (Optional) Discord Role ID to mention for new posts |
| `DISCORD_ROLE_EPISODE` | (Optional) Discord Role ID to mention for new episodes |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console verification token |

## Additional Attributions

- [AnimeTerra](https://github.com/IncarnateWill/AnimeTerra) - By [IncarnateWill](https://github.com/IncarnateWill).

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. 

Copyright (C) 2026 IncarnateWill

---

**Creat cu ❤️ de comunitatea HentaiTerra pentru fanii hentai din România**
