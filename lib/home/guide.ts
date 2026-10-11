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
  de: {
    title: 'Kulturelles Erbe in der Türkei: Ein praktischer Reiseführer',
    sections: [
      {
        heading: 'Wo Sie anfangen sollten',
        paragraphs: [
          'Die Türkei lässt sich nicht in einer Woche „erledigen“: Die Entfernungen sind groß und jede Region hat ihre eigene Geschichte. Am meisten von einer Reise haben Sie, wenn Sie ein oder zwei Regionen auswählen und diese ohne Eile erkunden. Für einen Erstbesuch sind Istanbul und Kappadokien der klassische Einstieg. Wenn Sie antike Städte lieben, entscheiden Sie sich für die Ägäis und die lykische Küste; wenn Sie die ältesten Schichten der Menschheitsgeschichte neugierig machen, sind Şanlıurfa und Mardin die bessere Wahl.',
          'Jede Stadtseite auf Kitabe kann nach Stadtteilen und Kategorien gefiltert werden. Sie können beispielsweise nur die antiken Stätten in Antalya oder nur die Museen in Istanbul auflisten lassen und darauf basierend Ihre Route zusammenstellen.',
        ],
      },
      {
        heading: 'Wann Sie wohin reisen sollten',
        paragraphs: [
          'Der Frühling (April–Mai) und der Herbst (September–Oktober) sind die besten Monate für die Ägäis, das Mittelmeer und den Südosten. Im Juli und August ist eine Besichtigung in Şanlıurfa oder Ephesus zur Mittagszeit bei Temperaturen, die 40 °C übersteigen können, wirklich beschwerlich. Um im Sommer einen kühlen Kopf zu bewahren, zieht es Sie am besten in das schwarzmeerische Hochland oder in die Hochlagen Ostanatoliens.',
          'Der Winter eignet sich gut für Museen und Städtereisen. Die großen Museen in Istanbul, Ankara, Konya und Gaziantep funktionieren bei jedem Wetter, und Kappadokien sowie Kars unter Schnee sind für sich genommen eine Reise wert.',
        ],
      },
      {
        heading: 'Museumspässe und Eintrittskarten',
        paragraphs: [
          'Museen und archäologische Stätten des Ministeriums für Kultur und Tourismus können mit einem Museumspass besucht werden. Für internationale Besucher werden Regionalpässe und ein landesweiter Pass angeboten, während in der Türkei ansässige Personen die jährliche Müzekart erwerben können. Wenn Sie planen, mehrere bedeutende Stätten zu besuchen, ist ein Pass in der Regel günstiger als Einzeltickets.',
          'Preise und Öffnungszeiten ändern sich im Laufe des Jahres, zudem unterscheiden sich Sommer- und Winteröffnungszeiten. Bitte prüfen Sie daher vor Ihrer Reise die offiziellen Quellen. Private Museen und Stiftungsmuseen sind möglicherweise nicht enthalten.',
        ],
      },
      {
        heading: 'UNESCO-Weltkulturerbestätten',
        paragraphs: [
          'Die Türkei verfügt über mehr als 20 Stätten auf der UNESCO-Welterbeliste, darunter Göreme und Kappadokien, die historischen Bereiche von Istanbul, die Große Moschee und das Hospital von Divriği, Hattusa, der Nemrut-Dag, Hierapolis-Pamukkale, Xanthos-Letoon, Safranbolu, Troja, die Selimiye-Moschee, Çatalhöyük, Bursa und Cumalıkızık, Pergamon, Ephesus, Ani, Aphrodisias, die Festung von Diyarbakır und die Hevsel-Gärten, Göbeklitepe, Arslantepe und Gordion. Dutzende weitere befinden sich auf der Tentativliste.',
        ],
      },
      {
        heading: 'Unterwegs vor Ort',
        paragraphs: [
          'Fernbusse erreichen fast jede Stadt, und Nachtbusse sparen bei langen Strecken wertvolle Zeit. Hochgeschwindigkeitszüge verbinden Istanbul, Ankara, Eskişehir und Konya. Die nächstgelegenen Flughäfen sind Kayseri oder Nevşehir für Kappadokien, Şanlıurfa für Göbeklitepe sowie Dalaman oder Antalya für die lykische Küste.',
          'Auf weitläufigen Routen wie der lykischen Küste oder dem schwarzmeerischen Hochland erleichtert das Mieten eines Autos die Dinge erheblich. Es gibt zwar öffentliche Verkehrsmittel, jedoch fahren diese selten.',
        ],
      },
      {
        heading: 'Ihr Besuch',
        paragraphs: [
          'Moscheen sind außerhalb der Gebetszeiten für Besucher geöffnet. Bedecken Sie Ihre Schultern und Knie, und Frauen sollten zudem ihr Haar bedecken; die meisten großen Moscheen verleihen am Eingang Tücher. An archäologischen Stätten gibt es kaum Schatten, bringen Sie daher unbedingt eine Kopfbedeckung, Wasser und bequeme Schuhe mit.',
          'Wenn Sie große Stätten wie Ephesos, Hierapolis oder Ani zur Öffnungszeit oder kurz vor der Schließung besuchen, ersparen Sie sich sowohl die Hitze als auch die Menschenmassen. Klettern Sie nicht auf Ruinen und berühren Sie keine Mosaike. Holen Sie vor dem Flug einer Drohne unbedingt eine Genehmigung ein.',
        ],
      },
      {
        heading: 'So verwenden Sie Kitabe',
        paragraphs: [
          'Kitabe ist ein Reiseführer, der das kulturelle Erbe der Türkei an einem Ort vereint. Jeder Eintrag enthält einen Standort, Fotos, eine kurze Geschichte sowie Besuchertipps. Geben Sie einfach eine Stadt, einen Bezirk oder einen Ort in das Suchfeld oben auf dieser Seite ein und grenzen Sie die Liste anschließend auf den jeweiligen Stadtseiten mithilfe von Bezirks- und Kategoriefiltern ein. Die mobile App zeigt dieselben Inhalte auf einer Karte an, sodass Sie sehen können, was sich in Ihrer Nähe befindet, und eine Route planen können.',
        ],
      },
    ],
  },
  es: {
    title: 'Viajes de patrimonio cultural en Turquía: una guía práctica',
    sections: [
      {
        heading: 'Por dónde empezar',
        paragraphs: [
          'No es posible «hacer» Turquía en una semana: las distancias son largas y cada región tiene su propia historia. Aprovechará mejor su viaje si elige una o dos regiones y las explora sin prisas. Para una primera visita, Estambul y Capadocia son el punto de partida clásico. Si le encantan las ciudades antiguas, opte por la costa del Egeo y Licia; si siente curiosidad por las capas más antiguas de la historia humana, Şanlıurfa y Mardin son la mejor opción.',
          'Cada página de ciudad en Kitabe se puede filtrar por distrito y categoría. Puede, por ejemplo, listar solo los sitios antiguos en Antalya o solo los museos en Estambul y armar su itinerario a partir de ahí.',
        ],
      },
      {
        heading: 'Cuándo ir a cada lugar',
        paragraphs: [
          'La primavera (abril-mayo) y el otoño (septiembre-octubre) son los mejores meses para el Egeo, el Mediterráneo y el sureste. En julio y agosto, hacer turismo al mediodía en Şanlıurfa o Éfeso es verdaderamente difícil, con temperaturas que pueden superar los 40 °C. Para mantenerse fresco en verano, diríjase a las tierras altas del mar Negro o a las zonas elevadas de Anatolia Oriental.',
          'El invierno es ideal para museos y escapadas urbanas. Los grandes museos de Estambul, Ankara, Konya y Gaziantep funcionan con cualquier clima, y Capadocia y Kars bajo la nieve merecen ser visitados por derecho propio.',
        ],
      },
      {
        heading: 'Pases de museos y entradas',
        paragraphs: [
          'Los museos y yacimientos arqueológicos gestionados por el Ministerio de Cultura y Turismo se pueden visitar con un pase de museos (Museum Pass). Se venden pases regionales y un pase nacional a los visitantes extranjeros, mientras que los residentes en Turquía pueden comprar la Müzekart anual. Si planea visitar varios sitios importantes, un pase suele ser más económico que comprar entradas individuales.',
          'Los precios y los horarios de apertura cambian durante el año, y los horarios de verano e invierno difieren, por lo que debe consultar las fuentes oficiales antes de ir. Es posible que los museos privados y de fundaciones no estén incluidos.',
        ],
      },
      {
        heading: 'Patrimonio de la Humanidad por la UNESCO',
        paragraphs: [
          'Turquía cuenta con más de 20 sitios en la Lista del Patrimonio Mundial de la UNESCO, incluidos Göreme y Capadocia, las zonas históricas de Estambul, la Gran Mezquita y Hospital de Divriği, Hattusa, el monte Nemrut, Hierápolis-Pamukkale, Janto-Letooün, Safranbolu, Troya, la mezquita de Selimiye, Çatalhöyük, Bursa y Cumalıkızık, Pérgamo, Éfeso, Ani, Afrodisias, la fortaleza de Diyarbakır y los jardines de Hevsel, Göbeklitepe, Arslantepe y Gordion. Docenas más figuran en la lista indicativa.',
        ],
      },
      {
        heading: 'Cómo moverse',
        paragraphs: [
          'Los autobuses interurbanos llegan a casi todas las localidades, y los autobuses nocturnos ahorran tiempo en trayectos largos. Los trenes de alta velocidad conectan Estambul, Ankara, Eskişehir y Konya. Los aeropuertos más cercanos son Kayseri o Nevşehir para Capadocia, Şanlıurfa para Göbeklitepe, y Dalaman o Antalya para la costa de Licia.',
          'En rutas extensas como la costa de Licia o las tierras altas del mar Negro, alquilar un coche facilita mucho las cosas. El transporte público existe, pero la frecuencia es baja.',
        ],
      },
      {
        heading: 'Durante su visita',
        paragraphs: [
          'Las mezquitas están abiertas a los visitantes fuera de las horas de oración. Cubra sus hombros y rodillas, y las mujeres deben cubrirse el cabello; la mayoría de las mezquitas grandes prestan pañuelos en la entrada. La sombra es escasa en los yacimientos arqueológicos, así que lleve sombrero, agua y calzado cómodo.',
          'Visitar sitios grandes como Éfeso, Hierápolis o Ani a la hora de apertura o cerca del cierre le evita tanto el calor como las aglomeraciones. No se suba a las ruinas ni toque los mosaicos, y obtenga permiso antes de volar un dron.',
        ],
      },
      {
        heading: 'Cómo usar Kitabe',
        paragraphs: [
          'Kitabe es una guía de viaje que reúne los sitios del patrimonio cultural de Turquía en un solo lugar. Cada entrada cuenta con ubicación, fotos, una breve historia y consejos de visita. Comience escribiendo el nombre de una ciudad, distrito o lugar en el cuadro de búsqueda en la parte superior de esta página, luego filtre la lista con los filtros de distrito y categoría en la página de cada ciudad. La aplicación móvil muestra el mismo contenido en un mapa, para que pueda ver qué hay cerca de usted y planificar una ruta.',
        ],
      },
    ],
  },
  ja: {
    title: 'トルコの文化遺産旅行：実用ガイド',
    sections: [
      {
        heading: 'どこから始めるか',
        paragraphs: [
          '1週間でトルコをすべて見て回ることはできません。移動距離が長く、すべての地域に独自の歴史があるからです。旅行を最大限に楽しむには、1〜2つの地域を選び、急がずに探索することです。初めての訪問なら、イスタンブールとカッパドキアが王道のスタートです。古代都市が好きならエーゲ海やリュキア地方へ、人類の歴史の最も古い層に興味があるならシャンルウルファやマルディンがおすすめです。',
          'Kitabeの各都市ページでは、地区やカテゴリで絞り込みができます。たとえば、アンタルヤの古代遺跡だけ、あるいはイスタンブールの美術館だけを表示して、そこからルートを組み立てることができます。',
        ],
      },
      {
        heading: 'いつどこに行くべきか',
        paragraphs: [
          '春（4月〜5月）と秋（9月〜10月）は、エーゲ海、地中海、南東部を訪れるのに最適な月です。7月と8月には、シャンルウルファやエフェソスでの昼間の観光は気温が40°Cを超えることもあり、非常に過酷です。夏の暑さを避けるには、黒海地方の高地や東アナトリアの高原に向かいましょう。',
          '冬は美術館やシティブレイクに適しています。イスタンブール、アンカラ、コンヤ、ガズィアンテプの主要な美術館は天候に関係なく楽しめ、雪に覆われたカッパドキアやカルスはそれ自体が見る価値があります。',
        ],
      },
      {
        heading: 'ミュージアムパスとチケット',
        paragraphs: [
          '文化観光省が運営する美術館や遺跡は、ミュージアムパス（Museum Pass）を利用して見学できます。外国人観光客向けには地域パスや全国共通パスが販売されており、トルコ居住者は年間パスであるミュゼカルト（Müzekart）を購入できます。いくつかの主要な遺跡を見学する予定であれば、パスを購入するほうが通常は個別のチケットよりもお得です。',
          '料金や開館時間は年間を通じて変動し、夏季と冬季で時間が異なるため、お出かけ前に公式情報をご確認ください。私立や財団運営の美術館は対象外となる場合があります。',
        ],
      },
      {
        heading: 'ユネスコ世界遺産',
        paragraphs: [
          'トルコには、ギョレメとカッパドキア、イスタンブールの歴史地区、ディヴリーイの大モスクと病院、ハットゥシャ、ネムルート山、ヒエラポリス・パムッカレ、サントス・レトーン、サフランボル、トロイ、セリミエ・モスク、チャタルヒュユク、ブルサとジュマルクズク、ペルガモン、エフェソス、アニ、アフロディシアス、ディヤルバクル要塞とヘヴセル庭園、ギョベクリテペ、アースランテペ、ゴルディオンなど、20件以上のユネスコ世界遺産があります。さらに数十件が暫定リストに登録されています。',
        ],
      },
      {
        heading: '移動手段',
        paragraphs: [
          '都市間バスはほぼすべての町に網羅しており、夜行バスを利用すれば長距離移動の時間を節約できます。高速鉄道がイスタンブール、アンカラ、エスキシェヒール、コンヤを結んでいます。最寄りの空港は、カッパドキアならカイセリまたはネヴシェヒル、ギョベクリテペならシャンルウルファ、リュキア海岸ならダラマンまたはアンタルヤです。',
          'リュキア海岸や黒海高地などの広がりのあるルートでは、レンタカーを利用すると移動がはるかに楽になります。公共交通機関もありますが、運行本数は多くありません。',
        ],
      },
      {
        heading: '訪問時の注意点',
        paragraphs: [
          'モスクは礼拝時間外であれば見学者に開放されています。肩と膝を隠し、女性は髪を覆うようにしてください。ほとんどの大きなモスクでは入口でスカーフの貸出を行っています。遺跡では日陰が少ないため、帽子、水、歩きやすい靴をご持参ください。',
          'エフェソス、ヒエラポリス、アニなどの大きな遺跡を朝の開門時や閉門間際に訪れると、暑さや混雑を避けることができます。遺跡に登ったりモザイク画に触れたりしないでください。また、ドローンを飛ばす前には必ず許可を得てください。',
        ],
      },
      {
        heading: 'Kitabeの使い方',
        paragraphs: [
          'Kitabeは、トルコの文化遺産スポットを1か所に集めたトラベルガイドです。各スポットには、位置情報、写真、簡単な歴史、見学のヒントが掲載されています。まずはこのページの上部にある検索ボックスに都市名、地区名、またはスポット名を入力し、各都市ページにある地区やカテゴリのフィルターでリストを絞り込んでください。モバイルアプリでは同じコンテンツを地図上で確認できるため、近くにあるスポットを見つけてルートを計画することができます。',
        ],
      },
    ],
  },
};
