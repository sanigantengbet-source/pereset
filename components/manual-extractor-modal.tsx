'use client';

import React, {useState} from 'react';
import {X, Filter, CheckCircle2, AlertCircle, PlusCircle, ArrowRight} from 'lucide-react';
import {
  extractPresetLinksFromText,
  detectPresetCategory,
  type PlatformType,
  type VtPresetEntry,
} from '@/lib/preset-filter';

interface ManualExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExtractedEntry: (entry: VtPresetEntry) => void;
}

const SAMPLE_COMMENT_VKRIEDTZ2 = `📌 Disematkan oleh @vkriedtz2
Prst 5mb :
https://alightcreative.com/am/share/u/7RKsdEaAa1gQkAGE92bOMk1z1Uw1/p/Q8llLg16H6-6ac24d46b0bcbd33

Prst Xml :
https://drive.google.com/file/d/1MRZ1AsEcQIn_WdJEh5-AlSnfRllUWi8b/view?usp=drivesdk

Sound :
https://drive.google.com/file/d/1vSoDI2x6oPXW4L5m4rGdeWbCtMRsqeU-/view?usp=drivesdk

Toko afiliasi (akan difilter keluar): https://shopee.co.id/contoh-spam`;

const SAMPLE_COMMENT_MULTI_PRESET = `Preset 1
Xml : https://drive.google.com/file/d/1_IB0GD1oQqstLxJ30EZcSbvKrSL94muu/view?usp=drivesdk
Sound : https://www.mediafire.com/file/paojmjgoevgt9pa/preset_01.m4a/file

Preset 2
Xml : https://drive.google.com/file/d/11p9jBMhFyV7xUd0EOcygHmbB4hWW8oeW/view?usp=drivesdk
Sound : https://www.mediafire.com/file/3ymycyvlhdjbdga/preset_02.m4a/file

Preset 3
Xml : https://drive.google.com/drive/folders/1liFGJbiQc42bZOzw2Qp-peD29k-1TbOd
Sound : https://www.mediafire.com/file/55dh6zcbn062gee/preset_03.m4a/file`;

