'use client';

import React, {useState, useEffect} from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  FileCode2,
  Music,
  Share2,
  Heart,
  Eye,
  MessageSquare,
  ShieldCheck,
  Play,
  Video,
  ChevronUp,
  BookMarked,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import {
  summarizePresetLinks,
  resolveVtEmbedInfo,
  detectPresetCategory,
  getPresetCategoryMeta,
  type FilteredPresetLink,
  type VtPresetEntry,
} from '@/lib/preset-filter';

interface VtDetailModalProps {
  entry: VtPresetEntry | null;
  isSaved: boolean;
  onClose: () => void;
  onToggleSave: (entry: VtPresetEntry) => void;
}

export function VtDetailModal({
  entry,
  isSaved,
  onClose,
  onToggleSave,
}: VtDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'links' | 'raw' | 'xml'>('links');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedXmlLinkIndex, setSelectedXmlLinkIndex] = useState<number>(0);
  const [showVideoPlayer, setShowVideoPlayer] = useState<boolean>(true);
  const [playerSource, setPlayerSource] = useState<'youtube' | 'tiktok'>('youtube');
  const [isIframeLoading, setIsIframeLoading] = useState<boolean>(true);

  const entryId = entry?.id || '';

  useEffect(() => {
    if (!entry) return;
    const embedInfo = resolveVtEmbedInfo(entry);
    setPlayerSource(embedInfo.defaultSource);
    setShowVideoPlayer(true);
    setIsIframeLoading(true);
    setActiveTab('links');
  }, [entryId, entry]);

  useEffect(() => {
    if (!entry) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [entry, onClose]);

  if (!entry) return null;

  const summary = summarizePresetLinks(entry.links);
  const embedInfo = resolveVtEmbedInfo(entry);
  const categoryMeta = getPresetCategoryMeta(detectPresetCategory(entry));
  const xmlLinks = entry.links.filter((l) => l.type === 'xml_drive' && l.xmlMeta);
  const currentXmlMeta =
    xmlLinks[selectedXmlLinkIndex]?.xmlMeta || xmlLinks[0]?.xmlMeta;

  // Group links by groupName ("Utama", "Preset 1", "Preset 2", etc.)
  const groupedLinks: Record<string, FilteredPresetLink[]> = {};
  for (const link of entry.links) {
    if (!groupedLinks[link.groupName]) {
      groupedLinks[link.groupName] = [];
    }
    groupedLinks[link.groupName].push(link);
  }

  const handleCopy = async (text: string, id: string) => {
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
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleCopyAllLinks = () => {
    const formatted = [
      `${entry.vtTitle}`,
      `Sound: ${entry.soundName}`,
      `Kreator: ${entry.creatorHandle} (${entry.platform === 'tiktok' ? 'TikTok VT' : 'YouTube'})`,
      `Likes: ${entry.likesCount.toLocaleString('id-ID')}`,
      '',
      ...entry.links.map((l) => `${l.label} :\n${l.url}`),
    ].join('\n');
    handleCopy(formatted, 'all-links');
  };

  const getTypeIcon = (type: FilteredPresetLink['type']) => {
    if (type === 'am_5mb') return <Share2 className="w-4 h-4 text-[#111111] shrink-0" />;
    if (type === 'xml_drive')
      return <FileCode2 className="w-4 h-4 text-[#111111] shrink-0" />;
    return <Music className="w-4 h-4 text-[#111111] shrink-0" />;
  };

  const getTypeLabel = (type: FilteredPresetLink['type']) => {
    if (type === 'am_5mb') return 'Preset 5MB';
    if (type === 'xml_drive') return 'Preset XML';
    return 'Sound Audio';
  };

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

  const activeEmbedUrl =
    entry.platform === 'tiktok'
      ? embedInfo.tiktokEmbedUrl
      : embedInfo.youtubeEmbedUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#111111]/75 p-0 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vt-detail-title"
    >
      <div className="relative w-full max-w-3xl bg-[#F6F5F0] text-[#111111] border-t-2 sm:border-2 border-[#111111] shadow-[8px_8px_0px_#111111] overflow-hidden max-h-[94vh] sm:max-h-[90vh] flex flex-col">
        {/* Top Modal Header (Neobrutalist "RIDE DETAILS" / "RIDE CONFIRMED!" style) */}
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b-2 border-[#111111] bg-white">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup detail VT"
                className="w-9 h-9 inline-flex items-center justify-center bg-white text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#F7B91C] transition-colors shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              {/* Decorative Halftone Dot Grid + Diagonal Yellow/Black Squares */}
              <div className="flex items-center gap-3">
                <div className="relative w-6 h-6 shrink-0" aria-hidden="true">
                  <span className="absolute top-0 left-0 w-3 h-3 bg-[#111111]" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#F7B91C] border border-[#111111]" />
                </div>
                <div
                  aria-hidden="true"
                  className="w-8 h-8 opacity-80"
                  style={{
                    backgroundImage: 'radial-gradient(#111111 1.25px, transparent 1.25px)',
                    backgroundSize: '5px 5px',
                  }}
                />
              </div>
            </div>

            <div className="pt-1 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#111111]/70">
              <BookMarked className="w-3.5 h-3.5 text-[#F25C05] shrink-0" />
              <span className="font-mono text-[#111111]">
                {entry.creatorHandle.replace(/^@/, '')}
              </span>
              <span>·</span>
              <span className="px-1.5 py-0.5 bg-[#F7B91C] text-[#111111] border border-[#111111]">
                {entry.platform === 'tiktok' ? 'TIKTOK VT' : 'YOUTUBE'}
              </span>
              <span>·</span>
              <span>{categoryMeta.label}</span>
              <span>·</span>
              <span>{entry.publishedAt}</span>
            </div>

            <h2
              id="vt-detail-title"
              className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[#111111] leading-tight line-clamp-2"
              style={{fontFamily: 'var(--font-display), sans-serif'}}
            >
              {entry.vtTitle}
            </h2>
          </div>
        </div>

        {/* Highlight Yellow Banner (Matches "John Smith / STANDARD $12.50" yellow card in IMG_1220.jpeg) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b-2 border-[#111111] bg-[#F7B91C]">
          <div className="space-y-0.5 min-w-0">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#111111]/80">
              SOUND &amp; METRIK POPULER
            </div>
            <div className="text-sm sm:text-base font-extrabold text-[#111111] truncate">
              {entry.soundName}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono font-bold tabular-nums text-[#111111]">
              <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 border border-[#111111]">
                <Heart className="w-3 h-3 text-[#F25C05] fill-[#F25C05]" />
                {entry.likesCount.toLocaleString('id-ID')} Like
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                {entry.commentsCount.toLocaleString('id-ID')} Komentar
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {entry.viewsCount.toLocaleString('id-ID')} Tayangan
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onToggleSave(entry)}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-extrabold uppercase tracking-wider border-2 border-[#111111] shadow-[2px_2px_0px_#111111] transition-colors whitespace-nowrap shrink-0 ${
                isSaved
                  ? 'bg-[#111111] text-[#F7B91C]'
                  : 'bg-white text-[#111111] hover:bg-[#111111] hover:text-white'
              }`}
              style={{fontFamily: 'var(--font-display), sans-serif'}}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  Tersimpan
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  Simpan VT
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyAllLinks}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-extrabold uppercase tracking-wider text-white bg-[#F25C05] hover:bg-[#d94e00] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] transition-colors whitespace-nowrap shrink-0"
              style={{fontFamily: 'var(--font-display), sans-serif'}}
            >
              {copiedId === 'all-links' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Disalin ({entry.links.length})
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Salin Semua ({entry.links.length})
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs inside Detail Modal */}
        <div className="flex items-center justify-between gap-2 px-5 py-2.5 bg-white border-b-2 border-[#111111]">
          <div className="grid grid-cols-3 sm:flex items-center gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('links')}
              className={`px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider border-2 border-[#111111] transition-colors whitespace-nowrap text-center ${
                activeTab === 'links'
                  ? 'bg-[#111111] text-[#F7B91C] shadow-[2px_2px_0px_#F25C05]'
                  : 'bg-[#F6F5F0] text-[#111111] hover:bg-[#F7B91C]'
              }`}
              style={{fontFamily: 'var(--font-display), sans-serif'}}
            >
              VT &amp; Link ({entry.links.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('raw')}
              className={`px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider border-2 border-[#111111] transition-colors whitespace-nowrap text-center ${
                activeTab === 'raw'
                  ? 'bg-[#111111] text-[#F7B91C] shadow-[2px_2px_0px_#F25C05]'
                  : 'bg-[#F6F5F0] text-[#111111] hover:bg-[#F7B91C]'
              }`}
              style={{fontFamily: 'var(--font-display), sans-serif'}}
            >
              Deskripsi Asli
            </button>
            {xmlLinks.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('xml')}
                className={`px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider border-2 border-[#111111] transition-colors whitespace-nowrap text-center ${
                  activeTab === 'xml'
                    ? 'bg-[#111111] text-[#F7B91C] shadow-[2px_2px_0px_#F25C05]'
                    : 'bg-[#F6F5F0] text-[#111111] hover:bg-[#F7B91C]'
                }`}
                style={{fontFamily: 'var(--font-display), sans-serif'}}
              >
                File XML ({xmlLinks.length})
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs font-bold text-[#111111] shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#F25C05]" />
            <span>
              {summary.am5mbCount}× 5MB · {summary.xmlCount}× XML · {summary.soundCount}× Sound
            </span>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 bg-[#F6F5F0]">
          {activeTab === 'links' && (
            <div className="space-y-5">
              {/* Embedded VT Video Preview Panel */}
              <div className="border-2 border-[#111111] shadow-[4px_4px_0px_#111111] overflow-hidden bg-white">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-white border-b-2 border-[#111111] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#F25C05] border border-[#111111] inline-block" />
                    <Video className="w-4 h-4 text-[#111111] shrink-0" />
                    <span
                      className="font-extrabold uppercase tracking-wider text-sm text-[#111111]"
                      style={{fontFamily: 'var(--font-display), sans-serif'}}
                    >
                      {entry.platform === 'tiktok'
                        ? 'Pratinjau Video TikTok VT'
                        : 'Pratinjau Video YouTube'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[11px] font-bold uppercase bg-[#F7B91C] text-[#111111] border border-[#111111]">
                      {entry.platform === 'tiktok' ? 'Player TikTok VT' : 'Player YouTube'}
                    </span>

                    <button
                      type="button"
                      onClick={() => setShowVideoPlayer((prev) => !prev)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#111111] bg-white hover:bg-[#111111] hover:text-white border-2 border-[#111111] transition-colors"
                    >
                      {showVideoPlayer ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Sembunyikan Video</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Lihat Video</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {showVideoPlayer && (
                  <div className="relative w-full bg-[#111111]">
                    {activeEmbedUrl ? (
                      <div
                        className={`relative w-full mx-auto ${
                          entry.platform === 'tiktok'
                            ? 'h-[360px] sm:h-[400px] max-w-[340px]'
                            : 'aspect-video max-h-[300px] sm:max-h-[340px]'
                        }`}
                      >
                        {isIframeLoading && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#F6F5F0] text-[#111111] z-10">
                            <div className="w-12 h-12 bg-[#F7B91C] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] flex items-center justify-center">
                              <Play className="w-6 h-6 text-[#111111] fill-current" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">
                              {entry.platform === 'tiktok'
                                ? 'Memuat pratinjau TikTok VT...'
                                : 'Memuat pratinjau video YouTube...'}
                            </span>
                          </div>
                        )}
                        <iframe
                          key={activeEmbedUrl}
                          src={activeEmbedUrl}
                          title={`Video Preset ${entry.vtTitle}`}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          onLoad={() => setIsIframeLoading(false)}
                        />
                      </div>
                    ) : (
                      <div className="p-6 text-center space-y-2 bg-[#F6F5F0]">
                        <p className="text-xs font-medium text-[#111111]">
                          Pratinjau langsung dapat dibuka melalui tautan resmi di bawah:
                        </p>
                        <div className="flex items-center justify-center gap-2 pt-1">
                          {entry.platform === 'tiktok' ? (
                            <a
                              href={tiktokHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase bg-[#F7B91C] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111]"
                            >
                              <span>Tonton VT di TikTok</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <a
                              href={youtubeHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase bg-[#F7B91C] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111]"
                            >
                              <span>Tonton Video di YouTube</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Grouped Preset Links (Pickup -> Dropoff Route Box style) */}
              {Object.entries(groupedLinks).map(([groupName, groupItems]) => (
                <div key={groupName} className="space-y-2">
                  <div className="flex items-center justify-between border-b-2 border-[#111111] pb-1">
                    <h3
                      className="text-sm font-extrabold uppercase tracking-wider text-[#111111]"
                      style={{fontFamily: 'var(--font-display), sans-serif'}}
                    >
                      Paket Link: {groupName}
                    </h3>
                    <span className="text-xs text-[#F25C05] font-mono font-bold tabular-nums">
                      {groupItems.length} tautan valid
                    </span>
                  </div>

                  <div className="divide-y-2 divide-[#111111] border-2 border-[#111111] shadow-[4px_4px_0px_#111111] bg-white">
                    {groupItems.map((link, lIdx) => (
                      <div
                        key={link.id}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F7B91C]/15 transition-colors"
                      >
                        <div className="min-w-0 flex-1 flex items-start gap-3">
                          {/* Orange/Black Route Node */}
                          <div className="flex flex-col items-center pt-1 shrink-0" aria-hidden="true">
                            <span
                              className={`w-3 h-3 border border-[#111111] ${
                                lIdx % 2 === 0 ? 'bg-[#F25C05]' : 'bg-[#111111]'
                              }`}
                            />
                            {lIdx < groupItems.length - 1 && (
                              <span className="w-0.5 h-5 border-l-2 border-dashed border-[#111111]/40 mt-1" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#111111] mb-1">
                              {getTypeIcon(link.type)}
                              <span className="font-extrabold uppercase tracking-wide">
                                {link.label}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="font-semibold text-[#111111]/70">
                                {getTypeLabel(link.type)}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono text-[#111111]/60">{link.host}</span>
                            </div>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block font-mono text-xs font-semibold text-[#111111] underline decoration-[#F25C05] decoration-2 hover:bg-[#F7B91C] break-all"
                            >
                              {link.url}
                            </a>
                            {link.xmlMeta && (
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#111111]/70 font-mono tabular-nums">
                                <span className="font-bold text-[#111111]">{link.xmlMeta.fileName}</span>
                                <span aria-hidden="true">·</span>
                                <span>
                                  {link.xmlMeta.width}×{link.xmlMeta.height}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span>{link.xmlMeta.fps} FPS</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
                          {link.xmlMeta && (
                            <button
                              type="button"
                              onClick={() => {
                                const idx = xmlLinks.findIndex((x) => x.id === link.id);
                                setSelectedXmlLinkIndex(idx >= 0 ? idx : 0);
                                setActiveTab('xml');
                              }}
                              className="px-2.5 py-1.5 text-xs font-bold text-[#111111] bg-[#F6F5F0] hover:bg-[#F7B91C] border-2 border-[#111111] transition-colors whitespace-nowrap shrink-0"
                            >
                              Lihat XML
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleCopy(link.url, link.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-[#111111] bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#F7B91C] transition-colors whitespace-nowrap shrink-0"
                          >
                            {copiedId === link.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#F25C05]" />
                                Disalin
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Salin Link
                              </>
                            )}
                          </button>

                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Buka ${link.label}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-[#111111] bg-[#F7B91C] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#111111] hover:text-white transition-colors whitespace-nowrap shrink-0"
                          >
                            <span>Buka</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#111111]">
                <span>
                  Teks dari{' '}
                  {entry.sourceLocation === 'description'
                    ? 'Deskripsi Video'
                    : 'Komentar Disematkan'}
                </span>
                <span className="font-mono tabular-nums text-[#F25C05]">
                  {entry.links.length} link preset diekstrak
                </span>
              </div>
              <pre className="p-4 bg-white text-[#111111] font-mono text-xs leading-relaxed whitespace-pre-wrap break-all overflow-x-auto border-2 border-[#111111] shadow-[4px_4px_0px_#111111]">
                {entry.rawText}
              </pre>
            </div>
          )}

          {activeTab === 'xml' && currentXmlMeta && (
            <div className="space-y-4">
              {xmlLinks.length > 1 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase text-[#111111]">Pilih File XML:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {xmlLinks.map((xl, idx) => (
                      <button
                        key={xl.id}
                        type="button"
                        onClick={() => setSelectedXmlLinkIndex(idx)}
                        className={`px-2.5 py-1 text-xs font-mono font-bold border-2 border-[#111111] transition-colors ${
                          selectedXmlLinkIndex === idx
                            ? 'bg-[#F7B91C] text-[#111111] shadow-[2px_2px_0px_#111111]'
                            : 'bg-white text-[#111111] hover:bg-[#F7B91C]/40'
                        }`}
                      >
                        {xl.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] text-xs">
                <div>
                  <span className="text-[#111111]/60 font-bold uppercase block">Nama Dokumen XML</span>
                  <span className="font-mono font-bold text-[#111111] break-all">
                    {currentXmlMeta.fileName}
                  </span>
                </div>
                <div>
                  <span className="text-[#111111]/60 font-bold uppercase block">Resolusi &amp; FPS</span>
                  <span className="font-mono font-bold text-[#111111] tabular-nums">
                    {currentXmlMeta.width}×{currentXmlMeta.height} · {currentXmlMeta.fps} FPS
                  </span>
                </div>
                <div>
                  <span className="text-[#111111]/60 font-bold uppercase block">Durasi Scene</span>
                  <span className="font-mono font-bold text-[#F25C05] tabular-nums">
                    {(currentXmlMeta.totalTimeMs / 1000).toFixed(2)} dtk (
                    {currentXmlMeta.totalTimeMs} ms)
                  </span>
                </div>
                <div>
                  <span className="text-[#111111]/60 font-bold uppercase block">Versi Alight Motion</span>
                  <span className="font-mono font-bold text-[#111111]">
                    v{currentXmlMeta.amVersion}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase text-[#111111]">
                    Struktur Dokumen XML Alight Motion (drive.google.com preview)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(currentXmlMeta.rawXmlPreview, 'copy-xml-code')
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-[#111111] bg-[#F7B91C] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] shrink-0"
                  >
                    {copiedId === 'copy-xml-code' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        XML Disalin
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Salin Kode XML
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 bg-white text-[#111111] font-mono text-xs leading-relaxed whitespace-pre-wrap break-all border-2 border-[#111111] shadow-[4px_4px_0px_#111111]">
                  {currentXmlMeta.rawXmlPreview}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Neobrutalist Split Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t-2 border-[#111111] bg-white text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {entry.platform === 'tiktok' ? (
              <a
                href={tiktokHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 font-bold uppercase tracking-wider text-[#111111] bg-[#F6F5F0] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#F7B91C] transition-colors whitespace-nowrap"
                style={{fontFamily: 'var(--font-display), sans-serif'}}
              >
                <span>Buka VT di TikTok</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <a
                href={youtubeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 font-bold uppercase tracking-wider text-[#111111] bg-[#F6F5F0] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#F7B91C] transition-colors whitespace-nowrap"
                style={{fontFamily: 'var(--font-display), sans-serif'}}
              >
                <span>Buka Video di YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-stretch border-2 border-[#111111] shadow-[3px_3px_0px_#111111] bg-[#F7B91C] hover:bg-[#e5a812] text-[#111111] ml-auto"
          >
            <span
              className="px-4 py-1.5 text-sm font-extrabold uppercase tracking-wider flex items-center"
              style={{fontFamily: 'var(--font-display), sans-serif'}}
            >
              Selesai
            </span>
            <span className="px-2.5 bg-[#111111] text-white flex items-center justify-center border-l-2 border-[#111111]">
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
