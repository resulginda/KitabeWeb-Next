export type BlogLang = 'tr' | 'en' | 'ru' | 'ar';

export type BlogCategoryKey = 'culturalHeritage' | 'travelGuide' | 'tourism' | 'museums';

export type BlogPostId =
  | 'kahverengi-tabela-nedir'
  | 'beypazari-gezilecek-yerler'
  | 'unesco-alanlari-turkiye'
  | 'kulturel-rotalar-nedir'
  | 'hafta-sonu-gunubirlik-gezi'
  | 'tarihi-camiler-turkiye'
  | 'arkeoloji-muzeleri'
  | 'kapadokya-balon-turu';

export type BlogPost = {
  id: BlogPostId;
  date: string;
  readMinutes: number;
  categoryKey: BlogCategoryKey;
  title: string;
  excerpt: string;
  content: string;
};

type BlogPostBase = {
  id: BlogPostId;
  date: string;
  readMinutes: number;
  categoryKey: BlogCategoryKey;
};

const BASE: BlogPostBase[] = [
  { id: 'kahverengi-tabela-nedir', date: '2026-01-15', readMinutes: 5, categoryKey: 'culturalHeritage' },
  { id: 'beypazari-gezilecek-yerler', date: '2026-01-10', readMinutes: 8, categoryKey: 'travelGuide' },
  { id: 'unesco-alanlari-turkiye', date: '2026-01-05', readMinutes: 12, categoryKey: 'culturalHeritage' },
  { id: 'kulturel-rotalar-nedir', date: '2025-12-28', readMinutes: 7, categoryKey: 'tourism' },
  { id: 'hafta-sonu-gunubirlik-gezi', date: '2025-12-20', readMinutes: 10, categoryKey: 'travelGuide' },
  { id: 'tarihi-camiler-turkiye', date: '2025-12-15', readMinutes: 9, categoryKey: 'culturalHeritage' },
  { id: 'arkeoloji-muzeleri', date: '2025-12-10', readMinutes: 8, categoryKey: 'museums' },
  { id: 'kapadokya-balon-turu', date: '2025-12-05', readMinutes: 6, categoryKey: 'travelGuide' },
];

