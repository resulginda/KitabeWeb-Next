/** Ziyaretçi getirmeyen, binlerce sayfayı tarayıp sunucuyu yoran veri toplama / SEO botları. */
export const BLOCKED_BOTS = [
  'GPTBot',
  'ClaudeBot',
  'CCBot',
  'Bytespider',
  'TikTokSpider',
  'Amazonbot',
  'meta-externalagent',
  'AhrefsBot',
  'SemrushBot',
  'SERankingBacklinksBot',
  'Reflectionbot',
  'MJ12bot',
  'DotBot',
  'PetalBot',
  'DataForSeoBot',
  'BLEXBot',
];

const BLOCKED_UA = new RegExp(BLOCKED_BOTS.join('|'), 'i');

export function isBlockedBot(userAgent: string | null): boolean {
  return !!userAgent && BLOCKED_UA.test(userAgent);
}
