// AdMob Web için reklam servisi
// Web'de AdSense veya AdMob Web SDK kullanılabilir

let adsInitialized = false;

export const initializeAds = async () => {
  if (adsInitialized) return;
  
  // Web için AdSense veya AdMob Web SDK başlatılabilir
  // Şimdilik basit bir implementasyon
  console.log('Ads initialized (Web)');
  adsInitialized = true;
};

export const showBannerAd = () => {
  // Banner reklam gösterimi
  // Web'de genellikle sayfa içine yerleştirilir
  return Promise.resolve();
};

export const showInterstitialAd = async (): Promise<boolean> => {
  // Interstitial reklam gösterimi
  // Web'de popup veya modal olarak gösterilebilir
  console.log('Interstitial ad would be shown (Web)');
  return Promise.resolve(true);
};

export const showRewardedAd = async (): Promise<boolean> => {
  // Rewarded reklam gösterimi
  // Web'de modal olarak gösterilebilir
  console.log('Rewarded ad would be shown (Web)');
  return Promise.resolve(true);
};

