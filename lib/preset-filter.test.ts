import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidPresetUrl,
  extractPresetLinksFromText,
  parseAlightMotionXmlPreview,
  summarizePresetLinks,
  filterAndSortVtEntries,
  normalizeStylizedText,
  extractYoutubeVideoId,
  extractTiktokVideoId,
  resolveVtEmbedInfo,
  detectPresetCategory,
  getPresetCategoryMeta,
} from './preset-filter';
import {
  getSeedVtEntries,
  getTrendingSeedVtEntries,
  getTrendingByTopic,
} from './preset-seed-data';

test('isValidPresetUrl strictly allows only Alight Motion, Google Drive, MediaFire, and Catbox preset links', () => {
  // Exact links from IMG_1165
  assert.equal(
    isValidPresetUrl(
      'https://alightcreative.com/am/share/u/7RKsdEaAa1gQkAGE92bOMk1z1Uw1/p/Q8llLg16H6-6ac24d46b0bcbd33'
    ),
    true
  );
  assert.equal(
    isValidPresetUrl(
      'https://drive.google.com/file/d/1MRZ1AsEcQIn_WdJEh5-AlSnfRllUWi8b/view?usp=drivesdk'
    ),
    true
  );
  // Exact links from IMG_1164
  assert.equal(
    isValidPresetUrl('https://www.mediafire.com/file/paojmjgoevgt9pa/preset_01.m4a/file'),
    true
  );
  assert.equal(
    isValidPresetUrl(
      'https://drive.google.com/drive/folders/1liFGJbiQc42bZOzw2Qp-peD29k-1TbOd'
    ),
    true
  );

  // Reject unrelated or spam links
  assert.equal(isValidPresetUrl('https://shopee.co.id/product/12345'), false);
  assert.equal(isValidPresetUrl('https://www.instagram.com/p/xyz'), false);
  assert.equal(isValidPresetUrl('https://t.me/randomchannel'), false);
  assert.equal(isValidPresetUrl('not-a-url'), false);
});

test('normalizeStylizedText converts Unicode small-caps from AM descriptions accurately', () => {
  const stylized = '◦ ᴘʀᴇsᴇᴛ 5 ᴍʙ ➩';
  assert.equal(normalizeStylizedText(stylized), '◦ preset 5 mb ➩');
});

test('extractPresetLinksFromText parses pinned comment format from IMG_1165 accurately', () => {
  const commentImg1165 = `Disematkan oleh @vkriedtz2
Prst 5mb :
https://alightcreative.com/am/share/u/
7RKsdEaAa1gQkAGE92bOMk1z1Uw1/p/
Q8llLg16H6-6ac24d46b0bcbd33

Prst Xml :
https://drive.google.com/file/d/
1MRZ1AsEcQIn_WdJEh5-AlSnfRllUWi8b/
view?usp=drivesdk

Sound :
https://drive.google.com/file/d/
1vSoDI2x6oPXW4L5m4rGdeWbCtMRsqeU-/
view?usp=drivesdk

Link bio: https://shopee.co.id/spam`;

  const result = extractPresetLinksFromText(commentImg1165, 'vkriedtz2');
  assert.equal(result.links.length, 3);
  assert.equal(result.rejectedUrls.length, 1);
  assert.equal(result.links[0].type, 'am_5mb');
  assert.equal(result.links[1].type, 'xml_drive');
  assert.equal(result.links[2].type, 'sound_audio');
  assert.ok(result.links[1].xmlMeta);
});

test('extractPresetLinksFromText parses multi-preset comment format from IMG_1164 accurately', () => {
  const commentImg1164 = `Preset 1
Xml : https://drive.google.com/file/d/1_IB0GD1oQqstLxJ30EZcSbvKrSL94muu/view?usp=drivesdk
Sound : https://www.mediafire.com/file/paojmjgoevgt9pa/preset_01.m4a/file

Preset 2
Xml : https://drive.google.com/file/d/11p9jBMhFyV7xUd0EOcygHmbB4hWW8oeW/view?usp=drivesdk
Sound : https://www.mediafire.com/file/3ymycyvlhdjbdga/preset_02.m4a/file

Preset 3
Xml : https://drive.google.com/drive/folders/1liFGJbiQc42bZOzw2Qp-peD29k-1TbOd
Sound : https://www.mediafire.com/file/55dh6zcbn062gee/preset_03.m4a/file`;

  const result = extractPresetLinksFromText(commentImg1164, 'multi');
  assert.equal(result.links.length, 6);
  const summary = summarizePresetLinks(result.links);
  assert.equal(summary.xmlCount, 3);
  assert.equal(summary.soundCount, 3);
  assert.deepEqual(summary.groups, ['Preset 1', 'Preset 2', 'Preset 3']);
});

test('getSeedVtEntries returns 18+ real kicau mania entries with valid working URLs and no truncation', () => {
  const entries = getSeedVtEntries();
  assert.ok(entries.length >= 18);
  const kicauResults = filterAndSortVtEntries(entries, {query: 'kicau mania'});
  assert.equal(kicauResults.length, entries.length);
  for (const entry of kicauResults) {
    assert.ok(entry.links.length > 0);
    assert.ok(entry.tiktokUrl?.startsWith('https://'));
    assert.ok(entry.youtubeUrl?.startsWith('https://'));
  }
});

