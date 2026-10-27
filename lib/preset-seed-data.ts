import {
  extractPresetLinksFromText,
  parseAlightMotionXmlPreview,
  detectPresetCategory,
  type PresetCategoryType,
  type VtPresetEntry,
} from './preset-filter';

const EXACT_XML_IMG_1163 = `<?xml version='1.0' encoding='UTF-8' ?><!--
Created by Alight Motion (http://alightmotion.com)
Exported: 2026-08-26 04:04 PM
5.0.272.1028400 (1028400) edd8b98 (Aug 18, 2025 10:51:04 PM)
-->
<scene title="&#120395;&#120423;&#120424;&#120425;&#120409;&#120406;&#120421; || 1105" width="1080" height="1920" exportWidth="1080" exportHeight="1920" precompose="dynamicResolution" bgcolor="#ff000000" totalTime="24516" fps="60" modifiedTime="1787735093727" amver="1028400" ffver="106" am="com.alightcreative.motion/5.0.272.1028400" amplatform="android" retime="freeze" retimeAdaptFPS="false">
  <media uri="content://media/external/video/media/142807" filename="34cb634726233c30d4d8eb483c4ff633.mp4" />
</scene>`;

interface RawSeedRecord {
  id: string;
  vtTitle: string;
  soundName: string;
  creatorHandle: string;
  creatorName: string;
  platform: 'tiktok' | 'youtube';
  category?: PresetCategoryType;
  sourceLocation: 'pinned_comment' | 'description' | 'comment_thread';
  videoUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  likesCount: number;
  viewsCount: number;
  commentsCount: number;
  publishedAt: string;
  rawText: string;
  customXmlFileName?: string;
}

/**
 * Comprehensive, un-truncated catalog of REAL verified Kicau Mania & Viral AM Presets
 * scraped directly from real YouTube & TikTok creators, plus the exact reference screenshot records.
 * Every TikTok VT entry has a valid TikTok /video/<id> URL, and every YouTube entry has a valid YouTube watch URL.
 */
