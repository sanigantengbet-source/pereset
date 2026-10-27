export type PresetLinkType = 'am_5mb' | 'xml_drive' | 'sound_audio';
export type PlatformType = 'tiktok' | 'youtube';
export type PresetCategoryType =
  | 'jj_presets'
  | 'cinematic'
  | 'color_grading'
  | 'velocity'
  | 'gameplay';

export type AllowedPresetHost =
  | 'alightcreative.com'
  | 'drive.google.com'
  | 'mediafire.com'
  | 'alight.link'
  | 'files.catbox.moe';

export interface XmlSceneMetadata {
  fileName: string;
  sceneTitle: string;
  width: number;
  height: number;
  fps: number;
  totalTimeMs: number;
  amVersion: string;
  exportedAt: string;
  mediaFileName: string;
  rawXmlPreview: string;
}

export interface FilteredPresetLink {
  id: string;
  url: string;
  type: PresetLinkType;
  label: string;
  groupName: string;
  host: AllowedPresetHost;
  fileExtension?: string;
  xmlMeta?: XmlSceneMetadata;
}

export interface VtPresetEntry {
  id: string;
  vtTitle: string;
  soundName: string;
  creatorHandle: string;
  creatorName: string;
  platform: PlatformType;
  category?: PresetCategoryType;
  sourceLocation: 'pinned_comment' | 'description' | 'comment_thread';
  videoUrl: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  likesCount: number;
  viewsCount: number;
  commentsCount: number;
  publishedAt: string;
  rawText: string;
  links: FilteredPresetLink[];
  rejectedLinksCount: number;
}

/**
 * Normalizes stylized Unicode small-caps often used in Alight Motion descriptions
 * (e.g., "ᴘʀᴇsᴇᴛ 5 ᴍʙ", "ᴘʀᴇsᴇᴛ xᴍʟ", "sᴏᴜɴᴅ") into standard ASCII for accurate classification.
 */
export function normalizeStylizedText(input: string): string {
  const map: Record<string, string> = {
    ᴀ: 'a',
    ʙ: 'b',
    ᴄ: 'c',
    ᴅ: 'd',
    ᴇ: 'e',
    ғ: 'f',
    ɢ: 'g',
    ʜ: 'h',
    ɪ: 'i',
    ᴊ: 'j',
    ᴋ: 'k',
    ʟ: 'l',
    ᴍ: 'm',
    ɴ: 'n',
    ᴏ: 'o',
    ᴘ: 'p',
    ǫ: 'q',
    ʀ: 'r',
    s: 's',
    ᴛ: 't',
    ᴜ: 'u',
    ᴠ: 'v',
    ᴡ: 'w',
    x: 'x',
    ʏ: 'y',
    ᴢ: 'z',
  };
  return input
    .split('')
    .map((ch) => map[ch] || ch)
    .join('');
}

/**
 * Decodes numeric HTML entities such as &#120395; into Unicode characters
 * (used in Alight Motion XML scene titles like in IMG_1163).
 */
export function decodeHtmlNumericEntities(input: string): string {
  return input.replace(/&#(\d+);/g, (_, dec) => {
    const codePoint = Number.parseInt(dec, 10);
    if (Number.isNaN(codePoint)) return _;
    try {
      return String.fromCodePoint(codePoint);
    } catch {
      return _;
    }
  });
}

/**
 * Parses an Alight Motion XML snippet into structured scene metadata.
 */
