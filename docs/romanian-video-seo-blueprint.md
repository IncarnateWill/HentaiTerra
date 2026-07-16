# Romanian Video Platform SEO & Technical Blueprint

This blueprint targets a custom Next.js App Router + TypeScript 18+ hentai streaming and video translation platform that publishes Romanian-subtitled 18+ episodes quickly, while keeping URLs crawlable, semantic, and suitable for Google Romania.

> Audience and compliance note: this blueprint is for an 18+ hentai streaming catalogue. Keep age-gating, DMCA/contact pages, and adult-content compliance visible and crawl-safe; do not expose admin or private APIs.
>
> Implementation note: replace every `[INSERT_DATA]` placeholder with data from your CMS/database/environment variables. Do not hardcode private hostnames, credentials, competitor content, or unlicensed metadata.

---

## Module 1: Localized Keyword Research & Topical Architecture (Romanian Market)

### 1.1 High-intent Romanian keyword set

| # | Keyword | Type | Intent | Recommended page target | Content angle |
|---|---|---|---|---|---|
| 1 | `hentai subtitrat in romana` | Primary | Commercial | `/hentais` | Main library page for Romanian subtitles. |
| 2 | `episoade hentai subtitrate romana` | Primary | Commercial | `/watch/[mediaId]` | Individual episode watch pages discovered from homepage and detail pages. |
| 3 | `hentai subtitrat romana online` | Primary | Commercial | `/hentais` | Category page for translated series. |
| 4 | `[INSERT_SHOW_NAME] subtitrat in romana` | Long-tail | Transactional | `/hentai/[mediaId]` | Hentai detail with episode index. |
| 5 | `[INSERT_SHOW_NAME] episodul [INSERT_EPISODE_NUMBER] subtitrat` | Long-tail | Transactional | `/watch/[mediaId]` | Episode streaming page. |
| 6 | `hentai nou subtitrat romana` | Secondary | Informational/Commercial | `/hentais` | New releases and update frequency. |
| 7 | `hentai actiune subtitrat romana` | Secondary | Commercial | `/genuri/actiune` | Genre landing page. |
| 8 | `hentai romance subtitrat romana` | Secondary | Commercial | `/genuri/romance` | Genre landing page. |
| 9 | `hentai fantasy subtitrat romana` | Secondary | Commercial | `/genuri/fantasy` | Genre landing page. |
| 10 | `hentai isekai subtitrat romana` | Secondary | Commercial | `/genuri/isekai` | Genre landing page. |
| 11 | `unde pot vedea hentai subtitrat in romana` | Informational | Informational | `/ghid/hentai-subtitrat-romana` | Educational guide and internal links. |
| 12 | `program lansari episoade subtitrate romana` | Secondary | Informational | `/program` | Release calendar. |
| 13 | `traduceri hentai romana` | Secondary | Informational/Commercial | `/recruit` | Fansub workflow, quality, credits. |
| 14 | `hentai hd subtitrat romana` | Secondary | Commercial | `/hentais?calitate=hd` canonicalized to `/hentais` | Avoid index bloat; use filter with canonical. |
| 15 | `episoade hentai recente subtitrate in romana` | Primary | Transactional | `/watch/[mediaId]` | Canonical episode watch path. |

### 1.2 Silo and topical cluster structure

The architecture should support fast discovery of fresh episodes while consolidating authority into durable hubs.

```text
Homepage /
├── Main discovery hubs
│   ├── /hentais
│   │   ├── /hentai/[mediaId]
│   │   │   ├── /watch/[mediaId]
│   │   │   ├── previous episode links
│   │   │   ├── next episode links
│   │   │   └── season/arc episode list links
│   │   └── linked from homepage latest updates module
│   ├── /watch/[mediaId]
│   │   └── canonical episode streaming URLs linked from homepage, /hentais, and /hentai/[mediaId]
│   ├── /genuri/[genre]
│   │   └── links to hentai detail pages, not only episodes
│   ├── /program
│   │   └── links to upcoming and freshly published episodes
│   └── /ghid/[slug]
│       └── informational pages that link contextually to hubs
└── Utility trust pages
    ├── /despre
    ├── /contact
    ├── /recrutare
    └── /dmca
```

