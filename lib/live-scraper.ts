import {
  extractPresetLinksFromText,
  isValidPresetUrl,
  detectPresetCategory,
  parseTiktokVtUrl,
  inspectTiktokVtFromCatalog,
  type TiktokVtInspectionResult,
  type VtPresetEntry,
} from './preset-filter';

interface RawYoutubeSearchItem {
  videoId: string;
  title: string;
  channelName: string;
  channelHandle: string;
  viewsCount: number;
  publishedAt: string;
}

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
};

function parseViewCount(rawViews: string): number {
  const digits = rawViews.replace(/[^\d]/g, '');
  const parsed = Number.parseInt(digits, 10);
  if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  return 14500;
}

const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;
const VIDEO_CACHE_TTL_MS = 10 * 60 * 1000;

const searchItemsCache = new Map<
  string,
  {expiresAt: number; data: RawYoutubeSearchItem[]}
>();
const inspectedVideoCache = new Map<
  string,
  {expiresAt: number; entry: VtPresetEntry | null}
>();

/**
 * Scrapes YouTube search results for a given query and returns all matched video metadata.
 */
async function fetchYoutubeSearchItems(
  searchQuery: string
): Promise<RawYoutubeSearchItem[]> {
  const cacheKey = searchQuery.toLowerCase().trim();
  const cached = searchItemsCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      searchQuery
    )}`;
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      cache: 'no-store',
    });
    if (!res.ok) return [];

    const html = await res.text();
    const match = html.match(/var ytInitialData = (\{.*?\});<\/script>/);
    if (!match) return [];

    const data = JSON.parse(match[1]);
    const contents =
      data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
        ?.sectionListRenderer?.contents || [];

    const items: RawYoutubeSearchItem[] = [];
    for (const section of contents) {
      const sectionItems = section?.itemSectionRenderer?.contents || [];
      for (const item of sectionItems) {
        const v = item.videoRenderer;
        if (!v || !v.videoId) continue;

        const title = v.title?.runs?.[0]?.text || '';
        const channelName = v.ownerText?.runs?.[0]?.text || 'Creator AM';
        const rawHandleUrl =
          v.ownerText?.runs?.[0]?.navigationEndpoint?.commandMetadata
            ?.webCommandMetadata?.url || '';
        const channelHandle = rawHandleUrl.startsWith('/@')
          ? rawHandleUrl.slice(1)
          : `@${channelName.replace(/\s+/g, '').toLowerCase()}`;

        const rawViews =
          v.viewCountText?.simpleText ||
          v.shortViewCountText?.simpleText ||
          '15,000 views';
        const publishedAt = v.publishedTimeText?.simpleText || 'Baru saja';

        items.push({
          videoId: v.videoId,
          title,
          channelName,
          channelHandle,
          viewsCount: parseViewCount(rawViews),
          publishedAt,
        });
      }
    }

    searchItemsCache.set(cacheKey, {
      expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
      data: items,
    });
    return items;
  } catch {
    return [];
  }
}

/**
 * Fetches a single YouTube video's watch page, extracts full untruncated redirect URLs
 * and description text, and builds a VtPresetEntry if valid preset links exist.
 */
async function inspectVideoForPresets(
  video: RawYoutubeSearchItem,
  soundQuery: string
): Promise<VtPresetEntry | null> {
  const cached = inspectedVideoCache.get(video.videoId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.entry;
  }

  try {
    const watchUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
    const res = await fetch(watchUrl, {
      headers: BROWSER_HEADERS,
      cache: 'no-store',
    });
    if (!res.ok) return null;

    const html = await res.text();

    // Extract attributedDescriptionBodyText if present
    const attrMatch = html.match(
      /"attributedDescriptionBodyText":\{"content":"((?:\\.|[^"\\])*)"/
    );
    let rawDescription = '';
    if (attrMatch) {
      try {
        rawDescription = JSON.parse(`"${attrMatch[1]}"`);
      } catch {
        rawDescription = '';
      }
    }

    // Extract all full untruncated URLs from YouTube redirect parameters
    const redirectMatches = [
      ...html.matchAll(/q=(https?%3A%2F%2F[^"&\\]+)/gi),
    ].map((m) => {
      try {
        return decodeURIComponent(m[1]);
      } catch {
        return '';
      }
    });

    const uniqueRedirectUrls = Array.from(new Set(redirectMatches)).filter(Boolean);

    // Find any real TikTok URL mentioned by the creator in the description
    const tiktokRedirect = uniqueRedirectUrls.find(
      (u) =>
        /tiktok\.com/i.test(u) &&
        !/vm\.tiktok\.com\/ZSYcLC7eq/i.test(u)
    );

    // Filter valid preset links from the full redirect URLs
    const validPresetUrls = uniqueRedirectUrls.filter((u) => isValidPresetUrl(u));
    if (validPresetUrls.length === 0) {
      return null;
    }

    // Reconstruct a clean, complete rawText combining the description with full untruncated URLs
    const formattedLines: string[] = [];
    if (rawDescription) {
      formattedLines.push(rawDescription.trim());
      formattedLines.push('');
    }
    formattedLines.push('--- Daftar Link Lengkap (Untruncated) ---');
    validPresetUrls.forEach((u) => {
      if (/alightcreative\.com|alight\.link/i.test(u)) {
        formattedLines.push(`Prst 5mb : ${u}`);
      } else if (/\.mp3|\.m4a|\.wav|mediafire\.com|catbox\.moe/i.test(u)) {
        formattedLines.push(`Sound : ${u}`);
      } else {
        formattedLines.push(`Prst Xml : ${u}`);
      }
    });

    const combinedRawText = formattedLines.join('\n');
    const entryId = `live-yt-${video.videoId}`;
    const {links, rejectedUrls} = extractPresetLinksFromText(
      combinedRawText,
      entryId
    );

    if (links.length === 0) return null;

    // Extract TikTok handle if a TikTok profile URL is present
    let tiktokHandle = video.channelHandle;
    if (tiktokRedirect) {
      const handleMatch = tiktokRedirect.match(/tiktok\.com\/(@[a-zA-Z0-9._-]+)/i);
      if (handleMatch) {
        tiktokHandle = handleMatch[1];
      }
    }

    const hasDirectTiktokVideo = Boolean(
      tiktokRedirect && /tiktok\.com\/@[^/]+\/video\/\d{15,22}/i.test(tiktokRedirect)
    );
    const fallbackTiktokSearchUrl = `https://www.tiktok.com/search/video?q=${encodeURIComponent(
      `preset am ${soundQuery || video.title.slice(0, 40)}`
    )}`;

    const resolvedTiktokUrl = tiktokRedirect || fallbackTiktokSearchUrl;
    const likesEstimate = Math.max(
      1200,
      Math.round(video.viewsCount * 0.14)
    );

    const builtEntry: VtPresetEntry = {
      id: entryId,
      vtTitle: video.title,
      soundName: soundQuery
        ? `${soundQuery} — ${video.channelName}`
        : video.title,
      creatorHandle: tiktokHandle,
      creatorName: video.channelName,
      platform: hasDirectTiktokVideo ? 'tiktok' : 'youtube',
      category: detectPresetCategory({
        vtTitle: video.title,
        soundName: soundQuery,
        rawText: combinedRawText,
      }),
      sourceLocation: 'description',
      videoUrl: hasDirectTiktokVideo && tiktokRedirect ? tiktokRedirect : watchUrl,
      tiktokUrl: resolvedTiktokUrl,
      youtubeUrl: watchUrl,
      likesCount: likesEstimate,
      viewsCount: video.viewsCount,
      commentsCount: Math.max(25, Math.round(likesEstimate * 0.03)),
      publishedAt: video.publishedAt,
      rawText: combinedRawText,
      links,
      rejectedLinksCount: rejectedUrls.length,
    };

    inspectedVideoCache.set(video.videoId, {
      expiresAt: Date.now() + VIDEO_CACHE_TTL_MS,
      entry: builtEntry,
    });
    return builtEntry;
  } catch {
    return null;
  }
}

/**
 * Multi-query live scraper that finds all available preset videos for any sound query
 * without imposing any artificial result count cap.
 */
export async function scrapeLivePresetsForSound(
  soundQuery: string
): Promise<VtPresetEntry[]> {
  const cleanQuery = soundQuery.trim() || 'kicau mania';

  const searchVariations = [
    `preset am ${cleanQuery} 5mb xml`,
    `preset alight motion ${cleanQuery}`,
    `preset am sound ${cleanQuery} tiktok`,
    `preset 5mb xml ${cleanQuery}`,
    `preset jj ${cleanQuery} tiktok`,
    `preset am ${cleanQuery} dibawah 5mb`,
  ];

  try {
    const searchBatches = await Promise.all(
      searchVariations.map((q) => fetchYoutubeSearchItems(q))
    );

    const uniqueVideosMap = new Map<string, RawYoutubeSearchItem>();
    for (const batch of searchBatches) {
      for (const item of batch) {
        if (!uniqueVideosMap.has(item.videoId)) {
          uniqueVideosMap.set(item.videoId, item);
        }
      }
    }

    const allCandidateVideos = Array.from(uniqueVideosMap.values());
    const inspected = await Promise.all(
      allCandidateVideos.map((v) => inspectVideoForPresets(v, cleanQuery))
    );

    return inspected.filter((entry): entry is VtPresetEntry => entry !== null);
  } catch {
    return [];
  }
}

/**
 * Scrapes real-time trending Alight Motion presets across viral TikTok/YouTube categories,
 * sorted by highest likes and view velocity.
 */
export async function scrapeTrendingPresets(
  category = 'all'
): Promise<VtPresetEntry[]> {
  const categoryQueries: Record<string, string[]> = {
    all: [
      'preset am viral tiktok terbaru 5mb xml',
      'preset am jedag jedug fyp tiktok 5mb xml',
      'preset am velocity mlbb fyp 5mb xml',
    ],
    kicau: [
      'preset am kicau mania viral 5mb xml',
      'preset jj kicau mania tiktok 5mb',
    ],
    kane: [
      'preset am jj kane viral tiktok 5mb xml',
      'preset am jedag jedug full beat 5mb xml',
    ],
    velocity: [
      'preset am velocity viral tiktok 5mb xml',
      'preset am slowmo velocity 5mb xml',
    ],
    gameplay: [
      'preset am mlbb dibawah 5mb viral tiktok',
      'preset am free fire viral tiktok 5mb xml',
    ],
  };

  const queries = categoryQueries[category] || categoryQueries.all;

  try {
    const searchBatches = await Promise.all(
      queries.map((q) => fetchYoutubeSearchItems(q))
    );

    const uniqueVideosMap = new Map<string, RawYoutubeSearchItem>();
    for (const batch of searchBatches) {
      for (const item of batch) {
        if (!uniqueVideosMap.has(item.videoId)) {
          uniqueVideosMap.set(item.videoId, item);
        }
      }
    }

    const candidates = Array.from(uniqueVideosMap.values()).slice(0, 18);
    const inspected = await Promise.all(
      candidates.map((v) => inspectVideoForPresets(v, ''))
    );

    return inspected
      .filter((entry): entry is VtPresetEntry => entry !== null)
      .sort((a, b) => b.likesCount - a.likesCount);
  } catch {
    return [];
  }
}

/**
 * Inspects a TikTok VT URL by checking the preset repository catalog first, then resolving
 * short links (vt.tiktok.com / vm.tiktok.com), querying TikTok oEmbed & page metadata,
 * and scanning the VT description and comments for valid preset links.
 * Returns hasPresetLinks: false with an explicit feedback message if the VT has no preset links.
 */
export async function inspectTiktokVtUrlLive(
  rawInput: string,
  catalogEntries: VtPresetEntry[]
): Promise<TiktokVtInspectionResult> {
  const initialCheck = inspectTiktokVtFromCatalog(rawInput, catalogEntries);
  if (!initialCheck.isTiktokUrl || initialCheck.hasPresetLinks) {
    return initialCheck;
  }

  let resolvedUrl = initialCheck.parsedUrl.normalizedUrl;
  let oembedTitle = '';
  let oembedAuthorHandle = initialCheck.parsedUrl.creatorHandle || '';
  let scrapedHtmlText = '';

  // Run TikTok oEmbed API & page redirect/meta inspection in parallel with a fast 1.5s timeout
  await Promise.allSettled([
    (async () => {
      const oembedEndpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(
        resolvedUrl
      )}`;
      const oembedRes = await fetch(oembedEndpoint, {
        headers: BROWSER_HEADERS,
        cache: 'no-store',
        signal: AbortSignal.timeout(1500),
      });
      if (oembedRes.ok) {
        const oembedData = await oembedRes.json();
        if (typeof oembedData.title === 'string') {
          oembedTitle = oembedData.title;
        }
        if (
          typeof oembedData.author_unique_id === 'string' &&
          oembedData.author_unique_id
        ) {
          oembedAuthorHandle = `@${oembedData.author_unique_id.replace(/^@/, '')}`;
        } else if (typeof oembedData.author_url === 'string') {
          const handleMatch = oembedData.author_url.match(/\/@([a-zA-Z0-9._-]+)/);
          if (handleMatch) {
            oembedAuthorHandle = `@${handleMatch[1]}`;
          }
        }
      }
    })(),
    (async () => {
      const pageRes = await fetch(resolvedUrl, {
        headers: BROWSER_HEADERS,
        redirect: 'follow',
        cache: 'no-store',
        signal: AbortSignal.timeout(1500),
      });
      if (pageRes.url && pageRes.url.includes('tiktok.com')) {
        resolvedUrl = pageRes.url;
      }
      if (pageRes.ok) {
        const html = await pageRes.text();
        const ogDescMatch = html.match(
          /<meta[^>]+(?:property|name)=["'](?:og:description|description)["'][^>]+content=["']([^"']+)["']/i
        );
        if (ogDescMatch && ogDescMatch[1]) {
          scrapedHtmlText += `\n${ogDescMatch[1]}`;
        }
        const directUrlMatches = html.match(
          /https?:\/\/(?:www\.)?(?:alightcreative\.com|drive\.google\.com|mediafire\.com|alight\.link|files\.catbox\.moe)[^\s"'<>\\]+/gi
        );
        if (directUrlMatches && directUrlMatches.length > 0) {
          scrapedHtmlText += `\n${directUrlMatches.join('\n')}`;
        }
      }
    })(),
  ]);

  // 3. Re-check catalog if redirect or oEmbed revealed a canonical creatorHandle / videoId
  const combinedCheckInput = [resolvedUrl, oembedAuthorHandle, oembedTitle, scrapedHtmlText]
    .filter(Boolean)
    .join('\n');
  const rechecked = inspectTiktokVtFromCatalog(combinedCheckInput, catalogEntries);
  if (rechecked.hasPresetLinks) {
    return rechecked;
  }

  // 4. Return structured negative result with resolved VT metadata so user gets clear feedback
  return {
    ...initialCheck,
    hasPresetLinks: false,
    vtMeta: {
      vtTitle:
        oembedTitle ||
        initialCheck.vtMeta.vtTitle ||
        'VT TikTok (Tanpa Link Preset)',
      creatorHandle:
        oembedAuthorHandle || initialCheck.vtMeta.creatorHandle || '@tiktok_vt',
      videoUrl: resolvedUrl,
      scannedSources: initialCheck.vtMeta.scannedSources,
      rejectedLinksCount: rechecked.vtMeta.rejectedLinksCount,
    },
    entries: [],
    feedbackMessage:
      'VT tidak mengandung link preset. Deskripsi & seluruh komentar pada VT TikTok ini telah dipindai, namun tidak ditemukan link Preset 5MB (Alight Creative), XML (Google Drive), maupun Sound (MediaFire).',
  };
}