const COPY: Record<BlogPostId, Record<BlogLang, { title: string; excerpt: string; content: string }>> = {
  'kahverengi-tabela-nedir': {
    tr: {
      title: "Türkiye'de Kahverengi Tabela Nedir?",
      excerpt:
        'Kahverengi tabelalar, Türkiye\'deki tarihi ve kültürel yerleri işaretleyen özel trafik işaretleridir. Bu yazıda kahverengi tabelaların anlamını, tarihçesini ve önemini keşfedin.',
      content: `Kahverengi tabelalar, Türkiye'deki tarihi ve kültürel yerleri işaretleyen özel trafik işaretleridir. Bu tabelalar, sürücüleri ve yolcuları yakındaki önemli kültürel miras alanları hakkında bilgilendirmek için kullanılır.

Kahverengi tabelaların tarihçesi 1960'lı yıllara dayanmaktadır. İlk olarak Avrupa'da kullanılmaya başlanan bu sistem, Türkiye'de de 1980'li yıllardan itibaren yaygınlaşmıştır. Kahverengi renk, doğal ve kültürel mirası temsil eder.

Türkiye'de kahverengi tabelalar genellikle şu tür yerleri işaretler:
- Tarihi camiler ve kiliseler
- Müzeler ve arkeolojik alanlar
- Antik kentler ve kaleler
- Doğal güzellikler ve milli parklar
- Geleneksel köyler ve kültürel alanlar

Bu tabelalar, turistlerin ve yerel halkın kültürel mirasımızı keşfetmesine yardımcı olur. Ayrıca, kültürel turizmin gelişmesine de önemli katkı sağlar.`,
    },
    en: {
      title: 'What Are Brown Road Signs in Turkey?',
      excerpt:
        'Brown signs mark historical and cultural sites across Turkey. Learn what they mean, their history, and why they matter for travelers.',
      content: `Brown road signs are special traffic signs that point to historical and cultural places in Turkey. They help drivers and passengers discover nearby heritage sites.

The system dates back to the 1960s in Europe and became common in Turkey from the 1980s onward. Brown represents natural and cultural heritage.

In Turkey, brown signs usually mark:
- Historic mosques and churches
- Museums and archaeological sites
- Ancient cities and castles
- Natural wonders and national parks
- Traditional villages and cultural areas

These signs help both tourists and locals explore cultural heritage and support cultural tourism.`,
    },
    ru: {
      title: 'Что такое коричневые дорожные знаки в Турции?',
      excerpt:
        'Коричневые знаки указывают на исторические и культурные объекты Турции. Узнайте их значение, историю и важность для путешественников.',
      content: `Коричневые дорожные знаки — это специальные указатели, которые обозначают исторические и культурные места в Турции. Они помогают водителям и пассажирам находить важные объекты культурного наследия поблизости.

История таких знаков восходит к 1960-м годам в Европе; в Турции они стали широко использоваться с 1980-х. Коричневый цвет символизирует природное и культурное наследие.

В Турции коричневые знаки обычно указывают на:
- Исторические мечети и церкви
- Музеи и археологические зоны
- Античные города и крепости
- Природные достопримечательности и национальные парки
- Традиционные деревни и культурные районы

Эти знаки помогают туристам и местным жителям открывать культурное наследие и развивают культурный туризм.`,
    },
    ar: {
      title: 'ما هي اللوحات البنية في تركيا؟',
      excerpt:
        'اللوحات البنية تشير إلى المواقع التاريخية والثقافية في تركيا. تعرّف على معناها وتاريخها وأهميتها للمسافرين.',
      content: `اللوحات البنية هي إشارات مرورية خاصة تشير إلى الأماكن التاريخية والثقافية في تركيا. تساعد السائقين والركاب على اكتشاف مواقع التراث القريبة.

يعود نظام هذه اللوحات إلى الستينيات في أوروبا، وانتشر في تركيا منذ الثمانينيات. اللون البني يرمز إلى التراث الطبيعي والثقافي.

في تركيا، تشير اللوحات البنية عادة إلى:
- المساجد والكنائس التاريخية
- المتاحف والمواقع الأثرية
- المدن والقلاع القديمة
- المعالم الطبيعية والمتنزهات الوطنية
- القرى التقليدية والمناطق الثقافية

تساعد هذه اللوحات السياح والسكان المحليين على استكشاف التراث الثقافي وتدعم السياحة الثقافية.`,
    },
  },
  'beypazari-gezilecek-yerler': {
    tr: {
      title: 'Beypazarı Gezilecek Yerler Rehberi',
      excerpt:
        "Ankara'nın tarihi ilçesi Beypazarı, geleneksel mimarisi, el sanatları ve lezzetli yemekleriyle ünlüdür.",
      content: `Ankara'nın tarihi ilçesi Beypazarı, geleneksel mimarisi, el sanatları ve lezzetli yemekleriyle ünlüdür. Osmanlı döneminden kalma evleri ve dar sokaklarıyla ziyaretçilerini büyüler.

Beypazarı'nda mutlaka görülmesi gereken yerler:
1. Tarihi Evler
2. Beypazarı Müzesi
3. İnözü Vadisi
4. Geleneksel el sanatları atölyeleri
5. Yöresel lezzetler (havuç lokumu, cevizli sucuk)

Ankara'ya yakınlığı nedeniyle günübirlik geziler için idealdir.`,
    },
    en: {
      title: 'Beypazarı Travel Guide: Places to Visit',
      excerpt:
        'The historic district of Beypazarı near Ankara is famous for Ottoman houses, crafts, and local cuisine.',
      content: `Beypazarı is a historic district of Ankara known for traditional architecture, handicrafts, and local food. Its Ottoman-era houses and narrow streets charm visitors.

Must-see places:
1. Historic houses
2. Beypazarı Museum
3. İnözü Valley
4. Traditional craft workshops
5. Local delicacies (carrot delight, walnut sausage)

Ideal for a day trip from Ankara.`,
    },
    ru: {
      title: 'Путеводитель по Бейпазары: что посмотреть',
      excerpt:
        'Исторический район Бейпазары под Анкарой славится османской архитектурой, ремёслами и местной кухней.',
      content: `Бейпазары — исторический район Анкары, известный традиционной архитектурой, ремёслами и местной кухней. Османские дома и узкие улочки очаровывают гостей.

Обязательно посетите:
1. Исторические дома
2. Музей Бейпазары
3. Долина Инёзю
4. Мастерские народных промыслов
5. Местные деликатесы (морковная рахат-лукум, ореховая колбаска)

Идеально для однодневной поездки из Анкары.`,
    },
    ar: {
      title: 'دليل زيارة بيبازاري',
      excerpt:
        'بلدة بيبازاري التاريخية قرب أنقرة مشهورة بالعمارة العثمانية والحرف اليدوية والمأكولات المحلية.',
      content: `بيبازاري هي منطقة تاريخية في أنقرة تشتهر بالعمارة التقليدية والحرف اليدوية والطعام المحلي. منازلها العثمانية وأزقتها الضيقة تسحر الزوار.

أماكن يجب زيارتها:
1. المنازل التاريخية
2. متحف بيبازاري
3. وادي إينوزو
4. ورش الحرف التقليدية
5. الأطعمة المحلية

مثالية لرحلة يومية من أنقرة.`,
    },
  },
  'unesco-alanlari-turkiye': {
    tr: {
      title: "UNESCO Dünya Mirası Listesindeki Türkiye'nin Kültürel Alanları",
      excerpt:
        "Türkiye, UNESCO Dünya Mirası Listesi'nde 19 alanla temsil edilmektedir.",
      content: `Türkiye, UNESCO Dünya Mirası Listesi'nde 19 alanla temsil edilmektedir. Bu alanlar, insanlığın ortak mirası olarak kabul edilen eşsiz kültürel ve doğal değerlerdir.

Öne çıkan alanlar arasında İstanbul'un Tarihi Alanları, Göreme ve Kapadokya, Hierapolis-Pamukkale, Efes, Göbekli Tepe ve Selimiye Camii yer alır.

Bu alanlar, Türkiye'nin zengin kültürel mirasının dünya çapında tanınmasını sağlar.`,
    },
    en: {
      title: "Turkey's UNESCO World Heritage Sites",
      excerpt:
        'Turkey is represented on the UNESCO World Heritage List with 19 sites.',
      content: `Turkey has 19 entries on the UNESCO World Heritage List — outstanding cultural and natural treasures of humanity.

Highlights include Historic Areas of Istanbul, Göreme and Cappadocia, Hierapolis-Pamukkale, Ephesus, Göbekli Tepe, and the Selimiye Mosque.

These sites bring global recognition to Turkey's rich heritage.`,
    },
    ru: {
      title: 'Объекты всемирного наследия ЮНЕСКО в Турции',
      excerpt:
        'Турция представлена в списке всемирного наследия ЮНЕСКО 19 объектами.',
      content: `В списке всемирного наследия ЮНЕСКО Турция представлена 19 объектами — уникальными культурными и природными ценностями человечества.

Среди них: исторические районы Стамбула, Гёреме и Каппадокия, Иераполис-Памуккале, Эфес, Гёбекли-Тепе и мечеть Селимие.

Эти объекты обеспечивают мировое признание богатого наследия Турции.`,
    },
    ar: {
      title: 'مواقع التراث العالمي لليونسكو في تركيا',
      excerpt: 'تركيا ممثلة في قائمة اليونسكو بـ 19 موقعاً.',
      content: `تضم تركيا 19 موقعاً في قائمة التراث العالمي لليونسكو — كنوز ثقافية وطبيعية استثنائية.

من أبرزها: المناطق التاريخية في إسطنبول، غوريمه وكابادوكيا، هيرابوليس-باموكالي، أفسس، غوبكلي تيبه وجامع السليمية.

تمنح هذه المواقع اعترافاً عالمياً بثراء تركيا الثقافي.`,
    },
  },
  'kulturel-rotalar-nedir': {
    tr: {
      title: "Kültürel Rotalar Nedir? Türkiye'de Kültürel Turizm",
      excerpt: 'Kültürel rotalar, tarihi ve kültürel değerleri birbirine bağlayan özel güzergahlardır.',
      content: `Kültürel rotalar, tarihi ve kültürel değerleri birbirine bağlayan özel güzergahlardır.

Türkiye'deki önemli kültürel rotalar:
1. İpek Yolu
2. Likya Yolu
3. Karia Yolu
4. Frig Yolu
5. Evliya Çelebi Yolu

Kültürel rotalar, turizmi destekler ve mirası korur.`,
    },
    en: {
      title: 'What Are Cultural Routes? Cultural Tourism in Turkey',
      excerpt: 'Cultural routes connect historic and cultural sites along themed itineraries.',
      content: `Cultural routes are themed itineraries linking heritage sites.

Major routes in Turkey:
1. Silk Road
2. Lycian Way
3. Carian Trail
4. Phrygian Trail
5. Evliya Çelebi Way

They support tourism and heritage preservation.`,
    },
    ru: {
      title: 'Что такое культурные маршруты? Культурный туризм в Турции',
      excerpt: 'Культурные маршруты связывают исторические и культурные объекты.',
      content: `Культурные маршруты — это тематические пути, соединяющие объекты наследия.

Важные маршруты в Турции:
1. Великий шёлковый путь
2. Ликийская тропа
3. Карийская тропа
4. Фригийский маршрут
5. Путь Эвлии Челеби

Они поддерживают туризм и сохранение наследия.`,
    },
    ar: {
      title: 'ما هي المسارات الثقافية؟ السياحة الثقافية في تركيا',
      excerpt: 'المسارات الثقافية تربط المواقع التاريخية والثقافية.',
      content: `المسارات الثقافية هي خطوط سياحية تربط مواقع التراث.

أهم المسارات في تركيا:
1. طريق الحرير
2. مسار ليقيا
3. مسار كاريا
4. مسار الفريجية
5. طريق أوليا جلبي

تدعم السياحة والحفاظ على التراث.`,
    },
  },
  'hafta-sonu-gunubirlik-gezi': {
    tr: {
      title: "Hafta Sonu Günübirlik Gezi Önerileri: Türkiye'nin Gizli Cennetleri",
      excerpt: "Hafta sonu kısa bir kaçamak mı yapmak istiyorsunuz? Türkiye'nin dört bir yanındaki günübirlik gezilebilecek yerleri keşfedin.",
      content: `Hafta sonu kısa bir kaçamak için Türkiye'nin dört bir yanında tarihi ve kültürel duraklar bulunur.

İstanbul çevresi: Polonezköy, Şile, Ağva
Ankara çevresi: Beypazarı, Gordion, Kızılcahamam
İzmir çevresi: Şirince, Birgi, Foça
Antalya çevresi: Side, Aspendos, Termessos

Bu yerler hafta sonu gezileri için idealdir.`,
    },
    en: {
      title: "Weekend Day-Trip Ideas: Turkey's Hidden Gems",
      excerpt: 'Planning a short weekend escape? Discover day-trip destinations across Turkey.',
      content: `Turkey offers countless historic day-trip options.

Near Istanbul: Polonezköy, Şile, Ağva
Near Ankara: Beypazarı, Gordion, Kızılcahamam
Near Izmir: Şirince, Birgi, Foça
Near Antalya: Side, Aspendos, Termessos

Perfect for weekend getaways.`,
    },
    ru: {
      title: 'Идеи для однодневных поездок на выходные',
      excerpt: 'Планируете короткий отдых? Откройте маршруты выходного дня по всей Турции.',
      content: `По всей Турции есть исторические места для поездок на один день.

Рядом со Стамбулом: Полонезькёй, Шиле, Агва
Рядом с Анкарой: Бейпазары, Гордион, Кызылджахамам
Рядом с Измиром: Шириндже, Бирги, Фоча
Рядом с Антальей: Сиде, Аспендос, Термессос

Идеально для поездок на выходные.`,
    },
    ar: {
      title: 'أفكار رحلات يومية في عطلة نهاية الأسبوع',
      excerpt: 'تخطط لرحلة قصيرة؟ اكتشف وجهات يومية في جميع أنحاء تركيا.',
      content: `توفّر تركيا وجهات تاريخية للرحلات اليومية.

قرب إسطنبول: بولونيزكوي، شيليه، آغوا
قرب أنقرة: بيبازاري، غورديون، كيزيلجاهامام
قرب إزمير: شيرينجه، بيرجي، فوتشا
قرب أنطاليا: سيده، أسپندوس، تيرميسوس

مثالية لعطلات نهاية الأسبوع.`,
    },
  },
  'tarihi-camiler-turkiye': {
    tr: {
      title: "Türkiye'nin En Önemli Tarihi Camileri",
      excerpt: "Türkiye, Osmanlı ve Selçuklu dönemlerinden kalma muhteşem camilerle doludur.",
      content: `Türkiye'nin en önemli tarihi camileri:
1. Ayasofya Camii (İstanbul)
2. Sultanahmet Camii (İstanbul)
3. Süleymaniye Camii (İstanbul)
4. Selimiye Camii (Edirne)
5. Ulu Camii (Bursa)
6. Divriği Ulu Camii (Sivas)
7. Kocatepe Camii (Ankara)

Bu camiler Türk-İslam mimarisinin en güzel örneklerini sergiler.`,
    },
    en: {
      title: "Turkey's Most Important Historic Mosques",
      excerpt: 'Turkey is home to magnificent Ottoman and Seljuk-era mosques.',
      content: `Notable historic mosques:
1. Hagia Sophia Mosque (Istanbul)
2. Sultanahmet Mosque (Istanbul)
3. Süleymaniye Mosque (Istanbul)
4. Selimiye Mosque (Edirne)
5. Grand Mosque (Bursa)
6. Divriği Great Mosque (Sivas)
7. Kocatepe Mosque (Ankara)

They showcase masterpieces of Turkish-Islamic architecture.`,
    },
    ru: {
      title: 'Важнейшие исторические мечети Турции',
      excerpt: 'В Турции множество великолепных мечетей османской и сельджукской эпох.',
      content: `Главные исторические мечети:
1. Мечеть Айя-София (Стамбул)
2. Мечеть Султанахмет (Стамбул)
3. Мечеть Сулеймание (Стамбул)
4. Мечеть Селимие (Эдирне)
5. Великая мечеть (Бурса)
6. Великая мечеть Дивриги (Сивас)
7. Мечеть Коджатепе (Анкара)

Они демонстрируют шедевры турецко-исламской архитектуры.`,
    },
    ar: {
      title: 'أهم المساجد التاريخية في تركيا',
      excerpt: 'تركيا تضم مساجد عثمانية وسلجوقية رائعة.',
      content: `أبرز المساجد التاريخية:
1. مسجد آيا صوفيا (إسطنبول)
2. مسجد السلطان أحمد (إسطنبول)
3. مسجد السليمانية (إسطنبول)
4. مسجد السليمية (أدرنة)
5. الجامع الكبير (بورصة)
6. جامع ديفريği (سيواس)
7. مسجد كوجاتيبي (أنقرة)

تعرض روائع العمارة التركية الإسلامية.`,
    },
  },
  'arkeoloji-muzeleri': {
    tr: {
      title: "Türkiye'nin En İyi Arkeoloji Müzeleri",
      excerpt: "Türkiye, zengin arkeolojik geçmişiyle dünyanın en önemli müzelerine ev sahipliği yapar.",
      content: `Türkiye'nin en önemli arkeoloji müzeleri:
1. İstanbul Arkeoloji Müzesi
2. Anadolu Medeniyetleri Müzesi (Ankara)
3. Antalya Müzesi
4. Efes Müzesi
5. Zeugma Mozaik Müzesi (Gaziantep)
6. Çorum Müzesi
7. Bergama Müzesi

Bu müzeler binlerce yıllık tarihi ziyaretçilere sunar.`,
    },
    en: {
      title: "Turkey's Best Archaeology Museums",
      excerpt: 'Turkey hosts world-class museums thanks to its rich archaeological past.',
      content: `Top archaeology museums:
1. Istanbul Archaeology Museums
2. Museum of Anatolian Civilizations (Ankara)
3. Antalya Museum
4. Ephesus Museum
5. Zeugma Mosaic Museum (Gaziantep)
6. Çorum Museum
7. Bergama Museum

They present thousands of years of history.`,
    },
    ru: {
      title: 'Лучшие археологические музеи Турции',
      excerpt: 'Богатое археологическое прошлое Турции отражено в выдающихся музеях.',
      content: `Главные археологические музеи:
1. Археологические музеи Стамбула
2. Музей анатолийских цивилизаций (Анкара)
3. Музей Антальи
4. Музей Эфеса
5. Музей мозаик Зевгмы (Газиантеп)
6. Музей Чорума
7. Музей Бергамы

Они представляют тысячелетия истории.`,
    },
    ar: {
      title: 'أفضل متاحف الآثار في تركيا',
      excerpt: 'تستضيف تركيا متاحف عالمية بفضل تاريخها الأثري الغني.',
      content: `أبرز متاحف الآثار:
1. متاحف إسطنبول الأثرية
2. متحف حضارات الأناضول (أنقرة)
3. متحف أنطاليا
4. متحف أفسس
5. متحف زيوغما للفسيفساء (غازي عنتاب)
6. متحف تشوروم
7. متحف برغامة

تعرض آلاف السنين من التاريخ.`,
    },
  },
  'kapadokya-balon-turu': {
    tr: {
      title: 'Kapadokya Balon Turu: Dünyanın En Büyüleyici Deneyimlerinden Biri',
      excerpt: "Kapadokya'nın eşsiz peribacaları üzerinde balon turu yapmak, Türkiye'nin en unutulmaz deneyimlerinden biridir.",
      content: `Kapadokya balon turları hakkında bilmeniz gerekenler:
1. En iyi zaman: gün doğumu
2. Güvenlik: uluslararası standartlar
3. Süre: yaklaşık 1–1,5 saat
4. Rezervasyon: özellikle yaz aylarında önceden yapın

Kapadokya balon turu unutulmaz bir deneyim sunar.`,
    },
    en: {
      title: 'Cappadocia Balloon Tour: A Magical Experience',
      excerpt: 'A hot-air balloon ride over Cappadocia is one of Turkey\'s most unforgettable experiences.',
      content: `What to know about Cappadocia balloon tours:
1. Best time: sunrise
2. Safety: international standards
3. Duration: about 1–1.5 hours
4. Booking: reserve early in summer

A Cappadocia balloon flight is truly unforgettable.`,
    },
    ru: {
      title: 'Полёт на воздушном шаре в Каппадокии',
      excerpt: 'Полёт над «волшебными дымоходами» Каппадокии — одно из самых ярких впечатлений Турции.',
      content: `О полётах на шаре в Каппадокии:
1. Лучшее время: рассвет
2. Безопасность: международные стандарты
3. Длительность: около 1–1,5 часа
4. Бронирование: летом лучше заранее

Полёт над Каппадокией оставит незабываемые воспоминания.`,
    },
    ar: {
      title: 'رحلة منطاد في كابادوكيا',
      excerpt: 'الطيران فوق مداخن الجنيات في كابادوكيا من أروع تجارب تركيا.',
      content: `معلومات عن رحلات المنطاد:
1. أفضل وقت: شروق الشمس
2. السلامة: معايير دولية
3. المدة: حوالي 1–1.5 ساعة
4. الحجز: مسبقاً في الصيف

تجربة لا تُنسى في كابادوكيا.`,
    },
  },
};

const DATE_LOCALES: Record<BlogLang, string> = {
  tr: 'tr-TR',
  en: 'en-US',
  ru: 'ru-RU',
  ar: 'ar-SA',
};

export function getBlogDateLocale(lang: BlogLang): string {
  return DATE_LOCALES[lang] ?? 'en-US';
}

export function getBlogPost(id: string, lang: BlogLang): BlogPost | null {
  const base = BASE.find((p) => p.id === id);
  const copy = COPY[id as BlogPostId]?.[lang] ?? COPY[id as BlogPostId]?.tr;
  if (!base || !copy) return null;
  return { ...base, ...copy };
}

export function getAllBlogPosts(lang: BlogLang): BlogPost[] {
  return BASE.map((base) => {
    const copy = COPY[base.id][lang] ?? COPY[base.id].tr;
    return { ...base, ...copy };
  });
}

export function isBlogPostId(id: string): id is BlogPostId {
  return BASE.some((p) => p.id === id);
}