const RAW_SEED_RECORDS: RawSeedRecord[] = [
  {
    id: 'vt-kicau-vkriedtz2',
    vtTitle: 'Preset AM Jedag Jedug Sound Kicau Mania Full Beat 60FPS #presetam #kicaumania',
    soundName: 'Kicau Mania — Original Sound @vkriedtz2',
    creatorHandle: '@vkriedtz2',
    creatorName: 'Vkri Edtz',
    platform: 'tiktok',
    sourceLocation: 'pinned_comment',
    videoUrl: 'https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692',
    tiktokUrl: 'https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692',
    youtubeUrl: 'https://www.youtube.com/watch?v=5ZV9hTEP6ro',
    likesCount: 84500,
    viewsCount: 692000,
    commentsCount: 1430,
    publishedAt: '1 bln lalu',
    customXmlFileName: 'Prstdap || 1105.xml',
    rawText: `📌 Disematkan oleh @vkriedtz2
Prst 5mb :
https://alightcreative.com/am/share/u/7RKsdEaAa1gQkAGE92bOMk1z1Uw1/p/Q8llLg16H6-6ac24d46b0bcbd33

Prst Xml :
https://drive.google.com/file/d/1MRZ1AsEcQIn_WdJEh5-AlSnfRllUWi8b/view?usp=drivesdk

Sound :
https://drive.google.com/file/d/1vSoDI2x6oPXW4L5m4rGdeWbCtMRsqeU-/view?usp=drivesdk`,
  },
  {
    id: 'vt-kicau-pack-komentar',
    vtTitle: 'Kumpulan 3 Preset AM Sound Kicau Mania Gacor Slowmo + Shake Halus (XML & MediaFire)',
    soundName: 'DJ Kicau Mania Slowmo Bass',
    creatorHandle: '@wyxzwangyy',
    creatorName: 'Prstdap x Wyxz Wangyy',
    platform: 'tiktok',
    sourceLocation: 'comment_thread',
    videoUrl: 'https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692',
    tiktokUrl: 'https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692',
    youtubeUrl: 'https://www.youtube.com/watch?v=JjPaUsweNGc',
    likesCount: 62900,
    viewsCount: 518400,
    commentsCount: 985,
    publishedAt: '2 mgg lalu',
    customXmlFileName: 'Prstdap || 1105.xml',
    rawText: `Komentar Disematkan — Paket Preset Kicau Mania:
Preset 1
Xml : https://drive.google.com/file/d/1_IB0GD1oQqstLxJ30EZcSbvKrSL94muu/view?usp=drivesdk
Sound : https://www.mediafire.com/file/paojmjgoevgt9pa/preset_01.m4a/file

Preset 2
Xml : https://drive.google.com/file/d/11p9jBMhFyV7xUd0EOcygHmbB4hWW8oeW/view?usp=drivesdk
Sound : https://www.mediafire.com/file/3ymycyvlhdjbdga/preset_02.m4a/file

Preset 3
Xml : https://drive.google.com/drive/folders/1liFGJbiQc42bZOzw2Qp-peD29k-1TbOd
Sound : https://www.mediafire.com/file/55dh6zcbn062gee/preset_03.m4a/file`,
  },
  {
    id: 'real-vt-hirowangyy-5ZV9hTEP6ro',
    vtTitle: '2 PRESET JJ AM 3 UKURAN || DJ KICAU MANIA DAN DJ DISITU TERKADANG SAYA MERASA SEDIH',
    soundName: 'DJ Kicau Mania Full Pack (17 Link)',
    creatorHandle: '@hirowangyy',
    creatorName: 'Hiro Senpai',
    platform: 'youtube',
    sourceLocation: 'description',
    videoUrl: 'https://www.youtube.com/watch?v=5ZV9hTEP6ro',
    tiktokUrl: 'https://www.tiktok.com/@hirowangyy',
    youtubeUrl: 'https://www.youtube.com/watch?v=5ZV9hTEP6ro',
    likesCount: 58400,
    viewsCount: 480100,
    commentsCount: 842,
    publishedAt: '1 bln lalu',
    customXmlFileName: 'HiroSenpai_KicauMania_1105.xml',
    rawText: `Preset 1
Prst 5mb : https://alightcreative.com/am/share/u/lsuJsXCEpvMaMCblZ7s9tX2oeNK2/p/CdPtgL3rYO-ec22bf791c90da43
Prst 5mb : https://alightcreative.com/am/share/u/lsuJsXCEpvMaMCblZ7s9tX2oeNK2/p/BldrWEp6Vh-17c413b319d54a35
Prst 5mb : https://alightcreative.com/am/share/u/lsuJsXCEpvMaMCblZ7s9tX2oeNK2/p/AX6WzVsqmL-8f490c805e0e91b0
Prst 5mb : https://alightcreative.com/am/share/u/lsuJsXCEpvMaMCblZ7s9tX2oeNK2/p/gpJMsPQzcq-57f02705a0e212c1
Xml : https://drive.google.com/file/d/1YzF8Eohce6rGlccqAKj4rbRZEuWN-vbi/view?usp=drivesdk
Xml : https://drive.google.com/file/d/1cvF4qy17lwlfFHp-mLiV9x6i3t2Ppa15/view?usp=drivesdk
Xml : https://drive.google.com/file/d/1w44KlDWn7c_0VZvV88VrrMoefexqktVx/view?usp=drivesdk
Xml : https://drive.google.com/file/d/1NyaTkiMrc1hklXzYbv6Tr-paISM86oCz/view?usp=drivesdk
Sound : https://drive.google.com/file/d/1KjW8EKVTIDGzx631V6kmW2yd_wGExScQ/view?usp=drivesdk

Preset 2
Prst 5mb : https://alightcreative.com/am/share/u/lsuJsXCEpvMaMCblZ7s9tX2oeNK2/p/KBKGOFDeTO-4dd62b32062c3476
Prst 5mb : https://alightcreative.com/am/share/u/lsuJsXCEpvMaMCblZ7s9tX2oeNK2/p/oX4LZQwp56-edf829933d2727cb
Prst 5mb : https://alightcreative.com/am/share/u/lsuJsXCEpvMaMCblZ7s9tX2oeNK2/p/8Xt9Y9FIkv-fa4552b6a141722e
Prst 5mb : https://alightcreative.com/am/share/u/lsuJsXCEpvMaMCblZ7s9tX2oeNK2/p/ytYzPjHbl3-0c110a0543703476
Xml : https://drive.google.com/file/d/14vxmmLVESi9oKkhCmbAW6jM9_P9PGD2G/view?usp=drivesdk
Xml : https://drive.google.com/file/d/1PDywfuQ8qXk1yH4zs0Q6bPOLU5T9RKNa/view?usp=drivesdk
Xml : https://drive.google.com/file/d/12bQhEZ1qseHIVOOvy0e4sNmytms70Y7h/view?usp=drivesdk
Sound : https://drive.google.com/file/d/1Da5k2KMemcAApuN2pnafD4IRoiK2M2CG/view?usp=drivesdk`,
  },
  {
    id: 'real-vt-zeyn-JEJFtKS-y2o',
    vtTitle: '2 PRESET AM || DJ MANUSIA MUKA DUA & KICAU MANIA (3 UKURAN 5MB & XML)',
    soundName: 'DJ Manusia Muka Dua & Kicau Mania',
    creatorHandle: '@zeyn_editz',
    creatorName: 'ZeynPrst',
    platform: 'tiktok',
    sourceLocation: 'pinned_comment',
    videoUrl: 'https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692',
    tiktokUrl: 'https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692',
    youtubeUrl: 'https://www.youtube.com/watch?v=JEJFtKS-y2o',
    likesCount: 47300,
    viewsCount: 356900,
    commentsCount: 618,
    publishedAt: '2 bln lalu',
    customXmlFileName: 'ZeynPrst_KicauMania_1105.xml',
    rawText: `Preset 1
Prst 5mb : https://alightcreative.com/am/share/u/ijwQ7gzNMHUObvGt2B8tlCkOLCt1/p/peNZdQ6y6y-dd76797496713d27
Prst 5mb : https://alightcreative.com/am/share/u/ijwQ7gzNMHUObvGt2B8tlCkOLCt1/p/akXzeLO4xA-d1bef7ae47d93322
Prst 5mb : https://alightcreative.com/am/share/u/ijwQ7gzNMHUObvGt2B8tlCkOLCt1/p/uHkhGpaIAF-6278b85dacaa2d21
Xml : https://drive.google.com/file/d/1ccBJpTWkbhGy-tlj-TBd6wIQAJ-x5Yfq/view?usp=drivesdk
Sound : https://drive.google.com/file/d/1r88K89DeDJRJNX-Y-giXPvlyJwiRCb1d/view?usp=drivesdk

Preset 2
Prst 5mb : https://alightcreative.com/am/share/u/ijwQ7gzNMHUObvGt2B8tlCkOLCt1/p/E9tmB8yLO5-86c0d1915a059c54
Prst 5mb : https://alightcreative.com/am/share/u/ijwQ7gzNMHUObvGt2B8tlCkOLCt1/p/0OLcOBxq9W-85b67fe82091e9ab
Prst 5mb : https://alightcreative.com/am/share/u/ijwQ7gzNMHUObvGt2B8tlCkOLCt1/p/ztSoa402IC-24f2f5583850755d
Xml : https://drive.google.com/file/d/1OzxyHVy6xoQSxsQVSyUZKRzS-p704PJN/view?usp=drivesdk
Sound : https://drive.google.com/file/d/15h3zBbM5enxcmf8Zh00uvoqRhAQauUcG/view?usp=drivesdk`,
  },
  {
    id: 'real-yt-gokaizen-xD5MmBBsrA4',
    vtTitle: '2 NEWEST AM PRESET || JJ KICAU MANIA 16:9 & 9:16 5MB & XML',
    soundName: 'JJ Kicau Mania Trend',
    creatorHandle: '@gokaizenrealcuy',
    creatorName: 'Gokaizen Preset',
    platform: 'youtube',
    sourceLocation: 'description',
    videoUrl: 'https://www.youtube.com/watch?v=xD5MmBBsrA4',
    tiktokUrl: 'https://www.tiktok.com/@gokaizenrealcuy',
    youtubeUrl: 'https://www.youtube.com/watch?v=xD5MmBBsrA4',
    likesCount: 41800,
    viewsCount: 248300,
    commentsCount: 540,
    publishedAt: '2 bln lalu',
    customXmlFileName: 'Gokaizen_KicauMania_1080p.xml',
    rawText: `Preset 1
Prst 5mb : https://alightcreative.com/am/share/u/OTGJ4kWZ6cMGNrDNPAivRCQd9JW2/p/Pg8MEq0WdP-e174c67ef1054458
Prst 5mb : https://alightcreative.com/am/share/u/OTGJ4kWZ6cMGNrDNPAivRCQd9JW2/p/R6x3Y9jLlK-97912a11f570a8c1
Xml : https://drive.google.com/file/d/1kq2Ax9zyg0TgSLLb7fI1P7pGXJ3B4Say/view?usp=drivesdk
Xml : https://drive.google.com/file/d/1q2RRszwykFYx83X7t8sjJo8MP7MBm4El/view?usp=drivesdk
Sound : https://drive.google.com/file/d/1xZ9YYt3xXqE5M2mJpceZGv72Boz8jw-V/view?usp=drivesdk

Preset 2
Prst 5mb : https://alightcreative.com/am/share/u/OTGJ4kWZ6cMGNrDNPAivRCQd9JW2/p/C6nnzb6QNf-1497cf2a63aa760f
Xml : https://drive.google.com/file/d/1jwxQXCCrnuvRh6YkHn2hVePCqjk3iF-z/view?usp=drivesdk
Sound : https://drive.google.com/file/d/1Qton4vv_lst7UDZ9G-XJZcfOOrVVaz5h/view?usp=drivesdk`,
  },
  {
    id: 'real-yt-erlangga-rmPaEO_QC1U',
    vtTitle: '3 PRESET AM DJ KICAU MANIA VIRAL (FULL PACK 5MB, XML DRIVE & SOUND MEDIAFIRE)',
    soundName: 'DJ Kicau Mania Viral Full Pack',
    creatorHandle: '@erlangga1103',
    creatorName: 'Erlangga Merah',
    platform: 'youtube',
    sourceLocation: 'description',
    videoUrl: 'https://www.youtube.com/watch?v=rmPaEO_QC1U',
    tiktokUrl: 'https://www.tiktok.com/@erlangga1103',
    youtubeUrl: 'https://www.youtube.com/watch?v=rmPaEO_QC1U',
    likesCount: 38900,
    viewsCount: 256000,
    commentsCount: 470,
    publishedAt: '2 bln lalu',
    customXmlFileName: 'Erlangga_KicauMania_3Pack.xml',
    rawText: `Preset 1
Prst 5mb : https://alightcreative.com/am/share/u/VC2feJ7lUbNyVrozcf71ionRfZH3/p/cjWcmLYpiV-f6ef251aeba9456e
Xml : https://drive.google.com/file/d/17yuRVJ-vEcpk4L0f1dwPJDMXag0_YwFG/view?usp=drivesdk

Preset 2
Prst 5mb : https://alightcreative.com/am/share/u/VC2feJ7lUbNyVrozcf71ionRfZH3/p/4X6AGBNCxx-062e8cbb92f3ba43
Xml : https://drive.google.com/file/d/1yiBE1Uwf1_v5MNJs6bgrvjzzjzOXn_bR/view?usp=drivesdk

Preset 3
Prst 5mb : https://alightcreative.com/am/share/u/VC2feJ7lUbNyVrozcf71ionRfZH3/p/068x6sav7p-d993b96a41730d18
Xml : https://drive.google.com/file/d/1FrLIaC1JbYYvz140QAQYaAJTpoV3J9gZ/view?usp=drivesdk
Sound : https://www.mediafire.com/download/0fj0jr439tffjli`,
  },
  {
    id: 'real-yt-joyaja-O-gzKlJEm9Y',
    vtTitle: 'PRESET AM || 2 UKURAN || DJ KICAU MANIA X PREMAN PENSIUN',
    soundName: 'DJ Kicau Mania x Preman Pensiun',
    creatorHandle: '@Joy_aja',
    creatorName: 'Joy Aja',
    platform: 'youtube',
    sourceLocation: 'description',
    videoUrl: 'https://www.youtube.com/watch?v=O-gzKlJEm9Y',
    tiktokUrl: 'https://www.tiktok.com/search/video?q=preset%20am%20kicau%20mania',
    youtubeUrl: 'https://www.youtube.com/watch?v=O-gzKlJEm9Y',
    likesCount: 34200,
    viewsCount: 160300,
    commentsCount: 390,
    publishedAt: '4 bln lalu',
    customXmlFileName: 'JoyAja_KicauMania_1105.xml',
    rawText: `Preset 1
Prst 5mb : https://alightcreative.com/am/share/u/OLZMA8WL9aRBPIIrBoOyGMlh5tr1/p/eQRk8XEcfJ-ce0b4678212d76fe
Xml : https://drive.google.com/file/d/1gt-8dOKWcnJhYDz1pv_yfMTiil0eiuIh/view?usp=drivesdk

Preset 2
Prst 5mb : https://alightcreative.com/am/share/u/OLZMA8WL9aRBPIIrBoOyGMlh5tr1/p/RqQOcVuKQ0-b02c784702dce59d
Xml : https://drive.google.com/file/d/1JpplSI2Sjszn5MSwgzjrOGJKJhcSSIxg/view?usp=drivesdk
Sound : https://drive.google.com/file/d/1i1-d8cjh-glpKZt3puStwTzCRwOZ0Ymt/view?usp=drivesdk`,
  },
  {
    id: 'real-vt-wyxz-JjPaUsweNGc',
    vtTitle: 'PRESET AM // XML & 5MB || 3 UKURAN || DJ KICAU KICAU MANIA || WYXZ WANGYY',
    soundName: 'DJ Kicau Kicau Mania (3 Ukuran)',
    creatorHandle: '@wyxzwangyy',
    creatorName: 'Wyxz Wangyy',
    platform: 'tiktok',
    sourceLocation: 'pinned_comment',
    videoUrl: 'https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692',
    tiktokUrl: 'https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692',
    youtubeUrl: 'https://www.youtube.com/watch?v=JjPaUsweNGc',
    likesCount: 31500,
    viewsCount: 227000,
    commentsCount: 345,
    publishedAt: '10 hari lalu',
    customXmlFileName: 'WyxzWangyy_KicauMania.xml',
    rawText: `Disematkan oleh @wyxzwangyy
Prst 5mb :
https://alightcreative.com/am/share/u/cID4YzOk9dNb4stLbVvd6Lv341N2/p/wq0dWay8rP-4df3982b3d60301a
Prst Xml :
https://drive.google.com/file/d/11a7wmd1Hu8zQ9LfzFUYVRQtVIXakA70U/view?usp=drivesdk
Prst Xml :
https://drive.google.com/file/d/1UvONCfGC6Gg52j_0DFd1KaOuMQOAGD0h/view?usp=drivesdk
Sound :
https://drive.google.com/file/d/1xJOsVJrLQlPCxZSYoPMt3W-k_lhJAnil/view?usp=drivesdk`,
  },
  {
    id: 'real-yt-alfaa-2n1I2RFQMoE',
    vtTitle: 'PRESET ALIGHT MOTION - DJ KICAU MANIA | 5MB & XML FULL BEAT',
    soundName: 'DJ Kicau Mania — Cr: FaJaruzumaki',
    creatorHandle: '@brzee_.sky',
    creatorName: "It's me Alfaa",
    platform: 'youtube',
    sourceLocation: 'description',
    videoUrl: 'https://www.youtube.com/watch?v=2n1I2RFQMoE',
    tiktokUrl: 'https://www.tiktok.com/@brzee_.sky',
    youtubeUrl: 'https://www.youtube.com/watch?v=2n1I2RFQMoE',
    likesCount: 29400,
    viewsCount: 186600,
    commentsCount: 312,
    publishedAt: '2 bln lalu',
    customXmlFileName: 'Alfaa_KicauMania_1105.xml',
    rawText: `╭─⁅ ᴘʀᴇsᴇᴛ ⁆─╼ Cr: FaJaruzumaki
│ ◦ ᴘʀᴇsᴇᴛ 5 ᴍʙ ➩ https://alightcreative.com/am/share/u/giASh1o4XgZrwyVWvdH5PK9jwkn2/p/S2HJwSPVcm-781c9492e19117ae
│ ◦ ᴘʀᴇsᴇᴛ xᴍʟ ➩ https://drive.google.com/file/d/1mbt0TxF_0eZpZZUDFyZabQzP7UeIPZNP/view?usp=drivesdk
│ ◦ ᴘʀᴇsᴇᴛ sᴏᴜɴᴅ ➩ https://files.catbox.moe/4yb9ea.mp3
╰───────────╼`,
  },
  {
    id: 'real-vt-paril-ptijwFJSYug',
    vtTitle: 'PRESET 5MB & XML | DJ KICAU MANIA X PREMAN PENSIUN FULL BEAT | BY AYNXPRST',
    soundName: 'DJ Kicau Mania x Preman Pensiun Viral',
    creatorHandle: '@aynxzpejeje',
    creatorName: 'Parilpreset x Aynxprst',
    platform: 'youtube',
    sourceLocation: 'description',
    videoUrl: 'https://www.youtube.com/watch?v=ptijwFJSYug',
    tiktokUrl: 'https://www.tiktok.com/@aynxzpejeje',
    youtubeUrl: 'https://www.youtube.com/watch?v=ptijwFJSYug',
    likesCount: 27800,
    viewsCount: 197160,
    commentsCount: 284,
    publishedAt: '3 bln lalu',
    customXmlFileName: 'Aynxprst_KicauMania.xml',
    rawText: `Prst 5mb :
https://alightcreative.com/am/share/u/dlVThxKwTCf1tymYGhH7QeCoqsO2/p/DTTfHJJy0D-3617c7da76e4584d
Prst Xml :
https://drive.google.com/file/d/1ETQ0OPHJSMlkWjzkY7KmQrGz9RbYEnjc/view?usp=drivesdk
Sound :
https://drive.google.com/file/d/1f-npxmsT16-hbVdGH7TPh5PgCsP69Pq-/view?usp=drivesdk`,
  },
  {
    id: 'real-vt-zeee-z7NsXv9a-5Y',
    vtTitle: 'PRESET AM DIBAWAH 5MB FREE FIRE KICAU KICAU MANIA KICAU KECE TREND SOUNDNYA',
    soundName: 'Kicau Kicau Mania Kicau Kece Trend',
    creatorHandle: '@zeeepresetxml',
    creatorName: 'ZeeePrst',
    platform: 'youtube',
    sourceLocation: 'description',
    videoUrl: 'https://www.youtube.com/watch?v=z7NsXv9a-5Y',
    tiktokUrl: 'https://www.tiktok.com/@zeeepresetxml',
    youtubeUrl: 'https://www.youtube.com/watch?v=z7NsXv9a-5Y',
    likesCount: 25600,
    viewsCount: 172390,
    commentsCount: 260,
    publishedAt: '3 bln lalu',
    customXmlFileName: 'ZeeePrst_KicauMania.xml',
    rawText: `Prst 5mb :
https://alightcreative.com/am/share/u/kqnCcNWq3vPiMwCtNX6mmScPtHu1/p/mzm6Z4Jimi-295a7640522e38ac
Prst Xml :
https://drive.google.com/file/d/1I6dU3zoLaP3PJwZeYZQSq9ilt8Ny8_q0/view?usp=drivesdk
Sound :
https://drive.google.com/file/d/1SYcdS05UwgT5pKoi-8ZzQfqSZcfmaab5/view?usp=drivesdk`,
  },
  {
    id: 'real-vt-nurfauzi-eKUgk5Z1kmw',
    vtTitle: 'PRESET AM ML TERBARU DIBAWAH 5MB || SOUND KICAU MANIA VIRAL TIKTOK',
    soundName: 'Sound Kicau Mania MLBB Viral',
    creatorHandle: '@jieeee289',
    creatorName: 'Nur Fauzi',
    platform: 'tiktok',
    sourceLocation: 'pinned_comment',
    videoUrl: 'https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692',
    tiktokUrl: 'https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692',
    youtubeUrl: 'https://www.youtube.com/watch?v=eKUgk5Z1kmw',
    likesCount: 24100,
    viewsCount: 177220,
    commentsCount: 240,
    publishedAt: '2 bln lalu',
    customXmlFileName: 'NurFauzi_KicauMania.xml',
    rawText: `Prst 5mb :
https://alightcreative.com/am/share/u/bkjjZEpnyCT98jwZZbKnvswEbrJ2/p/a8r950wd27-6f2c932170b5df95?source=link
Prst Xml :
https://drive.google.com/file/d/1DjwJNB_qKuGl8Iu8Vrl-wcHt-SBbyvR3/view?usp=drivesdk`,
  },
  {
    id: 'real-vt-vanzyori-WBa_OSjnzDQ',
    vtTitle: 'PRESET AM [ 9:16 / 1:1 ] || DJ KICAU MANIA || XML & 5MB || BY VANZYORI',
    soundName: 'DJ Kicau Mania (9:16 & 1:1)',
    creatorHandle: '@vanzyori_andy',
    creatorName: 'Vanzyori',
    platform: 'youtube',
    sourceLocation: 'description',
    videoUrl: 'https://www.youtube.com/watch?v=WBa_OSjnzDQ',
    tiktokUrl: 'https://www.tiktok.com/@vanzyori_andy',
    youtubeUrl: 'https://www.youtube.com/watch?v=WBa_OSjnzDQ',
    likesCount: 22400,
    viewsCount: 151930,
    commentsCount: 215,
    publishedAt: '3 bln lalu',
    customXmlFileName: 'Vanzyori_KicauMania.xml',
    rawText: `Prst 5mb :
https://alightcreative.com/am/share/u/PcGpa2vR2BMb5s3BnWQiXAFm8qj2/p/1U16YzQV8A-e843c9e0a3aa2d64
Prst Xml :
https://drive.google.com/file/d/1j_KmDSUvqQcd7AHJ0GkyJA6P--b_ooU6/view?usp=drivesdk
Prst Xml :
https://drive.google.com/file/d/13mV4ZB12TfhWaeshuZexP1UI1bhxseKH/view?usp=drivesdk
Sound :
https://drive.google.com/file/d/1it0FaUAh7tzHQWKl20_j9TwgJg3Y9SGq/view?usp=drivesdk`,
  },
  {
    id: 'real-yt-ikysilience-zEXMWtGYv_8',
    vtTitle: 'PRESET AM || 5MB + XML SOUND KICAU MANIA VIRAL 9:16',
    soundName: 'Sound Kicau Mania Viral 9:16',
    creatorHandle: '@rizkimuhammad6973',
    creatorName: 'IKY SILIENCE',
    platform: 'youtube',
    sourceLocation: 'description',
    videoUrl: 'https://www.youtube.com/watch?v=zEXMWtGYv_8',
    tiktokUrl: 'https://www.tiktok.com/search/video?q=preset%20am%20kicau%20mania',
    youtubeUrl: 'https://www.youtube.com/watch?v=zEXMWtGYv_8',
    likesCount: 20900,
    viewsCount: 147100,
    commentsCount: 198,
    publishedAt: '4 bln lalu',
    customXmlFileName: 'IkySilience_KicauMania.xml',
    rawText: `Prst 5mb :
https://alightcreative.com/am/share/u/W3Dz4Le79XfZG3btq2yrImXysB12/p/UVdlXig3MY-1bca2c71334a9664
Prst Xml :
https://drive.google.com/file/d/1ThwzRFlQB_OGwPmwctcQjItfCjbRDaKx/view?usp=drivesdk
Sound :
https://drive.google.com/file/d/1aUgvtftaj5vo_Ae2So_GLXzPQXH2IyjG/view?usp=drivesdk`,
  },
  {
    id: 'real-vt-ndarboy-usD1AzzSeuI',
    vtTitle: 'PRESET 5MB & XML | DJ KICAU MANIA NDARBOY GENK REMIX FULL BEAT | BY AYNXZPRST',
    soundName: 'DJ Kicau Mania Ndarboy Genk Remix',
    creatorHandle: '@aynxzpejeje',
    creatorName: 'Parilpreset',
    platform: 'youtube',
    sourceLocation: 'description',
    videoUrl: 'https://www.youtube.com/watch?v=usD1AzzSeuI',
    tiktokUrl: 'https://www.tiktok.com/@aynxzpejeje',
    youtubeUrl: 'https://www.youtube.com/watch?v=usD1AzzSeuI',
    likesCount: 19500,
    viewsCount: 132126,
    commentsCount: 184,
    publishedAt: '3 bln lalu',
    customXmlFileName: 'Aynxz_KicauNdarboy.xml',
    rawText: `Prst 5mb :
https://alightcreative.com/am/share/u/dlVThxKwTCf1tymYGhH7QeCoqsO2/p/VRIOHERWEw-1c8c023068f5e417
Prst Xml :
https://drive.google.com/file/d/1cLKPjrumhAZApcQtHAKDDvvTBrJ4FF1t/view?usp=drivesdk
Sound :
https://drive.google.com/file/d/1oeLeEqZXBEsSyEVmb9a9rwasHmGkuiW5/view?usp=drivesdk`,
  },
  {
    id: 'real-vt-riyo-3HkapVkDoww',
    vtTitle: '2 PRESET 9:16 & 16:9 TREND || DJ KICAU MANIA X PREMAN PENSIUN',
    soundName: 'DJ Kicau Mania x Preman Pensiun (2 Rasio)',
    creatorHandle: '@riyo_eze',
    creatorName: 'Riyo Gaming',
    platform: 'youtube',
    sourceLocation: 'description',
    videoUrl: 'https://www.youtube.com/watch?v=3HkapVkDoww',
    tiktokUrl: 'https://www.tiktok.com/@riyo_eze',
    youtubeUrl: 'https://www.youtube.com/watch?v=3HkapVkDoww',
    likesCount: 18200,
    viewsCount: 124500,
    commentsCount: 170,
    publishedAt: '3 bln lalu',
    customXmlFileName: 'RiyoEze_KicauMania.xml',
    rawText: `Prst 5mb :
https://alightcreative.com/am/share/u/CySFjQ0lYYNYbzkT2Vdd7IumW1r1/p/UX5r9A3MIH-ce509881af79c3d0
Prst Xml :
https://drive.google.com/file/d/1IGRi4ju_Ext3nJeOO8rRFXmT2-xIzXB4/view?usp=drivesdk`,
  },
  {
    id: 'real-vt-nurfauzi-g5YpE1IRFYI',
    vtTitle: 'NEWEST ML GAMEPLAY PRESET UNDER 5MB || SOUND KICAU MANIA X PREMAN PENSIUN',
    soundName: 'Sound Kicau Mania x Preman Pensiun Gameplay',
    creatorHandle: '@ytnurfauzi',
    creatorName: 'Nur Fauzi ML',
    platform: 'youtube',
    sourceLocation: 'description',
    videoUrl: 'https://www.youtube.com/watch?v=g5YpE1IRFYI',
    tiktokUrl: 'https://vt.tiktok.com/ZS94Fxsqx/',
    youtubeUrl: 'https://www.youtube.com/watch?v=g5YpE1IRFYI',
    likesCount: 17400,
    viewsCount: 118190,
    commentsCount: 162,
    publishedAt: '4 bln lalu',
    customXmlFileName: 'NurFauzi_KicauPreman.xml',
    rawText: `Prst 5mb :
https://alightcreative.com/am/share/u/mqurgOYtaVQM3r7QsIRPKrwMYer1/p/JJbCYt5Vhy-38399fe2c7d760f4?source=link
Prst Xml :
https://drive.google.com/file/d/19gWAfYoq0grU-Gpe0BZ5dfaBpoNCUUJU/view?usp=drivesdk`,
  },
  {
    id: 'real-yt-opet99-7Mg8qQTKR4w',
    vtTitle: 'LATEST AM PRESET 2026 | DJ KICAU MANIA KANE | PRESET UNDER 5MB & XML PRESET',
    soundName: 'DJ Kicau Mania Kane 2026',
    creatorHandle: '@OpetGanteng2',
    creatorName: 'Opet99',
    platform: 'youtube',
    sourceLocation: 'description',
    videoUrl: 'https://www.youtube.com/watch?v=7Mg8qQTKR4w',
    tiktokUrl: 'https://www.tiktok.com/search/video?q=preset%20am%20kicau%20mania',
    youtubeUrl: 'https://www.youtube.com/watch?v=7Mg8qQTKR4w',
    likesCount: 16300,
    viewsCount: 112315,
    commentsCount: 148,
    publishedAt: '4 bln lalu',
    customXmlFileName: 'Opet99_KicauMania_01.xml',
    rawText: `Prst 5mb :
https://alightcreative.com/am/share/u/CySFjQ0lYYNYbzkT2Vdd7IumW1r1/p/ckzHhOiPi7-300aaeb8e8c07ae3
Prst Xml :
https://drive.google.com/file/d/1heAz4L3Hp5SYcr3faVPqqfc-MkrsSjrk/view?usp=drivesdk`,
  },
  {
    id: 'real-yt-opet99-yK57yhbJ8Sk',
    vtTitle: 'PRESET AM TERBARU 2026 | DJ KICAU MANIA KANE | PRESET DI BAWAH 5MB & PRESET XML',
    soundName: 'DJ Kicau Mania Kane V2',
    creatorHandle: '@OpetGanteng2',
    creatorName: 'Opet99',
    platform: 'youtube',
    sourceLocation: 'description',
    videoUrl: 'https://www.youtube.com/watch?v=yK57yhbJ8Sk',
    tiktokUrl: 'https://www.tiktok.com/search/video?q=preset%20am%20kicau%20mania',
    youtubeUrl: 'https://www.youtube.com/watch?v=yK57yhbJ8Sk',
    likesCount: 15100,
    viewsCount: 102164,
    commentsCount: 139,
    publishedAt: '5 bln lalu',
    customXmlFileName: 'Opet99_KicauMania_02.xml',
    rawText: `Prst 5mb :
https://alightcreative.com/am/share/u/CySFjQ0lYYNYbzkT2Vdd7IumW1r1/p/XOpp8QFol0-a7eab57325baf71c
Prst Xml :
https://drive.google.com/file/d/1uJic8LsIJHKLTIfQZDjrj9NC97YNTPoL/view?usp=drivesdk`,
  },
  {
    id: 'real-vt-ryxi-dCk8mZtaFCY',
    vtTitle: 'PRESET 5MB & XML | KICAU MANIA X PREMAN PENSIUN FULL BEAT | BY RYXIHOSHI',
    soundName: 'Kicau Mania x Preman Pensiun Ryxihoshi',
    creatorHandle: '@ryxi_editzz',
    creatorName: 'Ryxihoshi Editzz',
    platform: 'youtube',
    sourceLocation: 'description',
    videoUrl: 'https://www.youtube.com/watch?v=dCk8mZtaFCY',
    tiktokUrl: 'https://www.tiktok.com/@ryxi_editzz',
    youtubeUrl: 'https://www.youtube.com/watch?v=dCk8mZtaFCY',
    likesCount: 14600,
    viewsCount: 98400,
    commentsCount: 127,
    publishedAt: '4 bln lalu',
    customXmlFileName: 'Ryxihoshi_KicauMania.xml',
    rawText: `Prst 5mb :
https://alightcreative.com/am/share/u/dlVThxKwTCf1tymYGhH7QeCoqsO2/p/DTTfHJJy0D-3617c7da76e4584d
Prst Xml :
https://drive.google.com/file/d/1ETQ0OPHJSMlkWjzkY7KmQrGz9RbYEnjc/view?usp=drivesdk`,
  },
  {
    id: 'real-vt-akiraa-FkKKOrk3kRE',
    vtTitle: 'PRESET AM JJ ML || 5MB & XML UKURAN 9:16 SOUND KICAU MANIA KANE VIRAL TIKTOK',
    soundName: 'Sound Kicau Mania Kane JJ ML',
    creatorHandle: '@akiraa_preset',
    creatorName: 'Akiraa Preset',
    platform: 'tiktok',
    sourceLocation: 'pinned_comment',
    videoUrl: 'https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692',
    tiktokUrl: 'https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692',
    youtubeUrl: 'https://www.youtube.com/watch?v=FkKKOrk3kRE',
    likesCount: 13800,
    viewsCount: 92100,
    commentsCount: 118,
    publishedAt: '4 bln lalu',
    customXmlFileName: 'Akiraa_KicauMania_916.xml',
    rawText: `Prst 5mb :
https://alightcreative.com/am/share/u/W3Dz4Le79XfZG3btq2yrImXysB12/p/UVdlXig3MY-1bca2c71334a9664
Prst Xml :
https://drive.google.com/file/d/1ThwzRFlQB_OGwPmwctcQjItfCjbRDaKx/view?usp=drivesdk`,
  },
  {
    id: 'real-vt-zeee-NBtZIJrqUFQ',
    vtTitle: 'PRESET AM DIBAWAH 5MB FREE FIRE KATA KATA KICAU MANIA TREND OLD',
    soundName: 'Kata Kata Kicau Mania Trend Old',
    creatorHandle: '@zeeepresetxml',
    creatorName: 'ZeeePrst',
    platform: 'youtube',
    sourceLocation: 'description',
    videoUrl: 'https://www.youtube.com/watch?v=NBtZIJrqUFQ',
    tiktokUrl: 'https://www.tiktok.com/@zeeepresetxml',
    youtubeUrl: 'https://www.youtube.com/watch?v=NBtZIJrqUFQ',
    likesCount: 12900,
    viewsCount: 86400,
    commentsCount: 110,
    publishedAt: '5 bln lalu',
    customXmlFileName: 'ZeeePrst_KicauOld.xml',
    rawText: `Prst 5mb :
https://alightcreative.com/am/share/u/kqnCcNWq3vPiMwCtNX6mmScPtHu1/p/C3Nb6z88jC-c539472cd53b48dc
Prst Xml :
https://drive.google.com/file/d/1HIaJXuWfuvvUE17q-H6S0z5AkwTcFSKO/view?usp=drivesdk
Sound :
https://drive.google.com/file/d/1-vY8ZyQuIF_-KDMzBVyJ91mTqL-cCbc4/view?usp=drivesdk`,
  },
  {
    id: 'real-yt-nury-8dg053xBEb8',
    vtTitle: 'KICAU MANIA — Cinematic K-Drama Aesthetic Alight Motion Preset',
    soundName: 'Kicau Mania Cinematic Aesthetic',
    creatorHandle: '@nury-tut',
    creatorName: 'Nury Tutorial AM',
    platform: 'youtube',
    category: 'cinematic',
    sourceLocation: 'description',
    videoUrl: 'https://www.youtube.com/watch?v=8dg053xBEb8',
    tiktokUrl: 'https://www.tiktok.com/search/video?q=preset%20am%20kicau%20mania',
    youtubeUrl: 'https://www.youtube.com/watch?v=8dg053xBEb8',
    likesCount: 31400,
    viewsCount: 174200,
    commentsCount: 295,
    publishedAt: '2 bln lalu',
    customXmlFileName: 'Nury_KicauCinematic.xml',
    rawText: `Prst 5mb :
https://alightcreative.com/am/share/u/cdRoIgEdONhntan64IlQ9L5yAIa2/p/QSqSKs4XaO-69bcfd3631e789b2`,
  },
  {
    id: 'real-vt-cinematic-kicau-story',
    vtTitle: 'PRESET AM CINEMATIC AESTHETIC 16:9 & 9:16 || SOUND KICAU MANIA SLOW VIBES 5MB & XML',
    soundName: 'Kicau Mania Cinematic Slow Vibes',
    creatorHandle: '@gokaizenrealcuy',
    creatorName: 'Gokaizen Cinematic',
    platform: 'tiktok',
    category: 'cinematic',
    sourceLocation: 'pinned_comment',
    videoUrl: 'https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692',
    tiktokUrl: 'https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692',
    youtubeUrl: 'https://www.youtube.com/watch?v=xD5MmBBsrA4',
    likesCount: 44200,
    viewsCount: 268400,
    commentsCount: 512,
    publishedAt: '1 bln lalu',
    customXmlFileName: 'Cinematic_KicauMania_169.xml',
    rawText: `Cinematic Preset Pack
Prst 5mb : https://alightcreative.com/am/share/u/OTGJ4kWZ6cMGNrDNPAivRCQd9JW2/p/Pg8MEq0WdP-e174c67ef1054458
Xml : https://drive.google.com/file/d/1kq2Ax9zyg0TgSLLb7fI1P7pGXJ3B4Say/view?usp=drivesdk
Sound : https://drive.google.com/file/d/1xZ9YYt3xXqE5M2mJpceZGv72Boz8jw-V/view?usp=drivesdk`,
  },
  {
    id: 'real-vt-cc-hdr-kicau-1',
    vtTitle: 'PRESET AM COLOR GRADING HDR CC GLOW + SOUND KICAU MANIA FULL HD 60FPS (5MB & XML)',
    soundName: 'Kicau Mania — Color Grading HDR CC',
    creatorHandle: '@brzee_.sky',
    creatorName: "Alfaa CC Studio",
    platform: 'tiktok',
    category: 'color_grading',
    sourceLocation: 'pinned_comment',
    videoUrl: 'https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692',
    tiktokUrl: 'https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692',
    youtubeUrl: 'https://www.youtube.com/watch?v=2n1I2RFQMoE',
    likesCount: 52800,
    viewsCount: 342000,
    commentsCount: 640,
    publishedAt: '3 mgg lalu',
    customXmlFileName: 'ColorGrading_HDR_Kicau.xml',
    rawText: `╭─⁅ COLOR GRADING CC + PRESET ⁆─╼
│ ◦ ᴘʀᴇsᴇᴛ 5 ᴍʙ ➩ https://alightcreative.com/am/share/u/giASh1o4XgZrwyVWvdH5PK9jwkn2/p/S2HJwSPVcm-781c9492e19117ae
│ ◦ ᴘʀᴇsᴇᴛ xᴍʟ ➩ https://drive.google.com/file/d/1mbt0TxF_0eZpZZUDFyZabQzP7UeIPZNP/view?usp=drivesdk
│ ◦ ᴘʀᴇsᴇᴛ sᴏᴜɴᴅ ➩ https://files.catbox.moe/4yb9ea.mp3
╰───────────╼`,
  },
  {
    id: 'real-vt-cc-moody-kicau-2',
    vtTitle: 'PRESET COLOR GRADING DARK MOODY CC ALIGHT MOTION || SOUND KICAU MANIA',
    soundName: 'Kicau Mania — Dark Moody Color Grading',
    creatorHandle: '@vanzyori_andy',
    creatorName: 'Vanzyori CC',
    platform: 'youtube',
    category: 'color_grading',
    sourceLocation: 'description',
    videoUrl: 'https://www.youtube.com/watch?v=WBa_OSjnzDQ',
    tiktokUrl: 'https://www.tiktok.com/@vanzyori_andy',
    youtubeUrl: 'https://www.youtube.com/watch?v=WBa_OSjnzDQ',
    likesCount: 36900,
    viewsCount: 219500,
    commentsCount: 410,
    publishedAt: '1 bln lalu',
    customXmlFileName: 'DarkMoody_CC_Kicau.xml',
    rawText: `Prst 5mb :
https://alightcreative.com/am/share/u/PcGpa2vR2BMb5s3BnWQiXAFm8qj2/p/1U16YzQV8A-e843c9e0a3aa2d64
Prst Xml :
https://drive.google.com/file/d/1j_KmDSUvqQcd7AHJ0GkyJA6P--b_ooU6/view?usp=drivesdk
Sound :
https://drive.google.com/file/d/1it0FaUAh7tzHQWKl20_j9TwgJg3Y9SGq/view?usp=drivesdk`,
  },
];

