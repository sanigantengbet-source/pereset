'use client';

import React, {useState} from 'react';
import {X, Filter, CheckCircle2, AlertCircle, PlusCircle} from 'lucide-react';
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="extractor-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-[#0d1117] text-[#e6edf3] border-t sm:border border-[#30363d] rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden my-auto max-h-[92vh] sm:max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#30363d] bg-[#161b22]">
          <div>
            <h2
              id="extractor-modal-title"
              className="text-base font-semibold text-[#f0f6fc]"
              style={{fontFamily: 'var(--font-display), sans-serif'}}
            >
              Filter &amp; Ekstrak Link Preset dari Komentar / Deskripsi
            </h2>
            <p className="text-xs text-[#8b949e] mt-0.5">
              Tempel komentar VT TikTok atau deskripsi YouTube untuk menyaring otomatis hanya link
              5MB, XML Drive, dan Sound MediaFire.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal ekstraksi"
            className="p-2 text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="manual-vt-title"
                className="block text-xs font-medium text-[#c9d1d9] mb-1"
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
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#161b22] border border-[#30363d] text-[#f0f6fc] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58a6ff]"
                placeholder=""
              />
            </div>

            <div>
              <label
                htmlFor="manual-sound-name"
                className="block text-xs font-medium text-[#c9d1d9] mb-1"
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
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#161b22] border border-[#30363d] text-[#f0f6fc] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58a6ff]"
                placeholder=""
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="manual-creator"
                className="block text-xs font-medium text-[#c9d1d9] mb-1"
              >
                Username Kreator
              </label>
              <input
                id="manual-creator"
                type="text"
                value={creatorHandle}
                onChange={(e) => setCreatorHandle(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-[#161b22] border border-[#30363d] text-[#f0f6fc] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58a6ff]"
                placeholder=""
              />
            </div>

            <div>
              <label
                htmlFor="manual-platform"
                className="block text-xs font-medium text-[#c9d1d9] mb-1"
              >
                Platform Sumber
              </label>
              <select
                id="manual-platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value as PlatformType)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#161b22] border border-[#30363d] text-[#f0f6fc] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58a6ff]"
              >
                <option value="tiktok">TikTok VT</option>
                <option value="youtube">YouTube Shorts / Video</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="manual-likes"
                className="block text-xs font-medium text-[#c9d1d9] mb-1"
              >
                Jumlah Like VT
              </label>
              <input
                id="manual-likes"
                type="number"
                value={likesCount}
                onChange={(e) => setLikesCount(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm font-mono tabular-nums bg-[#161b22] border border-[#30363d] text-[#f0f6fc] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58a6ff]"
                placeholder=""
              />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <label
                htmlFor="manual-raw-text"
                className="block text-xs font-medium text-[#c9d1d9]"
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
                  className="text-xs text-[#58a6ff] hover:underline"
                >
                  Contoh 1 (@vkriedtz2)
                </button>
                <span className="text-[#30363d]">·</span>
                <button
                  type="button"
                  onClick={() => {
                    setRawText(SAMPLE_COMMENT_MULTI_PRESET);
                    setCreatorHandle('@prstdap.id');
                    setErrorMsg(null);
                  }}
                  className="text-xs text-[#58a6ff] hover:underline"
                >
                  Contoh 2 (Preset 1–3)
                </button>
              </div>
            </div>
            <textarea
              id="manual-raw-text"
              rows={7}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setErrorMsg(null);
              }}
              className="w-full p-3 text-xs font-mono bg-[#161b22] text-[#e6edf3] border border-[#30363d] rounded-md focus:outline-none focus:ring-2 focus:ring-[#58a6ff]"
              placeholder="Tempel komentar yang berisi link Prst 5mb, Prst Xml, atau Sound..."
            />
          </div>

          {/* Live Filter Preview */}
          <div className="p-3.5 bg-[#161b22] border border-[#30363d] rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#f0f6fc] inline-flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#58a6ff]" />
                Hasil Penyaringan Link Otomatis
              </span>
              <span className="font-mono tabular-nums text-[#8b949e]">
                {livePreview.links.length} link lolos · {livePreview.rejectedUrls.length} link
                ditolak
              </span>
            </div>

            {livePreview.links.length > 0 ? (
              <ul className="space-y-1 text-xs font-mono">
                {livePreview.links.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2 text-[#c9d1d9] truncate"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3fb950] shrink-0" />
                    <span className="font-semibold text-[#f0f6fc] shrink-0">
                      [{item.label}]
                    </span>
                    <span className="truncate text-[#58a6ff]">{item.url}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#8b949e]">
                Belum ada link yang cocok dengan pola Alight Creative, Google Drive, atau MediaFire.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#30363d]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#c9d1d9] bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] rounded-md"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#238636] hover:bg-[#2ea043] rounded-md"
            >
              <PlusCircle className="w-4 h-4" />
              Simpan Hasil Filter ke Daftar VT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