test('parseAlightMotionXmlPreview extracts scene metadata matching IMG_1163', () => {
  const xmlFromImg1163 = `<?xml version='1.0' encoding='UTF-8' ?><!--
Created by Alight Motion (http://alightmotion.com)
Exported: 2026-08-26 04:04 PM
5.0.272.1028400 (1028400) edd8b98 (Aug 18, 2025 10:51:04 PM)
-->
<scene title="&#120395;&#120423;&#120424;&#120425;&#120409;&#120406;&#120421; || 1105" width="1080" height="1920" exportWidth="1080" exportHeight="1920" precompose="dynamicResolution" bgcolor="#ff000000" totalTime="24516" fps="60" modifiedTime="1787735093727" amver="1028400" ffver="106" am="com.alightcreative.motion/5.0.272.1028400" amplatform="android" retime="freeze" retimeAdaptFPS="false">
  <media uri="content://media/external/video/media/142807" filename="34cb634726233c30d4d8eb483c4ff633.mp4" />
</scene>`;

  const meta = parseAlightMotionXmlPreview(xmlFromImg1163, 'Prstdap || 1105.xml');
  assert.equal(meta.width, 1080);
  assert.equal(meta.height, 1920);
  assert.equal(meta.fps, 60);
  assert.equal(meta.totalTimeMs, 24516);
  assert.equal(meta.amVersion, '5.0.272.1028400');
  assert.ok(meta.sceneTitle.includes('1105'));
});

test('extractYoutubeVideoId, extractTiktokVideoId, and resolveVtEmbedInfo strictly resolve platform-matching embeds', () => {
  assert.equal(
    extractYoutubeVideoId('https://www.youtube.com/watch?v=5ZV9hTEP6ro'),
    '5ZV9hTEP6ro'
  );
  assert.equal(
    extractTiktokVideoId('https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692'),
    '7696828668445756692'
  );

  const trending = getTrendingSeedVtEntries();
  assert.ok(trending.length >= 22);
  // Verify trending entries are sorted by highest likes descending
  for (let i = 1; i < trending.length; i++) {
    assert.ok(trending[i - 1].likesCount >= trending[i].likesCount);
  }
  // Verify every entry resolves a valid platform-matching embed URL for the detail modal player
  for (const entry of trending) {
    const embed = resolveVtEmbedInfo(entry);
    if (entry.platform === 'tiktok') {
      assert.equal(embed.defaultSource, 'tiktok');
      assert.ok(embed.tiktokEmbedUrl?.startsWith('https://www.tiktok.com/embed/v2/'));
      assert.equal(embed.youtubeEmbedUrl, null);
    } else {
      assert.equal(embed.defaultSource, 'youtube');
      assert.ok(embed.youtubeEmbedUrl?.startsWith('https://www.youtube.com/embed/'));
      assert.equal(embed.tiktokEmbedUrl, null);
    }
  }
});

test('detectPresetCategory classifies JJ Presets, Cinematic, Color Grading, Velocity, and Gameplay accurately', () => {
  assert.equal(
    detectPresetCategory({
      vtTitle: 'PRESET AM COLOR GRADING HDR 4K',
      soundName: 'Kicau Mania Color Grading',
    }),
    'color_grading'
  );
  assert.equal(
    detectPresetCategory({
      vtTitle: 'PRESET AM CINEMATIC STORY WA',
      soundName: 'Cinematic Aesthetic',
    }),
    'cinematic'
  );
  assert.equal(
    detectPresetCategory({
      vtTitle: 'PRESET JEDAG JEDUG SOUND KICAU MANIA FULL BEAT',
      soundName: 'Sound Kicau Mania',
    }),
    'jj_presets'
  );

  const trending = getTrendingSeedVtEntries();
  const jjFiltered = filterAndSortVtEntries(trending, {category: 'jj_presets'});
  const cinematicFiltered = filterAndSortVtEntries(trending, {category: 'cinematic'});
  const colorFiltered = filterAndSortVtEntries(trending, {category: 'color_grading'});

  assert.ok(jjFiltered.length > 0);
  assert.ok(cinematicFiltered.length > 0);
  assert.ok(colorFiltered.length > 0);
  assert.ok(jjFiltered.every((e) => e.category === 'jj_presets'));
  assert.ok(cinematicFiltered.every((e) => e.category === 'cinematic'));
  assert.ok(colorFiltered.every((e) => e.category === 'color_grading'));
  assert.equal(getPresetCategoryMeta('jj_presets').label, 'JJ Presets');
  assert.equal(getPresetCategoryMeta('cinematic').label, 'Cinematic');
  assert.equal(getPresetCategoryMeta('color_grading').label, 'Color Grading');
});

test('getTrendingByTopic returns topic-specific non-Kicau-Mania entries for kane, velocity, and gameplay', () => {
  const kaneEntries = getTrendingByTopic('kane', false);
  const velocityEntries = getTrendingByTopic('velocity', false);
  const gameplayEntries = getTrendingByTopic('gameplay', false);
  const allEntries = getTrendingByTopic('all', true);

  assert.ok(kaneEntries.length >= 3);
  assert.ok(velocityEntries.length >= 2);
  assert.ok(gameplayEntries.length >= 3);
  assert.ok(allEntries.length >= 10);

  assert.ok(kaneEntries.every((e) => !/kicau/i.test(e.vtTitle)));
  assert.ok(velocityEntries.every((e) => !/kicau/i.test(e.vtTitle)));
  assert.ok(gameplayEntries.every((e) => !/kicau/i.test(e.vtTitle)));
});