export function ManualExtractorModal({
  isOpen,
  onClose,
  onAddExtractedEntry,
}: ManualExtractorModalProps) {
  const [vtTitle, setVtTitle] = useState('');
  const [soundName, setSoundName] = useState('');
  const [creatorHandle, setCreatorHandle] = useState('');
  const [platform, setPlatform] = useState<PlatformType>('tiktok');
  const [likesCount, setLikesCount] = useState('');
  const [rawText, setRawText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const livePreview = extractPresetLinksFromText(rawText, 'preview');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) {
      setErrorMsg('Harap tempel teks komentar atau deskripsi video terlebih dahulu.');
      return;
    }
    if (livePreview.links.length === 0) {
      setErrorMsg(
        'Tidak ditemukan link preset yang valid (alightcreative.com, drive.google.com, atau mediafire.com) pada teks tersebut.'
      );
      return;
    }

    const id = `manual-${Date.now()}`;
    const {links, rejectedUrls} = extractPresetLinksFromText(rawText, id);
    const parsedLikes = Number.parseInt(likesCount.replace(/\D/g, ''), 10) || 15000;

    const finalTitle = vtTitle.trim() || 'Preset Alight Motion Custom VT';
    const finalSound = soundName.trim() || 'Original Sound VT';

    const cleanHandle = creatorHandle.trim()
      ? creatorHandle.trim().startsWith('@')
        ? creatorHandle.trim()
        : `@${creatorHandle.trim()}`
      : '@creator_am';
    const tiktokUrl = `https://www.tiktok.com/${cleanHandle}`;
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      `preset am ${finalSound}`
    )}`;

    const newEntry: VtPresetEntry = {
      id,
      vtTitle: finalTitle,
      soundName: finalSound,
      creatorHandle: cleanHandle,
      creatorName: cleanHandle.replace(/^@/, '').trim() || 'Creator AM',
      platform,
      category: detectPresetCategory({
        vtTitle: finalTitle,
        soundName: finalSound,
        rawText,
      }),
      sourceLocation: 'pinned_comment',
      videoUrl: platform === 'tiktok' ? tiktokUrl : youtubeUrl,
      tiktokUrl,
      youtubeUrl,
      likesCount: parsedLikes,
      viewsCount: parsedLikes * 8,
      commentsCount: Math.round(parsedLikes * 0.02),
      publishedAt: 'Baru diekstrak',
      rawText,
      links,
      rejectedLinksCount: rejectedUrls.length,
    };

    onAddExtractedEntry(newEntry);
    setVtTitle('');
    setSoundName('');
    setCreatorHandle('');
    setLikesCount('');
    setRawText('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#111111]/75 p-0 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="extractor-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-[#F6F5F0] text-[#111111] border-t-2 sm:border-2 border-[#111111] shadow-[8px_8px_0px_#111111] overflow-hidden my-auto max-h-[92vh] sm:max-h-[90vh] flex flex-col">
        {/* Top Neobrutalist Modal Header */}
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b-2 border-[#111111] bg-[#F7B91C]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#111111] text-white text-[11px] font-bold uppercase tracking-wider">
              <span>MANUAL LINK EXTRACTOR</span>
            </div>
            <h2
              id="extractor-modal-title"
              className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[#111111]"
              style={{fontFamily: 'var(--font-display), sans-serif'}}
            >
              Filter &amp; Ekstrak Link Preset dari Komentar / Deskripsi
            </h2>
            <p className="text-xs font-medium text-[#111111]/85">
              Tempel komentar VT TikTok atau deskripsi YouTube untuk menyaring otomatis hanya link
              5MB, XML Drive, dan Sound MediaFire.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal ekstraksi"
            className="w-9 h-9 inline-flex items-center justify-center bg-white text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#111111] hover:text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-[#F25C05] text-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Pickup/Dropoff style route box for metadata */}
          <div className="bg-white border-2 border-[#111111] p-4 shadow-[3px_3px_0px_#111111] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="manual-vt-title"
                  className="block text-xs font-bold uppercase tracking-wider text-[#111111] mb-1"
                  style={{fontFamily: 'var(--font-display), sans-serif'}}
                >
                  Judul / Nama VT
                </label>
                <input
                  id="manual-vt-title"
                  type="text"
                  value={vtTitle}
                  onChange={(e) => {
                    setVtTitle(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F6F5F0] border-2 border-[#111111] text-[#111111] font-medium focus:outline-none focus:bg-[#F7B91C]/20"
                  placeholder="Contoh: Preset JJ Kane Full Beat"
                />
              </div>

              <div>
                <label
                  htmlFor="manual-sound-name"
                  className="block text-xs font-bold uppercase tracking-wider text-[#111111] mb-1"
                  style={{fontFamily: 'var(--font-display), sans-serif'}}
                >
                  Nama Sound
                </label>
                <input
                  id="manual-sound-name"
                  type="text"
                  value={soundName}
                  onChange={(e) => {
                    setSoundName(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F6F5F0] border-2 border-[#111111] text-[#111111] font-medium focus:outline-none focus:bg-[#F7B91C]/20"
                  placeholder="Contoh: DJ Kicau Mania Viral"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label
                  htmlFor="manual-creator"
                  className="block text-xs font-bold uppercase tracking-wider text-[#111111] mb-1"
                  style={{fontFamily: 'var(--font-display), sans-serif'}}
                >
                  Username Kreator
                </label>
                <input
                  id="manual-creator"
                  type="text"
                  value={creatorHandle}
                  onChange={(e) => setCreatorHandle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-[#F6F5F0] border-2 border-[#111111] text-[#111111] focus:outline-none focus:bg-[#F7B91C]/20"
                  placeholder="@username"
                />
              </div>

              <div>
                <label
                  htmlFor="manual-platform"
                  className="block text-xs font-bold uppercase tracking-wider text-[#111111] mb-1"
                  style={{fontFamily: 'var(--font-display), sans-serif'}}
                >
                  Platform Sumber
                </label>
                <select
                  id="manual-platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as PlatformType)}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-[#F6F5F0] border-2 border-[#111111] text-[#111111] focus:outline-none focus:bg-[#F7B91C]/20"
                >
                  <option value="tiktok">TikTok VT</option>
                  <option value="youtube">YouTube Shorts / Video</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="manual-likes"
                  className="block text-xs font-bold uppercase tracking-wider text-[#111111] mb-1"
                  style={{fontFamily: 'var(--font-display), sans-serif'}}
                >
                  Jumlah Like VT
                </label>
                <input
                  id="manual-likes"
                  type="number"
                  value={likesCount}
                  onChange={(e) => setLikesCount(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-mono tabular-nums bg-[#F6F5F0] border-2 border-[#111111] text-[#111111] focus:outline-none focus:bg-[#F7B91C]/20"
                  placeholder="25000"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-[#111111] p-4 shadow-[3px_3px_0px_#111111]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label
                htmlFor="manual-raw-text"
                className="block text-sm font-extrabold uppercase tracking-wider text-[#111111]"
                style={{fontFamily: 'var(--font-display), sans-serif'}}
              >
                Teks Komentar atau Deskripsi Video
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRawText(SAMPLE_COMMENT_VKRIEDTZ2);
                    setCreatorHandle('@vkriedtz2');
                    setErrorMsg(null);
                  }}
                  className="px-2.5 py-1 text-xs font-bold bg-[#F7B91C] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#111111] hover:text-white transition-colors"
                >
                  Contoh 1 (@vkriedtz2)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRawText(SAMPLE_COMMENT_MULTI_PRESET);
                    setCreatorHandle('@prstdap.id');
                    setErrorMsg(null);
                  }}
                  className="px-2.5 py-1 text-xs font-bold bg-white text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#111111] hover:text-white transition-colors"
                >
                  Contoh 2 (Preset 1–3)
                </button>
              </div>
            </div>
            <textarea
              id="manual-raw-text"
              rows={6}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setErrorMsg(null);
              }}
              className="w-full p-3 text-xs font-mono bg-[#F6F5F0] text-[#111111] border-2 border-[#111111] focus:outline-none focus:bg-white"
              placeholder="Tempel komentar yang berisi link Prst 5mb, Prst Xml, atau Sound..."
            />
          </div>

          {/* Live Filter Preview (Fare Breakdown style) */}
          <div className="p-4 bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] space-y-2.5">
            <div className="flex items-center justify-between text-xs border-b-2 border-dashed border-[#111111]/40 pb-2">
              <span
                className="font-extrabold uppercase tracking-wider text-sm text-[#111111] inline-flex items-center gap-1.5"
                style={{fontFamily: 'var(--font-display), sans-serif'}}
              >
                <Filter className="w-4 h-4 text-[#F25C05]" />
                Hasil Penyaringan Link Otomatis
              </span>
              <span className="font-mono font-bold tabular-nums text-[#F25C05]">
                {livePreview.links.length} link lolos · {livePreview.rejectedUrls.length} link
                ditolak
              </span>
            </div>

            {livePreview.links.length > 0 ? (
              <ul className="space-y-1.5 text-xs font-mono">
                {livePreview.links.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2 text-[#111111] bg-[#F6F5F0] border border-[#111111] px-2.5 py-1.5 truncate"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#111111] fill-[#F7B91C] shrink-0" />
                    <span className="font-bold text-[#111111] shrink-0">
                      [{item.label}]
                    </span>
                    <span className="truncate text-[#111111]/80 underline">{item.url}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#111111]/70 font-medium">
                Belum ada link yang cocok dengan pola Alight Creative, Google Drive, atau MediaFire.
              </p>
            )}
          </div>

          {/* Neobrutalist Split Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#111111] bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] hover:bg-[#111111] hover:text-white transition-colors"
              style={{fontFamily: 'var(--font-display), sans-serif'}}
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-stretch border-2 border-[#111111] shadow-[4px_4px_0px_#111111] bg-[#F25C05] hover:bg-[#d94e00] text-white transition-transform active:translate-x-0.5 active:translate-y-0.5"
            >
              <span
                className="px-4 py-2.5 text-sm font-extrabold uppercase tracking-wider flex items-center gap-1.5"
                style={{fontFamily: 'var(--font-display), sans-serif'}}
              >
                <PlusCircle className="w-4 h-4" />
                Simpan Hasil Filter ke Daftar VT
              </span>
              <span className="px-3 bg-[#111111] text-white flex items-center justify-center border-l-2 border-[#111111]">
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
