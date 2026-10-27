'use client';

import React, {useState, useEffect, useMemo, useCallback, useRef} from 'react';
import Image from 'next/image';
import {
  Search,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Copy,
  Check,
  Heart,
  Eye,
  MessageSquare,
  FileCode2,
  Share2,
  Music,
  SlidersHorizontal,
  Download,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  Flame,
  Play,
  Radio,
  BookMarked,
  Layers,
  Sparkles,
  ArrowRight,
  Link2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import {
  summarizePresetLinks,
  filterAndSortVtEntries,
  detectPresetCategory,
  getPresetCategoryMeta,
  parseTiktokVtUrl,
  inspectTiktokVtFromCatalog,
  type TiktokVtInspectionResult,
  type PlatformType,
  type PresetLinkType,
  type PresetCategoryType,
  type VtPresetEntry,
} from '@/lib/preset-filter';
import {
  getSeedVtEntries,
  getTrendingSeedVtEntries,
  getTrendingByTopic,
} from '@/lib/preset-seed-data';
import {VtDetailModal} from './vt-detail-modal';
import {ManualExtractorModal} from './manual-extractor-modal';
import {VtCardSkeletonGrid} from './vt-card-skeleton';

const STORAGE_KEY_SAVED = 'presetfinder_saved_vt_v2';

const POPULAR_SOUND_SUGGESTIONS = [
  'kicau mania',
  'preman pensiun',
  'muka dua',
  'ndarboy',
  'kane',
  'velocity',
];

const PRESET_CATEGORIES: Array<{
  id: 'all' | PresetCategoryType;
  label: string;
  shortLabel: string;
  dotColor: string;
}> = [
  {id: 'all', label: 'Semua Kategori', shortLabel: 'Semua', dotColor: '#111111'},
  {id: 'jj_presets', label: 'JJ Presets', shortLabel: 'JJ Presets', dotColor: '#F7B91C'},
  {id: 'cinematic', label: 'Cinematic', shortLabel: 'Cinematic', dotColor: '#F25C05'},
  {id: 'color_grading', label: 'Color Grading', shortLabel: 'Color Grading', dotColor: '#F7B91C'},
  {id: 'velocity', label: 'Velocity & Slowmo', shortLabel: 'Velocity', dotColor: '#111111'},
  {id: 'gameplay', label: 'Gameplay ML/FF', shortLabel: 'Gameplay', dotColor: '#F25C05'},
];

const TRENDING_CATEGORIES = [
  {id: 'all', label: 'Semua Tren FYP'},
  {id: 'kicau', label: 'Kicau Mania'},
  {id: 'kane', label: 'JJ Kane'},
  {id: 'velocity', label: 'Velocity'},
  {id: 'gameplay', label: 'MLBB & FF'},
] as const;

function buildRepoSlug(entry: VtPresetEntry): string {
  const base = entry.soundName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
  return base || 'am-preset-pack';
}

/**
 * Custom Neobrutalist Vector Illustration matching the Yellow/Black/Checkerboard graphic style in IMG_1220.jpeg
 */
function NeobrutalistHeroIllustration() {
  return (
    <svg
      viewBox="0 0 280 135"
      className="w-56 sm:w-64 h-auto shrink-0 select-none"
      aria-hidden="true"
    >
      {/* Background City / Studio Equalizer Silhouette (like the light gray skyline in IMG_1220.jpeg) */}
      <rect x="28" y="22" width="26" height="88" fill="#E5E3DC" />
      <rect x="60" y="8" width="32" height="102" fill="#E5E3DC" />
      <rect x="98" y="34" width="24" height="76" fill="#E5E3DC" />
      <rect x="128" y="16" width="36" height="94" fill="#E5E3DC" />
      <rect x="170" y="28" width="28" height="82" fill="#E5E3DC" />
      <rect x="204" y="14" width="30" height="96" fill="#E5E3DC" />

      {/* Ground Shadow & Road Line */}
      <ellipse cx="142" cy="118" rx="116" ry="8" fill="#111111" />
      <line x1="10" y1="118" x2="270" y2="118" stroke="#111111" strokeWidth="3" />

      {/* Top Roof Sign ("AM 5MB" like "TAXI" roof badge in IMG_1220.jpeg) */}
      <rect
        x="114"
        y="30"
        width="54"
        height="16"
        fill="#111111"
        stroke="#111111"
        strokeWidth="2.5"
      />
      <text
        x="141"
        y="41.5"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="9.5"
        fontWeight="800"
        fontFamily="monospace"
        letterSpacing="1"
      >
        AM·XML
      </text>

      {/* Upper Cabin Frame */}
      <path
        d="M68 74 L90 46 L192 46 L214 74 Z"
        fill="#F7B91C"
        stroke="#111111"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Cabin Windows */}
      <path
        d="M78 71 L94 51 L136 51 L136 71 Z"
        fill="#FFFFFF"
        stroke="#111111"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M144 71 L144 51 L186 51 L202 71 Z"
        fill="#FFFFFF"
        stroke="#111111"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Main Cruiser Body in Taxi Yellow (#F7B91C) */}
      <rect
        x="34"
        y="74"
        width="214"
        height="34"
        rx="4"
        fill="#F7B91C"
        stroke="#111111"
        strokeWidth="3"
      />

      {/* Checkerboard Racing / Taxi Stripe across the side */}
      <g>
        {Array.from({length: 14}).map((_, i) => (
          <React.Fragment key={i}>
            <rect
              x={56 + i * 12}
              y={84}
              width="6"
              height="5"
              fill={i % 2 === 0 ? '#111111' : '#FFFFFF'}
            />
            <rect
              x={56 + i * 12}
              y={89}
              width="6"
              height="5"
              fill={i % 2 === 0 ? '#FFFFFF' : '#111111'}
            />
          </React.Fragment>
        ))}
        <rect
          x="56"
          y="84"
          width="168"
          height="10"
          fill="none"
          stroke="#111111"
          strokeWidth="1.5"
        />
      </g>

      {/* Front Grille & Headlights */}
      <rect
        x="30"
        y="80"
        width="10"
        height="12"
        fill="#FFFFFF"
        stroke="#111111"
        strokeWidth="2.5"
      />
      <rect
        x="240"
        y="80"
        width="10"
        height="12"
        fill="#F25C05"
        stroke="#111111"
        strokeWidth="2.5"
      />

      {/* Bumpers */}
      <rect
        x="24"
        y="98"
        width="22"
        height="8"
        fill="#FFFFFF"
        stroke="#111111"
        strokeWidth="2.5"
      />
      <rect
        x="236"
        y="98"
        width="20"
        height="8"
        fill="#FFFFFF"
        stroke="#111111"
        strokeWidth="2.5"
      />

      {/* Wheels with Keyframe Diamond Centers */}
      <circle cx="82" cy="108" r="14" fill="#111111" />
      <circle cx="82" cy="108" r="7" fill="#FFFFFF" />
      <rect
        x="79"
        y="105"
        width="6"
        height="6"
        transform="rotate(45 82 108)"
        fill="#F25C05"
      />

      <circle cx="202" cy="108" r="14" fill="#111111" />
      <circle cx="202" cy="108" r="7" fill="#FFFFFF" />
      <rect
        x="199"
        y="105"
        width="6"
        height="6"
        transform="rotate(45 202 108)"
        fill="#F25C05"
      />
    </svg>
  );
}

/**
 * Creator Profile Avatar (Displays a distinct YouTube Channel or TikTok Creator Profile Avatar
 * for each account handle with platform badge and @handle tag, matching the Neobrutalist portrait style)
 */
function CreatorProfileAvatar({
  entry,
  profileHref,
}: {
  entry: VtPresetEntry;
  profileHref: string;
}) {
  const cleanHandle = entry.creatorHandle.replace(/^@/, '').trim() || 'creator';

  // Deterministic seed from creator handle so each creator has their own unique profile look
  let hash = 0;
  for (let i = 0; i < cleanHandle.length; i++) {
    hash = (hash * 31 + cleanHandle.charCodeAt(i)) | 0;
  }
  const absHash = Math.abs(hash);
  const bgPalette = ['#FFE066', '#FFD2B3', '#C3F0CA', '#CDE4FF', '#F3D9FA', '#F7B91C'];
  const shirtPalette = ['#F25C05', '#111111', '#2563EB', '#16A34A', '#D97706', '#DC2626'];
  const skinPalette = ['#FFDFC4', '#F0C8A0', '#FFDCB1', '#E8B88A'];
  const bgColor = bgPalette[absHash % bgPalette.length];
  const shirtColor = shirtPalette[(absHash >> 2) % shirtPalette.length];
  const skinColor = skinPalette[(absHash >> 4) % skinPalette.length];
  const styleVariant = absHash % 4; // 0: headphones, 1: visor cap + glasses, 2: spiky hair, 3: beanie + mic

  return (
    <a
      href={profileHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Profil ${entry.platform === 'tiktok' ? 'TikTok' : 'YouTube'} @${cleanHandle}`}
      title={`Buka profil ${entry.platform === 'tiktok' ? 'TikTok' : 'YouTube'} @${cleanHandle}`}
      className="group relative w-16 h-[72px] sm:w-[74px] sm:h-[78px] border-2 border-[#111111] bg-white shadow-[3px_3px_0px_#111111] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#111111] transition-all flex flex-col justify-between overflow-hidden shrink-0"
    >
      {/* Top-right Platform Badge (YT / TT) */}
      <span
        className={`absolute top-0 right-0 z-10 px-1 py-0.5 text-[9px] font-mono font-extrabold uppercase leading-none border-b-2 border-l-2 border-[#111111] ${
          entry.platform === 'tiktok'
            ? 'bg-[#111111] text-[#F7B91C]'
            : 'bg-[#F25C05] text-white'
        }`}
      >
        {entry.platform === 'tiktok' ? 'TT' : 'YT'}
      </span>

      {/* Creator Portrait Avatar Canvas */}
      <div
        className="w-full flex-1 relative flex items-end justify-center overflow-hidden"
        style={{backgroundColor: bgColor}}
      >
        <svg
          viewBox="0 0 64 54"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Subtle halftone / ring backdrop */}
          <circle
            cx="32"
            cy="26"
            r="21"
            fill="#FFFFFF"
            fillOpacity="0.55"
            stroke="#111111"
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />

          {/* Shoulders / Creator Hoodie or Jacket */}
          <path
            d="M8 54 C9 38, 55 38, 56 54 Z"
            fill={shirtColor}
            stroke="#111111"
            strokeWidth="2.5"
          />
          {/* Hoodie V-neck / Collar detail */}
          <polygon
            points="25,40 32,49 39,40"
            fill="#FFFFFF"
            stroke="#111111"
            strokeWidth="2"
          />

          {/* Neck */}
          <rect
            x="27"
            y="32"
            width="10"
            height="9"
            fill={skinColor}
            stroke="#111111"
            strokeWidth="2"
          />

          {/* Studio Headphones Arc (Variant 0 or 3) */}
          {(styleVariant === 0 || styleVariant === 3) && (
            <>
              <path
                d="M16 25 C16 8, 48 8, 48 25"
                fill="none"
                stroke="#111111"
                strokeWidth="3"
              />
              <rect
                x="12"
                y="20"
                width="6"
                height="11"
                rx="2"
                fill="#F7B91C"
                stroke="#111111"
                strokeWidth="2"
              />
              <rect
                x="46"
                y="20"
                width="6"
                height="11"
                rx="2"
                fill="#F7B91C"
                stroke="#111111"
                strokeWidth="2"
              />
            </>
          )}

          {/* Face / Head */}
          <circle
            cx="32"
            cy="24"
            r="12.5"
            fill={skinColor}
            stroke="#111111"
            strokeWidth="2.5"
          />

          {/* Hair / Cap Variants */}
          {styleVariant === 1 ? (
            /* Streetwear Cap */
            <>
              <path
                d="M19 20 C19 9, 45 9, 45 20 Z"
                fill="#111111"
                stroke="#111111"
                strokeWidth="1.5"
              />
              <path
                d="M18 19 L50 19 L48 22 L18 22 Z"
                fill="#F25C05"
                stroke="#111111"
                strokeWidth="2"
              />
            </>
          ) : styleVariant === 2 ? (
            /* Creator Messy / Spiky Hair */
            <path
              d="M18 22 C17 12, 25 8, 32 10 C39 8, 47 12, 46 22 C42 17, 36 16, 32 17 C27 16, 22 17, 18 22 Z"
              fill="#111111"
            />
          ) : (
            /* Clean Modern Parted Hair */
            <path
              d="M19 22 C19 10, 45 10, 45 22 C41 16, 24 15, 19 22 Z"
              fill="#111111"
            />
          )}

          {/* Glasses on Variant 1 & 2 */}
          {styleVariant === 1 || styleVariant === 2 ? (
            <g>
              <rect
                x="22.5"
                y="21.5"
                width="7.5"
                height="5.5"
                fill="#FFFFFF"
                stroke="#111111"
                strokeWidth="2"
              />
              <rect
                x="34"
                y="21.5"
                width="7.5"
                height="5.5"
                fill="#FFFFFF"
                stroke="#111111"
                strokeWidth="2"
              />
              <line x1="30" y1="24" x2="34" y2="24" stroke="#111111" strokeWidth="2" />
            </g>
          ) : (
            <>
              <circle cx="27.5" cy="24.5" r="1.7" fill="#111111" />
              <circle cx="36.5" cy="24.5" r="1.7" fill="#111111" />
            </>
          )}

          {/* Confident Creator Smile */}
          <path
            d="M28 30.5 Q32 33.5 36 30.5"
            fill="none"
            stroke="#111111"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Bottom Creator @Handle Strip */}
      <span className="w-full text-center bg-[#111111] group-hover:bg-[#F25C05] text-white font-mono text-[9.5px] font-bold tracking-tight leading-tight py-1 px-1 truncate border-t-2 border-[#111111] transition-colors">
        @{cleanHandle}
      </span>
    </a>
  );
}

export function PresetFinderWorkspace() {
  const initialSearchEntries = useMemo(() => getSeedVtEntries(), []);
  const allCatalogEntries = useMemo(() => getTrendingSeedVtEntries(), []);
  const initialTrendingEntries = useMemo(() => getTrendingByTopic('all', false), []);

  // Separate Beranda (Trending Realtime), Pencarian (Search), and Tersimpan (Saved)
  const [activeView, setActiveView] = useState<'beranda' | 'search' | 'saved'>('beranda');

  // Search & Filter state
  const [searchInput, setSearchInput] = useState('kicau mania');
  const [activeQuery, setActiveQuery] = useState('kicau mania');
  const [vtLinkInput, setVtLinkInput] = useState('');
  const [vtInspectionResult, setVtInspectionResult] =
    useState<TiktokVtInspectionResult | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | PresetCategoryType>('all');
  const [platformFilter, setPlatformFilter] = useState<'all' | PlatformType>('all');
  const [linkTypeFilter, setLinkTypeFilter] = useState<'all' | PresetLinkType>('all');
  const [sortBy, setSortBy] = useState<'likes' | 'views' | 'links'>('likes');
  const [entries, setEntries] = useState<VtPresetEntry[]>(initialSearchEntries);
  const [isLoading, setIsLoading] = useState(false);

  // Realtime Trending Beranda state
  const [trendingCategory, setTrendingCategory] = useState<string>('all');
  const [trendingEntries, setTrendingEntries] = useState<VtPresetEntry[]>(
    initialTrendingEntries
  );
  const [isTrendingLoading, setIsTrendingLoading] = useState(false);
  const [lastTrendingSync, setLastTrendingSync] = useState<string>('Baru saja');
  const [isAutoRealtime, setIsAutoRealtime] = useState<boolean>(true);

  // Saved & Modal state
  const [savedEntries, setSavedEntries] = useState<VtPresetEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<VtPresetEntry | null>(null);
  const [isExtractorOpen, setIsExtractorOpen] = useState(false);
  const [copiedLinkKey, setCopiedLinkKey] = useState<string | null>(null);
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});

  // Load saved VT list from localStorage on mount & randomize Beranda trending order
  useEffect(() => {
    setTrendingEntries(getTrendingByTopic('all', true));
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_SAVED);
      if (raw) {
        const parsed = JSON.parse(raw) as VtPresetEntry[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedEntries(parsed);
          return;
        }
      }
      const defaultSaved = initialSearchEntries.slice(0, 3);
      setSavedEntries(defaultSaved);
      window.localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(defaultSaved));
    } catch {
      // Ignore storage errors
    }
  }, [initialSearchEntries]);

  const trendingReqIdRef = useRef(0);

  // Fetch Realtime Trending Presets
  const fetchTrendingRealtime = useCallback(
    async (categoryToFetch: string, showSkeleton = true) => {
      const reqId = ++trendingReqIdRef.current;
      if (showSkeleton) {
        setIsTrendingLoading(true);
      }
      // Immediately set topic-filtered & randomized local entries
      setTrendingEntries(getTrendingByTopic(categoryToFetch, true));
      if (showSkeleton) {
        setTimeout(() => {
          if (reqId === trendingReqIdRef.current) {
            setIsTrendingLoading(false);
          }
        }, 180);
      }
      try {
        const params = new URLSearchParams({category: categoryToFetch});
        const res = await fetch(`/api/trending?${params.toString()}`);
        if (reqId !== trendingReqIdRef.current) return;
        if (res.ok) {
          const data = await res.json();
          if (reqId !== trendingReqIdRef.current) return;
          if (Array.isArray(data.entries) && data.entries.length > 0) {
            setTrendingEntries(data.entries);
          }
          const now = new Date();
          setLastTrendingSync(
            now.toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          );
        }
      } catch {
        // Fallback to local trending seed filter if offline
      } finally {
        if (showSkeleton && reqId === trendingReqIdRef.current) {
          setIsTrendingLoading(false);
        }
      }
    },
    []
  );

  // 45s realtime polling when on Beranda
  useEffect(() => {
    if (activeView !== 'beranda' || !isAutoRealtime) return;
    const interval = setInterval(() => {
      fetchTrendingRealtime(trendingCategory, false);
    }, 45000);
    return () => clearInterval(interval);
  }, [activeView, isAutoRealtime, trendingCategory, fetchTrendingRealtime]);

  const handleSelectTrendingCategory = (catId: string) => {
    setTrendingCategory(catId);
    setCategoryFilter('all');
    fetchTrendingRealtime(catId, true);
  };

  const handleSelectSidebarCategory = (catId: 'all' | PresetCategoryType) => {
    setCategoryFilter(catId);
    if (activeView === 'beranda' && catId !== 'all' && trendingCategory !== 'all') {
      setTrendingCategory('all');
      fetchTrendingRealtime('all', false);
    }
  };

  const persistSavedEntries = (nextSaved: VtPresetEntry[]) => {
    setSavedEntries(nextSaved);
    try {
      window.localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(nextSaved));
    } catch {
      // Ignore storage errors
    }
  };

  const handleToggleSave = (entry: VtPresetEntry) => {
    const exists = savedEntries.some((s) => s.id === entry.id);
    if (exists) {
      persistSavedEntries(savedEntries.filter((s) => s.id !== entry.id));
    } else {
      persistSavedEntries([entry, ...savedEntries]);
    }
  };

  const toggleExpandCard = (entryId: string) => {
    setExpandedCardIds((prev) => ({
      ...prev,
      [entryId]: !prev[entryId],
    }));
  };

  const executeTiktokVtLinkScan = async (rawVtUrl: string) => {
    const trimmed = rawVtUrl.trim();
    if (!trimmed) return;

    setVtLinkInput(trimmed);
    setActiveView('search');
    setCategoryFilter('all');
    setPlatformFilter('all');
    setLinkTypeFilter('all');
    setIsLoading(true);
    const startedAt = Date.now();

    // Immediate client-side catalog & inline text check
    const localInspection = inspectTiktokVtFromCatalog(trimmed, allCatalogEntries);
    setVtInspectionResult(localInspection);
    setActiveQuery('');
    setEntries(localInspection.entries);

    if (localInspection.isTiktokUrl) {
      try {
        const params = new URLSearchParams({
          q: trimmed,
          platform: 'all',
          linkType: 'all',
          category: 'all',
          sortBy,
        });
        const res = await fetch(`/api/search?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.vtInspection) {
            setVtInspectionResult(data.vtInspection);
            setEntries(
              Array.isArray(data.vtInspection.entries)
                ? data.vtInspection.entries
                : []
            );
          }
        }
      } catch {
        // Keep localInspection fallback if offline
      }
    }

    const elapsed = Date.now() - startedAt;
    const remainingDelay = Math.max(0, 280 - elapsed);
    setTimeout(() => setIsLoading(false), remainingDelay);
  };

  const handleVtLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeTiktokVtLinkScan(vtLinkInput);
  };

  const handleClearVtLinkScan = () => {
    setVtLinkInput('');
    setVtInspectionResult(null);
    setCategoryFilter('all');
    setPlatformFilter('all');
    setLinkTypeFilter('all');
    setSearchInput('kicau mania');
    setActiveQuery('kicau mania');
    setEntries(initialSearchEntries);
  };

  const executeSearch = async (queryToRun: string) => {
    const trimmed = queryToRun.trim();

    // Automatically route TikTok VT links pasted in the main search input to the VT link scanner
    if (parseTiktokVtUrl(trimmed).isTiktokUrl) {
      await executeTiktokVtLinkScan(trimmed);
      return;
    }

    setVtInspectionResult(null);
    setActiveQuery(trimmed);
    setActiveView('search');
    setEntries(initialSearchEntries);
    setIsLoading(true);
    const startedAt = Date.now();

    try {
      const params = new URLSearchParams({
        q: trimmed,
        platform: 'all',
        linkType: 'all',
        category: 'all',
        sortBy,
      });
      const res = await fetch(`/api/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.entries) && data.entries.length > 0) {
          setEntries(data.entries);
        }
      }
    } catch {
      // Fallback to local filter if offline
    } finally {
      const elapsed = Date.now() - startedAt;
      const remainingDelay = Math.max(0, 450 - elapsed);
      setTimeout(() => setIsLoading(false), remainingDelay);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchInput);
  };

  // Base list before category filter so we can compute accurate per-category counts in the sidebar
  const baseSourceBeforeCategory = useMemo(() => {
    if (activeView === 'beranda') {
      // Preserve randomized trending order on Beranda while applying platform & linkType filters
      return trendingEntries.filter((entry) => {
        if (platformFilter !== 'all' && entry.platform !== platformFilter) {
          return false;
        }
        if (linkTypeFilter !== 'all') {
          const hasLinkType = entry.links.some((l) => l.type === linkTypeFilter);
          if (!hasLinkType) return false;
        }
        return true;
      });
    }

    const rawSource = activeView === 'saved' ? savedEntries : entries;
    return filterAndSortVtEntries(rawSource, {
      query: activeView === 'search' ? activeQuery : '',
      platform: platformFilter,
      linkType: linkTypeFilter,
      category: 'all',
      sortBy,
    });
  }, [
    activeView,
    trendingEntries,
    savedEntries,
    entries,
    activeQuery,
    platformFilter,
    linkTypeFilter,
    sortBy,
  ]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: baseSourceBeforeCategory.length,
      jj_presets: 0,
      cinematic: 0,
      color_grading: 0,
      velocity: 0,
      gameplay: 0,
    };
    for (const item of baseSourceBeforeCategory) {
      const cat = detectPresetCategory(item);
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [baseSourceBeforeCategory]);

  const activeList = useMemo(() => {
    if (categoryFilter === 'all') return baseSourceBeforeCategory;
    return baseSourceBeforeCategory.filter(
      (item) => detectPresetCategory(item) === categoryFilter
    );
  }, [baseSourceBeforeCategory, categoryFilter]);

  const totalFilteredLinks = useMemo(
    () => activeList.reduce((acc, item) => acc + item.links.length, 0),
    [activeList]
  );

  const handleQuickCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedLinkKey(key);
    setTimeout(() => setCopiedLinkKey(null), 1600);
  };

  const handleExportSavedJson = () => {
    const targetList = activeView === 'saved' ? savedEntries : activeList;
    const blob = new Blob([JSON.stringify(targetList, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daftar-preset-${(activeQuery || 'trending').replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddManualEntry = (newEntry: VtPresetEntry) => {
    setEntries((prev) => [newEntry, ...prev]);
    setTrendingEntries((prev) => [newEntry, ...prev]);
    persistSavedEntries([newEntry, ...savedEntries]);
    setSelectedEntry(newEntry);
  };

  const isGridBusy =
    (activeView === 'beranda' && isTrendingLoading) ||
    (activeView === 'search' && isLoading);

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F5F0] text-[#111111]">
      {/* Top Bar Contract: 3 Zones separated by gap-8 (Neobrutalist Crisp White & Black Header) */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-8 py-3 bg-white border-b-2 border-[#111111]">
        {/* Zone 1: Official Alight Motion Logo + Brand Name */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveView('beranda');
          }}
          className="flex items-center gap-2.5 text-lg sm:text-xl font-extrabold uppercase tracking-tight text-[#111111] whitespace-nowrap shrink-0"
          style={{fontFamily: 'var(--font-display), sans-serif'}}
        >
          <Image
            src="/assets/alight-motion-logo.jpg"
            alt="Alight Motion Logo"
            width={30}
            height={30}
            referrerPolicy="no-referrer"
            className="border-2 border-[#111111] shadow-[2px_2px_0px_#F7B91C] shrink-0"
          />
          <span>PresetFinder Studio</span>
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav
          aria-label="Navigasi Utama"
          className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-bold text-[#111111]/75"
        >
          <button
            type="button"
            onClick={() => setActiveView('beranda')}
            className={`hover:text-[#111111] transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'beranda'
                ? 'text-[#111111] underline underline-offset-8 decoration-4 decoration-[#F25C05] font-extrabold'
                : ''
            }`}
          >
            Beranda Trending ({trendingEntries.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveView('search')}
            className={`hover:text-[#111111] transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'search'
                ? 'text-[#111111] underline underline-offset-8 decoration-4 decoration-[#F25C05] font-extrabold'
                : ''
            }`}
          >
            Pencarian Sound ({entries.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveView('saved')}
            className={`hover:text-[#111111] transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'saved'
                ? 'text-[#111111] underline underline-offset-8 decoration-4 decoration-[#F25C05] font-extrabold'
                : ''
            }`}
          >
            Tersimpan ({savedEntries.length})
          </button>
          <a
            href="#filter-rules"
            className="hover:text-[#111111] transition-colors whitespace-nowrap shrink-0"
          >
            Dokumentasi XML
          </a>
        </nav>

        {/* Zone 3: Quick Search Jump (Split Neobrutalist Button) */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() =>
              setActiveView(activeView === 'search' ? 'beranda' : 'search')
            }
            className="inline-flex items-stretch border-2 border-[#111111] shadow-[3px_3px_0px_#111111] bg-[#F7B91C] hover:bg-[#e8ab12] text-[#111111] transition-transform active:translate-x-0.5 active:translate-y-0.5 whitespace-nowrap shrink-0"
          >
            <span
              className="px-3 py-1.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center gap-1.5"
              style={{fontFamily: 'var(--font-display), sans-serif'}}
            >
              {activeView === 'search' ? (
                <>
                  <Flame className="w-3.5 h-3.5 text-[#F25C05] fill-[#F25C05]" />
                  <span>Ke Beranda Tren</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Cari Sound VT</span>
                </>
              )}
            </span>
            <span className="px-2 bg-[#111111] text-white flex items-center justify-center border-l-2 border-[#111111]">
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main
        id="top"
        className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-5"
      >
        {/* Neobrutalist Tab Switcher Bar */}
        <div className="bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] p-1.5">
          <div
            role="tablist"
            aria-label="Pilih Halaman Utama"
            className="grid grid-cols-3 gap-1.5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'beranda'}
              onClick={() => setActiveView('beranda')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider border-2 transition-colors whitespace-nowrap ${
                activeView === 'beranda'
                  ? 'bg-[#F7B91C] text-[#111111] border-[#111111] shadow-[2px_2px_0px_#111111]'
                  : 'bg-[#F6F5F0] text-[#111111]/75 border-transparent hover:border-[#111111] hover:text-[#111111]'
              }`}
              style={{fontFamily: 'var(--font-display), sans-serif'}}
            >
              <Flame className="w-4 h-4 shrink-0 text-[#F25C05] fill-[#F25C05]" />
              <span className="sm:hidden">Beranda</span>
              <span className="hidden sm:inline">Beranda Trending</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'search'}
              onClick={() => setActiveView('search')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider border-2 transition-colors whitespace-nowrap ${
                activeView === 'search'
                  ? 'bg-[#F25C05] text-white border-[#111111] shadow-[2px_2px_0px_#111111]'
                  : 'bg-[#F6F5F0] text-[#111111]/75 border-transparent hover:border-[#111111] hover:text-[#111111]'
              }`}
              style={{fontFamily: 'var(--font-display), sans-serif'}}
            >
              <Search className="w-4 h-4 shrink-0" />
              <span className="sm:hidden">Pencarian</span>
              <span className="hidden sm:inline">Pencarian Sound</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'saved'}
              onClick={() => setActiveView('saved')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider border-2 transition-colors whitespace-nowrap ${
                activeView === 'saved'
                  ? 'bg-[#111111] text-[#F7B91C] border-[#111111] shadow-[2px_2px_0px_#F25C05]'
                  : 'bg-[#F6F5F0] text-[#111111]/75 border-transparent hover:border-[#111111] hover:text-[#111111]'
              }`}
              style={{fontFamily: 'var(--font-display), sans-serif'}}
            >
              <Bookmark className="w-4 h-4 shrink-0" />
              <span>Tersimpan ({savedEntries.length})</span>
            </button>
          </div>
        </div>

        {/* Centered Developer Credit & Official Channel Strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 px-3 py-1.5 text-center text-xs font-medium text-[#111111]/80">
          <span>
            Developer:{' '}
            <strong className="font-extrabold text-[#111111] tracking-tight">
              SANN404 FORUM GROUP
            </strong>
          </span>
          <span aria-hidden="true" className="text-[#111111]">
            ·
          </span>
          <a
            href="https://whatsapp.com/channel/0029Vb6ukqnHQbS4mKP0j80L"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-[#F25C05] underline decoration-2 underline-offset-2 hover:bg-[#F7B91C] hover:text-[#111111] px-1 transition-colors"
          >
            <span>Saluran Resmi WhatsApp</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Neobrutalist 2-Column Layout: Left Sidebar + Right Main Repository Results */}
        <div className="grid grid-cols-1 lg:grid-cols-[285px_1fr] gap-6 items-start">
          {/* LEFT SIDEBAR */}
          <aside className="space-y-5 lg:sticky lg:top-16">
            {/* Top Sidebar Card: Official Alight Motion Identity with Circular Vector Emblem (like Screen 3 in IMG_1220.jpeg) */}
            <div className="bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] p-4 space-y-3 relative overflow-hidden">
              {/* Top-Right Halftone Dot Grid */}
              <div
                aria-hidden="true"
                className="absolute top-3 right-3 w-7 h-7 opacity-80"
                style={{
                  backgroundImage: 'radial-gradient(#111111 1.25px, transparent 1.25px)',
                  backgroundSize: '4.5px 4.5px',
                }}
              />

              <div className="flex items-center gap-3 pr-8">
                <div className="relative w-12 h-12 rounded-full border-2 border-[#111111] bg-[#F7B91C] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#111111]">
                  <Image
                    src="/assets/alight-motion-logo.jpg"
                    alt="Alight Motion Official Logo"
                    width={34}
                    height={34}
                    referrerPolicy="no-referrer"
                    className="rounded-full border border-[#111111]"
                  />
                </div>
                <div className="min-w-0">
                  <h2
                    className="text-base font-extrabold uppercase tracking-tight text-[#111111] truncate"
                    style={{fontFamily: 'var(--font-display), sans-serif'}}
                  >
                    Alight Motion Hub
                  </h2>
                  <p className="text-xs font-bold text-[#F25C05] truncate">
                    Preset &amp; Sound VT Index
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#111111]/80 font-medium leading-relaxed border-t-2 border-dashed border-[#111111]/25 pt-2.5">
                Indeks repositori link preset{' '}
                <strong className="bg-[#F7B91C] px-1 border border-[#111111] text-[#111111]">
                  5MB
                </strong>
                ,{' '}
                <strong className="bg-[#F6F5F0] px-1 border border-[#111111] text-[#111111]">
                  XML Drive
                </strong>
                , dan{' '}
                <strong className="bg-[#F6F5F0] px-1 border border-[#111111] text-[#111111]">
                  Sound
                </strong>{' '}
                dari kreator VT TikTok &amp; YouTube.
              </p>
            </div>

            {/* Category Filter Card (Styled like "SELECT YOUR RIDE" Stack in IMG_1220.jpeg: active card turns Yellow #F7B91C with black check circle) */}
            <div className="bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] p-4 space-y-3">
              <div className="flex items-center justify-between border-b-2 border-[#111111] pb-2">
                <h3
                  className="text-sm font-extrabold uppercase tracking-wider text-[#111111] flex items-center gap-1.5"
                  style={{fontFamily: 'var(--font-display), sans-serif'}}
                >
                  <Layers className="w-4 h-4 text-[#F25C05]" />
                  <span>Filter Kategori Preset</span>
                </h3>
                {categoryFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('all')}
                    className="px-2 py-0.5 text-[11px] font-bold bg-[#F6F5F0] border border-[#111111] text-[#111111] hover:bg-[#F7B91C]"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div
                role="group"
                aria-label="Filter Kategori Preset"
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2"
              >
                {PRESET_CATEGORIES.map((cat) => {
                  const isSelected = categoryFilter === cat.id;
                  const count = categoryCounts[cat.id] ?? 0;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectSidebarCategory(cat.id)}
                      className={`flex items-center justify-between gap-2 px-3 py-2.5 text-xs border-2 border-[#111111] transition-all text-left ${
                        isSelected
                          ? 'bg-[#F7B91C] text-[#111111] font-extrabold shadow-[3px_3px_0px_#111111]'
                          : 'bg-white text-[#111111] font-semibold hover:bg-[#F6F5F0]'
                      }`}
                    >
                      <span className="flex items-center gap-2 min-w-0 truncate">
                        <span
                          className="w-3 h-3 border border-[#111111] shrink-0"
                          style={{backgroundColor: cat.dotColor}}
                        />
                        <span
                          className="truncate uppercase tracking-wide text-xs sm:text-sm"
                          style={{fontFamily: 'var(--font-display), sans-serif'}}
                        >
                          {cat.label}
                        </span>
                      </span>

                      <span className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-white border border-[#111111] text-[#111111] tabular-nums">
                          {count}
                        </span>
                        {/* Radio / Check circle exactly like IMG_1220.jpeg */}
                        <span
                          className={`w-4 h-4 rounded-full border-2 border-[#111111] flex items-center justify-center ${
                            isSelected ? 'bg-[#111111] text-white' : 'bg-white'
                          }`}
                          aria-hidden="true"
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platform & Link Type Filters inside Sidebar */}
            <div className="bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] p-4 space-y-3.5">
              <div className="space-y-1.5">
                <span
                  className="text-xs font-extrabold uppercase tracking-wider text-[#111111] block"
                  style={{fontFamily: 'var(--font-display), sans-serif'}}
                >
                  Platform Sumber VT
                </span>
                <div
                  role="group"
                  aria-label="Filter Platform"
                  className="grid grid-cols-3 gap-1.5"
                >
                  <button
                    type="button"
                    onClick={() => setPlatformFilter('all')}
                    className={`px-2 py-1.5 text-xs font-bold border-2 border-[#111111] transition-colors text-center ${
                      platformFilter === 'all'
                        ? 'bg-[#111111] text-[#F7B91C]'
                        : 'bg-[#F6F5F0] text-[#111111] hover:bg-[#F7B91C]'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatformFilter('tiktok')}
                    className={`px-2 py-1.5 text-xs font-bold border-2 border-[#111111] transition-colors text-center ${
                      platformFilter === 'tiktok'
                        ? 'bg-[#111111] text-[#F7B91C]'
                        : 'bg-[#F6F5F0] text-[#111111] hover:bg-[#F7B91C]'
                    }`}
                  >
                    TikTok
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatformFilter('youtube')}
                    className={`px-2 py-1.5 text-xs font-bold border-2 border-[#111111] transition-colors text-center ${
                      platformFilter === 'youtube'
                        ? 'bg-[#111111] text-[#F7B91C]'
                        : 'bg-[#F6F5F0] text-[#111111] hover:bg-[#F7B91C]'
                    }`}
                  >
                    YouTube
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <span
                  className="text-xs font-extrabold uppercase tracking-wider text-[#111111] block"
                  style={{fontFamily: 'var(--font-display), sans-serif'}}
                >
                  Jenis File Preset
                </span>
                <div
                  role="group"
                  aria-label="Filter Jenis Link"
                  className="grid grid-cols-2 gap-1.5"
                >
                  <button
                    type="button"
                    onClick={() => setLinkTypeFilter('all')}
                    className={`px-2 py-1.5 text-xs font-bold border-2 border-[#111111] transition-colors text-center ${
                      linkTypeFilter === 'all'
                        ? 'bg-[#F7B91C] text-[#111111] shadow-[2px_2px_0px_#111111]'
                        : 'bg-[#F6F5F0] text-[#111111] hover:bg-[#F7B91C]/50'
                    }`}
                  >
                    Semua Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkTypeFilter('am_5mb')}
                    className={`px-2 py-1.5 text-xs font-bold border-2 border-[#111111] transition-colors text-center ${
                      linkTypeFilter === 'am_5mb'
                        ? 'bg-[#F7B91C] text-[#111111] shadow-[2px_2px_0px_#111111]'
                        : 'bg-[#F6F5F0] text-[#111111] hover:bg-[#F7B91C]/50'
                    }`}
                  >
                    Prst 5MB
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkTypeFilter('xml_drive')}
                    className={`px-2 py-1.5 text-xs font-bold border-2 border-[#111111] transition-colors text-center ${
                      linkTypeFilter === 'xml_drive'
                        ? 'bg-[#F7B91C] text-[#111111] shadow-[2px_2px_0px_#111111]'
                        : 'bg-[#F6F5F0] text-[#111111] hover:bg-[#F7B91C]/50'
                    }`}
                  >
                    Prst XML
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkTypeFilter('sound_audio')}
                    className={`px-2 py-1.5 text-xs font-bold border-2 border-[#111111] transition-colors text-center ${
                      linkTypeFilter === 'sound_audio'
                        ? 'bg-[#F7B91C] text-[#111111] shadow-[2px_2px_0px_#111111]'
                        : 'bg-[#F6F5F0] text-[#111111] hover:bg-[#F7B91C]/50'
                    }`}
                  >
                    Sound Audio
                  </button>
                </div>
              </div>
            </div>

            {/* Manual Comment Extractor Card with Neobrutalist Split CTA */}
            <div className="bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3
                  className="text-sm font-extrabold uppercase tracking-wider text-[#111111]"
                  style={{fontFamily: 'var(--font-display), sans-serif'}}
                >
                  Ekstraktor Komentar Manual
                </h3>
                <span className="w-3 h-3 bg-[#F25C05] border border-[#111111]" />
              </div>
              <p className="text-xs text-[#111111]/80 font-medium leading-relaxed">
                Punya teks komentar atau deskripsi VT sendiri? Tempel dan saring otomatis link 5MB,
                XML, &amp; Sound.
              </p>
              <button
                type="button"
                onClick={() => setIsExtractorOpen(true)}
                className="w-full inline-flex items-stretch justify-between border-2 border-[#111111] shadow-[3px_3px_0px_#111111] bg-[#F7B91C] hover:bg-[#e5a812] text-[#111111] transition-transform active:translate-x-0.5 active:translate-y-0.5"
              >
                <span
                  className="px-3 py-2 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5"
                  style={{fontFamily: 'var(--font-display), sans-serif'}}
                >
                  <Plus className="w-4 h-4" />
                  <span>Filter Komentar Manual</span>
                </span>
                <span className="px-2.5 bg-[#111111] text-white flex items-center justify-center border-l-2 border-[#111111]">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
          </aside>

          {/* RIGHT MAIN COLUMN */}
          <div className="space-y-5 min-w-0">
            {/* VIEW 1: BERANDA TRENDING REALTIME HEADER (Matches "SELECT YOUR RIDE" Hero in IMG_1220.jpeg) */}
            {activeView === 'beranda' && (
              <section className="bg-white border-2 border-[#111111] shadow-[6px_6px_0px_#111111] p-5 sm:p-6 space-y-4 relative overflow-hidden">
                {/* Top-right Halftone Dot Matrix Pattern from IMG_1220.jpeg */}
                <div
                  aria-hidden="true"
                  className="hidden sm:block absolute top-4 right-4 w-11 h-11 opacity-85"
                  style={{
                    backgroundImage: 'radial-gradient(#111111 1.5px, transparent 1.5px)',
                    backgroundSize: '6px 6px',
                  }}
                />

                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#F25C05] text-white border border-[#111111] font-extrabold uppercase tracking-wider">
                        <Radio className="w-3.5 h-3.5" />
                        <span>LIVE TRENDING REPOSITORIES</span>
                      </span>
                      <span className="text-[#111111]/75 font-mono font-bold tabular-nums">
                        Update terakhir:{' '}
                        <strong className="text-[#111111] underline decoration-[#F7B91C] decoration-2">
                          {lastTrendingSync}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <h1
                        className="text-2xl sm:text-4xl font-extrabold uppercase text-[#111111] tracking-tight leading-[1.05]"
                        style={{
                          fontFamily: 'var(--font-display), sans-serif',
                          textWrap: 'balance',
                        }}
                      >
                        Beranda Preset Trending Realtime dengan Like Terbanyak
                      </h1>
                      {/* Signature Diagonal Yellow & Black Touching Squares from IMG_1220.jpeg */}
                      <div className="relative w-8 h-8 shrink-0 mt-1 hidden sm:block" aria-hidden="true">
                        <span className="absolute top-0 left-0 w-4 h-4 bg-[#F7B91C] border border-[#111111]" />
                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-[#111111]" />
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#111111]/80 font-medium leading-relaxed">
                      Daftar repositori VT preset Alight Motion yang sedang viral di TikTok &amp;
                      YouTube saat ini, diurutkan otomatis berdasarkan jumlah{' '}
                      <strong className="font-extrabold text-[#111111] bg-[#F7B91C]/50 px-1">
                        Like terbanyak
                      </strong>
                      .
                    </p>

                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => fetchTrendingRealtime(trendingCategory, true)}
                        disabled={isTrendingLoading}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-extrabold uppercase tracking-wider text-[#111111] bg-white hover:bg-[#F6F5F0] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] disabled:opacity-60 transition-colors whitespace-nowrap"
                        style={{fontFamily: 'var(--font-display), sans-serif'}}
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${
                            isTrendingLoading ? 'animate-spin text-[#F25C05]' : ''
                          }`}
                        />
                        <span>{isTrendingLoading ? 'Menyinkronkan...' : 'Perbarui Tren'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveView('search')}
                        className="inline-flex items-stretch border-2 border-[#111111] shadow-[3px_3px_0px_#111111] bg-[#F7B91C] hover:bg-[#e5a812] text-[#111111] transition-transform active:translate-x-0.5 active:translate-y-0.5 whitespace-nowrap"
                      >
                        <span
                          className="px-3.5 py-2 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5"
                          style={{fontFamily: 'var(--font-display), sans-serif'}}
                        >
                          <Search className="w-3.5 h-3.5" />
                          <span>Cari Sound Spesifik</span>
                        </span>
                        <span className="px-2.5 bg-[#111111] text-white flex items-center justify-center border-l-2 border-[#111111]">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Neobrutalist Yellow/Black Cruiser Illustration */}
                  <div className="flex justify-center xl:justify-end xl:pr-6">
                    <NeobrutalistHeroIllustration />
                  </div>
                </div>

                {/* Trending Topics Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t-2 border-[#111111]">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
                    <span
                      className="text-xs font-extrabold uppercase tracking-wider text-[#111111] whitespace-nowrap shrink-0 mr-1"
                      style={{fontFamily: 'var(--font-display), sans-serif'}}
                    >
                      Topik Tren:
                    </span>
                    {TRENDING_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectTrendingCategory(cat.id)}
                        className={`px-3 py-1 text-xs font-bold border-2 border-[#111111] transition-colors whitespace-nowrap shrink-0 ${
                          trendingCategory === cat.id
                            ? 'bg-[#111111] text-[#F7B91C] shadow-[2px_2px_0px_#F25C05]'
                            : 'bg-[#F6F5F0] text-[#111111] hover:bg-[#F7B91C]'
                        }`}
                      >
                        #{cat.label.toLowerCase().replace(/\s+/g, '-')}
                      </button>
                    ))}
                  </div>

                  <label className="inline-flex items-center gap-2 text-xs font-bold text-[#111111] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isAutoRealtime}
                      onChange={(e) => setIsAutoRealtime(e.target.checked)}
                      className="w-4 h-4 accent-[#111111] border-2 border-[#111111]"
                    />
                    <span>Auto-Update Realtime (45 dtk)</span>
                  </label>
                </div>
              </section>
            )}

            {/* VIEW 2: PENCARIAN SOUND HEADER */}
            {activeView === 'search' && (
              <section className="bg-white border-2 border-[#111111] shadow-[6px_6px_0px_#111111] p-5 sm:p-6 space-y-4 relative overflow-hidden">
                <div
                  aria-hidden="true"
                  className="hidden sm:block absolute top-4 right-4 w-11 h-11 opacity-85"
                  style={{
                    backgroundImage: 'radial-gradient(#111111 1.5px, transparent 1.5px)',
                    backgroundSize: '6px 6px',
                  }}
                />

                <div className="space-y-1.5 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#F7B91C] border border-[#111111] text-xs text-[#111111] font-mono font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>PRESET REPOSITORY SEARCH · TANPA BATAS HASIL</span>
                  </div>
                  <h1
                    className="text-2xl sm:text-4xl font-extrabold uppercase text-[#111111] tracking-tight leading-[1.05]"
                    style={{
                      fontFamily: 'var(--font-display), sans-serif',
                      textWrap: 'balance',
                    }}
                  >
                    Cari Nama Sound &amp; Filter Kategori Preset Alight Motion
                  </h1>
                  <p className="text-xs sm:text-sm text-[#111111]/80 font-medium leading-relaxed">
                    Ketik nama sound seperti{' '}
                    <strong className="text-[#111111] bg-[#F7B91C]/60 px-1">“kicau mania”</strong>{' '}
                    lalu pilih kategori{' '}
                    <span className="font-bold underline decoration-[#F25C05]">JJ Presets</span>,{' '}
                    <span className="font-bold underline decoration-[#F7B91C]">Cinematic</span>,
                    atau{' '}
                    <span className="font-bold underline decoration-[#111111]">Color Grading</span>{' '}
                    untuk menyaring seluruh link preset secara instan.
                  </p>
                </div>

                {/* Search Input Form */}
                <form onSubmit={handleSearchSubmit} className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <div className="relative flex-1">
                      <label htmlFor="sound-search-input" className="sr-only">
                        Cari nama sound atau VT preset
                      </label>
                      <Search className="w-4 h-4 text-[#111111] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="sound-search-input"
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Cari repositori sound preset (contoh: kicau mania)..."
                        className="w-full pl-10 pr-9 py-2.5 text-sm font-bold bg-[#F6F5F0] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] text-[#111111] placeholder:text-[#111111]/50 focus:outline-none focus:bg-white"
                      />
                      {searchInput && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchInput('');
                            executeSearch('');
                          }}
                          aria-label="Bersihkan kata kunci pencarian"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#111111] hover:bg-[#F7B91C]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-stretch justify-between border-2 border-[#111111] shadow-[3px_3px_0px_#111111] bg-[#F25C05] hover:bg-[#d94e00] disabled:opacity-60 text-white transition-transform active:translate-x-0.5 active:translate-y-0.5 whitespace-nowrap shrink-0 h-[42px]"
                    >
                      <span
                        className="flex-1 px-4 text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2"
                        style={{fontFamily: 'var(--font-display), sans-serif'}}
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Memindai VT...</span>
                          </>
                        ) : (
                          <span>Cari Semua Preset</span>
                        )}
                      </span>
                      <span className="w-10 shrink-0 bg-[#111111] text-white flex items-center justify-center border-l-2 border-[#111111]">
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </button>
                  </div>

                  {/* Recommended Sound Topics */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1">
                    <span
                      className="text-[#111111] font-extrabold uppercase tracking-wider whitespace-nowrap shrink-0 mr-1"
                      style={{fontFamily: 'var(--font-display), sans-serif'}}
                    >
                      Rekomendasi Topik:
                    </span>
                    {POPULAR_SOUND_SUGGESTIONS.map((sound) => (
                      <button
                        key={sound}
                        type="button"
                        onClick={() => {
                          setSearchInput(sound);
                          executeSearch(sound);
                        }}
                        className={`px-2.5 py-1 border-2 border-[#111111] font-mono text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 ${
                          activeQuery.toLowerCase() === sound.toLowerCase() &&
                          activeView === 'search'
                            ? 'bg-[#F7B91C] text-[#111111] shadow-[2px_2px_0px_#111111]'
                            : 'bg-[#F6F5F0] text-[#111111] hover:bg-[#F7B91C]'
                        }`}
                      >
                        #{sound.replace(/\s+/g, '-')}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('');
                        executeSearch('');
                      }}
                      className={`px-2.5 py-1 border-2 border-[#111111] font-mono text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 ${
                        activeQuery === '' && activeView === 'search'
                          ? 'bg-[#F7B91C] text-[#111111] shadow-[2px_2px_0px_#111111]'
                          : 'bg-white text-[#111111] hover:bg-[#F7B91C]'
                      }`}
                    >
                      #semua-sound ({entries.length})
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* FITUR BARU: CARI & FILTER BERDASARKAN LINK VT TIKTOK (Visible on Beranda & Pencarian) */}
            {activeView !== 'saved' && (
              <section
                aria-label="Cari Berdasarkan Link VT TikTok"
                className="bg-white border-2 border-[#111111] shadow-[5px_5px_0px_#111111] p-4 sm:p-5 space-y-3.5 relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#111111] pb-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#111111] text-[#F7B91C] border border-[#111111] text-[11px] font-mono font-extrabold uppercase tracking-wider">
                      <Link2 className="w-3.5 h-3.5" />
                      <span>FITUR SCAN LINK VT TIKTOK</span>
                    </span>
                    <h2
                      className="text-base sm:text-xl font-extrabold uppercase tracking-tight text-[#111111]"
                      style={{fontFamily: 'var(--font-display), sans-serif'}}
                    >
                      Cari Preset Berdasarkan Link VT TikTok
                    </h2>
                  </div>

                  {vtInspectionResult && (
                    <button
                      type="button"
                      onClick={handleClearVtLinkScan}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-[#F6F5F0] hover:bg-[#F7B91C] text-[#111111] border-2 border-[#111111] self-start sm:self-auto"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reset Scan VT</span>
                    </button>
                  )}
                </div>

                <p className="text-xs text-[#111111]/80 font-medium leading-relaxed">
                  Masukkan link VT TikTok (contoh:{' '}
                  <span className="font-mono font-bold text-[#111111] bg-[#F6F5F0] px-1 border border-[#111111]/30">
                    https://www.tiktok.com/@user/video/...
                  </span>{' '}
                  atau{' '}
                  <span className="font-mono font-bold text-[#111111] bg-[#F6F5F0] px-1 border border-[#111111]/30">
                    https://vt.tiktok.com/...
                  </span>
                  ). Sistem otomatis memindai &amp; memfilter seluruh link preset (5MB, XML Drive,
                  &amp; Sound) di deskripsi serta komentar VT tersebut.
                </p>

                <form onSubmit={handleVtLinkSubmit} className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <div className="relative flex-1">
                      <label htmlFor="tiktok-vt-url-input" className="sr-only">
                        Masukkan Link VT TikTok
                      </label>
                      <Link2 className="w-4 h-4 text-[#111111] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="tiktok-vt-url-input"
                        type="text"
                        value={vtLinkInput}
                        onChange={(e) => setVtLinkInput(e.target.value)}
                        placeholder="Tempel link VT TikTok di sini (contoh: https://www.tiktok.com/@vkriedtz2/video/7696828668445756692)..."
                        className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm font-mono font-bold bg-[#F6F5F0] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] text-[#111111] placeholder:text-[#111111]/50 focus:outline-none focus:bg-white"
                      />
                      {vtLinkInput && (
                        <button
                          type="button"
                          onClick={handleClearVtLinkScan}
                          aria-label="Hapus link VT TikTok"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#111111] hover:bg-[#F7B91C]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !vtLinkInput.trim()}
                      className="flex items-stretch justify-between border-2 border-[#111111] shadow-[3px_3px_0px_#111111] bg-[#F7B91C] hover:bg-[#e5a812] disabled:opacity-60 text-[#111111] transition-transform active:translate-x-0.5 active:translate-y-0.5 whitespace-nowrap shrink-0 h-[42px]"
                    >
                      <span
                        className="flex-1 px-4 text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5"
                        style={{fontFamily: 'var(--font-display), sans-serif'}}
                      >
                        <Search className="w-3.5 h-3.5 shrink-0" />
                        <span>Scan Link VT TikTok</span>
                      </span>
                      <span className="w-9 shrink-0 bg-[#111111] text-white flex items-center justify-center border-l-2 border-[#111111]">
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </button>
                  </div>

                  {/* Quick Test VT Link Buttons (Positive & Negative Examples) */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs">
                    <span
                      className="text-[#111111] font-extrabold uppercase tracking-wider whitespace-nowrap shrink-0 mr-1"
                      style={{fontFamily: 'var(--font-display), sans-serif'}}
                    >
                      Uji Cepat Link VT:
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        executeTiktokVtLinkScan(
                          'https://www.tiktok.com/@vkriedtz2/video/7696828668445756692'
                        )
                      }
                      className="px-2.5 py-1 border-2 border-[#111111] bg-[#F6F5F0] hover:bg-[#F7B91C] text-[#111111] font-mono text-[11px] font-bold transition-colors whitespace-nowrap"
                    >
                      VT Ada Preset (@vkriedtz2)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        executeTiktokVtLinkScan(
                          'https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692'
                        )
                      }
                      className="px-2.5 py-1 border-2 border-[#111111] bg-[#F6F5F0] hover:bg-[#F7B91C] text-[#111111] font-mono text-[11px] font-bold transition-colors whitespace-nowrap"
                    >
                      VT Multi-Preset (@wyxzwangyy)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        executeTiktokVtLinkScan(
                          'https://www.tiktok.com/@dailyvlog_random/video/7106594312292453675'
                        )
                      }
                      className="px-2.5 py-1 border-2 border-[#111111] bg-white hover:bg-[#F25C05] hover:text-white text-[#111111] font-mono text-[11px] font-bold transition-colors whitespace-nowrap"
                    >
                      VT Tanpa Preset (Tes Feedback Kosong)
                    </button>
                  </div>
                </form>

                {/* Active VT Scan Status Banner (Both Found & Not Found Feedback Directly Visible) */}
                {vtInspectionResult &&
                  (vtInspectionResult.hasPresetLinks ? (
                    <div
                      data-testid="vt-preset-found-banner"
                      className="p-3.5 bg-[#F7B91C] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-[#111111] shrink-0 mt-0.5" />
                        <div className="space-y-0.5 text-xs">
                          <p
                            className="font-extrabold uppercase tracking-wider text-sm text-[#111111]"
                            style={{fontFamily: 'var(--font-display), sans-serif'}}
                          >
                            Link Preset Ditemukan pada VT TikTok (
                            {vtInspectionResult.vtMeta.creatorHandle})
                          </p>
                          <p className="font-semibold text-[#111111]/90">
                            {vtInspectionResult.feedbackMessage} Gunakan filter Kategori &amp; Jenis
                            File di samping untuk menyaring hasil.
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-[#111111] text-white font-mono text-xs font-bold whitespace-nowrap self-start sm:self-center">
                        {totalFilteredLinks} Link Aktif
                      </span>
                    </div>
                  ) : (
                    <div
                      role="status"
                      data-testid="vt-no-preset-inline-banner"
                      className="p-3.5 bg-[#F25C05] text-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 fill-white text-[#F25C05]" />
                        <div className="space-y-0.5 text-xs">
                          <p
                            className="font-extrabold uppercase tracking-wider text-sm text-white"
                            style={{fontFamily: 'var(--font-display), sans-serif'}}
                          >
                            VT Tidak Mengandung Link Preset ({vtInspectionResult.vtMeta.creatorHandle})
                          </p>
                          <p className="font-medium text-white/95">
                            {vtInspectionResult.feedbackMessage}
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-[#111111] text-[#F7B91C] font-mono text-xs font-bold whitespace-nowrap self-start sm:self-center">
                        0 Link Preset
                      </span>
                    </div>
                  ))}
              </section>
            )}

            {/* Result Count & Sort Header Bar */}
            <div className="bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[#111111]">
                <span className="w-3 h-3 bg-[#F25C05] border border-[#111111] inline-block" />
                <strong
                  className="text-[#111111] font-extrabold uppercase tracking-wider text-base"
                  style={{fontFamily: 'var(--font-display), sans-serif'}}
                >
                  {activeList.length} repository results
                </strong>
                <span className="font-mono font-bold text-[#111111]/70">
                  ({totalFilteredLinks} link preset aktif)
                </span>
                {categoryFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#F7B91C] text-[#111111] border-2 border-[#111111] font-bold">
                    <span>
                      Kategori:{' '}
                      {PRESET_CATEGORIES.find((c) => c.id === categoryFilter)?.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCategoryFilter('all')}
                      aria-label="Hapus filter kategori"
                      className="hover:text-[#F25C05]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2.5">
                {activeView !== 'beranda' && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#111111]">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#111111] shrink-0" />
                    <span>Sort:</span>
                    <select
                      id="sort-select"
                      aria-label="Urutkan hasil"
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(e.target.value as 'likes' | 'views' | 'links')
                      }
                      className="px-2.5 py-1 text-xs font-bold bg-[#F6F5F0] border-2 border-[#111111] text-[#111111] focus:outline-none focus:bg-[#F7B91C]"
                    >
                      <option value="likes">Most stars / likes</option>
                      <option value="views">Most views</option>
                      <option value="links">Most preset links</option>
                    </select>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleExportSavedJson}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#111111] bg-[#F6F5F0] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#F7B91C] transition-colors whitespace-nowrap shrink-0"
                  style={{fontFamily: 'var(--font-display), sans-serif'}}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor JSON</span>
                </button>
              </div>
            </div>

            {/* SKELETON LOADERS WHILE FETCHING SEARCH OR TRENDING DATA */}
            {isGridBusy ? (
              <VtCardSkeletonGrid
                count={4}
                label={
                  activeView === 'beranda'
                    ? 'Memuat daftar repositori VT preset trending...'
                    : vtInspectionResult
                      ? `Memindai deskripsi & komentar VT TikTok "${vtLinkInput}"...`
                      : `Memindai dan menyaring repositori preset untuk "${activeQuery}"...`
                }
              />
            ) : vtInspectionResult && !vtInspectionResult.hasPresetLinks && activeView === 'search' ? (
              /* FEEDBACK KHUSUS JIKA VT TIKTOK TIDAK MENGANDUNG LINK PRESET DI DESKRIPSI MAUPUN KOMENTAR */
              <div
                role="alert"
                data-testid="vt-no-preset-feedback"
                className="bg-white border-2 border-[#111111] shadow-[5px_5px_0px_#111111] overflow-hidden"
              >
                <div className="bg-[#F25C05] text-white px-4 sm:px-5 py-3 border-b-2 border-[#111111] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 shrink-0 fill-white text-[#F25C05]" />
                    <span
                      className="text-sm sm:text-base font-extrabold uppercase tracking-wider"
                      style={{fontFamily: 'var(--font-display), sans-serif'}}
                    >
                      Hasil Pindai Link VT TikTok: Tidak Ada Link Preset
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-[#111111] text-[#F7B91C] font-mono text-xs font-bold">
                    0 LINK PRESET DITEMUKAN
                  </span>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <div className="space-y-1.5">
                    <h3
                      className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[#111111]"
                      style={{fontFamily: 'var(--font-display), sans-serif'}}
                    >
                      VT Ini Tidak Mengandung Link Preset di Deskripsi Maupun Komentar
                    </h3>
                    <p className="text-xs sm:text-sm text-[#111111]/85 font-medium leading-relaxed">
                      {vtInspectionResult.feedbackMessage}
                    </p>
                  </div>

                  {/* Detail Area yang Telah Dipindai */}
                  <div className="bg-[#F6F5F0] border-2 border-[#111111] p-4 space-y-2.5 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b-2 border-dashed border-[#111111]/30 pb-2">
                      <span className="font-extrabold uppercase tracking-wider text-[#111111]">
                        Target Link VT TikTok:
                      </span>
                      <span className="font-mono font-bold text-[#F25C05] break-all">
                        {vtInspectionResult.vtMeta.videoUrl}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      {vtInspectionResult.vtMeta.scannedSources.map((sourceName) => (
                        <div
                          key={sourceName}
                          className="p-2.5 bg-white border-2 border-[#111111] flex items-center justify-between gap-2"
                        >
                          <span className="font-bold text-[#111111]">{sourceName}</span>
                          <span className="px-1.5 py-0.5 bg-[#111111] text-white font-mono text-[10px] font-bold whitespace-nowrap">
                            0 Link
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        executeTiktokVtLinkScan(
                          'https://www.tiktok.com/@vkriedtz2/video/7696828668445756692'
                        )
                      }
                      className="px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-[#111111] bg-[#F7B91C] hover:bg-[#e5a812] border-2 border-[#111111] shadow-[3px_3px_0px_#111111]"
                      style={{fontFamily: 'var(--font-display), sans-serif'}}
                    >
                      Coba Contoh VT yang Ada Preset (@vkriedtz2)
                    </button>

                    <button
                      type="button"
                      onClick={handleClearVtLinkScan}
                      className="px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-[#111111] bg-white hover:bg-[#F6F5F0] border-2 border-[#111111] shadow-[3px_3px_0px_#111111]"
                      style={{fontFamily: 'var(--font-display), sans-serif'}}
                    >
                      Reset &amp; Tampilkan Semua Preset Sound
                    </button>
                  </div>
                </div>
              </div>
            ) : activeList.length === 0 ? (
              <div className="bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] p-8 sm:p-10 text-center space-y-3">
                <p
                  className="text-xl font-extrabold uppercase tracking-tight text-[#111111]"
                  style={{fontFamily: 'var(--font-display), sans-serif'}}
                >
                  Tidak ada repositori VT preset yang cocok dengan filter saat ini
                </p>
                <p className="text-xs sm:text-sm text-[#111111]/75 font-medium max-w-md mx-auto">
                  Ubah filter kategori/platform ke “Semua”, atau klik tombol di bawah untuk
                  menampilkan seluruh daftar preset.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFilter('all');
                      setPlatformFilter('all');
                      setLinkTypeFilter('all');
                      if (vtInspectionResult && vtInspectionResult.hasPresetLinks) {
                        setEntries(vtInspectionResult.entries);
                      } else if (activeView === 'beranda') {
                        handleSelectTrendingCategory('all');
                      } else {
                        handleClearVtLinkScan();
                      }
                    }}
                    className="px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-[#111111] bg-[#F7B91C] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] hover:bg-[#e5a812]"
                    style={{fontFamily: 'var(--font-display), sans-serif'}}
                  >
                    Reset Filter &amp; Tampilkan Semua Preset
                  </button>
                </div>
              </div>
            ) : (
              /* Neobrutalist Repository Search Results List */
              <div className="space-y-4">
                {activeList.map((entry, idx) => {
                  const summary = summarizePresetLinks(entry.links);
                  const detectedCat = detectPresetCategory(entry);
                  const catMeta = getPresetCategoryMeta(detectedCat);
                  const repoSlug = buildRepoSlug(entry);
                  const isSaved = savedEntries.some((s) => s.id === entry.id);
                  const isExpanded = Boolean(expandedCardIds[entry.id]);
                  const isTopFeatured = idx === 0;
                  const visibleLinks =
                    isExpanded || entry.links.length <= 4
                      ? entry.links
                      : entry.links.slice(0, 4);
                  const hiddenCount = entry.links.length - visibleLinks.length;

                  const tiktokHref =
                    entry.tiktokUrl ||
                    `https://www.tiktok.com/search/video?q=${encodeURIComponent(
                      `preset am ${entry.soundName}`
                    )}`;
                  const youtubeHref =
                    entry.youtubeUrl ||
                    (entry.videoUrl.includes('youtube.com')
                      ? entry.videoUrl
                      : `https://www.youtube.com/results?search_query=${encodeURIComponent(
                          entry.vtTitle
                        )}`);

                  return (
                    <article
                      key={entry.id}
                      className="bg-white border-2 border-[#111111] shadow-[5px_5px_0px_#111111] overflow-hidden transition-transform"
                    >
                      {/* Top Header Zone (First card is highlighted in Taxi Yellow #F7B91C just like "STANDARD $12.50" in IMG_1220.jpeg) */}
                      <div
                        className={`p-4 sm:p-5 border-b-2 border-[#111111] flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                          isTopFeatured ? 'bg-[#F7B91C]' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          {/* Creator's YouTube Channel or TikTok Account Profile Avatar */}
                          <CreatorProfileAvatar
                            entry={entry}
                            profileHref={entry.platform === 'tiktok' ? tiktokHref : youtubeHref}
                          />

                          <div className="space-y-1.5 min-w-0 flex-1">
                            {/* Repo Path Line */}
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <BookMarked className="w-4 h-4 text-[#111111] shrink-0" />
                              <button
                                type="button"
                                onClick={() => setSelectedEntry(entry)}
                                className="text-left font-mono text-xs sm:text-sm font-bold text-[#111111] underline decoration-2 hover:bg-[#111111] hover:text-white px-0.5 break-all transition-colors"
                              >
                                {entry.creatorHandle.replace(/^@/, '')}
                                <span className="mx-0.5">/</span>
                                <span>{repoSlug}</span>
                              </button>

                              <span className="px-2 py-0.5 text-[11px] font-extrabold uppercase bg-white text-[#111111] border-2 border-[#111111] whitespace-nowrap">
                                {entry.platform === 'tiktok' ? 'TikTok VT' : 'YouTube'}
                              </span>

                              <span className="px-1.5 py-0.5 font-mono text-[11px] font-bold bg-[#111111] text-white tabular-nums">
                                {activeView === 'beranda'
                                  ? `Trending #${String(idx + 1).padStart(2, '0')}`
                                  : `#${String(idx + 1).padStart(2, '0')}`}
                              </span>
                            </div>

                            {/* VT Title */}
                            <h2
                              className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-[#111111] leading-snug"
                              style={{fontFamily: 'var(--font-display), sans-serif'}}
                            >
                              <button
                                type="button"
                                onClick={() => setSelectedEntry(entry)}
                                className="text-left hover:underline decoration-2"
                              >
                                {entry.vtTitle}
                              </button>
                            </h2>

                            <p className="text-xs font-semibold text-[#111111]/85">
                              Sound:{' '}
                              <strong className="font-extrabold text-[#111111]">
                                {entry.soundName}
                              </strong>
                            </p>

                            {/* Topic Filter Buttons Row */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px] font-mono font-bold">
                              <button
                                type="button"
                                onClick={() => setCategoryFilter(catMeta.id)}
                                className="px-2 py-0.5 bg-white text-[#111111] border border-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
                              >
                                {catMeta.badgeText}
                              </button>
                              {summary.am5mbCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setLinkTypeFilter('am_5mb')}
                                  className="px-2 py-0.5 bg-white text-[#111111] border border-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
                                >
                                  preset-5mb ({summary.am5mbCount})
                                </button>
                              )}
                              {summary.xmlCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setLinkTypeFilter('xml_drive')}
                                  className="px-2 py-0.5 bg-white text-[#111111] border border-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
                                >
                                  xml-drive ({summary.xmlCount})
                                </button>
                              )}
                              {summary.soundCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setLinkTypeFilter('sound_audio')}
                                  className="px-2 py-0.5 bg-white text-[#111111] border border-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
                                >
                                  sound-audio ({summary.soundCount})
                                </button>
                              )}
                            </div>

                            {/* Metadata Row (Category, Likes, Comments, Views, Updated) */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs font-bold text-[#111111]/85">
                              <span className="inline-flex items-center gap-1.5">
                                <span
                                  className="w-3 h-3 border border-[#111111] inline-block"
                                  style={{backgroundColor: catMeta.dotColor}}
                                />
                                <span>{catMeta.label}</span>
                              </span>

                              <span className="inline-flex items-center gap-1 font-mono tabular-nums text-[#111111]">
                                <Heart className="w-3.5 h-3.5 text-[#F25C05] fill-[#F25C05]" />
                                <strong>{entry.likesCount.toLocaleString('id-ID')}</strong>
                              </span>

                              <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>{entry.commentsCount.toLocaleString('id-ID')}</span>
                              </span>

                              <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                                <Eye className="w-3.5 h-3.5" />
                                <span>{entry.viewsCount.toLocaleString('id-ID')}</span>
                              </span>

                              <span>Updated {entry.publishedAt}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right Column: Neobrutalist Action Buttons (Cleanly Aligned, Flush Right Arrow Box) */}
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 shrink-0 pt-2 sm:pt-0 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => setSelectedEntry(entry)}
                            className="col-span-2 sm:col-span-1 w-full sm:w-auto h-10 flex items-stretch justify-between border-2 border-[#111111] shadow-[3px_3px_0px_#111111] bg-[#F25C05] hover:bg-[#d94e00] text-white transition-transform active:translate-x-0.5 active:translate-y-0.5 whitespace-nowrap shrink-0"
                          >
                            <span
                              className="flex-1 px-3.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5"
                              style={{fontFamily: 'var(--font-display), sans-serif'}}
                            >
                              <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                              <span>
                                {entry.platform === 'tiktok'
                                  ? `Lihat VT & Detail (${entry.links.length})`
                                  : `Lihat YT & Detail (${entry.links.length})`}
                              </span>
                            </span>
                            <span className="w-9 shrink-0 bg-[#111111] text-white flex items-center justify-center border-l-2 border-[#111111]">
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </button>

                          <a
                            href={entry.platform === 'tiktok' ? tiktokHref : youtubeHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-10 inline-flex items-center justify-center gap-1.5 px-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#111111] bg-white hover:bg-[#111111] hover:text-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] transition-colors whitespace-nowrap shrink-0"
                            style={{fontFamily: 'var(--font-display), sans-serif'}}
                          >
                            <span>
                              {entry.platform === 'tiktok' ? 'Buka TikTok' : 'Buka YouTube'}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleToggleSave(entry)}
                            aria-label={
                              isSaved
                                ? `Hapus ${entry.vtTitle} dari daftar tersimpan`
                                : `Simpan ${entry.vtTitle} ke daftar`
                            }
                            className={`h-10 inline-flex items-center justify-center gap-1.5 px-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider border-2 border-[#111111] shadow-[3px_3px_0px_#111111] transition-colors whitespace-nowrap shrink-0 ${
                              isSaved
                                ? 'bg-[#111111] text-[#F7B91C]'
                                : 'bg-white text-[#111111] hover:bg-[#111111] hover:text-white'
                            }`}
                            style={{fontFamily: 'var(--font-display), sans-serif'}}
                          >
                            {isSaved ? (
                              <>
                                <BookmarkCheck className="w-3.5 h-3.5 shrink-0" />
                                <span>Tersimpan</span>
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-3.5 h-3.5 shrink-0" />
                                <span>Simpan</span>
                              </>
                            )}
                          </button>

                          {activeView === 'saved' && (
                            <button
                              type="button"
                              onClick={() => handleToggleSave(entry)}
                              aria-label={`Hapus ${entry.vtTitle}`}
                              className="h-10 w-10 inline-flex items-center justify-center text-[#111111] bg-white hover:bg-[#F25C05] hover:text-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] transition-colors justify-self-end shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Filtered Links Rangkuman Box (Pickup -> Drop-off Dashed Route Box style from IMG_1220.jpeg) */}
                      <div className="bg-[#F6F5F0] p-3.5 sm:p-4 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#111111] border-b-2 border-dashed border-[#111111]/35 pb-2">
                          <div className="flex flex-wrap items-center gap-2 font-bold">
                            <span
                              className="uppercase tracking-wider text-sm font-extrabold"
                              style={{fontFamily: 'var(--font-display), sans-serif'}}
                            >
                              Rangkuman Link Preset:
                            </span>
                            <span className="font-mono tabular-nums text-[#F25C05]">
                              {summary.am5mbCount > 0 && `${summary.am5mbCount}× Prst 5MB`}
                              {summary.am5mbCount > 0 && summary.xmlCount > 0 && ' · '}
                              {summary.xmlCount > 0 && `${summary.xmlCount}× Prst XML`}
                              {(summary.am5mbCount > 0 || summary.xmlCount > 0) &&
                                summary.soundCount > 0 &&
                                ' · '}
                              {summary.soundCount > 0 && `${summary.soundCount}× Sound`}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs font-bold">
                            <button
                              type="button"
                              onClick={() => setSelectedEntry(entry)}
                              className="text-[#F25C05] hover:underline cursor-pointer"
                            >
                              {entry.platform === 'tiktok' ? 'Putar Video VT' : 'Putar Video YT'}
                            </button>
                            <span>·</span>
                            {entry.platform === 'tiktok' ? (
                              <a
                                href={tiktokHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#111111] underline hover:bg-[#F7B91C] px-1"
                              >
                                VT TikTok
                              </a>
                            ) : (
                              <a
                                href={youtubeHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#111111] underline hover:bg-[#F7B91C] px-1"
                              >
                                Video YouTube
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          {visibleLinks.map((link, lIdx) => (
                            <div
                              key={link.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 px-3 bg-white border-2 border-[#111111] text-xs"
                            >
                              <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-0 sm:flex sm:items-center sm:gap-2.5">
                                <div className="flex items-center gap-2 shrink-0">
                                  {/* Orange / Black square terminal like Pickup / Drop-off in IMG_1220.jpeg */}
                                  <span
                                    className={`w-3 h-3 border border-[#111111] shrink-0 ${
                                      lIdx % 2 === 0 ? 'bg-[#F25C05]' : 'bg-[#111111]'
                                    }`}
                                    aria-hidden="true"
                                  />
                                  {link.type === 'am_5mb' ? (
                                    <Share2 className="w-3.5 h-3.5 text-[#111111] shrink-0" />
                                  ) : link.type === 'xml_drive' ? (
                                    <FileCode2 className="w-3.5 h-3.5 text-[#111111] shrink-0" />
                                  ) : (
                                    <Music className="w-3.5 h-3.5 text-[#111111] shrink-0" />
                                  )}
                                  <span className="font-extrabold uppercase tracking-wide text-[#111111] whitespace-nowrap">
                                    {link.label} :
                                  </span>
                                </div>
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block font-mono font-medium text-[#111111] underline decoration-[#F7B91C] decoration-2 hover:bg-[#F7B91C] truncate"
                                >
                                  {link.url}
                                </a>
                              </div>

                              <div className="flex items-center justify-end gap-1.5 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-dashed border-[#111111]/30">
                                {link.xmlMeta && (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedEntry(entry)}
                                    className="px-2 py-1 text-xs font-mono font-bold text-[#111111] bg-[#F6F5F0] hover:bg-[#F7B91C] border border-[#111111] transition-colors truncate max-w-[130px] sm:max-w-none"
                                  >
                                    {link.xmlMeta.fileName}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleQuickCopy(link.url, link.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#111111] bg-white hover:bg-[#F7B91C] border-2 border-[#111111] transition-colors whitespace-nowrap shrink-0"
                                >
                                  {copiedLinkKey === link.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-[#F25C05]" />
                                      <span>Disalin</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Salin</span>
                                    </>
                                  )}
                                </button>
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#111111] bg-[#F7B91C] hover:bg-[#111111] hover:text-white border-2 border-[#111111] transition-colors whitespace-nowrap shrink-0"
                                >
                                  <span>Buka</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>

                        {entry.links.length > 4 && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => toggleExpandCard(entry.id)}
                              className="w-full py-2 text-xs font-extrabold uppercase tracking-wider text-[#111111] bg-white hover:bg-[#F7B91C] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] inline-flex items-center justify-center gap-1.5 transition-colors"
                              style={{fontFamily: 'var(--font-display), sans-serif'}}
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-4 h-4" />
                                  <span>Sembunyikan sebagian link</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  <span>
                                    Tampilkan +{hiddenCount} Link Preset Lainnya (Total{' '}
                                    {entry.links.length} Link)
                                  </span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Reference & Filter Specification Section (Fare Breakdown Dotted Style from IMG_1220.jpeg) */}
            <section
              id="filter-rules"
              className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2"
            >
              <div className="bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] p-5 space-y-3">
                <div className="flex items-center justify-between border-b-2 border-[#111111] pb-2">
                  <h2
                    className="text-lg font-extrabold uppercase tracking-wider text-[#111111]"
                    style={{fontFamily: 'var(--font-display), sans-serif'}}
                  >
                    01. Spesifikasi Filter Link Preset Ketat
                  </h2>
                  <span className="w-3.5 h-3.5 bg-[#F7B91C] border border-[#111111]" />
                </div>
                <p className="text-xs text-[#111111]/80 font-medium leading-relaxed">
                  Setiap deskripsi video dan komentar VT dipindai baris demi baris. Hanya tautan
                  yang memenuhi struktur domain preset resmi di bawah ini yang disimpan ke dalam
                  repositori:
                </p>
                <div className="divide-y-2 divide-dashed divide-[#111111]/30 border-2 border-[#111111] text-xs font-mono bg-[#F6F5F0]">
                  <div className="p-3 flex flex-col gap-1">
                    <span className="font-sans font-extrabold uppercase text-[#111111]">
                      Preset 5MB (Alight Creative Direct Share)
                    </span>
                    <span className="text-[#F25C05] font-bold break-all">
                      https://alightcreative.com/am/share/u/[UID]/p/[PROJECT_ID]
                    </span>
                  </div>
                  <div className="p-3 flex flex-col gap-1">
                    <span className="font-sans font-extrabold uppercase text-[#111111]">
                      Preset XML &amp; Folder Paket (Google Drive)
                    </span>
                    <span className="text-[#111111] font-bold break-all">
                      https://drive.google.com/file/d/[FILE_ID]/view?usp=drivesdk
                    </span>
                  </div>
                  <div className="p-3 flex flex-col gap-1">
                    <span className="font-sans font-extrabold uppercase text-[#111111]">
                      Sound Audio .m4a / .mp3 (MediaFire &amp; Google Drive)
                    </span>
                    <span className="text-[#111111] font-bold break-all">
                      https://www.mediafire.com/file/[ID]/[nama_sound].m4a/file
                    </span>
                  </div>
                </div>
              </div>

              <div
                id="xml-format"
                className="bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] p-5 space-y-3"
              >
                <div className="flex items-center justify-between border-b-2 border-[#111111] pb-2">
                  <h2
                    className="text-lg font-extrabold uppercase tracking-wider text-[#111111]"
                    style={{fontFamily: 'var(--font-display), sans-serif'}}
                  >
                    02. Dukungan Inspeksi Scene XML Alight Motion
                  </h2>
                  <span className="w-3.5 h-3.5 bg-[#F25C05] border border-[#111111]" />
                </div>
                <p className="text-xs text-[#111111]/80 font-medium leading-relaxed">
                  Setiap tautan XML Google Drive dilengkapi pembaca struktur header{' '}
                  <span className="font-mono font-bold text-xs text-[#111111] bg-[#F7B91C] px-1">
                    &lt;scene&gt;
                  </span>{' '}
                  Alight Motion untuk memverifikasi resolusi kanvas, frame rate, dan versi aplikasi:
                </p>
                <pre className="p-3.5 bg-[#F6F5F0] text-[#111111] font-mono text-xs font-semibold leading-relaxed overflow-x-auto border-2 border-[#111111]">
{`<?xml version='1.0' encoding='UTF-8' ?><!--
Created by Alight Motion (http://alightmotion.com)
5.0.272.1028400 (1028400) edd8b98
-->
<scene title="Prstdap || 1105" width="1080" height="1920"
  fps="60" totalTime="24516" amplatform="android">`}
                </pre>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Neobrutalist Footer */}
      <footer className="mt-8 sm:mt-12 border-t-2 border-[#111111] bg-white px-4 sm:px-8 py-7">
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center text-center gap-3 text-xs text-[#111111]">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Image
              src="/assets/alight-motion-logo.jpg"
              alt="Alight Motion"
              width={22}
              height={22}
              referrerPolicy="no-referrer"
              className="border-2 border-[#111111]"
            />
            <span className="font-bold">Developed by</span>
            <strong
              className="text-base font-extrabold uppercase tracking-wider bg-[#F7B91C] px-2 py-0.5 border-2 border-[#111111]"
              style={{fontFamily: 'var(--font-display), sans-serif'}}
            >
              SANN404 FORUM GROUP
            </strong>
          </div>

          <p className="text-xs font-medium text-[#111111]/80 max-w-md">
            Dapatkan update preset Alight Motion terbaru &amp; info komunitas melalui saluran resmi:
          </p>

          <a
            href="https://whatsapp.com/channel/0029Vb6ukqnHQbS4mKP0j80L"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-stretch border-2 border-[#111111] shadow-[3px_3px_0px_#111111] bg-[#F7B91C] hover:bg-[#e5a812] text-[#111111] transition-transform active:translate-x-0.5 active:translate-y-0.5"
          >
            <span
              className="px-4 py-2 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5"
              style={{fontFamily: 'var(--font-display), sans-serif'}}
            >
              <span>Saluran Resmi SANN404 FORUM GROUP (WhatsApp)</span>
            </span>
            <span className="px-2.5 bg-[#111111] text-white flex items-center justify-center border-l-2 border-[#111111]">
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
          </a>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-bold text-[#111111]/75">
            <span>PresetFinder Studio</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsExtractorOpen(true)}
              className="hover:text-[#F25C05] underline transition-colors"
            >
              Filter Komentar Manual
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleExportSavedJson}
              className="hover:text-[#F25C05] underline transition-colors"
            >
              Ekspor Daftar ({savedEntries.length})
            </button>
          </div>
        </div>
      </footer>

      {/* Detail Modal with Embedded VT Video Player */}
      <VtDetailModal
        entry={selectedEntry}
        isSaved={
          selectedEntry ? savedEntries.some((s) => s.id === selectedEntry.id) : false
        }
        onClose={() => setSelectedEntry(null)}
        onToggleSave={handleToggleSave}
      />

      {/* Manual Comment / Description Extractor Modal */}
      <ManualExtractorModal
        isOpen={isExtractorOpen}
        onClose={() => setIsExtractorOpen(false)}
        onAddExtractedEntry={handleAddManualEntry}
      />
    </div>
  );
}
