import type { ListingFilterResult, Locale } from './listings';
import { shouldUseExtendedIntro } from './listingQuality';
import { cityGuideParagraphs } from './cityGuideOverrides';

type IntroCtx = {
  city: string;
  district: string | null;
  category: string | null;
  total: number;
  categorySlug: string | null;
  districtSlug: string | null;
};

function ctxFromData(data: ListingFilterResult): IntroCtx {
  const { labels, total, filter } = data;
  return {
    city: labels.city,
    district: labels.district,
    category: labels.category,
    total,
    categorySlug:
      data.kind === 'category'
        ? filter[0] ?? null
        : data.kind === 'district_category'
          ? filter[1] ?? null
          : null,
    districtSlug:
      data.kind === 'district'
        ? filter[0] ?? null
        : data.kind === 'district_category'
          ? filter[0] ?? null
          : null,
  };
}

const CATEGORY_HINT_TR: Record<string, string> = {
  muzeler:
    'Arkeoloji müzelerinden etnografya koleksiyonlarına kadar şehrin hafızasını taşıyan mekânları burada bulabilirsiniz.',
  camiler:
    'Selçuklu ve Osmanlı dönemlerinden kalma camiler, medreseler ve külliyeler ziyaret rotanızın odak noktalarıdır.',
  'dini-yapilar':
    'Cami, kilise, manastır ve türbe gibi inanç yapıları şehrin çok katmanlı tarihini yansıtır.',
  kaleler:
    'Tarihi surlar, hisarlar ve kaleler hem savunma mimarisini hem de panoramik manzaraları bir arada sunar.',
  kale:
    'Tarihi surlar, hisarlar ve kaleler hem savunma mimarisini hem de panoramik manzaraları bir arada sunar.',
  hisar:
    'Tarihi surlar, hisarlar ve kaleler hem savunma mimarisini hem de panoramik manzaraları bir arada sunar.',
  'arkeolojik-alanlar':
    'Antik kent kalıntıları, tiyatroler ve kazı alanları arkeoloji meraklıları için vazgeçilmez duraklardır.',
  'dogal-alanlar':
    'Milli parklar, vadiler, şelaleler ve korunan peyzaj alanları doğa yürüyüşü ve fotoğrafçılık için idealdir.',
  'doga-parki':
    'Şehir parkları, mesire alanları ve korunan yeşil bölgeler aile gezileri ve kısa molalar için uygundur.',
  'sivil-mimari':
    'Konaklar, hanlar, çarşılar ve sivil yapılar günlük yaşamın tarih içinde nasıl şekillendiğini gösterir.',
  anitlar:
    'Anıtlar ve anıt mezarlar şehrin modern ve Cumhuriyet dönemi hafızasını görünür kılar.',
  gol: 'Göller ve su kenarı alanları hem dinlenme hem de kuş gözlemi için tercih edilen rotalardır.',
  yayla:
    'Yaylalar ve yüksek platolar serin havası, geleneksel yaşamı ve doğal manzaralarıyla öne çıkar.',
};

const CATEGORY_HINT_EN: Record<string, string> = {
  museums:
    'From archaeology collections to ethnography halls, these sites preserve the city’s layered memory.',
  mosques:
    'Seljuk and Ottoman mosques, madrasas and külliyes anchor many classic walking routes.',
  'religious-sites':
    'Mosques, churches, monasteries and tombs reflect centuries of faith and architecture.',
  castles:
    'Walls, citadels and fortresses combine military history with sweeping viewpoints.',
  'archaeological-sites':
    'Ancient theatres, ruins and excavation zones are essential stops for history lovers.',
  'natural-areas':
    'National parks, valleys and protected landscapes suit hiking and photography.',
  'nature-parks':
    'Urban parks and green belts work well for family outings and short breaks.',
};

function categoryHint(ctx: IntroCtx, locale: Locale): string {
  const slug = ctx.categorySlug?.toLowerCase() ?? '';
  if (locale === 'tr') return CATEGORY_HINT_TR[slug] ?? '';
  if (locale === 'en') return CATEGORY_HINT_EN[slug] ?? CATEGORY_HINT_EN[slug.replace(/ler$/, 's')] ?? '';
  return '';
}

function joinParagraphs(parts: string[]): string[] {
  return parts.map((p) => p.trim()).filter(Boolean);
}

