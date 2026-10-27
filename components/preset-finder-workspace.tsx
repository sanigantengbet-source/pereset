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
} from 'lucide-react';
import {
  summarizePresetLinks,
  filterAndSortVtEntries,
  detectPresetCategory,
  getPresetCategoryMeta,
  type PlatformType,
  type PresetLinkType,
  type PresetCategoryType,
  type VtPresetEntry,
} from '@/lib/preset-filter';
import {
  getSeedVtEntries,
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
  {id: 'all', label: 'Semua Kategori', shortLabel: 'Semua', dotColor: '#8b949e'},
  {id: 'jj_presets', label: 'JJ Presets', shortLabel: 'JJ Presets', dotColor: '#58a6ff'},
  {id: 'cinematic', label: 'Cinematic', shortLabel: 'Cinematic', dotColor: '#a371f7'},
  {id: 'color_grading', label: 'Color Grading', shortLabel: 'Color Grading', dotColor: '#d29922'},
  {id: 'velocity', label: 'Velocity & Slowmo', shortLabel: 'Velocity', dotColor: '#3fb950'},
  {id: 'gameplay', label: 'Gameplay ML/FF', shortLabel: 'Gameplay', dotColor: '#f78166'},
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

export function PresetFinderWorkspace() {
  const initialSearchEntries = useMemo(() => getSeedVtEntries(), []);
  const initialTrendingEntries = useMemo(() => getTrendingByTopic('all', false), []);

  // Separate Beranda (Trending Realtime), Pencarian (Search), and Tersimpan (Saved)
  const [activeView, setActiveView] = useState<'beranda' | 'search' | 'saved'>('beranda');

  // Search & Filter state
  const [searchInput, setSearchInput] = useState('kicau mania');
  const [activeQuery, setActiveQuery] = useState('kicau mania');
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

  const executeSearch = async (queryToRun: string) => {
    const trimmed = queryToRun.trim();
    setActiveQuery(trimmed);
    setActiveView('search');
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
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-[#e6edf3]">
      {/* Top Bar Contract: 3 Zones separated by gap-8 (GitHub Dark Header) */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-8 py-3 bg-[#161b22] border-b border-[#30363d]">
        {/* Zone 1: Official Alight Motion Logo + Brand Name */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveView('beranda');
          }}
          className="flex items-center gap-2.5 text-sm sm:text-base font-bold tracking-tight text-[#f0f6fc] whitespace-nowrap shrink-0"
          style={{fontFamily: 'var(--font-display), sans-serif'}}
        >
          <Image
            src="/assets/alight-motion-logo.jpg"
            alt="Alight Motion Logo"
            width={28}
            height={28}
            referrerPolicy="no-referrer"
            className="rounded-md border border-[#30363d] shrink-0"
          />
          <span>PresetFinder Studio</span>
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav
          aria-label="Navigasi Utama"
          className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-[#8b949e]"
        >
          <button
            type="button"
            onClick={() => setActiveView('beranda')}
            className={`hover:text-[#f0f6fc] transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'beranda'
                ? 'text-[#f0f6fc] underline underline-offset-8 decoration-2 decoration-[#f78166] font-semibold'
                : ''
            }`}
          >
            Beranda Trending ({trendingEntries.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveView('search')}
            className={`hover:text-[#f0f6fc] transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'search'
                ? 'text-[#f0f6fc] underline underline-offset-8 decoration-2 decoration-[#f78166] font-semibold'
                : ''
            }`}
          >
            Pencarian Sound ({entries.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveView('saved')}
            className={`hover:text-[#f0f6fc] transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'saved'
                ? 'text-[#f0f6fc] underline underline-offset-8 decoration-2 decoration-[#f78166] font-semibold'
                : ''
            }`}
          >
            Tersimpan ({savedEntries.length})
          </button>
          <a
            href="#filter-rules"
            className="hover:text-[#f0f6fc] transition-colors whitespace-nowrap shrink-0"
          >
            Dokumentasi XML
          </a>
        </nav>

        {/* Zone 3: Quick Search Jump (No Manual Extractor in Top Bar) */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() =>
              setActiveView(activeView === 'search' ? 'beranda' : 'search')
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#c9d1d9] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            {activeView === 'search' ? (
              <>
                <Flame className="w-3.5 h-3.5 text-[#f78166]" />
                <span>Ke Beranda Tren</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5 text-[#58a6ff]" />
                <span>Cari Sound VT</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main
        id="top"
        className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4"
      >
        {/* GitHub-Style Tab Switcher Bar */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-1">
          <div
            role="tablist"
            aria-label="Pilih Halaman Utama"
            className="grid grid-cols-3 gap-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'beranda'}
              onClick={() => setActiveView('beranda')}
              className={`flex items-center justify-center gap-1.5 px-2 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeView === 'beranda'
                  ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]/50'
              }`}
            >
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#f78166]" />
              <span className="sm:hidden">Beranda</span>
              <span className="hidden sm:inline">Beranda Trending</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'search'}
              onClick={() => setActiveView('search')}
              className={`flex items-center justify-center gap-1.5 px-2 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeView === 'search'
                  ? 'bg-[#1f6feb] text-white'
                  : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]/50'
              }`}
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="sm:hidden">Pencarian</span>
              <span className="hidden sm:inline">Pencarian Sound</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'saved'}
              onClick={() => setActiveView('saved')}
              className={`flex items-center justify-center gap-1.5 px-2 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeView === 'saved'
                  ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]/50'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#58a6ff]" />
              <span>Tersimpan ({savedEntries.length})</span>
            </button>
          </div>
        </div>

        {/* Simple, Centered, Non-Intrusive Developer Credit & Official Channel Strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-3 py-1 text-center text-xs text-[#8b949e]">
          <span>
            Developer:{' '}
            <strong className="font-semibold text-[#f0f6fc] tracking-tight">
              SANN404 FORUM GROUP
            </strong>
          </span>
          <span aria-hidden="true" className="text-[#30363d]">
            ·
          </span>
          <a
            href="https://whatsapp.com/channel/0029Vb6ukqnHQbS4mKP0j80L"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-[#3fb950] hover:underline transition-colors"
          >
            <span>Saluran Resmi WhatsApp</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* GitHub-Style 2-Column Layout: Left Sidebar (Logo + Category Filters + Manual Extractor) + Right Main Repository Results */}
        <div className="grid grid-cols-1 lg:grid-cols-[270px_1fr] gap-5 items-start">
          {/* LEFT SIDEBAR: Official Alight Motion Logo Top Card, Category Filter, Platform/Link Filters, and Relocated Manual Extractor */}
          <aside className="space-y-4 lg:sticky lg:top-16">
            {/* Top Sidebar Card: Official Alight Motion Identity */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Image
                  src="/assets/alight-motion-logo.jpg"
                  alt="Alight Motion Official Logo"
                  width={44}
                  height={44}
                  referrerPolicy="no-referrer"
                  className="rounded-xl border border-[#30363d] shrink-0"
                />
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-[#f0f6fc] truncate">
                    Alight Motion Hub
                  </h2>
                  <p className="text-xs text-[#8b949e] truncate">
                    Preset &amp; Sound VT Index
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Indeks repositori link preset <span className="text-[#e6edf3]">5MB</span>,{' '}
                <span className="text-[#e6edf3]">XML Drive</span>, dan{' '}
                <span className="text-[#e6edf3]">Sound</span> dari kreator VT TikTok &amp; YouTube.
              </p>
            </div>

            {/* Category Filter Card ('JJ Presets', 'Cinematic', 'Color Grading', 'Velocity', 'Gameplay') */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8b949e] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#58a6ff]" />
                  <span>Filter Kategori Preset</span>
                </h3>
                {categoryFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('all')}
                    className="text-[11px] text-[#58a6ff] hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Desktop Vertical List & Mobile 2-Col Grid */}
              <div
                role="group"
                aria-label="Filter Kategori Preset"
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1"
              >
                {PRESET_CATEGORIES.map((cat) => {
                  const isSelected = categoryFilter === cat.id;
                  const count = categoryCounts[cat.id] ?? 0;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectSidebarCategory(cat.id)}
                      className={`flex items-center justify-between gap-2 px-2.5 py-2 text-xs rounded-md border transition-colors text-left ${
                        isSelected
                          ? 'bg-[#1f6feb]/20 text-[#f0f6fc] border-[#1f6feb] font-semibold'
                          : 'bg-[#0d1117]/60 text-[#c9d1d9] border-transparent hover:bg-[#21262d] hover:text-[#f0f6fc]'
                      }`}
                    >
                      <span className="flex items-center gap-2 min-w-0 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{backgroundColor: cat.dotColor}}
                        />
                        <span className="truncate">{cat.label}</span>
                      </span>
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#21262d] text-[#8b949e] tabular-nums shrink-0">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platform & Link Type Filters inside Sidebar */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3.5 space-y-3">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-[#8b949e] block">
                  Platform Sumber VT
                </span>
                <div
                  role="group"
                  aria-label="Filter Platform"
                  className="grid grid-cols-3 gap-1 p-1 bg-[#0d1117] border border-[#30363d] rounded-md"
                >
                  <button
                    type="button"
                    onClick={() => setPlatformFilter('all')}
                    className={`px-2 py-1.5 text-xs font-medium rounded transition-colors text-center ${
                      platformFilter === 'all'
                        ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                        : 'text-[#8b949e] hover:text-[#f0f6fc]'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatformFilter('tiktok')}
                    className={`px-2 py-1.5 text-xs font-medium rounded transition-colors text-center ${
                      platformFilter === 'tiktok'
                        ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                        : 'text-[#8b949e] hover:text-[#f0f6fc]'
                    }`}
                  >
                    TikTok
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatformFilter('youtube')}
                    className={`px-2 py-1.5 text-xs font-medium rounded transition-colors text-center ${
                      platformFilter === 'youtube'
                        ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                        : 'text-[#8b949e] hover:text-[#f0f6fc]'
                    }`}
                  >
                    YouTube
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-[#8b949e] block">
                  Jenis File Preset
                </span>
                <div
                  role="group"
                  aria-label="Filter Jenis Link"
                  className="grid grid-cols-2 gap-1 p-1 bg-[#0d1117] border border-[#30363d] rounded-md"
                >
                  <button
                    type="button"
                    onClick={() => setLinkTypeFilter('all')}
                    className={`px-2 py-1.5 text-xs font-medium rounded transition-colors text-center ${
                      linkTypeFilter === 'all'
                        ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                        : 'text-[#8b949e] hover:text-[#f0f6fc]'
                    }`}
                  >
                    Semua Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkTypeFilter('am_5mb')}
                    className={`px-2 py-1.5 text-xs font-medium rounded transition-colors text-center ${
                      linkTypeFilter === 'am_5mb'
                        ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                        : 'text-[#8b949e] hover:text-[#f0f6fc]'
                    }`}
                  >
                    Prst 5MB
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkTypeFilter('xml_drive')}
                    className={`px-2 py-1.5 text-xs font-medium rounded transition-colors text-center ${
                      linkTypeFilter === 'xml_drive'
                        ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                        : 'text-[#8b949e] hover:text-[#f0f6fc]'
                    }`}
                  >
                    Prst XML
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkTypeFilter('sound_audio')}
                    className={`px-2 py-1.5 text-xs font-medium rounded transition-colors text-center ${
                      linkTypeFilter === 'sound_audio'
                        ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                        : 'text-[#8b949e] hover:text-[#f0f6fc]'
                    }`}
                  >
                    Sound Audio
                  </button>
                </div>
              </div>
            </div>

            {/* Relocated Manual Comment Extractor Card (Moved from Top Bar to Sidebar) */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3.5 space-y-2.5">
              <h3 className="text-xs font-semibold text-[#f0f6fc]">
                Ekstraktor Komentar Manual
              </h3>
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Punya teks komentar atau deskripsi VT sendiri? Tempel dan saring otomatis link 5MB,
                XML, &amp; Sound.
              </p>
              <button
                type="button"
                onClick={() => setIsExtractorOpen(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-[#f0f6fc] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#3fb950]" />
                <span>Filter Komentar Manual</span>
              </button>
            </div>
          </aside>

          {/* RIGHT MAIN COLUMN: Search / Trending Header + GitHub Open-Source Repository Style Result List */}
          <div className="space-y-4 min-w-0">
            {/* VIEW 1: BERANDA TRENDING REALTIME HEADER */}
            {activeView === 'beranda' && (
              <section className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 sm:p-5 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-[#f78166]">
                        <Radio className="w-3.5 h-3.5 animate-pulse" />
                        <span>LIVE TRENDING REPOSITORIES</span>
                      </span>
                      <span aria-hidden="true" className="text-[#30363d]">
                        ·
                      </span>
                      <span className="text-[#8b949e] font-mono tabular-nums">
                        Update terakhir:{' '}
                        <strong className="text-[#f0f6fc]">{lastTrendingSync}</strong>
                      </span>
                    </div>

                    <h1
                      className="text-lg sm:text-2xl font-bold text-[#f0f6fc] tracking-tight leading-snug"
                      style={{
                        fontFamily: 'var(--font-display), sans-serif',
                        textWrap: 'balance',
                      }}
                    >
                      Beranda Preset Trending Realtime dengan Like Terbanyak
                    </h1>

                    <p className="text-xs sm:text-sm text-[#8b949e] leading-relaxed">
                      Daftar repositori VT preset Alight Motion yang sedang viral di TikTok &amp;
                      YouTube saat ini, diurutkan otomatis berdasarkan jumlah{' '}
                      <strong className="text-[#f0f6fc]">Like terbanyak</strong>.
                    </p>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => fetchTrendingRealtime(trendingCategory, true)}
                      disabled={isTrendingLoading}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-[#c9d1d9] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] disabled:opacity-60 rounded-md transition-colors whitespace-nowrap"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${
                          isTrendingLoading ? 'animate-spin text-[#58a6ff]' : ''
                        }`}
                      />
                      <span>{isTrendingLoading ? 'Menyinkronkan...' : 'Perbarui Tren'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveView('search')}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#238636] hover:bg-[#2ea043] rounded-md transition-colors whitespace-nowrap"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Cari Sound Spesifik</span>
                    </button>
                  </div>
                </div>

                {/* Trending Topics / Sound Categories (GitHub Explore Topics style) */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#30363d]">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
                    <span className="text-xs text-[#8b949e] whitespace-nowrap shrink-0 mr-1">
                      Topik Tren:
                    </span>
                    {TRENDING_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectTrendingCategory(cat.id)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors whitespace-nowrap shrink-0 ${
                          trendingCategory === cat.id
                            ? 'bg-[#1f6feb] text-white border-[#1f6feb]'
                            : 'bg-[#1f6feb]/10 text-[#58a6ff] border-[#1f6feb]/30 hover:bg-[#1f6feb]/20'
                        }`}
                      >
                        #{cat.label.toLowerCase().replace(/\s+/g, '-')}
                      </button>
                    ))}
                  </div>

                  <label className="inline-flex items-center gap-2 text-xs text-[#8b949e] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isAutoRealtime}
                      onChange={(e) => setIsAutoRealtime(e.target.checked)}
                      className="rounded border-[#30363d] bg-[#0d1117] text-[#238636] focus:ring-[#58a6ff]"
                    />
                    <span>Auto-Update Realtime (45 dtk)</span>
                  </label>
                </div>
              </section>
            )}

            {/* VIEW 2: PENCARIAN SOUND HEADER (GitHub Repository Search Bar & Explore Topics) */}
            {activeView === 'search' && (
              <section className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 sm:p-5 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#58a6ff] font-mono">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>GitHub-Style Preset Repository Search · Tanpa Batas Hasil</span>
                  </div>
                  <h1
                    className="text-lg sm:text-2xl font-bold text-[#f0f6fc] tracking-tight leading-snug"
                    style={{
                      fontFamily: 'var(--font-display), sans-serif',
                      textWrap: 'balance',
                    }}
                  >
                    Cari Nama Sound &amp; Filter Kategori Preset Alight Motion
                  </h1>
                  <p className="text-xs sm:text-sm text-[#8b949e] leading-relaxed">
                    Ketik nama sound seperti{' '}
                    <strong className="text-[#f0f6fc]">“kicau mania”</strong> lalu pilih kategori{' '}
                    <span className="text-[#58a6ff]">JJ Presets</span>,{' '}
                    <span className="text-[#a371f7]">Cinematic</span>, atau{' '}
                    <span className="text-[#d29922]">Color Grading</span> untuk menyaring seluruh
                    link preset secara instan.
                  </p>
                </div>

                {/* GitHub Search Input Form */}
                <form onSubmit={handleSearchSubmit} className="space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <label htmlFor="sound-search-input" className="sr-only">
                        Cari nama sound atau VT preset
                      </label>
                      <Search className="w-4 h-4 text-[#8b949e] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="sound-search-input"
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Cari repositori sound preset (contoh: kicau mania)..."
                        className="w-full pl-10 pr-9 py-2 text-sm bg-[#0d1117] border border-[#30363d] rounded-md text-[#f0f6fc] placeholder:text-[#8b949e] focus:outline-none focus:ring-2 focus:ring-[#58a6ff]"
                      />
                      {searchInput && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchInput('');
                            executeSearch('');
                          }}
                          aria-label="Bersihkan kata kunci pencarian"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8b949e] hover:text-[#f0f6fc] rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#238636] hover:bg-[#2ea043] disabled:opacity-60 rounded-md transition-colors whitespace-nowrap shrink-0 min-h-[38px]"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Memindai VT...</span>
                        </>
                      ) : (
                        <span>Cari Semua Preset</span>
                      )}
                    </button>
                  </div>

                  {/* GitHub-Style Recommended Sound Topics */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    <span className="text-[#8b949e] whitespace-nowrap shrink-0 mr-1">
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
                        className={`px-2.5 py-1 rounded-full border font-mono text-[11px] transition-colors whitespace-nowrap shrink-0 ${
                          activeQuery.toLowerCase() === sound.toLowerCase() &&
                          activeView === 'search'
                            ? 'bg-[#1f6feb] text-white border-[#1f6feb] font-semibold'
                            : 'bg-[#1f6feb]/10 text-[#58a6ff] border-[#1f6feb]/30 hover:bg-[#1f6feb]/20'
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
                      className={`px-2.5 py-1 rounded-full border font-mono text-[11px] transition-colors whitespace-nowrap shrink-0 ${
                        activeQuery === '' && activeView === 'search'
                          ? 'bg-[#1f6feb] text-white border-[#1f6feb] font-semibold'
                          : 'bg-[#21262d] text-[#c9d1d9] border-[#30363d] hover:bg-[#30363d]'
                      }`}
                    >
                      #semua-sound ({entries.length})
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* GitHub Search Result Count & Sort Header Bar */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[#c9d1d9]">
                <strong className="text-[#f0f6fc] font-mono tabular-nums text-sm">
                  {activeList.length} repository results
                </strong>
                <span className="text-[#8b949e]">
                  ({totalFilteredLinks} link preset aktif)
                </span>
                {categoryFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1f6feb]/20 text-[#58a6ff] border border-[#1f6feb]/40 font-medium">
                    <span>
                      Kategori:{' '}
                      {PRESET_CATEGORIES.find((c) => c.id === categoryFilter)?.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCategoryFilter('all')}
                      aria-label="Hapus filter kategori"
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2">
                {activeView !== 'beranda' && (
                  <div className="flex items-center gap-1.5 text-xs text-[#8b949e]">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#8b949e] shrink-0" />
                    <span>Sort:</span>
                    <select
                      id="sort-select"
                      aria-label="Urutkan hasil"
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(e.target.value as 'likes' | 'views' | 'links')
                      }
                      className="px-2.5 py-1 text-xs font-medium bg-[#21262d] border border-[#30363d] rounded-md text-[#f0f6fc] focus:outline-none focus:ring-2 focus:ring-[#58a6ff]"
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
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#c9d1d9] bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] rounded-md transition-colors whitespace-nowrap shrink-0"
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
                    : `Memindai dan menyaring repositori preset untuk "${activeQuery}"...`
                }
              />
            ) : activeList.length === 0 ? (
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 sm:p-10 text-center space-y-3">
                <p className="text-base font-semibold text-[#f0f6fc]">
                  Tidak ada repositori VT preset yang cocok dengan filter saat ini
                </p>
                <p className="text-xs sm:text-sm text-[#8b949e] max-w-md mx-auto">
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
                      if (activeView === 'beranda') {
                        handleSelectTrendingCategory('all');
                      } else {
                        setSearchInput('kicau mania');
                        executeSearch('kicau mania');
                      }
                    }}
                    className="px-4 py-2 text-xs font-medium text-white bg-[#238636] hover:bg-[#2ea043] rounded-md"
                  >
                    Reset Filter &amp; Tampilkan Semua Preset
                  </button>
                </div>
              </div>
            ) : (
              /* GitHub Open-Source Repository Search Results List (Unlimited) */
              <div className="space-y-3">
                {activeList.map((entry, idx) => {
                  const summary = summarizePresetLinks(entry.links);
                  const catMeta = getPresetCategoryMeta(detectPresetCategory(entry));
                  const repoSlug = buildRepoSlug(entry);
                  const isSaved = savedEntries.some((s) => s.id === entry.id);
                  const isExpanded = Boolean(expandedCardIds[entry.id]);
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
                      className="bg-[#161b22] border border-[#30363d] hover:border-[#8b949e]/60 rounded-lg p-4 transition-colors space-y-3"
                    >
                      {/* GitHub Repo Card Header: owner/repo-slug + Public badge + Star/Detail actions */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 min-w-0 flex-1">
                          {/* Repo Path Line */}
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <BookMarked className="w-4 h-4 text-[#8b949e] shrink-0" />
                            <button
                              type="button"
                              onClick={() => setSelectedEntry(entry)}
                              className="text-left font-mono text-sm sm:text-base font-semibold text-[#58a6ff] hover:underline break-all"
                            >
                              {entry.creatorHandle.replace(/^@/, '')}
                              <span className="text-[#8b949e] font-normal mx-0.5">/</span>
                              <span>{repoSlug}</span>
                            </button>

                            <span className="px-2 py-0.5 text-[11px] font-medium text-[#8b949e] border border-[#30363d] rounded-full whitespace-nowrap">
                              {entry.platform === 'tiktok' ? 'TikTok VT' : 'YouTube'}
                            </span>

                            <span className="font-mono text-[11px] text-[#8b949e] tabular-nums">
                              {activeView === 'beranda'
                                ? `Trending #${String(idx + 1).padStart(2, '0')}`
                                : `#${String(idx + 1).padStart(2, '0')}`}
                            </span>
                          </div>

                          {/* Repo Description (VT Title & Sound) */}
                          <h2 className="text-sm sm:text-base font-medium text-[#e6edf3] leading-snug">
                            <button
                              type="button"
                              onClick={() => setSelectedEntry(entry)}
                              className="text-left hover:text-[#58a6ff] transition-colors"
                            >
                              {entry.vtTitle}
                            </button>
                          </h2>

                          <p className="text-xs text-[#8b949e]">
                            Sound:{' '}
                            <strong className="text-[#c9d1d9] font-medium">
                              {entry.soundName}
                            </strong>
                          </p>

                          {/* GitHub-Style Topic Links Row */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px] font-mono">
                            <button
                              type="button"
                              onClick={() => setCategoryFilter(catMeta.id)}
                              className="px-2 py-0.5 rounded-full bg-[#1f6feb]/15 text-[#58a6ff] hover:bg-[#1f6feb]/30 transition-colors"
                            >
                              {catMeta.badgeText}
                            </button>
                            {summary.am5mbCount > 0 && (
                              <button
                                type="button"
                                onClick={() => setLinkTypeFilter('am_5mb')}
                                className="px-2 py-0.5 rounded-full bg-[#1f6feb]/15 text-[#58a6ff] hover:bg-[#1f6feb]/30 transition-colors"
                              >
                                preset-5mb ({summary.am5mbCount})
                              </button>
                            )}
                            {summary.xmlCount > 0 && (
                              <button
                                type="button"
                                onClick={() => setLinkTypeFilter('xml_drive')}
                                className="px-2 py-0.5 rounded-full bg-[#1f6feb]/15 text-[#58a6ff] hover:bg-[#1f6feb]/30 transition-colors"
                              >
                                xml-drive ({summary.xmlCount})
                              </button>
                            )}
                            {summary.soundCount > 0 && (
                              <button
                                type="button"
                                onClick={() => setLinkTypeFilter('sound_audio')}
                                className="px-2 py-0.5 rounded-full bg-[#1f6feb]/15 text-[#58a6ff] hover:bg-[#1f6feb]/30 transition-colors"
                              >
                                sound-audio ({summary.soundCount})
                              </button>
                            )}
                          </div>

                          {/* GitHub Open-Source Repo Metadata Row (Category Dot, Likes, Comments, Views, Updated) */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-[#8b949e]">
                            <span className="inline-flex items-center gap-1.5 text-[#c9d1d9]">
                              <span
                                className="w-3 h-3 rounded-full inline-block"
                                style={{backgroundColor: catMeta.dotColor}}
                              />
                              <span>{catMeta.label}</span>
                            </span>

                            <span className="inline-flex items-center gap-1 font-mono tabular-nums text-[#c9d1d9]">
                              <Heart className="w-3.5 h-3.5 text-[#f78166] fill-[#f78166]" />
                              <strong>{entry.likesCount.toLocaleString('id-ID')}</strong>
                            </span>

                            <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                              <MessageSquare className="w-3.5 h-3.5 text-[#8b949e]" />
                              <span>{entry.commentsCount.toLocaleString('id-ID')}</span>
                            </span>

                            <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                              <Eye className="w-3.5 h-3.5 text-[#8b949e]" />
                              <span>{entry.viewsCount.toLocaleString('id-ID')}</span>
                            </span>

                            <span>Updated {entry.publishedAt}</span>
                          </div>
                        </div>

                        {/* Right Column: GitHub-style Action Buttons */}
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 shrink-0 pt-1 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => setSelectedEntry(entry)}
                            className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#238636] hover:bg-[#2ea043] rounded-md transition-colors whitespace-nowrap shrink-0 text-center"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>
                              {entry.platform === 'tiktok'
                                ? `Lihat VT & Detail (${entry.links.length})`
                                : `Lihat YT & Detail (${entry.links.length})`}
                            </span>
                          </button>

                          <a
                            href={entry.platform === 'tiktok' ? tiktokHref : youtubeHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#c9d1d9] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-md transition-colors whitespace-nowrap shrink-0"
                          >
                            <span>
                              {entry.platform === 'tiktok' ? 'Buka TikTok' : 'Buka YouTube'}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleToggleSave(entry)}
                            aria-label={
                              isSaved
                                ? `Hapus ${entry.vtTitle} dari daftar tersimpan`
                                : `Simpan ${entry.vtTitle} ke daftar`
                            }
                            className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                              isSaved
                                ? 'bg-[#1f6feb]/20 text-[#58a6ff] border-[#1f6feb]/50 hover:bg-[#1f6feb]/30'
                                : 'bg-[#21262d] text-[#c9d1d9] border-[#30363d] hover:bg-[#30363d]'
                            }`}
                          >
                            {isSaved ? (
                              <>
                                <BookmarkCheck className="w-3.5 h-3.5 text-[#58a6ff]" />
                                <span>Tersimpan</span>
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-3.5 h-3.5" />
                                <span>Simpan</span>
                              </>
                            )}
                          </button>

                          {activeView === 'saved' && (
                            <button
                              type="button"
                              onClick={() => handleToggleSave(entry)}
                              aria-label={`Hapus ${entry.vtTitle}`}
                              className="p-1.5 text-[#8b949e] hover:text-rose-400 hover:bg-rose-950/40 rounded-md transition-colors justify-self-end"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Filtered Links Rangkuman Box inside GitHub Repo Card */}
                      <div className="bg-[#0d1117] border border-[#30363d] rounded-md p-3 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#8b949e] border-b border-[#21262d] pb-2">
                          <div className="flex flex-wrap items-center gap-1.5 font-medium text-[#c9d1d9]">
                            <span>Rangkuman Link Preset:</span>
                            <span className="font-mono tabular-nums text-[#8b949e] font-normal">
                              {summary.am5mbCount > 0 && `${summary.am5mbCount}× Prst 5MB`}
                              {summary.am5mbCount > 0 && summary.xmlCount > 0 && ' · '}
                              {summary.xmlCount > 0 && `${summary.xmlCount}× Prst XML`}
                              {(summary.am5mbCount > 0 || summary.xmlCount > 0) &&
                                summary.soundCount > 0 &&
                                ' · '}
                              {summary.soundCount > 0 && `${summary.soundCount}× Sound`}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs">
                            <button
                              type="button"
                              onClick={() => setSelectedEntry(entry)}
                              className="text-[#58a6ff] hover:underline font-medium cursor-pointer"
                            >
                              {entry.platform === 'tiktok' ? 'Putar Video VT' : 'Putar Video YT'}
                            </button>
                            <span className="text-[#30363d]">·</span>
                            {entry.platform === 'tiktok' ? (
                              <a
                                href={tiktokHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#8b949e] hover:text-[#f0f6fc] underline"
                              >
                                VT TikTok
                              </a>
                            ) : (
                              <a
                                href={youtubeHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#8b949e] hover:text-[#f0f6fc] underline"
                              >
                                Video YouTube
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-1.5">
                          {visibleLinks.map((link) => (
                            <div
                              key={link.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1.5 px-2.5 rounded bg-[#161b22] border border-[#30363d]/80 text-xs"
                            >
                              <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-0 sm:flex sm:items-center sm:gap-2">
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {link.type === 'am_5mb' ? (
                                    <Share2 className="w-3.5 h-3.5 text-[#58a6ff] shrink-0" />
                                  ) : link.type === 'xml_drive' ? (
                                    <FileCode2 className="w-3.5 h-3.5 text-[#3fb950] shrink-0" />
                                  ) : (
                                    <Music className="w-3.5 h-3.5 text-[#d29922] shrink-0" />
                                  )}
                                  <span className="font-semibold text-[#e6edf3] whitespace-nowrap">
                                    {link.label} :
                                  </span>
                                </div>
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block font-mono text-[#58a6ff] hover:underline truncate"
                                >
                                  {link.url}
                                </a>
                              </div>

                              <div className="flex items-center justify-end gap-1.5 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#21262d]">
                                {link.xmlMeta && (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedEntry(entry)}
                                    className="px-2 py-1 text-xs font-mono text-[#8b949e] hover:text-[#f0f6fc] bg-[#21262d] hover:bg-[#30363d] rounded transition-colors truncate max-w-[130px] sm:max-w-none"
                                  >
                                    {link.xmlMeta.fileName}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleQuickCopy(link.url, link.id)}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#c9d1d9] hover:text-white bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded transition-colors whitespace-nowrap shrink-0"
                                >
                                  {copiedLinkKey === link.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-[#3fb950]" />
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
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#c9d1d9] hover:text-white bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded transition-colors whitespace-nowrap shrink-0"
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
                              className="w-full py-1.5 text-xs font-medium text-[#58a6ff] hover:underline bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] rounded inline-flex items-center justify-center gap-1 transition-colors"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-3.5 h-3.5" />
                                  <span>Sembunyikan sebagian link</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3.5 h-3.5" />
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

            {/* Reference & Filter Specification Section (GitHub README style) */}
            <section
              id="filter-rules"
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2"
            >
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 sm:p-5 space-y-3">
                <h2
                  className="text-sm sm:text-base font-semibold text-[#f0f6fc]"
                  style={{fontFamily: 'var(--font-display), sans-serif'}}
                >
                  01. Spesifikasi Filter Link Preset Ketat
                </h2>
                <p className="text-xs text-[#8b949e] leading-relaxed">
                  Setiap deskripsi video dan komentar VT dipindai baris demi baris. Hanya tautan
                  yang memenuhi struktur domain preset resmi di bawah ini yang disimpan ke dalam
                  repositori:
                </p>
                <div className="divide-y divide-[#30363d] border border-[#30363d] rounded-md text-xs font-mono bg-[#0d1117]">
                  <div className="p-2.5 flex flex-col gap-1">
                    <span className="font-sans font-semibold text-[#f0f6fc]">
                      Preset 5MB (Alight Creative Direct Share)
                    </span>
                    <span className="text-[#58a6ff] break-all">
                      https://alightcreative.com/am/share/u/[UID]/p/[PROJECT_ID]
                    </span>
                  </div>
                  <div className="p-2.5 flex flex-col gap-1">
                    <span className="font-sans font-semibold text-[#f0f6fc]">
                      Preset XML &amp; Folder Paket (Google Drive)
                    </span>
                    <span className="text-[#3fb950] break-all">
                      https://drive.google.com/file/d/[FILE_ID]/view?usp=drivesdk
                    </span>
                  </div>
                  <div className="p-2.5 flex flex-col gap-1">
                    <span className="font-sans font-semibold text-[#f0f6fc]">
                      Sound Audio .m4a / .mp3 (MediaFire &amp; Google Drive)
                    </span>
                    <span className="text-[#d29922] break-all">
                      https://www.mediafire.com/file/[ID]/[nama_sound].m4a/file
                    </span>
                  </div>
                </div>
              </div>

              <div
                id="xml-format"
                className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 sm:p-5 space-y-3"
              >
                <h2
                  className="text-sm sm:text-base font-semibold text-[#f0f6fc]"
                  style={{fontFamily: 'var(--font-display), sans-serif'}}
                >
                  02. Dukungan Inspeksi Scene XML Alight Motion
                </h2>
                <p className="text-xs text-[#8b949e] leading-relaxed">
                  Setiap tautan XML Google Drive dilengkapi pembaca struktur header{' '}
                  <span className="font-mono text-xs text-[#e6edf3]">&lt;scene&gt;</span> Alight
                  Motion untuk memverifikasi resolusi kanvas, frame rate, dan versi aplikasi:
                </p>
                <pre className="p-3 rounded-md bg-[#0d1117] text-[#e6edf3] font-mono text-xs leading-relaxed overflow-x-auto border border-[#30363d]">
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

      {/* Centered, Simple, Non-Intrusive Developer Credit & Official Channel Footer (GitHub Dark Footer) */}
      <footer className="mt-8 sm:mt-12 border-t border-[#30363d] bg-[#161b22] px-4 sm:px-8 py-6">
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center text-center gap-2.5 text-xs text-[#8b949e]">
          <div className="flex flex-wrap items-center justify-center gap-2 text-[#c9d1d9]">
            <Image
              src="/assets/alight-motion-logo.jpg"
              alt="Alight Motion"
              width={20}
              height={20}
              referrerPolicy="no-referrer"
              className="rounded border border-[#30363d]"
            />
            <span>Developed by</span>
            <strong
              className="font-bold text-[#f0f6fc] tracking-tight"
              style={{fontFamily: 'var(--font-display), sans-serif'}}
            >
              SANN404 FORUM GROUP
            </strong>
          </div>

          <p className="text-xs text-[#8b949e] max-w-md">
            Dapatkan update preset Alight Motion terbaru &amp; info komunitas melalui saluran resmi:
          </p>

          <a
            href="https://whatsapp.com/channel/0029Vb6ukqnHQbS4mKP0j80L"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#238636] hover:bg-[#2ea043] rounded-md transition-colors"
          >
            <span>Saluran Resmi SANN404 FORUM GROUP (WhatsApp)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px] text-[#8b949e]">
            <span>PresetFinder Studio</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsExtractorOpen(true)}
              className="hover:text-[#f0f6fc] transition-colors"
            >
              Filter Komentar Manual
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleExportSavedJson}
              className="hover:text-[#f0f6fc] transition-colors"
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
