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
    if (type === 'am_5mb') return <Share2 className="w-4 h-4 text-[#58a6ff] shrink-0" />;
    if (type === 'xml_drive')
      return <FileCode2 className="w-4 h-4 text-[#3fb950] shrink-0" />;
    return <Music className="w-4 h-4 text-[#d29922] shrink-0" />;
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vt-detail-title"
    >
      <div className="relative w-full max-w-3xl bg-[#0d1117] text-[#e6edf3] border-t sm:border border-[#30363d] rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden max-h-[94vh] sm:max-h-[90vh] flex flex-col">
        {/* Top Modal Header (GitHub Dark Repo Header style) */}
        <div className="flex items-start justify-between gap-3 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[#30363d] bg-[#161b22]">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#8b949e] mb-1">
              <BookMarked className="w-3.5 h-3.5 text-[#8b949e] shrink-0" />
              <span className="font-mono text-[#58a6ff] font-medium">
                {entry.creatorHandle.replace(/^@/, '')}
              </span>
              <span>/</span>
              <span className="font-semibold text-[#e6edf3]">
                {entry.platform === 'tiktok' ? 'tiktok-vt' : 'youtube-preset'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-[#c9d1d9]">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{backgroundColor: categoryMeta.dotColor}}
                />
                {categoryMeta.label}
              </span>
              <span aria-hidden="true">·</span>
              <span>{entry.publishedAt}</span>
            </div>
            <h2
              id="vt-detail-title"
              className="text-sm sm:text-lg font-semibold text-[#f0f6fc] leading-snug line-clamp-2"
              style={{fontFamily: 'var(--font-display), sans-serif'}}
            >
              {entry.vtTitle}
            </h2>
            <p className="text-xs text-[#8b949e] mt-1 truncate">
              Sound: <span className="font-medium text-[#e6edf3]">{entry.soundName}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail VT"
            className="p-2 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] rounded-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metrics & Action Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-2.5 border-b border-[#30363d] bg-[#0d1117]">
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#8b949e] font-mono tabular-nums">
            <span className="inline-flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-[#f78166] fill-[#f78166]" />
              <strong className="font-semibold text-[#f0f6fc]">
                {entry.likesCount.toLocaleString('id-ID')}
              </strong>{' '}
              Like
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-[#8b949e]" />
              <strong className="font-semibold text-[#f0f6fc]">
                {entry.commentsCount.toLocaleString('id-ID')}
              </strong>{' '}
              Komentar
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-[#8b949e]" />
              <strong className="font-semibold text-[#f0f6fc]">
                {entry.viewsCount.toLocaleString('id-ID')}
              </strong>{' '}
              Tayangan
            </span>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleSave(entry)}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                isSaved
                  ? 'bg-[#1f6feb]/20 text-[#58a6ff] border-[#1f6feb]/50 hover:bg-[#1f6feb]/30'
                  : 'bg-[#21262d] text-[#c9d1d9] border-[#30363d] hover:bg-[#30363d]'
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 text-[#58a6ff]" />
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
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#238636] hover:bg-[#2ea043] rounded-md transition-colors whitespace-nowrap shrink-0"
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
        <div className="flex items-center justify-between gap-2 px-4 sm:px-5 py-2 bg-[#161b22] border-b border-[#30363d]">
          <div className="grid grid-cols-3 sm:flex items-center gap-1 p-1 bg-[#0d1117] border border-[#30363d] rounded-lg w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('links')}
              className={`px-2 sm:px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap text-center ${
                activeTab === 'links'
                  ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              VT &amp; Link ({entry.links.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('raw')}
              className={`px-2 sm:px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap text-center ${
                activeTab === 'raw'
                  ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                  : 'text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              Deskripsi Asli
            </button>
            {xmlLinks.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('xml')}
                className={`px-2 sm:px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap text-center ${
                  activeTab === 'xml'
                    ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d]'
                    : 'text-[#8b949e] hover:text-[#f0f6fc]'
                }`}
              >
                File XML ({xmlLinks.length})
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-[#8b949e] shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3fb950]" />
            <span>
              {summary.am5mbCount}× 5MB · {summary.xmlCount}× XML · {summary.soundCount}× Sound
            </span>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 bg-[#0d1117]">
          {activeTab === 'links' && (
            <div className="space-y-5">
              {/* Embedded VT Video Preview Panel */}
              <div className="border border-[#30363d] rounded-lg overflow-hidden bg-[#161b22]">
                <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-[#161b22] border-b border-[#30363d] text-xs">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#58a6ff] shrink-0" />
                    <span className="font-semibold text-[#f0f6fc]">
                      {entry.platform === 'tiktok'
                        ? 'Pratinjau Video TikTok VT'
                        : 'Pratinjau Video YouTube'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-[#1f6feb]/20 text-[#58a6ff] border border-[#1f6feb]/40">
                      {entry.platform === 'tiktok' ? 'Player TikTok VT' : 'Player YouTube'}
                    </span>

                    <button
                      type="button"
                      onClick={() => setShowVideoPlayer((prev) => !prev)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#c9d1d9] hover:text-white bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-md transition-colors"
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
                  <div className="relative w-full bg-black">
                    {activeEmbedUrl ? (
                      <div
                        className={`relative w-full mx-auto ${
                          entry.platform === 'tiktok'
                            ? 'h-[360px] sm:h-[400px] max-w-[340px]'
                            : 'aspect-video max-h-[300px] sm:max-h-[340px]'
                        }`}
                      >
                        {isIframeLoading && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0d1117] animate-pulse z-10">
                            <Play className="w-8 h-8 text-[#58a6ff]" />
                            <span className="text-xs text-[#8b949e]">
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
                      <div className="p-6 text-center space-y-2">
                        <p className="text-xs text-[#8b949e]">
                          Pratinjau langsung dapat dibuka melalui tautan resmi di bawah:
                        </p>
                        <div className="flex items-center justify-center gap-2 pt-1">
                          {entry.platform === 'tiktok' ? (
                            <a
                              href={tiktokHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#238636] hover:bg-[#2ea043] rounded-md"
                            >
                              <span>Tonton VT di TikTok</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <a
                              href={youtubeHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#238636] hover:bg-[#2ea043] rounded-md"
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

              {/* Grouped Preset Links */}
              {Object.entries(groupedLinks).map(([groupName, groupItems]) => (
                <div key={groupName} className="space-y-2">
                  <div className="flex items-center justify-between border-b border-[#30363d] pb-1.5">
                    <h3 className="text-xs font-semibold text-[#f0f6fc]">
                      Paket Link: {groupName}
                    </h3>
                    <span className="text-xs text-[#8b949e] font-mono tabular-nums">
                      {groupItems.length} tautan valid
                    </span>
                  </div>

                  <div className="divide-y divide-[#30363d] border border-[#30363d] rounded-lg bg-[#161b22]">
                    {groupItems.map((link) => (
                      <div
                        key={link.id}
                        className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-[#1f242c] transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#8b949e] mb-1">
                            {getTypeIcon(link.type)}
                            <span className="font-semibold text-[#f0f6fc]">
                              {link.label}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{getTypeLabel(link.type)}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono text-[#8b949e]">{link.host}</span>
                          </div>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block font-mono text-xs text-[#58a6ff] hover:underline break-all"
                          >
                            {link.url}
                          </a>
                          {link.xmlMeta && (
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#8b949e] font-mono tabular-nums">
                              <span>{link.xmlMeta.fileName}</span>
                              <span aria-hidden="true">·</span>
                              <span>
                                {link.xmlMeta.width}×{link.xmlMeta.height}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{link.xmlMeta.fps} FPS</span>
                            </div>
                          )}
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
                              className="px-2.5 py-1.5 text-xs font-medium text-[#c9d1d9] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-md transition-colors whitespace-nowrap shrink-0"
                            >
                              Lihat XML
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleCopy(link.url, link.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#c9d1d9] bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] rounded-md transition-colors whitespace-nowrap shrink-0"
                          >
                            {copiedId === link.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#3fb950]" />
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
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#c9d1d9] bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] rounded-md transition-colors whitespace-nowrap shrink-0"
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
              <div className="flex items-center justify-between text-xs text-[#8b949e]">
                <span>
                  Teks dari{' '}
                  {entry.sourceLocation === 'description'
                    ? 'Deskripsi Video'
                    : 'Komentar Disematkan'}
                </span>
                <span className="font-mono tabular-nums">
                  {entry.links.length} link preset diekstrak
                </span>
              </div>
              <pre className="p-3.5 sm:p-4 rounded-lg bg-[#161b22] text-[#e6edf3] font-mono text-xs leading-relaxed whitespace-pre-wrap break-all overflow-x-auto border border-[#30363d]">
                {entry.rawText}
              </pre>
            </div>
          )}

          {activeTab === 'xml' && currentXmlMeta && (
            <div className="space-y-4">
              {xmlLinks.length > 1 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-[#8b949e]">Pilih File XML:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {xmlLinks.map((xl, idx) => (
                      <button
                        key={xl.id}
                        type="button"
                        onClick={() => setSelectedXmlLinkIndex(idx)}
                        className={`px-2.5 py-1 text-xs font-mono rounded-md border transition-colors ${
                          selectedXmlLinkIndex === idx
                            ? 'bg-[#1f6feb] text-white border-[#1f6feb]'
                            : 'bg-[#21262d] text-[#c9d1d9] border-[#30363d] hover:bg-[#30363d]'
                        }`}
                      >
                        {xl.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#161b22] border border-[#30363d] rounded-lg text-xs">
                <div>
                  <span className="text-[#8b949e] block">Nama Dokumen XML</span>
                  <span className="font-mono font-semibold text-[#f0f6fc] break-all">
                    {currentXmlMeta.fileName}
                  </span>
                </div>
                <div>
                  <span className="text-[#8b949e] block">Resolusi &amp; Frame Rate</span>
                  <span className="font-mono font-semibold text-[#f0f6fc] tabular-nums">
                    {currentXmlMeta.width}×{currentXmlMeta.height} · {currentXmlMeta.fps} FPS
                  </span>
                </div>
                <div>
                  <span className="text-[#8b949e] block">Durasi Scene</span>
                  <span className="font-mono font-semibold text-[#f0f6fc] tabular-nums">
                    {(currentXmlMeta.totalTimeMs / 1000).toFixed(2)} dtk (
                    {currentXmlMeta.totalTimeMs} ms)
                  </span>
                </div>
                <div>
                  <span className="text-[#8b949e] block">Versi Alight Motion</span>
                  <span className="font-mono font-semibold text-[#f0f6fc]">
                    v{currentXmlMeta.amVersion}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-[#c9d1d9]">
                    Struktur Dokumen XML Alight Motion (drive.google.com preview)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(currentXmlMeta.rawXmlPreview, 'copy-xml-code')
                    }
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#c9d1d9] bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] rounded-md shrink-0"
                  >
                    {copiedId === 'copy-xml-code' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#3fb950]" />
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
                <pre className="p-3.5 sm:p-4 rounded-lg bg-[#161b22] text-[#e6edf3] font-mono text-xs leading-relaxed whitespace-pre-wrap break-all border border-[#30363d]">
                  {currentXmlMeta.rawXmlPreview}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Verified TikTok & YouTube Links */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-[#30363d] bg-[#161b22] text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {entry.platform === 'tiktok' ? (
              <a
                href={tiktokHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-[#c9d1d9] bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] rounded-md transition-colors whitespace-nowrap"
              >
                <span>Buka VT di TikTok</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#8b949e]" />
              </a>
            ) : (
              <a
                href={youtubeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-[#c9d1d9] bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] rounded-md transition-colors whitespace-nowrap"
              >
                <span>Buka Video di YouTube</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#8b949e]" />
              </a>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-[#238636] hover:bg-[#2ea043] rounded-md transition-colors ml-auto"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