/** placeCount > 5 olan liste sayfalarına ek SEO paragrafları */
function extendedIntroExtras(ctx: IntroCtx, locale: Locale, scope: ListingFilterResult['kind']): string[] {
  if (!shouldUseExtendedIntro(ctx.total)) return [];

  const { city, district, category, total } = ctx;

  if (locale === 'tr') {
    if (scope === 'city') {
      return joinParagraphs([
        `${city} gezisi planlarken müze günlerini, tarihi yarımadayı ve doğa duraklarını bir arada düşünmek rotanızı verimli kılar. Kitabe'deki her kayıt için konum bilgisi, fotoğraf galerisi ve pratik ziyaret ipuçları sunulur; böylece ${city}'de gezilecek yerleri önceden araştırabilirsiniz.`,
        `Şehir içi ulaşımda metro, tramvay ve yürüyüş mesafesindeki noktaları gruplamak zaman kazandırır. ${total} kayıtlı mekân arasından ilçe ve kategori filtreleriyle ilginizi çeken temayı seçin; örneğin müzeler, dini yapılar veya doğal alanlar.`,
        `Kitabe, ${city} turizmi ve kültür mirası meraklıları için düzenli güncellenen bir rehberdir. Mobil uygulama ile haritada gezebilir, favorilere ekleyebilir ve rotanızı paylaşabilirsiniz.`,
      ]);
    }
    if (scope === 'district' && district) {
      return joinParagraphs([
        `${city} ${district} bölgesinde ${total} kültürel miras noktası bulunmaktadır. Mahalle mahalle gezerken camiler, müzeler, parklar ve tarihi sokakları aynı gün içinde birleştirebilirsiniz.`,
        `Detay sayfalarında her yerin hikâyesi, dönem bilgisi ve ziyaret önerileri yer alır. ${district} için önerilen rota: önce merkezdeki ana duraklar, ardından çevredeki doğa veya arkeoloji noktaları.`,
      ]);
    }
    if (scope === 'category' && category) {
      return joinParagraphs([
        `${city} genelinde ${category} temasında ${total} kayıtlı mekân vardır. Bu liste, şehirde bu kategoriye girmek isteyen gezginler için tek sayfada toplanmış bir rehber niteliğindedir.`,
        `Kartlardan birini seçerek fotoğrafları, konumu ve ziyaret ipuçlarını inceleyin. Benzer temadaki yerleri haritada yan yana görerek günlük rotanızı planlayın.`,
      ]);
    }
    if (scope === 'district_category' && district && category) {
      return joinParagraphs([
        `${district} (${city}) içinde ${category} kategorisinde ${total} nokta listelenmiştir. Dar filtreli bu sayfa, belirli bir mahallede belirli bir tema arayanlar için hazırlanmıştır.`,
        `Yakın durakları yürüyüş mesafesine göre sıralayarak yarım veya tam gün rotası oluşturabilirsiniz.`,
      ]);
    }
  }

  if (locale === 'en') {
    if (scope === 'city') {
      return joinParagraphs([
        `When planning a trip to ${city}, grouping museums, old-town walks and outdoor stops saves time. Each Kitabe entry includes location, photos and practical visit tips among ${total} listed sites.`,
        `Use district and category filters to focus on museums, religious architecture or natural areas. The mobile app lets you browse on the map, save favourites and share your route.`,
      ]);
    }
    if (scope === 'district' && district) {
      return joinParagraphs([
        `${district} in ${city} lists ${total} heritage sites. Combine mosques, museums and historic streets in a single day walk through the district.`,
      ]);
    }
    if (scope === 'category' && category) {
      return joinParagraphs([
        `${city} has ${total} places in the ${category} category on this page — a focused guide for travellers with a specific interest.`,
      ]);
    }
  }

  return [];
}

function withExtended(base: string[], ctx: IntroCtx, locale: Locale, scope: ListingFilterResult['kind'], citySlug?: string): string[] {
  const extras = extendedIntroExtras(ctx, locale, scope);
  const manual =
    scope === 'city' && citySlug ? cityGuideParagraphs(citySlug, locale) : [];
  return [...base, ...extras, ...manual];
}