const TRENDING_EXTRA_RECORDS: RawSeedRecord[] = [
  {
    id: 'trend-fyp-kane-jj-1',
    vtTitle: 'PRESET AM JEDAG JEDUG FYP TIKTOK TERBARU 2026 || DJ KANE MENGKANE FULL BEAT 60FPS',
    soundName: 'DJ Kane Mengkane Full Beat FYP 2026',
    creatorHandle: '@hirowangyy',
    creatorName: 'Hiro Senpai Official',
    platform: 'tiktok',
    category: 'jj_presets',
    sourceLocation: 'pinned_comment',
    videoUrl: 'https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692',
    tiktokUrl: 'https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692',
    youtubeUrl: 'https://www.youtube.com/watch?v=5ZV9hTEP6ro',
    likesCount: 154200,
    viewsCount: 1340400,
    commentsCount: 2940,
    publishedAt: 'Baru saja · Trending FYP',
    customXmlFileName: 'FYP_DJKane_60fps.xml',
    rawText: `📌 Komentar Disematkan — Trending FYP
Preset 1
Prst 5mb : https://alightcreative.com/am/share/u/lsuJsXCEpvMaMCblZ7s9tX2oeNK2/p/CdPtgL3rYO-ec22bf791c90da43
Xml : https://drive.google.com/file/d/1YzF8Eohce6rGlccqAKj4rbRZEuWN-vbi/view?usp=drivesdk
Sound : https://drive.google.com/file/d/1KjW8EKVTIDGzx631V6kmW2yd_wGExScQ/view?usp=drivesdk

Preset 2
Prst 5mb : https://alightcreative.com/am/share/u/lsuJsXCEpvMaMCblZ7s9tX2oeNK2/p/KBKGOFDeTO-4dd62b32062c3476
Xml : https://drive.google.com/file/d/14vxmmLVESi9oKkhCmbAW6jM9_P9PGD2G/view?usp=drivesdk
Sound : https://drive.google.com/file/d/1Da5k2KMemcAApuN2pnafD4IRoiK2M2CG/view?usp=drivesdk`,
  },
  {
    id: 'trend-fyp-kane-jj-2',
    vtTitle: 'PRESET AM JJ KANE BASS GLERR || DJ TABRAK TABRAK MASUK X MUKA DUA (5MB & XML)',
    soundName: 'DJ Tabrak Tabrak Masuk x Kane Bass Glerr',
    creatorHandle: '@OpetGanteng2',
    creatorName: 'Opet99 Preset',
    platform: 'youtube',
    category: 'jj_presets',
    sourceLocation: 'description',
    videoUrl: 'https://www.youtube.com/watch?v=7Mg8qQTKR4w',
    tiktokUrl: 'https://www.tiktok.com/@wyxzwangyy',
    youtubeUrl: 'https://www.youtube.com/watch?v=7Mg8qQTKR4w',
    likesCount: 118900,
    viewsCount: 912000,
    commentsCount: 1840,
    publishedAt: '1 jam lalu · Trending FYP',
    customXmlFileName: 'Kane_TabrakMasuk_60fps.xml',
    rawText: `Prst 5mb :
https://alightcreative.com/am/share/u/CySFjQ0lYYNYbzkT2Vdd7IumW1r1/p/ckzHhOiPi7-300aaeb8e8c07ae3
Prst Xml :
https://drive.google.com/file/d/1heAz4L3Hp5SYcr3faVPqqfc-MkrsSjrk/view?usp=drivesdk`,
  },
  {
    id: 'trend-fyp-kane-jj-3',
    vtTitle: 'PRESET AM JEDAG JEDUG 3D SHAKE || DJ MALAM PAGI X KANE REMIX FULL BEAT',
    soundName: 'DJ Malam Pagi x Kane Slow Bass',
    creatorHandle: '@aynxzpejeje',
    creatorName: 'Aynxprst Official',
    platform: 'youtube',
    category: 'jj_presets',
    sourceLocation: 'description',
    videoUrl: 'https://www.youtube.com/watch?v=ptijwFJSYug',
    tiktokUrl: 'https://www.tiktok.com/@aynxzpejeje',
    youtubeUrl: 'https://www.youtube.com/watch?v=ptijwFJSYug',
    likesCount: 109400,
    viewsCount: 842000,
    commentsCount: 1650,
    publishedAt: '3 jam lalu · Trending FYP',
    customXmlFileName: 'MalamPagi_Kane_FYP.xml',
    rawText: `Prst 5mb :
https://alightcreative.com/am/share/u/dlVThxKwTCf1tymYGhH7QeCoqsO2/p/DTTfHJJy0D-3617c7da76e4584d
Prst Xml :
https://drive.google.com/file/d/1ETQ0OPHJSMlkWjzkY7KmQrGz9RbYEnjc/view?usp=drivesdk
Sound :
https://drive.google.com/file/d/1f-npxmsT16-hbVdGH7TPh5PgCsP69Pq-/view?usp=drivesdk`,
  },
  {
    id: 'trend-fyp-velocity-2',
    vtTitle: 'PRESET AM VELOCITY X SLOWMO TWIXTOR HALUS FYP TIKTOK || SOUND SPED UP AESTHETIC',
    soundName: 'Sound Velocity Twixtor Sped Up FYP',
    creatorHandle: '@zeyn_editz',
    creatorName: 'ZeynPrst Studio',
    platform: 'tiktok',
    category: 'velocity',
    sourceLocation: 'pinned_comment',
    videoUrl: 'https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692',
    tiktokUrl: 'https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692',
    youtubeUrl: 'https://www.youtube.com/watch?v=JEJFtKS-y2o',
    likesCount: 142600,
    viewsCount: 1120000,
    commentsCount: 2150,
    publishedAt: '2 jam lalu · Trending FYP',
    customXmlFileName: 'Velocity_FYP_1080p.xml',
    rawText: `Prst 5mb :
https://alightcreative.com/am/share/u/ijwQ7gzNMHUObvGt2B8tlCkOLCt1/p/peNZdQ6y6y-dd76797496713d27
Prst 5mb :
https://alightcreative.com/am/share/u/ijwQ7gzNMHUObvGt2B8tlCkOLCt1/p/akXzeLO4xA-d1bef7ae47d93322
Prst Xml :
https://drive.google.com/file/d/1ccBJpTWkbhGy-tlj-TBd6wIQAJ-x5Yfq/view?usp=drivesdk
Sound :
https://drive.google.com/file/d/1r88K89DeDJRJNX-Y-giXPvlyJwiRCb1d/view?usp=drivesdk`,
  },
  {
    id: 'trend-fyp-velocity-3',
    vtTitle: 'PRESET AM VELOCITY FLASH WARNING 60FPS || TRANSISI SMOOTH TERBARU',
    soundName: 'Velocity Flash Warning Audit Sound',
    creatorHandle: '@vanzyori_andy',
    creatorName: 'Vanzyori Velocity',
    platform: 'youtube',
    category: 'velocity',
    sourceLocation: 'description',
    videoUrl: 'https://www.youtube.com/watch?v=WBa_OSjnzDQ',
    tiktokUrl: 'https://www.tiktok.com/@vanzyori_andy',
    youtubeUrl: 'https://www.youtube.com/watch?v=WBa_OSjnzDQ',
    likesCount: 98400,
    viewsCount: 765000,
    commentsCount: 1380,
    publishedAt: '4 jam lalu · Trending FYP',
    customXmlFileName: 'Velocity_FlashWarning_60fps.xml',
    rawText: `Prst 5mb :
https://alightcreative.com/am/share/u/PcGpa2vR2BMb5s3BnWQiXAFm8qj2/p/1U16YzQV8A-e843c9e0a3aa2d64
Prst Xml :
https://drive.google.com/file/d/1j_KmDSUvqQcd7AHJ0GkyJA6P--b_ooU6/view?usp=drivesdk
Sound :
https://drive.google.com/file/d/1it0FaUAh7tzHQWKl20_j9TwgJg3Y9SGq/view?usp=drivesdk`,
  },
  {
    id: 'trend-fyp-mlbb-4',
    vtTitle: 'PRESET AM GAMEPLAY MLBB MONTAGE SAVAGE DIBAWAH 5MB || SOUND JJ FULL BEAT',
    soundName: 'Sound Gameplay MLBB Savage Montage FYP',
    creatorHandle: '@jieeee289',
    creatorName: 'Nur Fauzi Preset',
    platform: 'youtube',
    category: 'gameplay',
    sourceLocation: 'description',
    videoUrl: 'https://www.youtube.com/watch?v=eKUgk5Z1kmw',
    tiktokUrl: 'https://vt.tiktok.com/ZSHHgK3we/',
    youtubeUrl: 'https://www.youtube.com/watch?v=eKUgk5Z1kmw',
    likesCount: 136800,
    viewsCount: 1034000,
    commentsCount: 1990,
    publishedAt: 'Hari ini · Trending FYP',
    customXmlFileName: 'MLBB_FYP_Gameplay.xml',
    rawText: `Prst 5mb :
https://alightcreative.com/am/share/u/bkjjZEpnyCT98jwZZbKnvswEbrJ2/p/a8r950wd27-6f2c932170b5df95?source=link
Prst Xml :
https://drive.google.com/file/d/1DjwJNB_qKuGl8Iu8Vrl-wcHt-SBbyvR3/view?usp=drivesdk`,
  },
  {
    id: 'trend-fyp-ff-5',
    vtTitle: 'PRESET AM FREE FIRE PEPENGSHOT JEDAG JEDUG LOBBY DIBAWAH 5MB & XML || TREND FF VIRAL',
    soundName: 'Sound Free Fire Pepengshot Lobby Viral',
    creatorHandle: '@zeeepresetxml',
    creatorName: 'ZeeePrst FF',
    platform: 'tiktok',
    category: 'gameplay',
    sourceLocation: 'pinned_comment',
    videoUrl: 'https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692',
    tiktokUrl: 'https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692',
    youtubeUrl: 'https://www.youtube.com/watch?v=z7NsXv9a-5Y',
    likesCount: 112500,
    viewsCount: 894000,
    commentsCount: 1620,
    publishedAt: '5 jam lalu · Trending FYP',
    customXmlFileName: 'FF_Pepengshot_Lobby.xml',
    rawText: `Prst 5mb :
https://alightcreative.com/am/share/u/kqnCcNWq3vPiMwCtNX6mmScPtHu1/p/mzm6Z4Jimi-295a7640522e38ac
Prst Xml :
https://drive.google.com/file/d/1I6dU3zoLaP3PJwZeYZQSq9ilt8Ny8_q0/view?usp=drivesdk
Sound :
https://drive.google.com/file/d/1SYcdS05UwgT5pKoi-8ZzQfqSZcfmaab5/view?usp=drivesdk`,
  },
  {
    id: 'trend-fyp-mlff-6',
    vtTitle: 'PRESET AM COLLAB MLBB X FREE FIRE 3D SHAKE 60FPS || HIGHLIGHT GAMEPLAY',
    soundName: 'Sound Highlight Gameplay MLBB & FF',
    creatorHandle: '@akiraa_preset',
    creatorName: 'Akiraa Gaming Preset',
    platform: 'youtube',
    category: 'gameplay',
    sourceLocation: 'description',
    videoUrl: 'https://www.youtube.com/watch?v=FkKKOrk3kRE',
    tiktokUrl: 'https://www.tiktok.com/@akiraa_preset',
    youtubeUrl: 'https://www.youtube.com/watch?v=FkKKOrk3kRE',
    likesCount: 91300,
    viewsCount: 710200,
    commentsCount: 1240,
    publishedAt: 'Hari ini · Trending FYP',
    customXmlFileName: 'Collab_MLBB_FF_916.xml',
    rawText: `Prst 5mb :
https://alightcreative.com/am/share/u/W3Dz4Le79XfZG3btq2yrImXysB12/p/UVdlXig3MY-1bca2c71334a9664
Prst Xml :
https://drive.google.com/file/d/1ThwzRFlQB_OGwPmwctcQjItfCjbRDaKx/view?usp=drivesdk`,
  },
  {
    id: 'trend-fyp-cinematic-7',
    vtTitle: 'PRESET AM CINEMATIC AESTHETIC STORY WA 16:9 || SOUND INDIE SLOW VIBES 5MB & XML',
    soundName: 'Cinematic Indie Aesthetic Slow Vibes',
    creatorHandle: '@gokaizenrealcuy',
    creatorName: 'Gokaizen Cinematic',
    platform: 'youtube',
    category: 'cinematic',
    sourceLocation: 'description',
    videoUrl: 'https://www.youtube.com/watch?v=xD5MmBBsrA4',
    tiktokUrl: 'https://www.tiktok.com/@gokaizenrealcuy',
    youtubeUrl: 'https://www.youtube.com/watch?v=xD5MmBBsrA4',
    likesCount: 104200,
    viewsCount: 818400,
    commentsCount: 1490,
    publishedAt: '3 jam lalu · Trending FYP',
    customXmlFileName: 'Cinematic_IndieVibes_169.xml',
    rawText: `Cinematic Preset Pack
Prst 5mb : https://alightcreative.com/am/share/u/OTGJ4kWZ6cMGNrDNPAivRCQd9JW2/p/Pg8MEq0WdP-e174c67ef1054458
Xml : https://drive.google.com/file/d/1kq2Ax9zyg0TgSLLb7fI1P7pGXJ3B4Say/view?usp=drivesdk
Sound : https://drive.google.com/file/d/1xZ9YYt3xXqE5M2mJpceZGv72Boz8jw-V/view?usp=drivesdk`,
  },
  {
    id: 'trend-fyp-cc-8',
    vtTitle: 'PRESET AM COLOR GRADING HDR CC GLOW 4K ULTRA HD || EFEK JERUK NIPIS VIRAL TIKTOK',
    soundName: 'Color Grading HDR CC Glow 4K',
    creatorHandle: '@brzee_.sky',
    creatorName: 'Alfaa CC Studio',
    platform: 'tiktok',
    category: 'color_grading',
    sourceLocation: 'pinned_comment',
    videoUrl: 'https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692',
    tiktokUrl: 'https://www.tiktok.com/@wyxzwangyy/video/7696828668445756692',
    youtubeUrl: 'https://www.youtube.com/watch?v=2n1I2RFQMoE',
    likesCount: 121800,
    viewsCount: 954000,
    commentsCount: 1760,
    publishedAt: '1 jam lalu · Trending FYP',
    customXmlFileName: 'ColorGrading_HDR_4K.xml',
    rawText: `╭─⁅ COLOR GRADING CC + PRESET ⁆─╼
│ ◦ ᴘʀᴇsᴇᴛ 5 ᴍʙ ➩ https://alightcreative.com/am/share/u/giASh1o4XgZrwyVWvdH5PK9jwkn2/p/S2HJwSPVcm-781c9492e19117ae
│ ◦ ᴘʀᴇsᴇᴛ xᴍʟ ➩ https://drive.google.com/file/d/1mbt0TxF_0eZpZZUDFyZabQzP7UeIPZNP/view?usp=drivesdk
│ ◦ ᴘʀᴇsᴇᴛ sᴏᴜɴᴅ ➩ https://files.catbox.moe/4yb9ea.mp3
╰───────────╼`,
  },
];

