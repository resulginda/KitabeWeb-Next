import { Inter, Outfit } from 'next/font/google';

export const siteFontInter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const siteFontOutfit = Outfit({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
});

export const siteFontClassName = `${siteFontInter.variable} ${siteFontOutfit.variable}`;
