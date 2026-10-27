import type {Metadata} from 'next';
import {Plus_Jakarta_Sans, Public_Sans, JetBrains_Mono} from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'PresetFinder Studio — Pencarian & Filter Link Preset AM',
  description:
    'Mesin pencari dan penyaring link preset Alight Motion (5MB, XML Google Drive, Sound MediaFire) dari deskripsi dan komentar YouTube serta TikTok.',
  openGraph: {
    title: 'PresetFinder Studio — Pencarian & Filter Link Preset AM',
    description:
      'Mesin pencari dan penyaring link preset Alight Motion (5MB, XML Google Drive, Sound MediaFire) dari deskripsi dan komentar YouTube serta TikTok.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PresetFinder Studio — Pencarian & Filter Link Preset AM',
    description:
      'Mesin pencari dan penyaring link preset Alight Motion (5MB, XML Google Drive, Sound MediaFire) dari deskripsi dan komentar YouTube serta TikTok.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html
      lang="id"
      className={`${plusJakarta.variable} ${publicSans.variable} ${jetbrainsMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white"
        style={{fontFamily: 'var(--font-body), sans-serif'}}
      >
        {children}
      </body>
    </html>
  );
}