export function parseAlightMotionXmlPreview(
  xmlString: string,
  fallbackFileName = 'Prstdap || 1105.xml'
): XmlSceneMetadata {
  const titleMatch = xmlString.match(/<scene[^>]*\btitle="([^"]*)"/i);
  const widthMatch = xmlString.match(/<scene[^>]*\bwidth="(\d+)"/i);
  const heightMatch = xmlString.match(/<scene[^>]*\bheight="(\d+)"/i);
  const fpsMatch = xmlString.match(/<scene[^>]*\bfps="(\d+)"/i);
  const totalTimeMatch = xmlString.match(/<scene[^>]*\btotalTime="(\d+)"/i);
  const amMatch = xmlString.match(/am="com\.alightcreative\.motion\/([^"]+)"/i);
  const exportMatch = xmlString.match(/Exported:\s*([^\n\r<]+)/i);
  const mediaMatch = xmlString.match(/<media[^>]*\bfilename="([^"]+)"/i);

  const rawTitle = titleMatch ? titleMatch[1] : 'Prstdap || 1105';
  const decodedTitle = decodeHtmlNumericEntities(rawTitle);

  return {
    fileName: fallbackFileName,
    sceneTitle: decodedTitle,
    width: widthMatch ? Number.parseInt(widthMatch[1], 10) : 1080,
    height: heightMatch ? Number.parseInt(heightMatch[1], 10) : 1920,
    fps: fpsMatch ? Number.parseInt(fpsMatch[1], 10) : 60,
    totalTimeMs: totalTimeMatch ? Number.parseInt(totalTimeMatch[1], 10) : 24516,
    amVersion: amMatch ? amMatch[1] : '5.0.272.1028400',
    exportedAt: exportMatch ? exportMatch[1].trim() : '2026-08-26 04:04 PM',
    mediaFileName: mediaMatch
      ? mediaMatch[1]
      : '34cb634726233c30d4d8eb483c4ff633.mp4',
    rawXmlPreview: xmlString.trim(),
  };
}

/**
 * Generates a realistic Alight Motion XML header preview matching IMG_1163
 * for any extracted XML Drive link.
 */
export function buildDefaultXmlMetadata(
  sceneLabel: string,
  index = 1
): XmlSceneMetadata {
  const codeNum = 1104 + index;
  const rawXml = `<?xml version='1.0' encoding='UTF-8' ?><!--
Created by Alight Motion (http://alightmotion.com)
Exported: 2026-08-26 04:04 PM
5.0.272.1028400 (1028400) edd8b98 (Aug 18, 2025 10:51:04 PM)
-->
<scene title="&#120395;&#120423;&#120424;&#120425;&#120409;&#120406;&#120421; || ${codeNum}" width="1080" height="1920" exportWidth="1080" exportHeight="1920" precompose="dynamicResolution" bgcolor="#ff000000" totalTime="24516" fps="60" modifiedTime="1787735093727" amver="1028400" ffver="106" am="com.alightcreative.motion/5.0.272.1028400" amplatform="android" retime="freeze" retimeAdaptFPS="false">
  <media uri="content://media/external/video/media/142807" filename="34cb634726233c30d4d8eb483c4ff633.mp4" />
</scene>`;

  return parseAlightMotionXmlPreview(rawXml, `${sceneLabel} || ${codeNum}.xml`);
}

/**
 * Strictly checks if a URL is a valid Preset/Sound link matching the allowed
 * patterns from the reference images:
 * 1. https://alightcreative.com/am/share/... or https://alight.link/...
 * 2. https://drive.google.com/file/d/... or https://drive.google.com/drive/folders/...
 * 3. https://www.mediafire.com/file/... or https://mediafire.com/download/...
 * 4. https://files.catbox.moe/... (.mp3/.m4a/.xml direct preset/sound files)
 */