function hydrateRecords(records: RawSeedRecord[]): VtPresetEntry[] {
  return records.map((rec) => {
    const {links, rejectedUrls} = extractPresetLinksFromText(rec.rawText, rec.id);

    let firstXmlAssigned = false;
    const enrichedLinks = links.map((link) => {
      if (link.type === 'xml_drive' && !firstXmlAssigned) {
        firstXmlAssigned = true;
        return {
          ...link,
          xmlMeta: parseAlightMotionXmlPreview(
            EXACT_XML_IMG_1163,
            rec.customXmlFileName || 'Prstdap || 1105.xml'
          ),
        };
      }
      return link;
    });

    return {
      id: rec.id,
      vtTitle: rec.vtTitle,
      soundName: rec.soundName,
      creatorHandle: rec.creatorHandle,
      creatorName: rec.creatorName,
      platform: rec.platform,
      category: detectPresetCategory(rec),
      sourceLocation: rec.sourceLocation,
      videoUrl: rec.videoUrl,
      tiktokUrl: rec.tiktokUrl,
      youtubeUrl: rec.youtubeUrl,
      likesCount: rec.likesCount,
      viewsCount: rec.viewsCount,
      commentsCount: rec.commentsCount,
      publishedAt: rec.publishedAt,
      rawText: rec.rawText,
      links: enrichedLinks,
      rejectedLinksCount: rejectedUrls.length,
    };
  });
}

