import { cityNameToSlug } from '../citySlugLabel';
import type { Locale } from '../listings';

export type HomeRegion = {
  id: string;
  cities: string[];
  name: Record<Locale, string>;
  text: Record<Locale, string>;
};

const slugs = (names: string[]) => names.map(cityNameToSlug);

export const HOME_REGIONS: HomeRegion[] = [
  {
    id: 'marmara',
    cities: slugs(['İstanbul', 'Edirne', 'Kırklareli', 'Tekirdağ', 'Kocaeli', 'Yalova', 'Sakarya', 'Bilecik', 'Bursa', 'Balıkesir', 'Çanakkale']),
    name: { tr: 'Marmara', en: 'Marmara', ru: 'Мраморноморский регион', ar: 'منطقة مرمرة', de: 'Marmara', es: 'Mármara', ja: 'マルマラ' },
    text: {
      tr: 'İstanbul’un Bizans ve Osmanlı katmanları, Edirne’de Mimar Sinan’ın Selimiye’si, Osmanlı’nın ilk başkenti Bursa’nın külliyeleri ve Cumalıkızık, Çanakkale’de Troya ile Gelibolu Yarımadası. Kısa mesafelerde birbirinden çok farklı dönemleri görmek mümkün.',
      en: 'The Byzantine and Ottoman layers of Istanbul, Sinan’s Selimiye in Edirne, the mosque complexes of Bursa, the first Ottoman capital, and Cumalıkızık, plus Troy and the Gallipoli Peninsula in Çanakkale. Very different eras sit only a short drive apart.',
      ru: 'Византийские и османские слои Стамбула, мечеть Селимие работы Синана в Эдирне, комплексы Бурсы — первой османской столицы — и деревня Джумалыкызык, Троя и полуостров Галлиполи в Чанаккале. Совершенно разные эпохи на небольшом расстоянии друг от друга.',
      ar: 'طبقات إسطنبول البيزنطية والعثمانية، وجامع السليمية لسنان في أدرنة، ومجمّعات بورصة أول عاصمة عثمانية وقرية جومالي كيزيك، وطروادة وشبه جزيرة غاليبولي في جناق قلعة. عصور مختلفة تماماً على مسافات قصيرة.',
      de: 'Die byzantinischen und osmanischen Schichten Istanbuls, Sinans Selimiye-Moschee in Edirne, die Moscheekomplexe von Bursa, der ersten osmanischen Hauptstadt, und Cumalıkızık sowie Troja und die Halbinsel Gallipoli in Çanakkale. Völlig unterschiedliche Epochen liegen nur wenige Autofahrten voneinander entfernt.',
      es: 'Las capas bizantina y otomana de Estambul, la mezquita de Selimiye de Sinan en Edirne, los complejos de mezquitas de Bursa, la primera capital otomana, y Cumalıkızık, además de Troya y la península de Galípoli en Çanakkale. Eras muy diferentes se encuentran a poca distancia en coche.',
      ja: 'イスタンブールのビザンツ帝国およびオスマン帝国の層、エディルネにあるスィナン設計のセリミエ・モスク、最初のオスマン帝国の首都ブルサのモスク群とジュマルクズク、さらにチャナッカレのトロイとガリポリ半島。まったく異なる時代が、車ですぐの距離に隣接しています。',
    },
  },
  {
    id: 'ege',
    cities: slugs(['İzmir', 'Manisa', 'Aydın', 'Denizli', 'Muğla', 'Uşak', 'Kütahya', 'Afyonkarahisar']),
    name: { tr: 'Ege', en: 'Aegean', ru: 'Эгейский регион', ar: 'منطقة إيجة', de: 'Ägäis', es: 'Egeo', ja: 'エーゲ海' },
    text: {
      tr: 'Efes, Priene, Milet ve Didim’deki Apollon Tapınağı İyonya’nın büyük kentlerini aynı güzergâhta toplar. Pamukkale travertenlerinin üstündeki Hierapolis, Afrodisias ve Bergama da UNESCO listesinde. Zeytinlikler arasındaki taş köyler molaları güzelleştirir.',
      en: 'Ephesus, Priene, Miletus and the Temple of Apollo at Didyma bring the great cities of Ionia together on one route. Hierapolis above the Pamukkale travertines, Aphrodisias and Pergamon are also on the UNESCO list. Stone villages among the olive groves make for good breaks.',
      ru: 'Эфес, Приена, Милет и храм Аполлона в Дидимах — великие города Ионии на одном маршруте. Иераполис над травертинами Памуккале, Афродисиас и Пергам тоже входят в список ЮНЕСКО. Каменные деревни среди оливковых рощ — хорошие места для остановок.',
      ar: 'تجمع أفسس وبريني وميليتوس ومعبد أبولو في ديديم مدنَ إيونيا الكبرى في مسار واحد. كما أن هيرابوليس فوق مدرجات باموكالي الكلسية وأفروديسياس وبرغامة مدرجة في قائمة اليونسكو، والقرى الحجرية بين بساتين الزيتون محطات جميلة للاستراحة.',
      de: 'Ephesos, Priene, Milet und der Apollontempel von Didyma vereinen die großen Städte Ioniens auf einer Route. Auch Hierapolis oberhalb der Kalkterrassen von Pamukkale, Aphrodisias und Pergamon stehen auf der UNESCO-Liste. Steindörfer inmitten von Olivenhainen laden zu erholsamen Pausen ein.',
      es: 'Éfeso, Priene, Mileto y el Templo de Apolo en Dídyma reúnen las grandes ciudades de Jonia en una sola ruta. Hierápolis, sobre los travertinos de Pamukkale, Afrodisias y Pérgamo también figuran en la lista de la UNESCO. Los pueblos de piedra entre los olivos son excelentes lugares de descanso.',
      ja: 'エフェソス、プリエネ、ミレトス、ディディマのアポロン神殿は、イオニアの偉大な都市群を1つのルートにつなぎます。パムッカレの石灰棚の上にあるヒエラポリス、アフロディシアス、ペルガモンもユネスコの世界遺産リストに登録されています。オリーブ畑の中に佇む石造りの村々は、旅の素晴らしい休憩スポットとなります。',
    },
  },
  {
    id: 'akdeniz',
    cities: slugs(['Antalya', 'Isparta', 'Burdur', 'Mersin', 'Adana', 'Hatay', 'Osmaniye', 'Kahramanmaraş']),
    name: { tr: 'Akdeniz', en: 'Mediterranean', ru: 'Средиземноморский регион', ar: 'منطقة البحر المتوسط', de: 'Mittelmeer', es: 'Mediterráneo', ja: '地中海' },
    text: {
      tr: 'Likya kıyısında Patara, Xanthos, Myra ve Kekova’nın batık kalıntıları; Antalya çevresinde Perge, sahnesi ayakta duran Aspendos ve dağın tepesindeki Termessos. İç kesimde Sagalassos ve Salda Gölü, doğuda Mersin’in kıyı kaleleri ve Hatay’ın mozaikleri bölgeyi tamamlar.',
      en: 'On the Lycian coast: Patara, Xanthos, Myra and the sunken ruins of Kekova. Around Antalya: Perge, Aspendos with its standing stage building, and Termessos on its mountaintop. Inland are Sagalassos and Lake Salda; further east, the coastal castles of Mersin and the mosaics of Hatay.',
      ru: 'На Ликийском побережье — Патара, Ксанф, Мира и затонувшие руины Кековы. Вокруг Анталии — Перге, Аспендос с сохранившейся сценой и Термессос на вершине горы. В глубине региона — Сагалассос и озеро Салда, на востоке — прибрежные крепости Мерсина и мозаики Хатая.',
      ar: 'على الساحل الليقي باتارا وزانثوس وميرا وأطلال كيكوفا الغارقة، وحول أنطاليا بيرغه وأسبندوس بمسرحها القائم وتيرميسوس على قمة الجبل. وفي الداخل ساغالاسوس وبحيرة سالدا، وشرقاً قلاع مرسين الساحلية وفسيفساء هاتاي.',
      de: 'An der lykischen Küste: Patara, Xanthos, Myra und die versunkenen Ruinen von Kekova. Rund um Antalya: Perge, Aspendos mit seinem gut erhaltenen Bühnengebäude und Termessos auf einem Berggipfel. Im Landesinneren liegen Sagalassos und der Salda-See; weiter östlich die Küstenburgen von Mersin und die Mosaiken von Hatay.',
      es: 'En la costa licia: Pátara, Janto, Myra y las ruinas sumergidas de Kekova. Alrededor de Antalya: Perge, Aspendos con su edificio escénico en pie y Termessos en la cima de su montaña. Más hacia el interior se encuentran Sagalassos y el lago Salda; más al este, los castillos costeros de Mersin y los mosaicos de Hatay.',
      ja: 'リキア海岸：パタラ、クサントス、ミュラ、ケコヴァの水中遺跡。アンタルヤ周辺：ペルゲ、現存する舞台建築を持つアスペンドス、山頂のテルメッソス。内陸にはサガラッソスやサルダ湖があり、さらに東にはメルシンの海岸要塞やハタイのモザイク画があります。',
    },
  },
  {
    id: 'ic-anadolu',
    cities: slugs(['Ankara', 'Konya', 'Kayseri', 'Eskişehir', 'Sivas', 'Yozgat', 'Kırıkkale', 'Kırşehir', 'Nevşehir', 'Niğde', 'Aksaray', 'Karaman', 'Çankırı']),
    name: { tr: 'İç Anadolu', en: 'Central Anatolia', ru: 'Центральная Анатолия', ar: 'وسط الأناضول', de: 'Zentralanatolien', es: 'Anatolia Central', ja: '中央アナトリア' },
    text: {
      tr: 'Kapadokya’nın peribacaları ve kaya kiliseleri, Derinkuyu ile Kaymaklı yeraltı şehirleri, Konya’da Mevlana Müzesi ve Selçuklu medreseleri, 9 bin yılı aşkın geçmişiyle Çatalhöyük. Ankara’da Anadolu Medeniyetleri Müzesi ve Anıtkabir, Sivas’ta Divriği Ulu Camii bu bölgede.',
      en: 'The fairy chimneys and rock churches of Cappadocia, the underground cities of Derinkuyu and Kaymaklı, the Mevlana Museum and Seljuk madrasas of Konya, and Çatalhöyük, settled more than 9,000 years ago. Ankara’s Museum of Anatolian Civilizations and Anıtkabir, and the Great Mosque of Divriği in Sivas, are here too.',
      ru: 'Скалы-«дымоходы» и пещерные церкви Каппадокии, подземные города Деринкую и Каймаклы, музей Мевляны и сельджукские медресе Коньи, Чатал-Хююк, которому больше 9000 лет. Здесь же Музей анатолийских цивилизаций и Аныткабир в Анкаре и Великая мечеть Дивриги в Сивасе.',
      ar: 'مداخن الجنيات والكنائس الصخرية في كابادوكيا، ومدينتا ديرينكويو وكايماكلي تحت الأرض، ومتحف مولانا والمدارس السلجوقية في قونية، وتشاتال هويوك التي يزيد عمرها على 9000 عام. وفي المنطقة أيضاً متحف حضارات الأناضول وأنيت قبر في أنقرة، وجامع ديفريغي الكبير في سيواس.',
      de: 'Die Feenkamine und Felsenkirchen Kappadokiens, die unterirdischen Städte Derinkuyu und Kaymaklı, das Mevlana-Museum und die seldschukischen Koranschulen von Konya sowie Çatalhöyük, das vor über 9.000 Jahren besiedelt wurde. Auch Ankaras Museum für anatolische Zivilisationen, Anıtkabir und die Große Moschee von Divriği in Sivas befinden sich hier.',
      es: 'Las chimeneas de hadas y las iglesias rupestres de Capadocia, las ciudades subterráneas de Derinkuyu y Kaymaklı, el Museo de Mevlana y las madrazas selyúcidas de Konya, y Çatalhöyük, poblado hace más de 9.000 años. El Museo de Civilizaciones Anatolias de Ankara y Anıtkabir, así como la Gran Mezquita de Divriği en Sivas, también se encuentran aquí.',
      ja: 'カッパドキアの奇岩と岩窟教会、デルリンクユとカイマクル紙の地下都市、コンヤのメヴラーナ博物館とセルジューク朝のマドラサ（神学校）、そして9000年以上前に定住が始まったチャタル・ヒュユク。アンカラのアナトリア文明博物館やアニトゥカビル（アタテュルク廟）、シヴァスのディヴリーイの大モスクもここにあります。',
    },
  },
  {
    id: 'karadeniz',
    cities: slugs(['Trabzon', 'Rize', 'Artvin', 'Giresun', 'Ordu', 'Samsun', 'Sinop', 'Kastamonu', 'Bartın', 'Zonguldak', 'Karabük', 'Düzce', 'Bolu', 'Amasya', 'Tokat', 'Çorum', 'Gümüşhane', 'Bayburt']),
    name: { tr: 'Karadeniz', en: 'Black Sea', ru: 'Черноморский регион', ar: 'منطقة البحر الأسود', de: 'Schwarzmeer', es: 'Mar Negro', ja: '黒海' },
    text: {
      tr: 'Uzungöl, Ayder ve Pokut gibi yaylalar, Fırtına Vadisi’nin taş köprüleri, kayalığa yaslanmış Sümela Manastırı. Batıda Safranbolu’nun Osmanlı konakları, Amasya’nın Yeşilırmak kıyısındaki evleri ve kaya mezarları, Çorum’da Hitit başkenti Hattuşa.',
      en: 'Highland plateaus such as Uzungöl, Ayder and Pokut, the stone bridges of the Fırtına Valley and Sumela Monastery clinging to its cliff. Further west are the Ottoman mansions of Safranbolu, the riverside houses and rock tombs of Amasya, and the Hittite capital Hattusa in Çorum.',
      ru: 'Плато Узунгёль, Айдер и Покут, каменные мосты долины Фыртына, монастырь Сумела на отвесной скале. Западнее — османские особняки Сафранболу, дома и скальные гробницы Амасьи на берегу Ешильырмака и хеттская столица Хаттуса в Чоруме.',
      ar: 'هضاب مثل أوزون غول وآيدر وبوكوت، وجسور وادي فيرتينا الحجرية، ودير سوميلا المعلّق على الجرف. وغرباً قصور سفرانبولو العثمانية، وبيوت أماسيا ومقابرها الصخرية على نهر يشيل إرماق، وحاتوشا عاصمة الحثيين في تشوروم.',
      de: 'Hochlandplateaus wie Uzungöl, Ayder und Pokut, die Steinbrücken des Fırtına-Tals und das an eine Felswand geschmiegte Kloster Sümela. Weiter westlich liegen die osmanischen Herrenhäuser von Safranbolu, die Häuser am Fluss und Felsgräber von Amasya sowie die hethitische Hauptstadt Hattuša in Çorum.',
      es: 'Mesetas de gran altitud como Uzungöl, Ayder y Pokut, los puentes de piedra del valle de Fırtına y el Monasterio de Sumela aferrado a su acantilado. Más al oeste se encuentran las mansiones otomanas de Safranbolu, las casas junto al río y las tumbas excavadas en la roca de Amasya, y la capital hitita Hattusa en Çorum.',
      ja: 'ウズンギョル、アイデル、ポクトなどの高地プラトー、フルトゥナ渓谷の石橋、崖にしがみつくように建つスメラ修道院。さらに西には、サフランボルのオスマン帝国時代の邸宅、アマスヤの川沿いの家々と岩窟墓、チョルムにあるヒッタイトの首都ハットゥシャがあります。',
    },
  },
  {
    id: 'dogu-anadolu',
    cities: slugs(['Erzurum', 'Erzincan', 'Kars', 'Ardahan', 'Iğdır', 'Ağrı', 'Van', 'Muş', 'Bitlis', 'Bingöl', 'Tunceli', 'Elazığ', 'Malatya', 'Hakkari']),
    name: { tr: 'Doğu Anadolu', en: 'Eastern Anatolia', ru: 'Восточная Анатолия', ar: 'شرق الأناضول', de: 'Ostanatolien', es: 'Anatolia Oriental', ja: '東アナトリア' },
    text: {
      tr: 'Kars’ta sınırın hemen kıyısındaki Ani harabeleri, Van Gölü’nde Akdamar Kilisesi, Doğubayazıt’ta İshak Paşa Sarayı, Erzurum’un Selçuklu medreseleri ve Nemrut Krater Gölü. Kışlar uzun ve sert; yaz ve erken sonbahar en rahat dönem.',
      en: 'The ruins of Ani right on the border in Kars, the Akdamar church on Lake Van, İshak Pasha Palace at Doğubayazıt, the Seljuk madrasas of Erzurum and the Nemrut crater lake. Winters are long and harsh; summer and early autumn are the easiest time to travel.',
      ru: 'Руины Ани у самой границы в Карсе, церковь на острове Ахтамар на озере Ван, дворец Исхак-паши в Догубаязыте, сельджукские медресе Эрзурума и кратерное озеро Немрут. Зимы долгие и суровые; удобнее всего ехать летом и ранней осенью.',
      ar: 'أطلال آني على الحدود مباشرة في قارص، وكنيسة أكدامار في بحيرة وان، وقصر إسحاق باشا في دوغوبايزيد، ومدارس أرضروم السلجوقية، وبحيرة نمرود البركانية. الشتاء طويل وقاسٍ، والصيف وأوائل الخريف أنسب أوقات السفر.',
      de: 'Die Ruinen von Ani direkt an der Grenze in Kars, die Akdamar-Kirche am Vansee, der Ishak-Pascha-Palast in Doğubayazıt, die seldschukischen Koranschulen von Erzurum und der Nemrut-Kratersee. Die Winter sind lang und streng; Sommer und Frühherbst sind die beste Reisezeit.',
      es: 'Las ruinas de Ani justo en la frontera de Kars, la iglesia de Akdamar en el lago Van, el Palacio de Ishak Pasha en Doğubayazıt, las madrazas selyúcidas de Erzurum y el lago cratérico del Nemrut. Los inviernos son largos y duros; el verano y principios de otoño son las mejores épocas para viajar.',
      ja: 'カルスの国境沿いにあるアニの遺跡、ヴァン湖畔のアクダマル教会、ドゥバヤズットのイサク・パシャ宮殿、エルズルムのセルジューク朝のマドラサ、ネムルト火口湖。冬は長く厳しいですが、夏から初秋にかけてが最も旅しやすい時期です。',
    },
  },
  {
    id: 'guneydogu-anadolu',
    cities: slugs(['Şanlıurfa', 'Mardin', 'Gaziantep', 'Diyarbakır', 'Adıyaman', 'Batman', 'Siirt', 'Şırnak', 'Kilis']),
    name: { tr: 'Güneydoğu Anadolu', en: 'Southeastern Anatolia', ru: 'Юго-Восточная Анатолия', ar: 'جنوب شرق الأناضول', de: 'Südostanatolien', es: 'Anatolia Sudoriental', ja: '東南アナトリア' },
    text: {
      tr: 'Göbeklitepe ve Karahan Tepe, bilinen en eski anıtsal yapılara ev sahipliği yapıyor. Şanlıurfa’da Balıklıgöl, Harran’ın kümbet evleri, Mardin’in taş sokakları, Gaziantep’te Zeugma mozaikleri ve Nemrut Dağı’nın dev heykelleri de bu bölgede.',
      en: 'Göbeklitepe and Karahan Tepe hold some of the oldest monumental structures known. Balıklıgöl in Şanlıurfa, the beehive houses of Harran, the stone streets of Mardin, the Zeugma mosaics in Gaziantep and the giant statues of Mount Nemrut are all in this region.',
      ru: 'Гёбекли-Тепе и Карахан-Тепе — одни из древнейших известных монументальных сооружений. Здесь же озеро Балыклыгёль в Шанлыурфе, купольные дома Харрана, каменные улицы Мардина, мозаики Зевгмы в Газиантепе и гигантские статуи горы Немрут.',
      ar: 'يضم غوبكلي تبه وكاراهان تبه بعضاً من أقدم المنشآت الأثرية المعروفة. وفي المنطقة أيضاً بركة إبراهيم في شانلي أورفا، وبيوت حرّان ذات القباب، وأزقّة ماردين الحجرية، وفسيفساء زيوغما في غازي عنتاب، وتماثيل جبل نمرود العملاقة.',
      de: 'Göbeklitepe und Karahan Tepe beherbergen einige der ältesten bekannten monumentalen Bauwerke. Balıklıgöl in Şanlıurfa, die Bienenkorbhäuser von Harran, die Steingassen von Mardin, die Zeugma-Mosaiken in Gaziantep und die riesigen Statuen des Berges Nemrut befinden sich alle in dieser Region.',
      es: 'Göbeklitepe y Karahan Tepe albergan algunas de las estructuras monumentales más antiguas que se conocen. Balıklıgöl en Şanlıurfa, las casas colmena de Harran, las calles de piedra de Mardin, los mosaicos de Zeugma en Gaziantep y las estatuas gigantes del monte Nemrut se encuentran en esta región.',
      ja: 'ギョベクリ・テペとカラハン・テペには、知られている中で最古級のモニュメント建築が残されています。シャンルウルフラのバルクルギョル、ハッランの蜂の巣状の家々、マルディンの石造りの街並み、ガズィアンテップのゼウグマ・モザイク博物館、そしてネムルト山の巨大な石像群がすべてこの地域にあります。',
    },
  },
];