function cityIntro(ctx: IntroCtx, locale: Locale): string[] {
  const { city, total } = ctx;
  if (locale === 'tr') {
    return joinParagraphs([
      `${city}, Türkiye'nin kültürel miras açısından en zengin illerinden biridir. Kitabe'de ${city} için ${total} gezilecek yer; müzeler, tarihi yapılar, doğal alanlar ve arkeolojik noktalar tek rehberde toplanmıştır.`,
      `Aşağıdaki listede ${city}'nin öne çıkan duraklarını inceleyebilir, ilçe veya kategori filtreleriyle rotanızı daraltabilirsiniz. Her kayıt için konum, fotoğraf ve ziyaret ipuçları sunulur; harita üzerinden yakınınızdaki noktaları da keşfedebilirsiniz.`,
      `${city} gezisi planlarken müze günlerini, yürüyüş parkurlarını ve tarihi merkezleri bir arada değerlendirmenizi öneririz. Kitabe, ${city}'deki kültürel mirası güncel ve erişilebilir biçimde sunar.`,
    ]);
  }
  if (locale === 'en') {
    return joinParagraphs([
      `${city} ranks among Turkey's richest destinations for cultural heritage. On Kitabe you will find ${total} places to visit in ${city} — museums, historic buildings, natural sites and archaeological landmarks in one guide.`,
      `Browse the highlights below, then narrow your route by district or category. Each entry includes location, photos and practical tips; use the map to discover nearby sites as you travel.`,
      `When planning a trip to ${city}, combine museum visits, old-town walks and outdoor stops for a balanced itinerary. Kitabe keeps ${city}'s heritage up to date and easy to explore.`,
    ]);
  }
  if (locale === 'ru') {
    return joinParagraphs([
      `${city} — один из самых богатых городов Турции с точки зрения культурного наследия. В Kitabe собрано ${total} мест для посещения: музеи, исторические здания, природные зоны и археологические объекты.`,
      `Ниже — основные точки маршрута; фильтруйте по району или категории. У каждой записи есть фото, расположение и советы для визита.`,
      `Планируя поездку в ${city}, сочетайте музеи, прогулки по старому городу и природные остановки. Kitabe помогает открыть наследие ${city} в удобном формате.`,
    ]);
  }
  return joinParagraphs([
    `يُعدّ ${city} من أغنى مدن تركيا من حيث التراث الثقافي. في Kitabe تجد ${total} مكاناً للزيارة: متاحف ومبانٍ تاريخية ومناطق طبيعية ومواقع أثرية.`,
    `استعرض القائمة أدناه وضيّق البحث حسب الحي أو الفئة. كل مكان يتضمن موقعاً وصوراً ونصائح للزيارة.`,
    `عند التخطيط لرحلة إلى ${city}، اجمع بين المتاحف والمشي في البلدة القديمة والمحطات الطبيعية. Kitabe يعرض تراث ${city} بشكل محدّث وسهل.`,
  ]);
}

function districtIntro(ctx: IntroCtx, locale: Locale): string[] {
  const { city, district, total } = ctx;
  if (!district) return cityIntro(ctx, locale);
  if (locale === 'tr') {
    return joinParagraphs([
      `${district}, ${city} ilinde gezilecek yerler açısından öne çıkan ilçelerden biridir. Bu sayfada ${district} sınırları içindeki ${total} kültürel miras noktası listelenmiştir.`,
      `${district} bölgesinde tarihi yapılar, müzeler, dini mimari ve doğal alanlar bir arada bulunabilir. Aşağıdaki kartlardan ilginizi çeken durakları seçin; detay sayfalarında hikâye, konum ve ziyaret önerileri yer alır.`,
      `${city} ${district} rotası oluştururken yürüyüş mesafesindeki noktaları gruplamak zaman kazandırır. Kitabe haritasıyla ${district}'deki yerleri sıralayabilir ve gezinizi adım adım planlayabilirsiniz.`,
    ]);
  }
  if (locale === 'en') {
    return joinParagraphs([
      `${district} is one of the most rewarding districts to explore in ${city}. This page lists ${total} cultural heritage sites within ${district}.`,
      `Historic quarters, museums, religious architecture and green spaces often sit side by side here. Pick cards below for photos, stories and visit tips.`,
      `Group nearby stops when building a ${district}, ${city} itinerary — Kitabe's map helps you order sites efficiently.`,
    ]);
  }
  if (locale === 'ru') {
    return joinParagraphs([
      `${district} — один из ключевых районов ${city} для путешественников. Здесь ${total} объектов культурного наследия.`,
      `Исторические кварталы, музеи и природные зоны часто соседствуют в ${district}. Выберите карточки ниже для деталей и советов.`,
      `Составляя маршрут по ${district}, группируйте близкие точки — карта Kitabe упростит планирование.`,
    ]);
  }
  return joinParagraphs([
    `يُعدّ ${district} من أبرز أحياء ${city} للزيارة. هذه الصفحة تضم ${total} موقعاً للتراث الثقافي.`,
    `تتجاور في ${district} غالباً المباني التاريخية والمتاحف والمساحات الخضراء. اختر البطاقات أدناه للتفاصيل.`,
    `عند التخطيط لجولة في ${district}، اجمع المحطات القريبة باستخدام خريطة Kitabe.`,
  ]);
}

