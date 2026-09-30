import type { Locale } from '../listings';

type HomeCopy = {
  eyebrow: string;
  h1: string;
  lead: string;
  searchPlaceholder: string;
  searchButton: string;
  searchLabels: { city: string; district: string; category: string; place: string; empty: string; loading: string };
  cities: string;
  places: string;
  linkSeason: string;
  linkRoutes: string;
  linkUnesco: string;
  linkMap: string;
  featuredTitle: string;
  explore: string;
  routesTitle: string;
  routesLead: string;
  days: (n: number) => string;
  stops: (n: number) => string;
  unescoTitle: string;
  unescoLead: string;
  themesTitle: string;
  themesLead: string;
  themeTopCities: string;
  regionsTitle: string;
  regionsLead: string;
  aboutTitle: string;
  aboutText: string;
  aboutLink: string;
  contactLink: string;
  suggestLink: string;
};

export const HOME_COPY: Record<Locale, HomeCopy> = {
  tr: {
    eyebrow: 'Türkiye Kültürel Miras Rehberi',
    h1: 'Türkiye’de Gezilecek Yerler',
    lead: 'Müzeler, antik kentler, kaleler ve doğal güzellikler. Gideceğiniz yeri arayın ya da aşağıdaki önerilerle başlayın.',
    searchPlaceholder: 'Şehir, ilçe veya yer ara… (ör. Efes, Kaş, Mardin)',
    searchButton: 'Ara',
    searchLabels: { city: 'Şehir', district: 'İlçe', category: 'Kategori', place: 'Yer', empty: 'Sonuç bulunamadı', loading: 'Yükleniyor…' },
    cities: 'şehir',
    places: 'yer',
    linkSeason: 'Bu ayın önerileri',
    linkRoutes: 'Hazır rotalar',
    linkUnesco: 'UNESCO alanları',
    linkMap: 'Haritada gez',
    featuredTitle: 'En popüler şehirler',
    explore: 'Keşfet',
    routesTitle: 'Hazır gezi rotaları',
    routesLead: 'Durakları tek tek seçmekle uğraşmayın: bu rotalar birbirine yakın yerleri mantıklı bir sırayla bir araya getiriyor. Her durağa tıklayıp ayrıntısına bakabilirsiniz.',
    days: (n) => `${n} gün`,
    stops: (n) => `${n} durak`,
    unescoTitle: 'UNESCO Dünya Mirası Listesi’ndeki yerler',
    unescoLead: 'Türkiye’nin Dünya Mirası Listesi’ndeki alanlarından Kitabe’de yer alanlar.',
    themesTitle: 'Temaya göre keşfet',
    themesLead: 'Türkiye genelinde en çok kaydın bulunduğu kategoriler ve her birinin öne çıktığı şehirler.',
    themeTopCities: 'Öne çıkan şehirler',
    regionsTitle: 'Bölgelere göre Türkiye',
    regionsLead: '81 ilin tamamı yedi coğrafi bölgeye göre gruplandı. Şehir adının yanındaki sayı, Kitabe’deki yer sayısını gösterir.',
    aboutTitle: 'Kitabe hakkında',
    aboutText: 'Kitabe, Türkiye’nin kültürel mirasını herkes için kolay ulaşılır kılmak amacıyla hazırlanan bir gezi rehberi. Kayıtlar kullanıcı önerileri ve editör incelemesiyle güncelleniyor. Bir hata görürseniz ya da eklenmesini istediğiniz bir yer varsa bize yazın.',
    aboutLink: 'Hakkımızda',
    contactLink: 'İletişim',
    suggestLink: 'Yer öner',
  },
  en: {
    eyebrow: 'Turkey Cultural Heritage Guide',
    h1: 'Things to Do in Turkey',
    lead: 'Museums, ancient cities, castles and natural wonders. Search for where you’re going, or start with the ideas below.',
    searchPlaceholder: 'Search a city, district or place… (e.g. Ephesus, Kaş, Mardin)',
    searchButton: 'Search',
    searchLabels: { city: 'City', district: 'District', category: 'Category', place: 'Place', empty: 'No results found', loading: 'Loading…' },
    cities: 'cities',
    places: 'places',
    linkSeason: 'This month',
    linkRoutes: 'Ready-made routes',
    linkUnesco: 'UNESCO sites',
    linkMap: 'Browse the map',
    featuredTitle: 'Most popular cities',
    explore: 'Explore',
    routesTitle: 'Ready-made itineraries',
    routesLead: 'No need to pick every stop yourself: these routes group nearby places in a sensible order. Click any stop to see its details.',
    days: (n) => (n === 1 ? '1 day' : `${n} days`),
    stops: (n) => `${n} stops`,
    unescoTitle: 'UNESCO World Heritage Sites',
    unescoLead: 'Sites from Turkey’s World Heritage List that you can explore on Kitabe.',
    themesTitle: 'Explore by theme',
    themesLead: 'The categories with the most entries across Turkey, and the cities where each one stands out.',
    themeTopCities: 'Top cities',
    regionsTitle: 'Turkey by region',
    regionsLead: 'All 81 provinces grouped into Turkey’s seven geographical regions. The number next to each city is how many places it has on Kitabe.',
    aboutTitle: 'About Kitabe',
    aboutText: 'Kitabe is a travel guide that aims to make Turkey’s cultural heritage easy for everyone to explore. Entries are kept up to date through user suggestions and editorial review. If you spot a mistake or want a place added, let us know.',
    aboutLink: 'About us',
    contactLink: 'Contact',
    suggestLink: 'Suggest a place',
  },
  ru: {
    eyebrow: 'Путеводитель по культурному наследию Турции',
    h1: 'Достопримечательности Турции',
    lead: 'Музеи, античные города, крепости и природные красоты. Найдите нужное место или начните с идей ниже.',
    searchPlaceholder: 'Город, район или место… (напр. Эфес, Каш, Мардин)',
    searchButton: 'Найти',
    searchLabels: { city: 'Город', district: 'Район', category: 'Категория', place: 'Место', empty: 'Ничего не найдено', loading: 'Загрузка…' },
    cities: 'городов',
    places: 'мест',
    linkSeason: 'Идеи на этот месяц',
    linkRoutes: 'Готовые маршруты',
    linkUnesco: 'Объекты ЮНЕСКО',
    linkMap: 'Открыть карту',
    featuredTitle: 'Популярные города',
    explore: 'Смотреть',
    routesTitle: 'Готовые маршруты',
    routesLead: 'Не нужно подбирать каждую остановку самому: эти маршруты объединяют близкие места в удобном порядке. Нажмите на любую остановку, чтобы узнать подробности.',
    days: (n) => (n === 1 ? '1 день' : n < 5 ? `${n} дня` : `${n} дней`),
    stops: (n) => (n < 5 ? `${n} остановки` : `${n} остановок`),
    unescoTitle: 'Объекты Всемирного наследия ЮНЕСКО',
    unescoLead: 'Объекты из списка Всемирного наследия в Турции, которые есть на Kitabe.',
    themesTitle: 'Темы',
    themesLead: 'Категории с наибольшим числом мест по всей Турции и города, где каждая из них особенно представлена.',
    themeTopCities: 'Лучшие города',
    regionsTitle: 'Турция по регионам',
    regionsLead: 'Все 81 провинция, сгруппированные по семи географическим регионам. Число рядом с городом — количество мест на Kitabe.',
    aboutTitle: 'О Kitabe',
    aboutText: 'Kitabe — путеводитель, цель которого — сделать культурное наследие Турции доступным для всех. Данные обновляются благодаря предложениям пользователей и проверке редакторами. Если вы нашли ошибку или хотите добавить место, напишите нам.',
    aboutLink: 'О нас',
    contactLink: 'Контакты',
    suggestLink: 'Предложить место',
  },
  ar: {
    eyebrow: 'دليل التراث الثقافي في تركيا',
    h1: 'أماكن للزيارة في تركيا',
    lead: 'متاحف ومدن أثرية وقلاع وعجائب طبيعية. ابحث عن وجهتك أو ابدأ بالاقتراحات أدناه.',
    searchPlaceholder: 'ابحث عن مدينة أو حي أو مكان… (مثل أفسس، كاش، ماردين)',
    searchButton: 'ابحث',
    searchLabels: { city: 'مدينة', district: 'حي', category: 'فئة', place: 'مكان', empty: 'لا توجد نتائج', loading: 'جارٍ التحميل…' },
    cities: 'مدينة',
    places: 'مكان',
    linkSeason: 'اقتراحات هذا الشهر',
    linkRoutes: 'مسارات جاهزة',
    linkUnesco: 'مواقع اليونسكو',
    linkMap: 'تصفح الخريطة',
    featuredTitle: 'المدن الأكثر شعبية',
    explore: 'استكشف',
    routesTitle: 'مسارات سياحية جاهزة',
    routesLead: 'لا داعي لاختيار كل محطة بنفسك: تجمع هذه المسارات الأماكن المتقاربة بترتيب منطقي. اضغط على أي محطة لرؤية تفاصيلها.',
    days: (n) => (n === 1 ? 'يوم واحد' : n === 2 ? 'يومان' : `${n} أيام`),
    stops: (n) => `${n} محطات`,
    unescoTitle: 'مواقع التراث العالمي لليونسكو',
    unescoLead: 'مواقع من قائمة التراث العالمي في تركيا متاحة على Kitabe.',
    themesTitle: 'استكشف حسب الموضوع',
    themesLead: 'الفئات الأكثر حضوراً في أنحاء تركيا، والمدن التي تبرز فيها كل فئة.',
    themeTopCities: 'أبرز المدن',
    regionsTitle: 'تركيا حسب المناطق',
    regionsLead: 'المحافظات الـ81 كلها مقسّمة على المناطق الجغرافية السبع. الرقم بجانب المدينة هو عدد أماكنها على Kitabe.',
    aboutTitle: 'عن Kitabe',
    aboutText: 'Kitabe دليل سفر يهدف إلى جعل التراث الثقافي التركي في متناول الجميع. تُحدَّث البيانات عبر اقتراحات المستخدمين ومراجعة المحررين. إن لاحظت خطأً أو أردت إضافة مكان فراسلنا.',
    aboutLink: 'من نحن',
    contactLink: 'اتصل بنا',
    suggestLink: 'اقترح مكاناً',
  },
};