Internal linking rules:

- Every newly published episode must be linked from the homepage latest updates block for at least `[INSERT_DATA]` days.
- Every episode page must link upward to its hentai detail and sideways to previous/next episodes.
- Every hentai detail must include a crawlable episode list rendered as server HTML, not only fetched client-side.
- Genre pages should link to hentai detail pages first, then latest episodes as supporting links.
- Informational guides should use descriptive Romanian anchors such as `hentai subtitrat in romana`, `episoade hentai recente subtitrate`, and `[INSERT_SHOW_NAME] subtitrat`.
- If catalogue pagination is added, prefer clean paths such as `/hentais/pagina/2`; otherwise keep query-based catalogue states canonicalized to `/hentais`.
- Filtered, sorted, and searched URLs should generally be `noindex,follow` unless they represent curated static landing pages.

### 1.3 Next.js App Router folder and URL structure

Rules:

- Use lowercase ASCII slugs only.
- Strip Romanian diacritics from URLs: `acțiune` becomes `actiune`, `română` becomes `romana`.
- Use hyphen-separated paths.
- Do not include uppercase letters, spaces, punctuation, or query strings in canonical URLs.

```text
app/
├── page.tsx                                      # /
├── sitemap.ts                                   # /sitemap.xml
├── robots.ts                                    # /robots.txt
├── hentais/
│   └── page.tsx                                 # /hentais
├── hentai/
│   └── [mediaId]/
│       └── page.tsx                             # /hentai/[mediaId]
├── watch/
│   └── [mediaId]/
│       └── page.tsx                             # /watch/[mediaId]
├── genuri/
│   ├── page.tsx                                 # /genuri
│   └── [genre]/
│       └── page.tsx                             # /genuri/[genre]
├── program/
│   └── page.tsx                                 # /program
├── ghid/
│   └── [slug]/
│       └── page.tsx                             # /ghid/[slug]
├── despre/
│   └── page.tsx                                 # /despre
├── contact/
│   └── page.tsx                                 # /contact
└── admin/                                       # disallowed in robots
```

Recommended route parameter examples:

```text
/hentais
/hentai/[INSERT_MEDIA_ID]
/watch/[INSERT_EPISODE_MEDIA_ID]
/genuri/actiune
/genuri/supranatural
/ghid/cum-functioneaza-subtitrarile-in-romana
```

---

## Module 2: Data Scraping & Competitive Intelligence Playbook

This section is for structural competitive analysis only. Respect competitors' robots.txt, terms, rate limits, copyright, and local law. Do not copy synopses or protected media. Use findings to create original Romanian descriptions and improve technical SEO.

### 2.1 Elements to extract from competitor pages

Extract page structure, metadata patterns, and entity coverage rather than copying content.

#### HTML and DOM selectors

```ts
const extractionTargets = {
  headings: ['h1', 'h2', 'h3'],
  primaryTitle: ['h1', '.entry-title', '.post-title', '.hentai-title', '[data-testid="title"]'],
  synopsis: ['.synopsis', '.description', '.entry-content', '.post-content', '.hentai-description', '[itemprop="description"]'],
  episodeList: ['.episode-list a', '.episodes a', '.eplister a', '.listing a[href*="epis"]'],
  videoEmbeds: ['iframe[src]', 'video source[src]', '[data-embed]', '[data-video-id]'],
  breadcrumbs: ['nav[aria-label="breadcrumb"] a', '.breadcrumb a', '[itemtype*="BreadcrumbList"] [itemprop="itemListElement"]'],
  taxonomyLinks: ['a[href*="/genre"]', 'a[href*="/gen"]', 'a[href*="/category"]', '.genres a', '.tags a'],
  paginationLinks: ['a[rel="next"]', 'a[rel="prev"]', '.pagination a'],
  imageCandidates: ['meta[property="og:image"]', 'img[src]', 'source[srcset]'],
};
```

#### Metadata tag map

Collect these tags from each inspected URL:

```ts
const metadataTargets = [
  'title',
  'meta[name="description"]',
  'meta[name="robots"]',
  'link[rel="canonical"]',
  'meta[property="og:title"]',
  'meta[property="og:description"]',
  'meta[property="og:image"]',
  'meta[property="og:type"]',
  'meta[property="og:url"]',
  'meta[name="twitter:card"]',
  'meta[name="twitter:title"]',
  'meta[name="twitter:description"]',
  'meta[name="twitter:image"]',
];
```

#### Structured data and microdata arrays

Parse JSON-LD blocks and microdata attributes for these entity types:

```ts
const schemaTargets = [
  'VideoObject',
  'Movie',
  'TVSeries',
  'TVEpisode',
  'BreadcrumbList',
  'ItemList',
  'Organization',
  'WebSite',
];

const microdataSelectors = [
  '[itemscope]',
  '[itemtype]',
  '[itemprop]',
];
```

Competitive metrics to score:

- Title length and keyword placement.
- Meta description length and Romanian value proposition.
- Whether episode pages expose raw server-rendered links to hentai detail pages.
- Whether thumbnails have `width`, `height`, and descriptive `alt` attributes.
- Whether JSON-LD is valid and includes `uploadDate`, `duration`, `thumbnailUrl`, and `embedUrl`.
- Whether canonical URLs are clean or polluted by search/filter parameters.

### 2.2 Lightweight Python scraper for safe structural harvesting

```python
from __future__ import annotations

import json
import random
import time
from dataclasses import dataclass, asdict
from typing import Any
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 "
    "(KHTML, like Gecko) Version/17.5 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 "
    "(KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
]

HEADERS_BASE = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "ro-RO,ro;q=0.9,en-US;q=0.6,en;q=0.5",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "DNT": "1",
}

@dataclass
class PageIntel:
    url: str
    status_code: int
    title: str | None
    meta: dict[str, str]
    headings: dict[str, list[str]]
    canonical: str | None
    og: dict[str, str]
    twitter: dict[str, str]
    json_ld_types: list[str]
    microdata_itemtypes: list[str]
    episode_links: list[str]
    video_sources: list[str]
    taxonomy_links: list[str]


def build_headers() -> dict[str, str]:
    return {
        **HEADERS_BASE,
        "User-Agent": random.choice(USER_AGENTS),
        "Referer": "https://www.google.ro/",
    }


def text_or_none(node: Any) -> str | None:
    if not node:
        return None
    text = node.get_text(" ", strip=True)
    return text or None


def attr_or_none(node: Any, attr: str) -> str | None:
    if not node:
        return None
    value = node.get(attr)
    return value.strip() if isinstance(value, str) and value.strip() else None


def collect_meta(soup: BeautifulSoup) -> dict[str, str]:
    output: dict[str, str] = {}
    for tag in soup.select("meta[name], meta[property]"):
        key = tag.get("name") or tag.get("property")
        value = tag.get("content")
        if isinstance(key, str) and isinstance(value, str) and value.strip():
            output[key] = value.strip()
    return output


def collect_json_ld_types(soup: BeautifulSoup) -> list[str]:
    found: list[str] = []
    for script in soup.select('script[type="application/ld+json"]'):
        raw = script.string or script.get_text(strip=True)
        if not raw:
            continue
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            continue
        nodes = payload if isinstance(payload, list) else [payload]
        for node in nodes:
            if isinstance(node, dict):
                graph = node.get("@graph")
                candidates = graph if isinstance(graph, list) else [node]
                for candidate in candidates:
                    if isinstance(candidate, dict) and candidate.get("@type"):
                        schema_type = candidate["@type"]
                        if isinstance(schema_type, list):
                            found.extend(str(item) for item in schema_type)
                        else:
                            found.append(str(schema_type))
    return sorted(set(found))


def absolute_links(base_url: str, nodes: list[Any], attr: str = "href", limit: int = 50) -> list[str]:
    links: list[str] = []
    for node in nodes:
        value = node.get(attr)
        if isinstance(value, str) and value.strip():
            links.append(urljoin(base_url, value.strip()))
    return sorted(set(links))[:limit]


def scrape_page(url: str, timeout: int = 15) -> PageIntel:
    response = requests.get(url, headers=build_headers(), timeout=timeout)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    meta = collect_meta(soup)
    canonical_node = soup.select_one('link[rel="canonical"]')

    return PageIntel(
        url=url,
        status_code=response.status_code,
        title=text_or_none(soup.select_one("title")),
        meta={k: v for k, v in meta.items() if not k.startswith(("og:", "twitter:"))},
        headings={
            "h1": [h.get_text(" ", strip=True) for h in soup.select("h1")],
            "h2": [h.get_text(" ", strip=True) for h in soup.select("h2")],
            "h3": [h.get_text(" ", strip=True) for h in soup.select("h3")],
        },
        canonical=attr_or_none(canonical_node, "href"),
        og={k: v for k, v in meta.items() if k.startswith("og:")},
        twitter={k: v for k, v in meta.items() if k.startswith("twitter:")},
        json_ld_types=collect_json_ld_types(soup),
        microdata_itemtypes=sorted({node.get("itemtype") for node in soup.select("[itemtype]") if node.get("itemtype")}),
        episode_links=absolute_links(url, soup.select('.episode-list a, .episodes a, .eplister a, a[href*="epis"]')),
        video_sources=absolute_links(url, soup.select("iframe[src], video source[src]"), attr="src"),
        taxonomy_links=absolute_links(url, soup.select('a[href*="/genre"], a[href*="/gen"], a[href*="/category"], .genres a, .tags a')),
    )


def scrape_many(urls: list[str], min_delay: float = 2.0, max_delay: float = 6.0) -> list[PageIntel]:
    results: list[PageIntel] = []
    for url in urls:
        try:
            results.append(scrape_page(url))
        except requests.RequestException as exc:
            print(f"[WARN] Could not fetch {url}: {exc}")
        time.sleep(random.uniform(min_delay, max_delay))
    return results


if __name__ == "__main__":
    competitor_urls = [
        "[INSERT_DATA]",
        "[INSERT_DATA]",
    ]
    intel = scrape_many(competitor_urls)
    print(json.dumps([asdict(item) for item in intel], ensure_ascii=False, indent=2))
```