function categoryIntro(ctx: IntroCtx, locale: Locale): string[] {
  const { city, category, total } = ctx;
  const hint = categoryHint(ctx, locale);
  if (!category) return cityIntro(ctx, locale);
  if (locale === 'tr') {
    return joinParagraphs([
      `${city} genelinde ${category} kategorisinde ${total} kayıtlı nokta bulunmaktadır. Bu liste, şehirde bu tema etrafında gezilebilecek durakları tek sayfada toplar.`,
      hint ||
        `${category} meraklıları için ${city}'de farklı dönemlere ait örnekler bir arada sunulur; her kayıt konum ve kısa bilgi içerir.`,
      `Rotanızı ${city} sınırları içinde planlarken aşağıdaki yerleri sırayla veya haritaya göre ziyaret edebilirsiniz. Kitabe, ${city} ${category} rehberini düzenli olarak günceller.`,
    ]);
  }
  if (locale === 'en') {
    return joinParagraphs([
      `${city} has ${total} listed places in the ${category} category. This page gathers them in one searchable guide.`,
      hint ||
        `Highlights across ${city} show how this theme appears in different periods; each entry includes location and context.`,
      `Plan your ${city} route below or use the map to visit ${category} sites in a logical order. Kitabe keeps this ${city} guide current.`,
    ]);
  }
  if (locale === 'ru') {
    return joinParagraphs([
      `В ${city} в категории «${category}» — ${total} объектов. Страница объединяет их в одном справочнике.`,
      hint || `В ${city} представлены разные эпохи этой темы; у каждой записи есть расположение.`,
      `Составьте маршрут по ${city} с помощью списка или карты Kitabe.`,
    ]);
  }
  return joinParagraphs([
    `في ${city} ضمن فئة ${category} يوجد ${total} مكاناً. تجمع هذه الصفحة أبرزها في دليل واحد.`,
    hint || `تعرض ${city} نماذج متنوعة لهذا الموضوع مع مواقع وصور.`,
    `خطّط جولتك في ${city} من القائمة أو عبر خريطة Kitabe.`,
  ]);
}

function districtCategoryIntro(ctx: IntroCtx, locale: Locale): string[] {
  const { city, district, category, total } = ctx;
  if (!district || !category) return categoryIntro(ctx, locale);
  const hint = categoryHint(ctx, locale);
  if (locale === 'tr') {
    return joinParagraphs([
      `${city} ${district} ilçesinde ${category} kategorisinde ${total} nokta yer almaktadır. Bu sayfa, bölgeyi daraltılmış ve odaklı biçimde keşfetmek isteyenler için hazırlanmıştır.`,
      hint ||
        `${district} çevresinde ${category} örnekleri hem yerel tarih hem de mimari açıdan önem taşır; aşağıda en çok ziyaret edilen durakları bulabilirsiniz.`,
      `${district} rotanızı ${category} temasıyla planlarken yakın durakları bir günde birleştirmek mümkündür. Detay sayfalarından hikâyeleri okuyun, haritadan konumları kontrol edin.`,
    ]);
  }
  if (locale === 'en') {
    return joinParagraphs([
      `In ${district}, ${city}, there are ${total} places in the ${category} category. This focused list helps you explore one neighbourhood theme at a time.`,
      hint ||
        `${category} sites in ${district} reflect local history and architecture; browse the cards below for the most visited stops.`,
      `Combine nearby entries into a single-day ${district} walk; read stories on detail pages and check locations on the map.`,
    ]);
  }
  if (locale === 'ru') {
    return joinParagraphs([
      `В районе ${district} (${city}) — ${total} объектов категории «${category}». Узкий список для целенаправленной прогулки.`,
      hint || `В ${district} эта тема раскрывает местную историю; ниже — основные точки.`,
      `Объедините близкие остановки в маршрут на день; детали — на страницах объектов и на карте.`,
    ]);
  }
  return joinParagraphs([
    `في حي ${district} بمدينة ${city} يوجد ${total} مكان ضمن فئة ${category}.`,
    hint || `تعرض ${district} أمثلة محلية بارزة لهذا الموضوع.`,
    `اجمع المحطات القريبة في جولة يومية؛ التفاصيل في صفحات الأماكن والخريطة.`,
  ]);
}

