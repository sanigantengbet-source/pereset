import {NextRequest, NextResponse} from 'next/server';
import {type VtPresetEntry} from '@/lib/preset-filter';
import {getTrendingByTopic, shuffleEntries} from '@/lib/preset-seed-data';
import {scrapeTrendingPresets} from '@/lib/live-scraper';

export async function GET(req: NextRequest) {
  const {searchParams} = new URL(req.url);
  const category = (searchParams.get('category') || 'all').toLowerCase();

  const filteredSeed = getTrendingByTopic(category, true);

  // Live scrape real-time trending presets in parallel
  let liveTrending: VtPresetEntry[] = [];
  try {
    const rawLive = await scrapeTrendingPresets(category);
    if (category !== 'kicau') {
      // Ensure non-kicau topics aren't polluted by cached kicau items
      liveTrending = rawLive.filter(
        (item) => !/kicau/i.test(`${item.vtTitle} ${item.soundName}`)
      );
    } else {
      liveTrending = rawLive;
    }
  } catch {
    liveTrending = [];
  }

  // Merge and deduplicate by YouTube videoUrl or first preset link URL
  const seenKeys = new Set<string>();
  const merged: VtPresetEntry[] = [];

  for (const item of [...filteredSeed, ...liveTrending]) {
    const firstUrl = item.links[0]?.url || '';
    const key = `${item.id}::${firstUrl}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    merged.push(item);
  }

  // Keep diverse non-Kicau trending presets shuffled at the top on 'all' so Beranda never gets stuck on Kicau Mania
  let randomizedTrending: VtPresetEntry[];
  if (category === 'all') {
    const nonKicau = merged.filter(
      (item) => !/kicau/i.test(`${item.vtTitle} ${item.soundName}`)
    );
    const kicau = merged.filter((item) =>
      /kicau/i.test(`${item.vtTitle} ${item.soundName}`)
    );
    randomizedTrending = [...shuffleEntries(nonKicau), ...shuffleEntries(kicau)];
  } else {
    randomizedTrending = shuffleEntries(merged);
  }

  return NextResponse.json({
    category,
    totalCount: randomizedTrending.length,
    liveCount: liveTrending.length,
    updatedAt: new Date().toISOString(),
    entries: randomizedTrending,
  });
}