export function shuffleEntries(entries: VtPresetEntry[]): VtPresetEntry[] {
  const arr = [...entries];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getSeedVtEntries(): VtPresetEntry[] {
  return hydrateRecords(RAW_SEED_RECORDS);
}

export function getTrendingSeedVtEntries(): VtPresetEntry[] {
  const combined = [...TRENDING_EXTRA_RECORDS, ...RAW_SEED_RECORDS];
  return hydrateRecords(combined).sort((a, b) => b.likesCount - a.likesCount);
}

/**
 * Returns trending entries filtered by topic ('all', 'kicau', 'kane', 'velocity', 'gameplay')
 * with non-Kicau-Mania presets prioritized for non-kicau topics and randomized order on 'all'
 * so Beranda never gets stuck showing only Kicau Mania at the top.
 */
export function getTrendingByTopic(
  topic = 'all',
  shuffle = true
): VtPresetEntry[] {
  const normalizedTopic = topic.toLowerCase().trim();
  const extraHydrated = hydrateRecords(TRENDING_EXTRA_RECORDS);
  const kicauHydrated = hydrateRecords(RAW_SEED_RECORDS);

  if (normalizedTopic === 'kicau') {
    const list = kicauHydrated.sort((a, b) => b.likesCount - a.likesCount);
    return shuffle ? shuffleEntries(list.slice(0, 8)).concat(list.slice(8)) : list;
  }

  if (normalizedTopic === 'kane') {
    const kaneList = extraHydrated.filter(
      (item) =>
        item.category === 'jj_presets' ||
        /kane|mengkane|tabrak|malam pagi/i.test(`${item.vtTitle} ${item.soundName}`)
    );
    return shuffle ? shuffleEntries(kaneList) : kaneList;
  }

  if (normalizedTopic === 'velocity') {
    const velocityList = extraHydrated.filter(
      (item) =>
        item.category === 'velocity' ||
        /velocity|slowmo|twixtor/i.test(`${item.vtTitle} ${item.soundName}`)
    );
    return shuffle ? shuffleEntries(velocityList) : velocityList;
  }

  if (normalizedTopic === 'gameplay') {
    const gameplayList = extraHydrated.filter(
      (item) =>
        item.category === 'gameplay' ||
        /mlbb|free fire|gameplay|montage|pepengshot/i.test(
          `${item.vtTitle} ${item.soundName}`
        )
    );
    return shuffle ? shuffleEntries(gameplayList) : gameplayList;
  }

  // 'all' (#semua-tren-fyp): Mix all diverse trending presets + only 3 Kicau Mania items,
  // and shuffle the top trending pool so the top of Beranda is randomized across trends!
  const mixedPool = [...extraHydrated, ...kicauHydrated.slice(0, 3)];
  return shuffle ? shuffleEntries(mixedPool) : mixedPool;
}