### 2.3 AI analysis checklist for superior localized synopses

Use scraped competitor intelligence to build an original content brief, not a paraphrase.

1. Identify missing context:
   - Does the competitor explain the premise, episode conflict, release context, and genre expectations?
   - Are Romanian subtitle details clear?
   - Are age, tone, or trigger-sensitive elements omitted?
2. Create a Romanian search brief:
   - Primary phrase: `[INSERT_DATA] subtitrat in romana`.
   - Secondary phrase: `episodul [INSERT_DATA] subtitrat`.
   - Supporting entities: characters, studio, season, genre, arc, release year.
3. Write an original synopsis:
   - 90-140 words for episode pages.
   - 180-260 words for hentai detail pages.
   - Natural Romanian, no keyword stuffing.
   - Mention subtitle language once in a user-helpful way.
4. Add unique value competitors often lack:
   - Episode order and continuity guidance.
   - Translation status and update timestamp.
   - Genre tags with Romanian labels.
   - Previous/next episode links.
   - Short quality note: `subtitrare verificata`, `traducere adaptata`, or `[INSERT_DATA]` if accurate.
5. Validate SEO constraints:
   - One H1 per page.
   - Title under 60 characters.
   - Meta description under 155 characters.
   - Self-referencing canonical.
   - JSON-LD validates in Rich Results Test.

---

## Module 3: On-page & Metadata Next.js Code Generation (Video Focus)

Target route: `app/watch/[mediaId]/page.tsx`.

```tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type WatchPageParams = {
  mediaId: string;
};

type WatchPageProps = {
  params: Promise<WatchPageParams>;
};

type WatchPageSeoData = {
  hentaiTitle: string;
  hentaiId: string;
  episodeTitle: string;
  mediaId: string;
  episodeNumber: number;
  synopsis: string;
  thumbnailUrl: string;
  thumbnailWidth: number;
  thumbnailHeight: number;
  uploadDate: string;
  modifiedDate: string;
  durationIso8601: string;
  embedUrl: string;
  contentUrl?: string;
  subtitleLanguages: Array<'ro' | 'en' | string>;
  genres: string[];
  previousEpisodeUrl?: string;
  nextEpisodeUrl?: string;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://[INSERT_DATA]';
const SITE_NAME = '[INSERT_DATA]';

async function getWatchPageSeoData(params: WatchPageParams): Promise<WatchPageSeoData | null> {
  // Replace with your database/CMS query.
  // Example: return await db.episode.findUnique({ where: { episodeId: params.mediaId } });
  void params;
  return {
    hentaiTitle: '[INSERT_DATA]',
    hentaiId: '[INSERT_DATA]',
    episodeTitle: '[INSERT_DATA]',
    mediaId: '[INSERT_DATA]',
    episodeNumber: 1,
    synopsis: '[INSERT_DATA]',
    thumbnailUrl: `${SITE_URL}/[INSERT_DATA]`,
    thumbnailWidth: 1280,
    thumbnailHeight: 720,
    uploadDate: '[INSERT_DATA]',
    modifiedDate: '[INSERT_DATA]',
    durationIso8601: 'PT24M00S',
    embedUrl: `${SITE_URL}/embed/[INSERT_DATA]`,
    contentUrl: `${SITE_URL}/media/[INSERT_DATA]`,
    subtitleLanguages: ['ro'],
    genres: ['[INSERT_DATA]'],
    previousEpisodeUrl: undefined,
    nextEpisodeUrl: undefined,
  };
}

function truncate(input: string, maxLength: number): string {
  if (input.length <= maxLength) return input;
  const trimmed = input.slice(0, maxLength - 1).trimEnd();
  return `${trimmed}…`;
}

function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export async function generateMetadata({ params }: WatchPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const watchItem = await getWatchPageSeoData(resolvedParams);

  if (!watchItem) {
    return {
      title: `Episod indisponibil | ${SITE_NAME}`,
      robots: { index: false, follow: false },
    };
  }

  const canonical = absoluteUrl(`/watch/${watchItem.mediaId}`);
  const title = truncate(`${watchItem.hentaiTitle} Ep ${watchItem.episodeNumber} subtitrat`, 60);
  const description = truncate(
    `Urmareste ${watchItem.hentaiTitle} episodul ${watchItem.episodeNumber} subtitrat in romana. ${watchItem.synopsis}`,
    155,
  );

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'video.episode',
      locale: 'ro_RO',
      siteName: SITE_NAME,
      url: canonical,
      title,
      description,
      images: [
        {
          url: watchItem.thumbnailUrl,
          width: watchItem.thumbnailWidth,
          height: watchItem.thumbnailHeight,
          alt: `${watchItem.hentaiTitle} episodul ${watchItem.episodeNumber} subtitrat in romana`,
        },
      ],
      videos: [
        {
          url: watchItem.embedUrl,
          secureUrl: watchItem.embedUrl,
          type: 'text/html',
          width: 1280,
          height: 720,
        },
      ],
      publishedTime: watchItem.uploadDate,
      modifiedTime: watchItem.modifiedDate,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [watchItem.thumbnailUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-video-preview': -1,
        'max-snippet': -1,
      },
    },
  };
}

export default async function EpisodePage({ params }: WatchPageProps) {
  const resolvedParams = await params;
  const watchItem = await getWatchPageSeoData(resolvedParams);

  if (!watchItem) notFound();

  const canonical = absoluteUrl(`/watch/${watchItem.mediaId}`);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: `${watchItem.hentaiTitle} episodul ${watchItem.episodeNumber} subtitrat in romana`,
    description: watchItem.synopsis,
    thumbnailUrl: [watchItem.thumbnailUrl],
    uploadDate: watchItem.uploadDate,
    dateModified: watchItem.modifiedDate,
    duration: watchItem.durationIso8601,
    embedUrl: watchItem.embedUrl,
    contentUrl: watchItem.contentUrl,
    inLanguage: 'ja',
    subtitleLanguage: watchItem.subtitleLanguages,
    isFamilyFriendly: '[INSERT_DATA]',
    genre: watchItem.genres,
    url: canonical,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/logo.png'),
      },
    },
    partOfSeries: {
      '@type': 'TVSeries',
      name: watchItem.hentaiTitle,
      url: absoluteUrl(`/hentai/${watchItem.hentaiId}`),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <header className="border-b border-zinc-800 bg-zinc-950 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-sm text-zinc-400">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/">Acasa</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/hentais">Hentai</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href={`/hentai/${watchItem.hentaiId}`}>{watchItem.hentaiTitle}</Link></li>
            </ol>
          </nav>

          <p className="text-sm font-medium uppercase tracking-wide text-violet-300">
            Episod subtitrat in romana
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {watchItem.hentaiTitle} episodul {watchItem.episodeNumber}: {watchItem.episodeTitle}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-zinc-300">
            {watchItem.synopsis}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section aria-labelledby="video-player-title" className="space-y-4">
          <h2 id="video-player-title" className="text-2xl font-semibold">
            Urmareste episodul online
          </h2>

          <div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl">
            <iframe
              src={watchItem.embedUrl}
              title={`${watchItem.hentaiTitle} episodul ${watchItem.episodeNumber} subtitrat in romana`}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="eager"
            />
          </div>
        </section>

        <section aria-labelledby="episode-details-title" className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <article className="space-y-4">
            <h2 id="episode-details-title" className="text-2xl font-semibold">
              Detalii episod
            </h2>
            <p className="leading-7 text-zinc-700 dark:text-zinc-300">{watchItem.synopsis}</p>
          </article>

          <aside aria-label="Navigare episoade" className="space-y-4 rounded-2xl border p-4">
            <Image
              src={watchItem.thumbnailUrl}
              alt={`${watchItem.hentaiTitle} episodul ${watchItem.episodeNumber}`}
              width={watchItem.thumbnailWidth}
              height={watchItem.thumbnailHeight}
              sizes="(min-width: 1024px) 320px, 100vw"
              className="aspect-video rounded-xl object-cover"
              priority
            />
            <Link href={`/hentai/${watchItem.hentaiId}`} className="block font-semibold text-violet-600">
              Toate episoadele hentai {watchItem.hentaiTitle}
            </Link>
            <div className="flex gap-3 text-sm">
              {watchItem.previousEpisodeUrl ? <Link href={watchItem.previousEpisodeUrl}>Episod anterior</Link> : null}
              {watchItem.nextEpisodeUrl ? <Link href={watchItem.nextEpisodeUrl}>Episod urmator</Link> : null}
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}
```

