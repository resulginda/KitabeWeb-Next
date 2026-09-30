import type { Locale } from '../listings';

export type GuideSection = { heading: string; paragraphs: string[] };

export type HomeGuide = { title: string; sections: GuideSection[] };

export const HOME_GUIDE: Record<Locale, HomeGuide> = {
  tr: {
    title: 'Türkiye’de kültür mirası gezisi: pratik rehber',
    sections: [
      {
        heading: 'Nereden başlamalı?',
        paragraphs: [
          'Türkiye’yi bir haftada “görmek” mümkün değil; mesafeler uzun ve her bölgenin kendine ait bir tarihi var. En iyi sonuç, bir ya da iki bölge seçip orada acele etmeden dolaşmaktan çıkıyor. İlk kez geliyorsanız İstanbul ve Kapadokya klasik bir başlangıç. Antik kentleri seviyorsanız Ege ve Likya kıyısı, insanlık tarihinin en eski katmanlarını merak ediyorsanız Şanlıurfa ve Mardin daha doğru bir tercih olur.',
          'Kitabe’de her şehrin sayfası ilçeye ve kategoriye göre filtrelenebiliyor. Örneğin Antalya’da yalnızca antik kentleri, İstanbul’da yalnızca müzeleri listeleyip rotanızı buna göre kurabilirsiniz.',
        ],
      },
      {
        heading: 'Hangi mevsimde nereye?',
        paragraphs: [
          'İlkbahar (nisan–mayıs) ve sonbahar (eylül–ekim) Ege, Akdeniz ve Güneydoğu için en iyi aylar. Temmuz ve ağustosta Şanlıurfa’da ya da Efes’te öğle saatlerinde gezmek gerçekten zor; sıcaklık 40 dereceyi aşabiliyor. Yazın serinlemek isteyenler için Karadeniz yaylaları ve Doğu Anadolu’nun yüksek kesimleri iyi bir seçenek.',
          'Kış, müzeler ve şehir gezileri için uygun. İstanbul, Ankara, Konya ve Gaziantep’teki büyük müzeler hava ne olursa olsun gezilebiliyor. Karla kaplı Kapadokya ve Kars ise kışın ayrıca görülmeye değer.',
        ],
      },
      {
        heading: 'Müzekart ve giriş ücretleri',
        paragraphs: [
          'Kültür ve Turizm Bakanlığı’na bağlı müze ve ören yerleri için Türkiye’de yaşayanlara yönelik Müzekart bir yıl boyunca geçerli. Yabancı ziyaretçiler için ise “Museum Pass” adıyla bölgesel ve ülke genelinde geçerli kartlar satılıyor. Birkaç büyük ören yeri gezecekseniz kart çoğu zaman tek tek bilet almaktan daha ekonomik oluyor.',
          'Ücretler ve ziyaret saatleri yıl içinde değişebiliyor, yaz ve kış saatleri de farklı. Gitmeden önce resmi kaynaklardan kontrol etmenizi öneririz. Özel müzeler ve vakıf müzeleri kart kapsamı dışında kalabilir.',
        ],
      },
      {
        heading: 'UNESCO Dünya Mirası alanları',
        paragraphs: [
          'Türkiye’nin UNESCO Dünya Mirası Listesi’nde 20’yi aşkın alanı var: Göreme ve Kapadokya, İstanbul’un tarihi alanları, Divriği Ulu Camii ve Darüşşifası, Hattuşa, Nemrut Dağı, Hierapolis-Pamukkale, Xanthos-Letoon, Safranbolu, Troya, Selimiye Camii, Çatalhöyük, Bursa ve Cumalıkızık, Bergama, Efes, Ani, Afrodisias, Diyarbakır Surları ve Hevsel Bahçeleri, Göbeklitepe, Arslantepe ve Gordion bunlardan bazıları. Geçici listede ise onlarca aday alan bulunuyor.',
        ],
      },
      {
        heading: 'Ulaşım',
        paragraphs: [
          'Şehirler arası otobüs ağı neredeyse her ilçeye ulaşıyor; gece otobüsleri uzun mesafelerde zaman kazandırıyor. İstanbul, Ankara, Eskişehir ve Konya arasında hızlı tren var. Kapadokya için Kayseri ya da Nevşehir, Göbeklitepe için Şanlıurfa, Likya kıyısı için Dalaman ya da Antalya havalimanları en yakın giriş noktaları.',
          'Likya kıyısı ve Karadeniz yaylaları gibi dağınık rotalarda araç kiralamak işinizi epey kolaylaştırır. Toplu taşıma var ama seferler seyrek.',
        ],
      },
      {
        heading: 'Ziyaret ederken',
        paragraphs: [
          'Camiler namaz vakitleri dışında ziyarete açık. Omuzları ve dizleri kapatan kıyafet, kadınlar için de başörtüsü gerekiyor; çoğu büyük camide girişte örtü veriliyor. Ören yerlerinde gölge az: şapka, su ve rahat ayakkabı şart.',
          'Efes, Hierapolis ya da Ani gibi büyük alanları sabah açılışta veya kapanışa yakın gezmek hem sıcaktan hem kalabalıktan kurtarır. Kalıntıların üzerine çıkmamak, mozaiklere dokunmamak ve drone uçurmadan önce izin almak da unutulmaması gerekenler arasında.',
        ],
      },
      {
        heading: 'Kitabe’yi nasıl kullanırsınız?',
        paragraphs: [
          'Kitabe, Türkiye’deki kültürel miras noktalarını tek yerde toplayan bir gezi rehberi. Her yer için konum, fotoğraf, kısa tarihçe ve ziyaret ipuçları bulunuyor. Sayfanın başındaki arama kutusuna bir şehir, ilçe ya da yer adı yazarak başlayabilir, şehir sayfalarında ilçe ve kategori filtreleriyle listeyi daraltabilirsiniz. Mobil uygulamada aynı içerik harita üzerinde; yakınınızdaki yerleri görmek ve rota oluşturmak için uygulamayı kullanabilirsiniz.',
        ],
      },
    ],
  },
  en: {
    title: 'Cultural heritage travel in Turkey: a practical guide',
    sections: [
      {
        heading: 'Where to start',
        paragraphs: [
          'You can’t “do” Turkey in a week: distances are long and every region has its own history. You’ll get the most out of a trip by picking one or two regions and exploring them without rushing. For a first visit, Istanbul and Cappadocia are the classic start. If you love ancient cities, go for the Aegean and the Lycian coast; if you’re curious about the oldest layers of human history, Şanlıurfa and Mardin are the better choice.',
          'Every city page on Kitabe can be filtered by district and category. You can, for example, list only the ancient sites in Antalya or only the museums in Istanbul and build your route from there.',
        ],
      },
      {
        heading: 'When to go where',
        paragraphs: [
          'Spring (April–May) and autumn (September–October) are the best months for the Aegean, the Mediterranean and the southeast. In July and August, sightseeing at midday in Şanlıurfa or Ephesus is genuinely hard, with temperatures that can pass 40°C. To stay cool in summer, head for the Black Sea highlands or the high country of Eastern Anatolia.',
          'Winter suits museums and city breaks. The big museums in Istanbul, Ankara, Konya and Gaziantep work in any weather, and Cappadocia and Kars under snow are worth seeing in their own right.',
        ],
      },
      {
        heading: 'Museum passes and tickets',
        paragraphs: [
          'Museums and archaeological sites run by the Ministry of Culture and Tourism can be visited with a Museum Pass. Regional passes and a nationwide pass are sold to foreign visitors, while residents of Turkey can buy the annual Müzekart. If you plan to see several major sites, a pass is usually cheaper than buying single tickets.',
          'Prices and opening hours change during the year, and summer and winter hours differ, so check official sources before you go. Private and foundation museums may not be covered.',
        ],
      },
      {
        heading: 'UNESCO World Heritage Sites',
        paragraphs: [
          'Turkey has more than 20 sites on the UNESCO World Heritage List, including Göreme and Cappadocia, the historic areas of Istanbul, the Great Mosque and Hospital of Divriği, Hattusa, Mount Nemrut, Hierapolis-Pamukkale, Xanthos-Letoon, Safranbolu, Troy, the Selimiye Mosque, Çatalhöyük, Bursa and Cumalıkızık, Pergamon, Ephesus, Ani, Aphrodisias, the Diyarbakır Fortress and Hevsel Gardens, Göbeklitepe, Arslantepe and Gordion. Dozens more are on the tentative list.',
        ],
      },
      {
        heading: 'Getting around',
        paragraphs: [
          'Intercity buses reach almost every town, and overnight buses save time on long distances. High-speed trains link Istanbul, Ankara, Eskişehir and Konya. The nearest airports are Kayseri or Nevşehir for Cappadocia, Şanlıurfa for Göbeklitepe, and Dalaman or Antalya for the Lycian coast.',
          'On spread-out routes such as the Lycian coast or the Black Sea highlands, renting a car makes things much easier. Public transport exists, but services are infrequent.',
        ],
      },
      {
        heading: 'When you visit',
        paragraphs: [
          'Mosques are open to visitors outside prayer times. Cover your shoulders and knees, and women should cover their hair; most large mosques lend scarves at the entrance. Shade is scarce at archaeological sites, so bring a hat, water and comfortable shoes.',
          'Visiting big sites such as Ephesus, Hierapolis or Ani at opening time or close to closing spares you both the heat and the crowds. Don’t climb on ruins or touch mosaics, and get permission before flying a drone.',
        ],
      },
      {
        heading: 'How to use Kitabe',
        paragraphs: [
          'Kitabe is a travel guide that gathers Turkey’s cultural heritage sites in one place. Each entry has a location, photos, a short history and visiting tips. Start by typing a city, district or place name into the search box at the top of this page, then narrow the list with district and category filters on each city page. The mobile app shows the same content on a map, so you can see what’s near you and plan a route.',
        ],
      },
    ],
  },
  ru: {
    title: 'Путешествие по культурному наследию Турции: практические советы',
    sections: [
      {
        heading: 'С чего начать',
        paragraphs: [
          'За неделю «увидеть» Турцию невозможно: расстояния большие, и у каждого региона своя история. Лучше выбрать один-два региона и изучать их без спешки. Для первой поездки классика — Стамбул и Каппадокия. Любителям античности подойдут Эгейское и Ликийское побережья, а тем, кого интересуют древнейшие страницы истории человечества, — Шанлыурфа и Мардин.',
          'Страницы городов на Kitabe можно фильтровать по районам и категориям: например, выбрать только античные города Анталии или только музеи Стамбула и строить маршрут по ним.',
        ],
      },
      {
        heading: 'Куда и когда ехать',
        paragraphs: [
          'Весна (апрель–май) и осень (сентябрь–октябрь) — лучшее время для Эгейского и Средиземноморского побережий и юго-востока. В июле и августе осматривать Шанлыурфу или Эфес в полдень очень тяжело: температура может превышать 40 °C. Летом прохладнее на черноморских плато и в высокогорьях Восточной Анатолии.',
          'Зима подходит для музеев и городских поездок. Крупные музеи Стамбула, Анкары, Коньи и Газиантепа можно посещать в любую погоду, а заснеженные Каппадокия и Карс заслуживают отдельной поездки.',
        ],
      },
      {
        heading: 'Музейные карты и билеты',
        paragraphs: [
          'В музеи и на археологические объекты Министерства культуры и туризма иностранцы могут ходить по карте Museum Pass — есть региональные и общенациональная. Жители Турции покупают годовую карту Müzekart. Если вы планируете несколько крупных объектов, карта обычно выгоднее отдельных билетов.',
          'Цены и часы работы меняются в течение года, летнее и зимнее расписание различается — проверяйте официальные источники перед поездкой. Частные музеи и музеи фондов могут не входить в карту.',
        ],
      },
      {
        heading: 'Объекты Всемирного наследия ЮНЕСКО',
        paragraphs: [
          'В списке Всемирного наследия ЮНЕСКО более 20 объектов Турции, среди них Гёреме и Каппадокия, исторические районы Стамбула, Великая мечеть и больница Дивриги, Хаттуса, гора Немрут, Иераполис-Памуккале, Ксанф-Летоон, Сафранболу, Троя, мечеть Селимие, Чатал-Хююк, Бурса и Джумалыкызык, Пергам, Эфес, Ани, Афродисиас, крепость Диярбакыра и сады Хевсель, Гёбекли-Тепе, Арслантепе и Гордион. Ещё десятки объектов находятся в предварительном списке.',
        ],
      },
      {
        heading: 'Транспорт',
        paragraphs: [
          'Междугородние автобусы доходят почти до каждого города, ночные рейсы экономят время на дальних расстояниях. Скоростные поезда связывают Стамбул, Анкару, Эскишехир и Конью. Ближайшие аэропорты: Кайсери или Невшехир для Каппадокии, Шанлыурфа для Гёбекли-Тепе, Даламан или Анталия для Ликии.',
          'На разбросанных маршрутах — Ликийское побережье, черноморские плато — удобнее арендовать машину: общественный транспорт есть, но ходит редко.',
        ],
      },
      {
        heading: 'Во время посещения',
        paragraphs: [
          'Мечети открыты для туристов вне времени намаза. Нужна одежда, закрывающая плечи и колени, женщинам — платок; в крупных мечетях его обычно выдают на входе. На раскопках мало тени: шляпа, вода и удобная обувь обязательны.',
          'Большие объекты вроде Эфеса, Иераполиса или Ани лучше осматривать к открытию или ближе к закрытию — так меньше жары и людей. Не забирайтесь на руины, не трогайте мозаики и получайте разрешение перед полётом дрона.',
        ],
      },
      {
        heading: 'Как пользоваться Kitabe',
        paragraphs: [
          'Kitabe — путеводитель, собравший объекты культурного наследия Турции в одном месте. У каждого объекта есть расположение, фотографии, краткая история и советы для посещения. Начните с поиска вверху страницы — введите город, район или название места, — а на страницах городов сужайте список фильтрами. В мобильном приложении тот же контент показан на карте: можно найти места рядом и составить маршрут.',
        ],
      },
    ],
  },
  ar: {
    title: 'السياحة التراثية في تركيا: دليل عملي',
    sections: [
      {
        heading: 'من أين تبدأ؟',
        paragraphs: [
          'لا يمكن «رؤية» تركيا في أسبوع؛ فالمسافات طويلة ولكل منطقة تاريخها الخاص. أفضل ما تفعله هو اختيار منطقة أو منطقتين والتجول فيهما دون عجلة. في الزيارة الأولى تُعد إسطنبول وكابادوكيا بداية كلاسيكية. وإن كنت تحب المدن الأثرية فاختر بحر إيجة والساحل الليقي، أما إن كنت مهتماً بأقدم طبقات التاريخ البشري فشانلي أورفا وماردين خيار أنسب.',
          'يمكن تصفية صفحة كل مدينة في Kitabe حسب الحي والفئة؛ فتعرض مثلاً المواقع الأثرية فقط في أنطاليا أو المتاحف فقط في إسطنبول، وتبني مسارك على أساسها.',
        ],
      },
      {
        heading: 'متى تذهب وإلى أين؟',
        paragraphs: [
          'الربيع (أبريل–مايو) والخريف (سبتمبر–أكتوبر) أفضل الأشهر لبحر إيجة والبحر المتوسط والجنوب الشرقي. في يوليو وأغسطس يصعب التجول ظهراً في شانلي أورفا أو أفسس، إذ قد تتجاوز الحرارة 40 درجة. ولمن يريد الانتعاش صيفاً، فهضاب البحر الأسود ومرتفعات شرق الأناضول خيار جيد.',
          'الشتاء مناسب للمتاحف ورحلات المدن؛ فالمتاحف الكبرى في إسطنبول وأنقرة وقونية وغازي عنتاب تُزار في أي طقس، وكابادوكيا وقارص تحت الثلج تستحقان الزيارة بحد ذاتهما.',
        ],
      },
      {
        heading: 'بطاقات المتاحف والتذاكر',
        paragraphs: [
          'يمكن للزوار الأجانب دخول المتاحف والمواقع الأثرية التابعة لوزارة الثقافة والسياحة ببطاقة «Museum Pass»، وهي متوفرة بنسخ إقليمية ونسخة تشمل البلاد كلها، بينما يشتري المقيمون في تركيا بطاقة «Müzekart» السنوية. إن كنت ستزور عدة مواقع كبرى فالبطاقة غالباً أوفر من التذاكر المنفردة.',
          'تتغير الأسعار ومواعيد الزيارة خلال العام، وتختلف مواعيد الصيف عن الشتاء، لذا ننصح بالتحقق من المصادر الرسمية قبل الذهاب. وقد لا تشمل البطاقة المتاحف الخاصة ومتاحف الأوقاف.',
        ],
      },
      {
        heading: 'مواقع التراث العالمي لليونسكو',
        paragraphs: [
          'لدى تركيا أكثر من 20 موقعاً على قائمة التراث العالمي لليونسكو، منها غوريمة وكابادوكيا، والمناطق التاريخية في إسطنبول، وجامع ديفريغي الكبير ومستشفاه، وحاتوشا، وجبل نمرود، وهيرابوليس-باموكالي، وزانثوس-ليتون، وسفرانبولو، وطروادة، وجامع السليمية، وتشاتال هويوك، وبورصة وجومالي كيزيك، وبرغامة، وأفسس، وآني، وأفروديسياس، وقلعة ديار بكر وحدائق هفسل، وغوبكلي تبه، وأرسلان تبه، وغورديون. وعشرات المواقع الأخرى على القائمة المؤقتة.',
        ],
      },
      {
        heading: 'التنقل',
        paragraphs: [
          'تصل الحافلات بين المدن إلى كل بلدة تقريباً، والحافلات الليلية توفر الوقت في المسافات الطويلة. ويربط القطار السريع إسطنبول وأنقرة وإسكي شهير وقونية. أقرب المطارات: قيصري أو نوشهير لكابادوكيا، وشانلي أورفا لغوبكلي تبه، ودالامان أو أنطاليا للساحل الليقي.',
          'في المسارات المتفرقة مثل الساحل الليقي وهضاب البحر الأسود يسهّل استئجار سيارة الأمور كثيراً؛ فالمواصلات العامة موجودة لكنها قليلة الرحلات.',
        ],
      },
      {
        heading: 'أثناء الزيارة',
        paragraphs: [
          'المساجد مفتوحة للزوار خارج أوقات الصلاة، ويلزم لباس يغطي الكتفين والركبتين، وغطاء رأس للنساء، وتوفر معظم المساجد الكبرى أغطية عند المدخل. الظل قليل في المواقع الأثرية، فالقبعة والماء والحذاء المريح ضرورية.',
          'زيارة المواقع الكبيرة مثل أفسس وهيرابوليس وآني عند الافتتاح أو قرب الإغلاق تجنّبك الحر والزحام. لا تتسلق الأطلال ولا تلمس الفسيفساء، واحصل على إذن قبل تطيير طائرة مسيّرة.',
        ],
      },
      {
        heading: 'كيف تستخدم Kitabe؟',
        paragraphs: [
          'Kitabe دليل سفر يجمع مواقع التراث الثقافي في تركيا في مكان واحد، ولكل موقع الموقع الجغرافي والصور ونبذة تاريخية ونصائح للزيارة. ابدأ بكتابة اسم مدينة أو حي أو مكان في مربع البحث أعلى الصفحة، ثم ضيّق القائمة بفلاتر الحي والفئة في صفحات المدن. ويعرض التطبيق المحمول المحتوى نفسه على الخريطة لتكتشف ما حولك وتخطط لمسارك.',
        ],
      },
    ],
  },
};