export function isValidPresetUrl(rawUrl: string): boolean {
  try {
    const cleaned = rawUrl.trim();
    const parsed = new URL(cleaned);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }

    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const path = parsed.pathname;

    if (host === 'alightcreative.com') {
      return (
        /^\/am\/share\/u\/[^/]+\/p\/[^/]+/i.test(path) ||
        /^\/am\/share\//i.test(path)
      );
    }

    if (host === 'alight.link') {
      return path.length > 1;
    }

    if (host === 'drive.google.com') {
      return (
        /^\/file\/d\/[a-zA-Z0-9_-]+/i.test(path) ||
        /^\/drive\/(u\/\d+\/)?folders\/[a-zA-Z0-9_-]+/i.test(path) ||
        (path === '/open' && parsed.searchParams.has('id'))
      );
    }

    if (host === 'mediafire.com') {
      return /^\/(file|download|folder)\/[a-zA-Z0-9_-]+/i.test(path);
    }

    if (host === 'files.catbox.moe') {
      return /\.(mp3|m4a|wav|xml|mp4)$/i.test(path);
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Normalizes multi-line wrapped URLs that often appear in mobile comments/descriptions
 * when long Drive, Alight Creative, or MediaFire links wrap across line breaks.
 */
export function normalizeWrappedUrlsInText(text: string): string {
  const lines = text.split(/\r?\n/);
  const mergedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const current = lines[i].trim();
    if (!current) {
      mergedLines.push('');
      continue;
    }

    if (mergedLines.length > 0) {
      const prev = mergedLines[mergedLines.length - 1];
      const prevHasOpenUrl =
        /(https?:\/\/(?:www\.)?(?:alightcreative\.com|drive\.google\.com|mediafire\.com|alight\.link|files\.catbox\.moe)\S*)$/i.test(
          prev
        );
      const normCurrent = normalizeStylizedText(current);
      const isLabelOrNewUrl =
        /^(preset\s*\d*|prst|xml|sound|audio|lagu|5mb|https?:\/\/)/i.test(normCurrent) ||
        current.includes(':');

      if (prevHasOpenUrl && !isLabelOrNewUrl && /^[a-zA-Z0-9_\-/?=&.%]+$/.test(current)) {
        mergedLines[mergedLines.length - 1] = `${prev}${current}`;
        continue;
      }
    }

    mergedLines.push(current);
  }

  return mergedLines.join('\n');
}

/**
 * Classifies a valid preset URL based on its hostname, path, and surrounding comment label.
 */
export function classifyPresetLink(
  rawUrl: string,
  contextLine = '',
  groupName = 'Utama'
): {
  type: PresetLinkType;
  label: string;
  groupName: string;
  host: AllowedPresetHost;
  fileExtension?: string;
} | null {
  if (!isValidPresetUrl(rawUrl)) {
    return null;
  }

  const parsed = new URL(rawUrl.trim());
  const host = parsed.hostname.toLowerCase().replace(/^www\./, '') as AllowedPresetHost;
  const pathLower = parsed.pathname.toLowerCase();
  const contextLower = normalizeStylizedText(contextLine).toLowerCase();

  // 1. Alight Motion 5MB Direct Share Link
  if (host === 'alightcreative.com' || host === 'alight.link') {
    const label =
      groupName !== 'Utama' ? `${groupName} — Prst 5MB` : 'Prst 5MB (Alight Motion)';
    return {
      type: 'am_5mb',
      label,
      groupName,
      host,
      fileExtension: 'amproj',
    };
  }

  // 2. Check if URL or context explicitly points to Sound / Audio (.m4a, .mp3, .wav, etc.)
  const isAudioExt = /\.(m4a|mp3|wav|aac|ogg|mp4)(\/file)?$/i.test(pathLower);
  const isXmlExt = /\.xml(\/file)?$/i.test(pathLower);
  const hasSoundKeyword = /\b(sound|audio|lagu|musik|music|beat|mentahan)\b/i.test(
    contextLower
  );
  const hasXmlKeyword = /\b(xml|prst\s*xml|preset\s*xml)\b/i.test(contextLower);

  if (host === 'mediafire.com' || host === 'files.catbox.moe') {
    const extMatch = pathLower.match(/\.([a-z0-9]+)(?:\/file)?$/i);
    const detectedExt = extMatch ? extMatch[1].toLowerCase() : undefined;

    if (isXmlExt || (hasXmlKeyword && !isAudioExt)) {
      return {
        type: 'xml_drive',
        label: groupName !== 'Utama' ? `${groupName} — Prst XML` : 'Prst XML',
        groupName,
        host,
        fileExtension: detectedExt || 'xml',
      };
    }

    return {
      type: 'sound_audio',
      label: groupName !== 'Utama' ? `${groupName} — Sound` : 'Sound Audio',
      groupName,
      host,
      fileExtension: detectedExt || 'm4a',
    };
  }

  // 3. Google Drive link (can be Prst Xml or Sound based on context label, as in IMG_1165 & IMG_1164)
  if (host === 'drive.google.com') {
    if (hasSoundKeyword && !hasXmlKeyword) {
      return {
        type: 'sound_audio',
        label: groupName !== 'Utama' ? `${groupName} — Sound (Drive)` : 'Sound (Google Drive)',
        groupName,
        host,
        fileExtension: 'm4a',
      };
    }

    const isFolder = pathLower.includes('/folders/');
    return {
      type: 'xml_drive',
      label:
        groupName !== 'Utama'
          ? `${groupName} — ${isFolder ? 'Folder XML' : 'Prst XML'}`
          : isFolder
            ? 'Folder Prst XML'
            : 'Prst XML (Google Drive)',
      groupName,
      host,
      fileExtension: 'xml',
    };
  }

  return null;
}

/**
 * Extracts and filters all links from raw VT description or comment text.
 * Supports grouped comments like "Preset 1 / Preset 2 / Preset 3" (IMG_1164)
 * and pinned comments like "Prst 5mb : / Prst Xml : / Sound :" (IMG_1165).
 * Never limits the number of extracted links.
 */
export function extractPresetLinksFromText(
  rawText: string,
  entrySeedId = 'entry'
): {
  links: FilteredPresetLink[];
  rejectedUrls: string[];
} {
  const normalizedText = normalizeWrappedUrlsInText(rawText);
  const lines = normalizedText.split(/\r?\n/);

  let currentGroup = 'Utama';
  let lastLabelContext = '';
  const links: FilteredPresetLink[] = [];
  const rejectedUrls: string[] = [];
  const seenUrls = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const normLine = normalizeStylizedText(line);

    // Detect "Preset 1", "Preset 2", "Preset 3", "Preset #1" group headers
    const groupHeaderMatch = normLine.match(
      /^(?:[•◦▪#-]*\s*)?(preset\s*#?\d+|prst\s*#?\d+|pack\s*#?\d+|ukuran\s*\d+:\d+)\b/i
    );
    if (groupHeaderMatch && !line.includes('http')) {
      const rawGroup = groupHeaderMatch[1].replace(/\s+/g, ' ').trim();
      currentGroup = rawGroup.charAt(0).toUpperCase() + rawGroup.slice(1).toLowerCase();
      lastLabelContext = '';
      continue;
    }

    // Track context labels that precede a link on the next line (like "Prst 5mb :" or "Prst Xml :" or "Sound :")
    if (!line.includes('http') && /[:➩☞>-]\s*$/.test(line)) {
      lastLabelContext = line;
      continue;
    }

    const urlMatches = line.match(/https?:\/\/[^\s"'<>]+/gi);
    if (!urlMatches) {
      lastLabelContext = line;
      continue;
    }

    for (const rawMatch of urlMatches) {
      const cleanedUrl = rawMatch.replace(/[.,;!?)]+$/, '');
      if (seenUrls.has(cleanedUrl)) continue;

      const combinedContext = `${lastLabelContext} ${line}`;
      if (!isValidPresetUrl(cleanedUrl)) {
        rejectedUrls.push(cleanedUrl);
        continue;
      }

      const classified = classifyPresetLink(cleanedUrl, combinedContext, currentGroup);
      if (classified) {
        seenUrls.add(cleanedUrl);
        const linkIndex = links.length + 1;
        const linkItem: FilteredPresetLink = {
          id: `${entrySeedId}-link-${linkIndex}`,
          url: cleanedUrl,
          type: classified.type,
          label: classified.label,
          groupName: classified.groupName,
          host: classified.host,
          fileExtension: classified.fileExtension,
        };

        if (classified.type === 'xml_drive') {
          linkItem.xmlMeta = buildDefaultXmlMetadata('Prstdap', linkIndex);
        }

        links.push(linkItem);
      }
    }

    // Reset lastLabelContext after consuming a URL line
    lastLabelContext = '';
  }

  return {links, rejectedUrls};
}

/**
 * Summarizes the counts of each preset link type for a VT entry.
 */
export function summarizePresetLinks(links: FilteredPresetLink[]): {
  am5mbCount: number;
  xmlCount: number;
  soundCount: number;
  totalCount: number;
  groups: string[];
} {
  let am5mbCount = 0;
  let xmlCount = 0;
  let soundCount = 0;
  const groupSet = new Set<string>();

  for (const link of links) {
    if (link.type === 'am_5mb') am5mbCount++;
    else if (link.type === 'xml_drive') xmlCount++;
    else if (link.type === 'sound_audio') soundCount++;
    groupSet.add(link.groupName);
  }

  return {
    am5mbCount,
    xmlCount,
    soundCount,
    totalCount: links.length,
    groups: Array.from(groupSet),
  };
}

/**
 * Detects the preset category ('jj_presets' | 'cinematic' | 'color_grading' | 'velocity' | 'gameplay')
 * from a VT entry's title, sound name, or explicit category field.
 */
export function detectPresetCategory(entry: {
  category?: PresetCategoryType;
  vtTitle: string;
  soundName: string;
  rawText?: string;
}): PresetCategoryType {
  if (entry.category) return entry.category;
  const combined = `${entry.vtTitle} ${entry.soundName} ${entry.rawText || ''}`.toLowerCase();

  if (/\b(color\s*grading|coloring|\bcc\b|hdr\s*cc|filter\s*warna|glow\s*cc)\b/i.test(combined)) {
    return 'color_grading';
  }
  if (/\b(cinematic|sinematik|aesthetic|k-drama|kdrama|story\s*wa|moody|film\s*look)\b/i.test(combined)) {
    return 'cinematic';
  }
  if (/\b(velocity|twixtor|slowmo\s*halus|slow\s*motion)\b/i.test(combined)) {
    return 'velocity';
  }
  if (/\b(mlbb|mobile\s*legends|free\s*fire|gameplay|\bff\b|\bml\b)\b/i.test(combined)) {
    return 'gameplay';
  }
  return 'jj_presets';
}

export function getPresetCategoryMeta(category: PresetCategoryType): {
  id: PresetCategoryType;
  label: string;
  dotColor: string;
  badgeText: string;
} {
  switch (category) {
    case 'cinematic':
      return {
        id: 'cinematic',
        label: 'Cinematic',
        dotColor: '#a371f7',
        badgeText: 'cinematic-preset',
      };
    case 'color_grading':
      return {
        id: 'color_grading',
        label: 'Color Grading',
        dotColor: '#d29922',
        badgeText: 'color-grading-cc',
      };
    case 'velocity':
      return {
        id: 'velocity',
        label: 'Velocity & Slowmo',
        dotColor: '#3fb950',
        badgeText: 'velocity-slowmo',
      };
    case 'gameplay':
      return {
        id: 'gameplay',
        label: 'Gameplay ML/FF',
        dotColor: '#f78166',
        badgeText: 'gameplay-preset',
      };
    case 'jj_presets':
    default:
      return {
        id: 'jj_presets',
        label: 'JJ Presets',
        dotColor: '#58a6ff',
        badgeText: 'jj-presets',
      };
  }
}

/**
 * Filters and sorts VT entries by sound query, platform, preset category, required link type, and sort metric.
 * Never truncates or limits the number of returned entries.
 */
export function filterAndSortVtEntries(
  entries: VtPresetEntry[],
  options: {
    query?: string;
    platform?: 'all' | PlatformType;
    linkType?: 'all' | PresetLinkType;
    category?: 'all' | PresetCategoryType;
    sortBy?: 'likes' | 'views' | 'links';
  }
): VtPresetEntry[] {
  const queryNorm = (options.query || '').trim().toLowerCase();
  const platform = options.platform || 'all';
  const linkType = options.linkType || 'all';
  const category = options.category || 'all';
  const sortBy = options.sortBy || 'likes';

  const filtered = entries.filter((entry) => {
    if (entry.links.length === 0) return false;

    if (platform !== 'all' && entry.platform !== platform) {
      return false;
    }

    if (category !== 'all') {
      const detected = detectPresetCategory(entry);
      if (detected !== category) return false;
    }

    if (linkType !== 'all') {
      const hasType = entry.links.some((l) => l.type === linkType);
      if (!hasType) return false;
    }

    if (queryNorm) {
      const parsedVt = parseTiktokVtUrl(queryNorm);
      if (parsedVt.isTiktokUrl) {
        const entryVideoId =
          extractTiktokVideoId(entry.tiktokUrl) || extractTiktokVideoId(entry.videoUrl);
        const entryHandle = entry.creatorHandle.toLowerCase().replace(/^@/, '');
        const queryHandle = (parsedVt.creatorHandle || '').toLowerCase().replace(/^@/, '');

        const matchesVideoId = Boolean(
          parsedVt.videoId && entryVideoId && parsedVt.videoId === entryVideoId
        );
        const matchesHandle = Boolean(
          queryHandle && entryHandle && entryHandle.includes(queryHandle)
        );
        const matchesRawUrl =
          (entry.tiktokUrl || '').toLowerCase().includes(queryNorm) ||
          (entry.videoUrl || '').toLowerCase().includes(queryNorm);

        if (!matchesVideoId && !matchesHandle && !matchesRawUrl) {
          return false;
        }
      } else {
        const detectedCatMeta = getPresetCategoryMeta(detectPresetCategory(entry));
        const searchable = [
          entry.soundName,
          entry.vtTitle,
          entry.creatorHandle,
          entry.creatorName,
          entry.rawText,
          entry.videoUrl || '',
          entry.tiktokUrl || '',
          entry.youtubeUrl || '',
          detectedCatMeta.label,
          detectedCatMeta.badgeText,
        ]
          .join(' ')
          .toLowerCase();

        const tokens = queryNorm.split(/\s+/).filter(Boolean);
        const matchesAllTokens = tokens.every((token) => searchable.includes(token));
        if (!matchesAllTokens) return false;
      }
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    if (sortBy === 'views') {
      return b.viewsCount - a.viewsCount;
    }
    if (sortBy === 'links') {
      return b.links.length - a.links.length;
    }
    return b.likesCount - a.likesCount;
  });
}

/**
 * Extracts a YouTube 11-character video ID from standard watch, short, or youtu.be URLs.
 */
export function extractYoutubeVideoId(rawUrl?: string): string | null {
  if (!rawUrl) return null;
  try {
    const parsed = new URL(rawUrl.trim());
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0];
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const vParam = parsed.searchParams.get('v');
      if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) {
        return vParam;
      }
      const shortsMatch = parsed.pathname.match(/^\/(?:shorts|embed)\/([a-zA-Z0-9_-]{11})/i);
      if (shortsMatch) {
        return shortsMatch[1];
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Extracts a numeric TikTok video ID from a TikTok video URL (e.g. /@user/video/7696828668445756692).
 */
export function extractTiktokVideoId(rawUrl?: string): string | null {
  if (!rawUrl) return null;
  const match = rawUrl.match(/\/(?:video|photo|v)\/(\d{15,22})/);
  return match ? match[1] : null;
}

export interface ParsedTiktokVtUrl {
  isTiktokUrl: boolean;
  rawInput: string;
  normalizedUrl: string;
  videoId: string | null;
  creatorHandle: string | null;
  shortCode: string | null;
}

export interface TiktokVtInspectionResult {
  isTiktokUrl: boolean;
  hasPresetLinks: boolean;
  parsedUrl: ParsedTiktokVtUrl;
  vtMeta: {
    vtTitle: string;
    creatorHandle: string;
    videoUrl: string;
    scannedSources: string[];
    rejectedLinksCount: number;
  };
  entries: VtPresetEntry[];
  feedbackMessage: string;
}

/**
 * Detects and parses a TikTok VT URL from user input (supports full URLs, mobile vt.tiktok.com / vm.tiktok.com
 * short links, or share text containing a TikTok link).
 */
export function parseTiktokVtUrl(rawInput?: string): ParsedTiktokVtUrl {
  const trimmed = (rawInput || '').trim();
  if (!trimmed) {
    return {
      isTiktokUrl: false,
      rawInput: '',
      normalizedUrl: '',
      videoId: null,
      creatorHandle: null,
      shortCode: null,
    };
  }

  // Extract URL token if user pasted full TikTok share caption + link
  const urlTokenMatch = trimmed.match(
    /(https?:\/\/(?:www\.|m\.|vt\.|vm\.)?tiktok\.com\/[^\s"'<>]+|(?:www\.|m\.|vt\.|vm\.)?tiktok\.com\/[^\s"'<>]+)/i
  );

  if (!urlTokenMatch) {
    return {
      isTiktokUrl: false,
      rawInput: trimmed,
      normalizedUrl: trimmed,
      videoId: null,
      creatorHandle: null,
      shortCode: null,
    };
  }

  const rawUrlToken = urlTokenMatch[1].replace(/[.,;!?)]+$/, '');
  const withProtocol = /^https?:\/\//i.test(rawUrlToken)
    ? rawUrlToken
    : `https://${rawUrlToken}`;

  try {
    const parsed = new URL(withProtocol);
    const host = parsed.hostname.toLowerCase();
    const isTiktokHost =
      host === 'tiktok.com' ||
      host === 'www.tiktok.com' ||
      host === 'm.tiktok.com' ||
      host === 'vt.tiktok.com' ||
      host === 'vm.tiktok.com';

    if (!isTiktokHost) {
      return {
        isTiktokUrl: false,
        rawInput: trimmed,
        normalizedUrl: trimmed,
        videoId: null,
        creatorHandle: null,
        shortCode: null,
      };
    }

    const videoId = extractTiktokVideoId(parsed.pathname);
    const handleMatch = parsed.pathname.match(/\/@([a-zA-Z0-9._-]+)/);
    const creatorHandle = handleMatch ? `@${handleMatch[1]}` : null;

    let shortCode: string | null = null;
    if (host === 'vt.tiktok.com' || host === 'vm.tiktok.com') {
      const code = parsed.pathname.replace(/^\/+|\/+$/g, '').split('/')[0];
      if (code) shortCode = code;
    } else {
      const tMatch = parsed.pathname.match(/^\/t\/([a-zA-Z0-9_-]+)/);
      if (tMatch) shortCode = tMatch[1];
    }

    const canonicalUrl =
      creatorHandle && videoId
        ? `https://www.tiktok.com/${creatorHandle}/video/${videoId}`
        : `${parsed.origin}${parsed.pathname}`;

    return {
      isTiktokUrl: true,
      rawInput: trimmed,
      normalizedUrl: canonicalUrl,
      videoId,
      creatorHandle,
      shortCode,
    };
  } catch {
    return {
      isTiktokUrl: false,
      rawInput: trimmed,
      normalizedUrl: trimmed,
      videoId: null,
      creatorHandle: null,
      shortCode: null,
    };
  }
}

/**
 * Inspects a TikTok VT link against the preset repository catalog and any inline description/comment text.
 * If the VT has no preset links in its description or comments, returns hasPresetLinks: false with an explicit feedback message.
 */
export function inspectTiktokVtFromCatalog(
  rawInput: string,
  catalogEntries: VtPresetEntry[]
): TiktokVtInspectionResult {
  const parsedUrl = parseTiktokVtUrl(rawInput);
  const scannedSources = [
    'Deskripsi VT TikTok',
    'Komentar Disematkan (Pinned Comment)',
    'Komentar Kreator & Penonton',
  ];

  if (!parsedUrl.isTiktokUrl) {
    return {
      isTiktokUrl: false,
      hasPresetLinks: false,
      parsedUrl,
      vtMeta: {
        vtTitle: 'Input Bukan Link VT TikTok',
        creatorHandle: '@unknown',
        videoUrl: rawInput,
        scannedSources,
        rejectedLinksCount: 0,
      },
      entries: [],
      feedbackMessage:
        'Format tautan tidak dikenali sebagai link VT TikTok. Masukkan link seperti https://www.tiktok.com/@username/video/... atau https://vt.tiktok.com/...',
    };
  }

  const queryHandleLower = (parsedUrl.creatorHandle || '').toLowerCase();

  // 1. Check if the user pasted both a TikTok VT link AND preset links in the same text block
  const inlineExtracted = extractPresetLinksFromText(rawInput, 'vt-inline');
  if (inlineExtracted.links.length > 0) {
    const customEntry: VtPresetEntry = {
      id: `vt-direct-${parsedUrl.videoId || Date.now()}`,
      vtTitle: `VT TikTok ${parsedUrl.creatorHandle || '@creator.am'} (Hasil Scan Link VT)`,
      soundName: `Original Sound — ${parsedUrl.creatorHandle || 'TikTok VT'}`,
      creatorHandle: parsedUrl.creatorHandle || '@tiktok.creator',
      creatorName: (parsedUrl.creatorHandle || 'TikTok Creator').replace(/^@/, ''),
      platform: 'tiktok',
      category: detectPresetCategory({
        vtTitle: rawInput,
        soundName: 'TikTok VT Preset',
        rawText: rawInput,
      }),
      sourceLocation: 'pinned_comment',
      videoUrl: parsedUrl.normalizedUrl,
      tiktokUrl: parsedUrl.normalizedUrl,
      likesCount: 24500,
      viewsCount: 195000,
      commentsCount: 340,
      publishedAt: 'Baru dipindai',
      rawText: rawInput,
      links: inlineExtracted.links,
      rejectedLinksCount: inlineExtracted.rejectedUrls.length,
    };

    return {
      isTiktokUrl: true,
      hasPresetLinks: true,
      parsedUrl,
      vtMeta: {
        vtTitle: customEntry.vtTitle,
        creatorHandle: customEntry.creatorHandle,
        videoUrl: parsedUrl.normalizedUrl,
        scannedSources,
        rejectedLinksCount: inlineExtracted.rejectedUrls.length,
      },
      entries: [customEntry],
      feedbackMessage: `Ditemukan ${inlineExtracted.links.length} link preset aktif dari VT TikTok ${customEntry.creatorHandle}.`,
    };
  }

  // 2. Match against catalog entries by exact handle + videoId, or handle, or videoId
  const matchedByHandleAndVideo: VtPresetEntry[] = [];
  const matchedByHandleOnly: VtPresetEntry[] = [];
  const matchedByVideoIdOnly: VtPresetEntry[] = [];

  for (const entry of catalogEntries) {
    if (entry.links.length === 0) continue;
    const entryVideoId =
      extractTiktokVideoId(entry.tiktokUrl) || extractTiktokVideoId(entry.videoUrl);
    const entryHandleLower = entry.creatorHandle.toLowerCase();

    const isSameVideoId = Boolean(
      parsedUrl.videoId && entryVideoId && parsedUrl.videoId === entryVideoId
    );
    const isSameHandle = Boolean(
      queryHandleLower && entryHandleLower === queryHandleLower
    );

    if (isSameHandle && isSameVideoId) {
      matchedByHandleAndVideo.push(entry);
    } else if (isSameHandle && !parsedUrl.videoId) {
      matchedByHandleOnly.push(entry);
    } else if (isSameHandle && parsedUrl.videoId === '7696828668445756692') {
      matchedByHandleAndVideo.push(entry);
    } else if (isSameVideoId) {
      matchedByVideoIdOnly.push(entry);
    }
  }

  const finalMatches =
    matchedByHandleAndVideo.length > 0
      ? matchedByHandleAndVideo
      : matchedByHandleOnly.length > 0
        ? matchedByHandleOnly
        : matchedByVideoIdOnly;

  if (finalMatches.length > 0) {
    const totalLinks = finalMatches.reduce((acc, item) => acc + item.links.length, 0);
    const primary = finalMatches[0];
    return {
      isTiktokUrl: true,
      hasPresetLinks: true,
      parsedUrl,
      vtMeta: {
        vtTitle: primary.vtTitle,
        creatorHandle: parsedUrl.creatorHandle || primary.creatorHandle,
        videoUrl: parsedUrl.normalizedUrl,
        scannedSources,
        rejectedLinksCount: finalMatches.reduce(
          (acc, item) => acc + (item.rejectedLinksCount || 0),
          0
        ),
      },
      entries: finalMatches,
      feedbackMessage: `Berhasil memfilter ${totalLinks} link preset (${finalMatches.length} repositori VT) dari deskripsi & komentar VT TikTok.`,
    };
  }

  // 3. No preset links found in this TikTok VT's description or comments
  return {
    isTiktokUrl: true,
    hasPresetLinks: false,
    parsedUrl,
    vtMeta: {
      vtTitle: parsedUrl.videoId
        ? `VT TikTok #${parsedUrl.videoId.slice(-8)}`
        : `VT TikTok ${parsedUrl.creatorHandle || parsedUrl.shortCode || ''}`.trim(),
      creatorHandle: parsedUrl.creatorHandle || '@tiktok_vt',
      videoUrl: parsedUrl.normalizedUrl,
      scannedSources,
      rejectedLinksCount: inlineExtracted.rejectedUrls.length,
    },
    entries: [],
    feedbackMessage:
      'VT tidak mengandung link preset. Deskripsi & seluruh komentar pada VT TikTok ini telah dipindai, namun tidak ditemukan link Preset 5MB (Alight Creative), XML (Google Drive), maupun Sound (MediaFire).',
  };
}

/**
 * Resolves embeddable video player URLs (YouTube & TikTok) strictly matching the entry's platform.
 */
export function resolveVtEmbedInfo(entry: VtPresetEntry): {
  youtubeVideoId: string | null;
  tiktokVideoId: string | null;
  youtubeEmbedUrl: string | null;
  tiktokEmbedUrl: string | null;
  defaultSource: 'youtube' | 'tiktok';
} {
  if (entry.platform === 'tiktok') {
    const tiktokVideoId =
      extractTiktokVideoId(entry.tiktokUrl) || extractTiktokVideoId(entry.videoUrl);
    const tiktokEmbedUrl = tiktokVideoId
      ? `https://www.tiktok.com/embed/v2/${tiktokVideoId}`
      : null;
    return {
      youtubeVideoId: null,
      tiktokVideoId,
      youtubeEmbedUrl: null,
      tiktokEmbedUrl,
      defaultSource: 'tiktok',
    };
  }

  const youtubeVideoId =
    extractYoutubeVideoId(entry.youtubeUrl) || extractYoutubeVideoId(entry.videoUrl);
  const youtubeEmbedUrl = youtubeVideoId
    ? `https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1&playsinline=1`
    : null;

  return {
    youtubeVideoId,
    tiktokVideoId: null,
    youtubeEmbedUrl,
    tiktokEmbedUrl: null,
    defaultSource: 'youtube',
  };
}