---

## Module 4: Dynamic Sitemap & Crawl Control for High-frequency Publishing

### 4.1 `app/sitemap.ts`

```ts
import type { MetadataRoute } from 'next';

type SitemapEpisode = {
  hentaiId: string;
  mediaId: string;
  updatedAt: string;
};

type SitemapHentai = {
  mediaId: string;
  updatedAt: string;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://[INSERT_DATA]';

async function getSitemapHentais(): Promise<SitemapHentai[]> {
  // Replace with a database query that returns all indexable hentai detail pages.
  return [
    { mediaId: '[INSERT_DATA]', updatedAt: '[INSERT_DATA]' },
  ];
}

async function getSitemapEpisodes(): Promise<SitemapEpisode[]> {
  // Replace with a database query for canonical, published, indexable episodes only.
  return [
    { hentaiId: '[INSERT_DATA]', mediaId: '[INSERT_DATA]', updatedAt: '[INSERT_DATA]' },
  ];
}

function url(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [hentais, episodes] = await Promise.all([
    getSitemapHentais(),
    getSitemapEpisodes(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: url('/'),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: url('/hentais'),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: url('/genuri'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: url('/program'),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  const hentaiRoutes: MetadataRoute.Sitemap = hentais.map((hentai) => ({
    url: url(`/hentai/${hentai.mediaId}`),
    lastModified: new Date(hentai.updatedAt),
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  const episodeRoutes: MetadataRoute.Sitemap = episodes.map((episode) => ({
    url: url(`/watch/${episode.mediaId}`),
    lastModified: new Date(episode.updatedAt),
    changeFrequency: 'always',
    priority: 0.9,
  }));

  return [...staticRoutes, ...hentaiRoutes, ...episodeRoutes];
}
```

### 4.2 `app/robots.ts`

