/**
 * Ziyaretçi getirmeyen veri toplama / AI / SEO scrapers.
 * Googlebot, bingbot, Applebot, Yandex, facebookexternalhit, meta-webindexer
 * SERBEST — paylaşım önizlemesi ve arama için gerekli.
 */
export const BLOCKED_BOTS = [
  // AI / LLM crawlers
  'GPTBot',
  'ClaudeBot',
  'CCBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'Google-Extended',
  'anthropic-ai',
  'Bytespider',
  'TikTokSpider',
  'KeenableBot',
  'ExaSearchBot',
  'KAF-AI-UptimeBot',
  // Amazon / marketplace scrapers (SEO değil)
  'Amazonbot',
  'Amzn-SearchBot',
  // Meta AI agent (crawler / webindexer değil)
  'meta-externalagent',
  // SEO rank trackers
  'AhrefsBot',
  'SemrushBot',
  'SERankingBacklinksBot',
  'Reflectionbot',
  'MJ12bot',
  'DotBot',
  'PetalBot',
  'DataForSeoBot',
  'BLEXBot',
  // Generic scrapers
  'Scrapy',
  'python-requests',
  'HeadlessChrome',
  'PhantomJS',
  'Puppeteer',
  'Playwright',
];

const BLOCKED_UA = new RegExp(BLOCKED_BOTS.join('|'), 'i');

export function isBlockedBot(userAgent: string | null): boolean {
  return !!userAgent && BLOCKED_UA.test(userAgent);
}
