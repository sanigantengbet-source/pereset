import {NextRequest, NextResponse} from 'next/server';
import {
  extractPresetLinksFromText,
  filterAndSortVtEntries,
  detectPresetCategory,
  parseTiktokVtUrl,
  type PlatformType,
  type PresetLinkType,
  type PresetCategoryType,
  type VtPresetEntry,
} from '@/lib/preset-filter';
import {getSeedVtEntries, getTrendingSeedVtEntries} from '@/lib/preset-seed-data';
import {scrapeLivePresetsForSound, inspectTiktokVtUrlLive} from '@/lib/live-scraper';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const {searchParams} = new URL(req.url);
  const query = (searchParams.get('q') || '').trim();
  const platform = (searchParams.get('platform') || 'all') as 'all' | PlatformType;
  const linkType = (searchParams.get('linkType') || 'all') as 'all' | PresetLinkType;
  const category = (searchParams.get('category') || 'all') as 'all' | PresetCategoryType;
  const sortBy = (searchParams.get('sortBy') || 'likes') as 'likes' | 'views' | 'links';
  const skipLive = searchParams.get('skipLive') === '1';

  const parsedVt = parseTiktokVtUrl(query);

  // Branch 1: Search by TikTok VT URL
  if (parsedVt.isTiktokUrl) {
    const allCatalogEntries = getTrendingSeedVtEntries();
    const vtInspection = await inspectTiktokVtUrlLive(query, allCatalogEntries);

    const filteredVtResults = filterAndSortVtEntries(vtInspection.entries, {
      query: '',
      platform,
      linkType,
      category,
      sortBy,
    });

    return NextResponse.json({
      query,
      isTiktokVtQuery: true,
      vtInspection,
      totalVtCount: filteredVtResults.length,
      totalFilteredLinksCount: filteredVtResults.reduce(
        (acc, e) => acc + e.links.length,
        0
      ),
      entries: filteredVtResults,
    });
  }

  // Branch 2: Standard Search by Sound Name / Keyword
  const seedEntries = getSeedVtEntries();
  const matchedSeed = filterAndSortVtEntries(seedEntries, {
    query,
    platform: 'all',
    linkType: 'all',
    category: 'all',
    sortBy,
  });

  // Always scrape live preset videos for the user's sound query unless explicitly skipped
  let liveEntries: VtPresetEntry[] = [];
  if (!skipLive && query) {
    liveEntries = await scrapeLivePresetsForSound(query);
  }

  // Merge and deduplicate by youtubeUrl or ID so there are no duplicate videos, with NO limit on count
  const seenKeys = new Set<string>();
  const combined: VtPresetEntry[] = [];

  for (const item of [...matchedSeed, ...liveEntries]) {
    const dedupKey = item.youtubeUrl || item.videoUrl || item.id;
    if (seenKeys.has(dedupKey)) continue;
    seenKeys.add(dedupKey);
    combined.push(item);
  }

  const finalResults = filterAndSortVtEntries(combined, {
    query: '', // Already matched query above
    platform,
    linkType,
    category,
    sortBy,
  });

  return NextResponse.json({
    query,
    isTiktokVtQuery: false,
    totalVtCount: finalResults.length,
    totalFilteredLinksCount: finalResults.reduce((acc, e) => acc + e.links.length, 0),
    entries: finalResults,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawText = String(body.rawText || '');
    const vtTitle = String(body.vtTitle || 'VT Ekstraksi Manual').trim();
    const soundName = String(body.soundName || 'Custom Sound').trim();
    const creatorHandle = String(body.creatorHandle || '@creator.am').trim();
    const platform: PlatformType =
      body.platform === 'youtube' ? 'youtube' : 'tiktok';

    if (!rawText.trim()) {
      return NextResponse.json(
        {error: 'Teks deskripsi atau komentar tidak boleh kosong.'},
        {status: 400}
      );
    }

    const entryId = `custom-${Date.now()}`;
    const {links, rejectedUrls} = extractPresetLinksFromText(rawText, entryId);

    const normalizedHandle = creatorHandle.startsWith('@')
      ? creatorHandle
      : `@${creatorHandle}`;
    const defaultTiktokUrl = `https://www.tiktok.com/${normalizedHandle}`;
    const defaultYoutubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      `preset am ${soundName}`
    )}`;

    const entry: VtPresetEntry = {
      id: entryId,
      vtTitle,
      soundName,
      creatorHandle: normalizedHandle,
      creatorName: normalizedHandle.replace(/^@/, ''),
      platform,
      category: detectPresetCategory({vtTitle, soundName, rawText}),
      sourceLocation: 'pinned_comment',
      videoUrl:
        String(body.videoUrl || '').trim() ||
        (platform === 'tiktok' ? defaultTiktokUrl : defaultYoutubeUrl),
      tiktokUrl: defaultTiktokUrl,
      youtubeUrl: defaultYoutubeUrl,
      likesCount: Number(body.likesCount) || 12500,
      viewsCount: Number(body.viewsCount) || 89000,
      commentsCount: Number(body.commentsCount) || 140,
      publishedAt: 'Baru diekstrak',
      rawText,
      links,
      rejectedLinksCount: rejectedUrls.length,
    };

    return NextResponse.json({
      entry,
      links,
      rejectedUrls,
    });
  } catch {
    return NextResponse.json(
      {error: 'Gagal memproses ekstraksi link preset.'},
      {status: 500}
    );
  }
}