/** On-page intro copy for listing hubs (city / district / category combos). ~150–220 words. */
export function listingIntroParagraphs(
  data: ListingFilterResult,
  locale: Locale
): string[] {
  const ctx = ctxFromData(data);
  let base: string[];
  switch (data.kind) {
    case 'district':
      base = districtIntro(ctx, locale);
      break;
    case 'category':
      base = categoryIntro(ctx, locale);
      break;
    case 'district_category':
      base = districtCategoryIntro(ctx, locale);
      break;
    case 'city':
    default:
      base = cityIntro(ctx, locale);
  }
  return withExtended(base, ctx, locale, data.kind, data.citySlug);
}

export function listingIntroText(data: ListingFilterResult, locale: Locale): string {
  return listingIntroParagraphs(data, locale).join('\n\n');
}

export function localeHubIntroParagraphs(
  locale: Locale,
  cityCount: number,
  placeCount: number
): string[] {
  if (locale === 'tr') {
    return joinParagraphs([
      `Türkiye'nin ${cityCount} ilinde ${placeCount} kültürel miras noktası Kitabe'de listelenmektedir. Müzeler, antik kentler, kaleler, camiler ve doğal güzellikler şehir şehir, ilçe ve kategori bazında düzenlenmiştir.`,
      `Aşağıdan şehrinizi seçerek gezilecek yer rehberine ulaşabilir; her il için ilçe ve tema filtreleriyle rotanızı daraltabilirsiniz. Popüler şehirlerden başlayın veya tüm illeri alfabetik olarak keşfedin.`,
      `Kitabe, Türkiye turizmi ve kültür mirası araştırmacıları için güncel konum, fotoğraf ve ziyaret bilgisi sunar. Harita üzerinden yakınınızdaki noktaları da inceleyebilirsiniz.`,
    ]);
  }
  if (locale === 'en') {
    return joinParagraphs([
      `Kitabe lists ${placeCount} cultural heritage sites across ${cityCount} provinces of Turkey — museums, ancient cities, castles, mosques and natural landmarks organised by city, district and theme.`,
      `Pick a city below to open its travel guide, then filter by neighbourhood or category. Start with popular destinations or browse every province.`,
      `Kitabe offers up-to-date locations, photos and visit tips for travellers and researchers. Use the map to find sites near you.`,
    ]);
  }
  if (locale === 'ru') {
    return joinParagraphs([
      `В Kitabe — ${placeCount} объектов культурного наследия в ${cityCount} провинциях Турции: музеи, античные города, крепости и природные зоны по городам и районам.`,
      `Выберите город ниже, затем сузьте маршрут по району или категории. Начните с популярных направлений или просмотрите все провинции.`,
      `Актуальные фото, карты и советы для путешественников и исследователей.`,
    ]);
  }
  return joinParagraphs([
    `يسرد Kitabe ${placeCount} موقعاً للتراث الثقافي في ${cityCount} محافظة تركية: متاحف ومدن أثرية وقلاع ومساجد ومناطق طبيعية.`,
    `اختر مدينة أدناه ثم ضيّق البحث حسب الحي أو الفئة. ابدأ بالوجهات الشائعة أو تصفّح كل المحافظات.`,
    `صور وخرائط ونصائح محدّثة للمسافرين والباحثين.`,
  ]);
}
