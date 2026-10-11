import type { ListingFilterResult, Locale } from './listings';
import { shouldUseExtendedIntro } from './listingQuality';
import { cityGuideParagraphs } from './cityGuideOverrides';
import { listingGuideParagraphs } from './listingGuides';
import { trGen, trLoc } from './trSuffix';

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
        `Birbirine yakın durakları aynı güne toplamak zaman kazandırır. Detay sayfalarında her yerin hikâyesini, dönem bilgisini ve ziyaret önerilerini okuyarak ${total} kayıtlı mekân arasından ${city} rotanızı önceden hazırlayabilirsiniz.`,
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
        `Grouping nearby stops into the same day saves time. Detail pages include each site's story, period and visit tips, so you can prepare your ${city} route from ${total} listed sites in advance.`,
        `The Kitabe mobile app lets you browse on the map, save favourites and share your route.`,
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

function withExtended(
  base: string[],
  ctx: IntroCtx,
  locale: Locale,
  data: ListingFilterResult
): string[] {
  const manual = data.kind === 'city' ? cityGuideParagraphs(data.citySlug, locale) : [];
  const guide = manual.length > 0 ? manual : listingGuideParagraphs(data.groupKey, locale);
  // Rehber varsa şablon paragraflar tekrar gibi durur; yalnız giriş cümlesi kalır.
  if (guide.length > 0) return [...base.slice(0, 1), ...guide];
  return [...base, ...extendedIntroExtras(ctx, locale, data.kind)];
}

function cityIntro(ctx: IntroCtx, locale: Locale): string[] {
  const { city, total } = ctx;
  if (locale === 'tr') {
    return joinParagraphs([
      `${city}, Türkiye'nin kültürel miras açısından en zengin illerinden biridir. Kitabe'de ${city} için ${total} gezilecek yer; müzeler, tarihi yapılar, doğal alanlar ve arkeolojik noktalar tek rehberde toplanmıştır.`,
      `Yukarıdaki listede ${trGen(city)} öne çıkan duraklarını inceleyebilir, ilçe veya kategori filtreleriyle rotanızı daraltabilirsiniz. Her kayıt için konum, fotoğraf ve ziyaret ipuçları sunulur; harita üzerinden yakınınızdaki noktaları da keşfedebilirsiniz.`,
      `${city} gezisi planlarken müze günlerini, yürüyüş parkurlarını ve tarihi merkezleri bir arada değerlendirmenizi öneririz. Kitabe, ${trLoc(city)}ki kültürel mirası güncel ve erişilebilir biçimde sunar.`,
    ]);
  }
  if (locale === 'en') {
    return joinParagraphs([
      `${city} ranks among Turkey's richest destinations for cultural heritage. On Kitabe you will find ${total} places to visit in ${city} — museums, historic buildings, natural sites and archaeological landmarks in one guide.`,
      `Browse the highlights above, then narrow your route by district or category. Each entry includes location, photos and practical tips; use the map to discover nearby sites as you travel.`,
      `When planning a trip to ${city}, combine museum visits, old-town walks and outdoor stops for a balanced itinerary. Kitabe keeps ${city}'s heritage up to date and easy to explore.`,
    ]);
  }
  if (locale === 'ru') {
    return joinParagraphs([
      `${city} — один из самых богатых городов Турции с точки зрения культурного наследия. В Kitabe собрано ${total} мест для посещения: музеи, исторические здания, природные зоны и археологические объекты.`,
      `Выше — основные точки маршрута; фильтруйте по району или категории. У каждой записи есть фото, расположение и советы для визита.`,
      `Планируя поездку в ${city}, сочетайте музеи, прогулки по старому городу и природные остановки. Kitabe помогает открыть наследие ${city} в удобном формате.`,
    ]);
  }
  if (locale === 'de') {
    return joinParagraphs([
      `${city} gehört zu den Regionen der Türkei mit dem reichsten kulturellen Erbe. Auf Kitabe finden Sie ${total} Sehenswürdigkeiten in ${city} – Museen, historische Bauwerke, Naturgebiete und archäologische Stätten in einem Reiseführer.`,
      `Sehen Sie sich oben die Höhepunkte an und grenzen Sie Ihre Route nach Bezirk oder Kategorie ein. Jeder Eintrag enthält Lage, Fotos und praktische Tipps; über die Karte entdecken Sie Orte in Ihrer Nähe.`,
      `Kombinieren Sie bei der Planung Ihrer Reise nach ${city} Museumsbesuche, Altstadtspaziergänge und Ausflüge in die Natur. Kitabe hält das Kulturerbe von ${city} aktuell und leicht zugänglich.`,
    ]);
  }
  if (locale === 'es') {
    return joinParagraphs([
      `${city} es uno de los destinos de Turquía con mayor patrimonio cultural. En Kitabe encontrará ${total} lugares para visitar en ${city}: museos, edificios históricos, espacios naturales y sitios arqueológicos en una sola guía.`,
      `Consulte los lugares destacados arriba y acote su ruta por distrito o categoría. Cada ficha incluye ubicación, fotos y consejos prácticos; use el mapa para descubrir sitios cercanos.`,
      `Al planificar un viaje a ${city}, combine museos, paseos por el casco antiguo y paradas al aire libre. Kitabe mantiene actualizado y accesible el patrimonio de ${city}.`,
    ]);
  }
  if (locale === 'ja') {
    return joinParagraphs([
      `${city}はトルコでも特に文化遺産が豊かな地域のひとつです。Kitabeでは${city}の見どころ${total}件を、博物館、歴史的建造物、自然スポット、遺跡までひとつのガイドにまとめています。`,
      `上の一覧で主なスポットを確認し、地区やカテゴリーで絞り込んでルートを決めましょう。各スポットには位置情報、写真、見学のヒントがあり、地図から近くの見どころも探せます。`,
      `${city}を旅するなら、博物館、旧市街の散策、自然の中の立ち寄り先を組み合わせるのがおすすめです。Kitabeは${city}の文化遺産を最新の情報でわかりやすく紹介します。`,
    ]);
  }
  return joinParagraphs([
    `يُعدّ ${city} من أغنى مدن تركيا من حيث التراث الثقافي. في Kitabe تجد ${total} مكاناً للزيارة: متاحف ومبانٍ تاريخية ومناطق طبيعية ومواقع أثرية.`,
    `استعرض القائمة أعلاه وضيّق البحث حسب الحي أو الفئة. كل مكان يتضمن موقعاً وصوراً ونصائح للزيارة.`,
    `عند التخطيط لرحلة إلى ${city}، اجمع بين المتاحف والمشي في البلدة القديمة والمحطات الطبيعية. Kitabe يعرض تراث ${city} بشكل محدّث وسهل.`,
  ]);
}