```ts
import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://[INSERT_DATA]';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/admin/*',
          '/api/',
          '/api/*',
          '/_next/data/',
          '/debug-user/',
          '/search?',
          '/*?q=',
          '/*?s=',
          '/*?sort=',
          '/*?filter=',
          '/*?utm_',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
```

---

## Module 5: System Core Web Vitals & Rendering Strategy

### 5.1 Rendering strategy by page type

| Page type | Route | Recommended strategy | Revalidation | Reason |
|---|---|---|---|---|
| Homepage | `/` | ISR | 60-300 seconds | Needs fast TTFB and frequent latest episode updates. |
| Full hentai catalogue | `/hentais` | ISR | 300-900 seconds | Large 18+ catalogue, moderate updates, strong cache value. |
| Hentai detail | `/hentai/[mediaId]` | `generateStaticParams` for popular hentai titles + ISR fallback | 300 seconds while active, 3600 seconds when completed | Crawlable episode lists with fast cached rendering. |
| Active watch page | `/watch/[mediaId]` | ISR with on-demand revalidation after publish/edit | 60 seconds or webhook-triggered | Fresh pages need quick indexing, stable HTML for bots, and discovery through internal links and sitemap. |
| Genre pages | `/genuri/[genre]` | SSG + ISR | 3600 seconds | Mostly stable pages that pass equity to hentai detail pages. |
| Release calendar | `/program` | ISR | 300 seconds | Updates regularly but can be cached. |
| Search results | `/cautare` or query-driven URLs | Dynamic, `noindex,follow` | No static cache requirement | Avoid thin/duplicate indexed pages. |
| Admin pages | `/admin/*` | Dynamic, authenticated, noindex | Never indexed | Private operational routes. |

Implementation defaults:

```ts
// Use on active public pages where content can be cached but refreshed quickly.
export const revalidate = 60;

// Use only where every route must be resolved from params and missing params should 404.
export const dynamicParams = true;
```

Recommended publish flow:

1. Save episode in CMS/database with `status = draft`.
2. Generate slug using ASCII Romanian-safe normalization.
3. Publish episode and trigger `/api/revalidate` for:
   - `/`
   - `/hentais`
   - `/hentai/[mediaId]`
   - `/watch/[mediaId]`
   - `/sitemap.xml`
4. Ping IndexNow if configured and appropriate.
5. Verify the episode appears in server-rendered homepage and hentai detail links.

### 5.2 CLS-free video embed and LCP-optimized image example

```tsx
import Image from 'next/image';

type HeroVideoProps = {
  title: string;
  thumbnailUrl: string;
  embedUrl: string;
};

export function HeroVideo({ title, thumbnailUrl, embedUrl }: HeroVideoProps) {
  return (
    <section aria-labelledby="hero-video-title" className="mx-auto max-w-6xl px-4 py-6">
      <h1 id="hero-video-title" className="mb-4 text-3xl font-bold tracking-tight sm:text-5xl">
        {title}
      </h1>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-zinc-950 shadow-xl">
          <iframe
            src={embedUrl}
            title={title}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="eager"
          />
        </div>

        <aside className="space-y-4">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-zinc-900">
            <Image
              src={thumbnailUrl}
              alt={`${title} - imagine episod subtitrat in romana`}
              fill
              priority
              fetchPriority="high"
              sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            Playerul este incarcat intr-un container cu raport fix 16:9 pentru a preveni schimbari de layout.
          </p>
        </aside>
      </div>
    </section>
  );
}
```

Core Web Vitals rules:

- Always wrap iframes in `aspect-video` or another fixed aspect-ratio container.
- Never inject the video iframe above the fold without reserving space.
- Use `next/image` with `width`/`height` or `fill` inside a fixed-ratio parent.
- Add `priority` only to the single likely LCP image; do not mark every thumbnail as priority.
- Use `sizes` accurately so mobile devices do not download desktop-sized thumbnails.
- Preload only critical fonts and use `font-display: swap`.
- Render metadata, H1, synopsis, breadcrumbs, and episode links on the server.
- Defer comments, recommendations, Discord widgets, and analytics below the main content.
- Avoid client-only player shells for primary content; Googlebot should see semantic HTML before hydration.