function districtIntro(ctx: IntroCtx, locale: Locale): string[] {
  const { city, district, total } = ctx;
  if (!district) return cityIntro(ctx, locale);
  if (locale === 'tr') {
    return joinParagraphs([
      `${district}, ${city} ilinde gezilecek yerler açısından öne çıkan ilçelerden biridir. Bu sayfada ${district} sınırları içindeki ${total} kültürel miras noktası listelenmiştir.`,
      `${district} bölgesinde tarihi yapılar, müzeler, dini mimari ve doğal alanlar bir arada bulunabilir. Yukarıdaki kartlardan ilginizi çeken durakları seçin; detay sayfalarında hikâye, konum ve ziyaret önerileri yer alır.`,
      `${city} ${district} rotası oluştururken yürüyüş mesafesindeki noktaları gruplamak zaman kazandırır. Kitabe haritasıyla ${trLoc(district)}ki yerleri sıralayabilir ve gezinizi adım adım planlayabilirsiniz.`,
    ]);
  }
  if (locale === 'en') {
    return joinParagraphs([
      `${district} is one of the most rewarding districts to explore in ${city}. This page lists ${total} cultural heritage sites within ${district}.`,
      `Historic quarters, museums, religious architecture and green spaces often sit side by side here. Pick cards above for photos, stories and visit tips.`,
      `Group nearby stops when building a ${district}, ${city} itinerary — Kitabe's map helps you order sites efficiently.`,
    ]);
  }
  if (locale === 'ru') {
    return joinParagraphs([
      `${district} — один из ключевых районов ${city} для путешественников. Здесь ${total} объектов культурного наследия.`,
      `Исторические кварталы, музеи и природные зоны часто соседствуют в ${district}. Выберите карточки выше для деталей и советов.`,
      `Составляя маршрут по ${district}, группируйте близкие точки — карта Kitabe упростит планирование.`,
    ]);
  }
  if (locale === 'de') {
    return joinParagraphs([
      `${district} ist einer der lohnendsten Bezirke in ${city}. Diese Seite listet ${total} Kulturerbestätten in ${district} auf.`,
      `Historische Viertel, Museen, religiöse Bauten und Grünflächen liegen hier oft dicht beieinander. Wählen Sie oben eine Karte für Fotos, Geschichte und Besuchstipps.`,
      `Fassen Sie nahe gelegene Orte zusammen, wenn Sie eine Route durch ${district} (${city}) planen – die Kitabe-Karte hilft Ihnen bei der Reihenfolge.`,
    ]);
  }
  if (locale === 'es') {
    return joinParagraphs([
      `${district} es uno de los distritos más interesantes de ${city}. Esta página reúne ${total} sitios del patrimonio cultural de ${district}.`,
      `Barrios históricos, museos, arquitectura religiosa y zonas verdes suelen estar muy cerca entre sí. Elija una tarjeta arriba para ver fotos, historia y consejos de visita.`,
      `Agrupe las paradas cercanas al planificar una ruta por ${district} (${city}); el mapa de Kitabe le ayuda a ordenarlas.`,
    ]);
  }
  if (locale === 'ja') {
    return joinParagraphs([
      `${district}は${city}の中でも見どころの多い地区です。このページでは${district}にある文化遺産${total}件を紹介しています。`,
      `歴史地区、博物館、宗教建築、緑地が近くに集まっていることも多いエリアです。上のカードから写真、歴史、見学のヒントを確認できます。`,
      `${city}・${district}のルートを組むときは、近いスポットをまとめると効率的です。Kitabeの地図で順番を決めましょう。`,
    ]);
  }
  return joinParagraphs([
    `يُعدّ ${district} من أبرز أحياء ${city} للزيارة. هذه الصفحة تضم ${total} موقعاً للتراث الثقافي.`,
    `تتجاور في ${district} غالباً المباني التاريخية والمتاحف والمساحات الخضراء. اختر البطاقات أعلاه للتفاصيل.`,
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
        `${category} meraklıları için ${trLoc(city)} farklı dönemlere ait örnekler bir arada sunulur; her kayıt konum ve kısa bilgi içerir.`,
      `Rotanızı ${city} sınırları içinde planlarken yukarıdaki yerleri sırayla veya haritaya göre ziyaret edebilirsiniz. Kitabe, ${city} ${category} rehberini düzenli olarak günceller.`,
    ]);
  }
  if (locale === 'en') {
    return joinParagraphs([
      `${city} has ${total} listed places in the ${category} category. This page gathers them in one searchable guide.`,
      hint ||
        `Highlights across ${city} show how this theme appears in different periods; each entry includes location and context.`,
      `Plan your ${city} route with the list above or use the map to visit ${category} sites in a logical order. Kitabe keeps this ${city} guide current.`,
    ]);
  }
  if (locale === 'ru') {
    return joinParagraphs([
      `В ${city} в категории «${category}» — ${total} объектов. Страница объединяет их в одном справочнике.`,
      hint || `В ${city} представлены разные эпохи этой темы; у каждой записи есть расположение.`,
      `Составьте маршрут по ${city} с помощью списка или карты Kitabe.`,
    ]);
  }
  if (locale === 'de') {
    return joinParagraphs([
      `In ${city} gibt es ${total} Orte in der Kategorie „${category}“. Diese Seite fasst sie in einem übersichtlichen Reiseführer zusammen.`,
      hint || `Die Beispiele in ${city} zeigen dieses Thema aus verschiedenen Epochen; jeder Eintrag enthält Lage und Hintergrund.`,
      `Planen Sie Ihre Route in ${city} mit der Liste oben oder besuchen Sie die Orte über die Karte in sinnvoller Reihenfolge. Kitabe hält diesen Reiseführer aktuell.`,
    ]);
  }
  if (locale === 'es') {
    return joinParagraphs([
      `${city} cuenta con ${total} lugares en la categoría «${category}». Esta página los reúne en una sola guía.`,
      hint || `Los ejemplos de ${city} muestran este tema en distintas épocas; cada ficha incluye ubicación y contexto.`,
      `Planifique su ruta por ${city} con la lista de arriba o use el mapa para visitar los lugares en un orden lógico. Kitabe mantiene esta guía actualizada.`,
    ]);
  }
  if (locale === 'ja') {
    return joinParagraphs([
      `${city}には「${category}」カテゴリーのスポットが${total}件あります。このページではそれらをひとつのガイドにまとめています。`,
      hint || `${city}では、さまざまな時代のスポットからこのテーマをたどれます。各スポットに位置情報と解説があります。`,
      `上の一覧や地図を使って、${city}のスポットを効率よく巡るルートを立てましょう。Kitabeはこのガイドを随時更新しています。`,
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
        `${district} çevresinde ${category} örnekleri hem yerel tarih hem de mimari açıdan önem taşır; yukarıda en çok ziyaret edilen durakları bulabilirsiniz.`,
      `${district} rotanızı ${category} temasıyla planlarken yakın durakları bir günde birleştirmek mümkündür. Detay sayfalarından hikâyeleri okuyun, haritadan konumları kontrol edin.`,
    ]);
  }
  if (locale === 'en') {
    return joinParagraphs([
      `In ${district}, ${city}, there are ${total} places in the ${category} category. This focused list helps you explore one neighbourhood theme at a time.`,
      hint ||
        `${category} sites in ${district} reflect local history and architecture; browse the cards above for the most visited stops.`,
      `Combine nearby entries into a single-day ${district} walk; read stories on detail pages and check locations on the map.`,
    ]);
  }
  if (locale === 'ru') {
    return joinParagraphs([
      `В районе ${district} (${city}) — ${total} объектов категории «${category}». Узкий список для целенаправленной прогулки.`,
      hint || `В ${district} эта тема раскрывает местную историю; выше — основные точки.`,
      `Объедините близкие остановки в маршрут на день; детали — на страницах объектов и на карте.`,
    ]);
  }
  if (locale === 'de') {
    return joinParagraphs([
      `In ${district} (${city}) gibt es ${total} Orte in der Kategorie „${category}“. Diese gezielte Liste hilft Ihnen, ein Thema in einem Bezirk zu erkunden.`,
      hint || `Die Orte der Kategorie „${category}“ in ${district} spiegeln lokale Geschichte und Architektur wider; oben finden Sie die meistbesuchten Stationen.`,
      `Verbinden Sie nahe gelegene Orte zu einem Tagesausflug durch ${district}; Geschichten finden Sie auf den Detailseiten, die Lage auf der Karte.`,
    ]);
  }
  if (locale === 'es') {
    return joinParagraphs([
      `En ${district} (${city}) hay ${total} lugares en la categoría «${category}». Esta lista le ayuda a explorar un tema concreto en un mismo distrito.`,
      hint || `Los lugares de «${category}» en ${district} reflejan la historia y la arquitectura locales; arriba encontrará las paradas más visitadas.`,
      `Combine las paradas cercanas en un paseo de un día por ${district}; lea la historia en cada ficha y consulte la ubicación en el mapa.`,
    ]);
  }
  if (locale === 'ja') {
    return joinParagraphs([
      `${city}・${district}には「${category}」カテゴリーのスポットが${total}件あります。ひとつの地区でテーマを絞って巡りたい方に便利な一覧です。`,
      hint || `${district}の「${category}」スポットからは、地域の歴史や建築を知ることができます。上に人気のスポットを掲載しています。`,
      `近いスポットを組み合わせれば、${district}を1日で巡るルートが作れます。詳細ページで歴史を読み、地図で場所を確認しましょう。`,
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
  return withExtended(base, ctx, locale, data);
}

export function listingIntroText(data: ListingFilterResult, locale: Locale): string {
  return listingIntroParagraphs(data, locale).join('\n\n');
}
