import type { Locale } from '../listings';
import { trLoc } from '../trSuffix';
import type { PlaceRef } from './places';

export type SeasonKey = 'winter' | 'spring' | 'summer' | 'autumn';

export type SeasonPick = { ref: PlaceRef; note: Record<Locale, string> };

const MONTHS: Record<Locale, string[]> = {
  tr: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  ru: ['январе', 'феврале', 'марте', 'апреле', 'мае', 'июне', 'июле', 'августе', 'сентябре', 'октябре', 'ноябре', 'декабре'],
  ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  de: [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
  ],
  es: [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ],
  ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
};

/** 1–12, Türkiye saatine göre */
export function currentMonth(now = new Date()): number {
  return Number(now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul', month: 'numeric' }));
}

export function seasonForMonth(month: number): SeasonKey {
  if (month === 12 || month <= 2) return 'winter';
  if (month <= 5) return 'spring';
  if (month <= 8) return 'summer';
  return 'autumn';
}

export function seasonTitle(month: number, locale: Locale): string {
  const name = MONTHS[locale][month - 1];
  if (locale === 'tr') return `${trLoc(name)} nereye gidilir?`;
  if (locale === 'en') return `Where to go in ${name}`;
  if (locale === 'ru') return `Куда поехать в ${name}`;
  if (locale === 'de') return `Reiseziele im ${name}`;
  if (locale === 'es') return `Adónde ir en ${name}`;
  if (locale === 'ja') return `${name}のおすすめ旅行先`;
  return `إلى أين تذهب في ${name}؟`;
}

export const SEASON_LEAD: Record<SeasonKey, Record<Locale, string>> = {
  autumn: {
    tr: 'Yaz sıcağı geçti, kalabalık dağıldı. Ege, Kapadokya ve Güneydoğu için yılın en rahat haftaları; Karadeniz ve Bolu ormanları da renk değiştirmeye başladı.',
    en: 'The summer heat is gone and the crowds have thinned. These are the easiest weeks of the year for the Aegean, Cappadocia and the southeast, and the forests of the Black Sea and Bolu are starting to turn.',
    ru: 'Летняя жара спала, туристов стало меньше. Самое удобное время для Эгейского побережья, Каппадокии и юго-востока, а леса Причерноморья и Болу начинают менять цвет.',
    ar: 'انتهى حرّ الصيف وخفّت الزحمة. هذه أنسب أسابيع السنة لزيارة بحر إيجة وكابادوكيا والجنوب الشرقي، وبدأت غابات البحر الأسود وبولو تتلوّن.',
    de: 'Die Sommerhitze ist vorbei und die Menschenmassen haben sich ausgedünnt. Dies sind die angenehmsten Wochen des Jahres für die Ägäis, Kappadokien und den Südosten, während sich die Wälder des Schwarzen Meeres und von Bolu zu verfärben beginnen.',
    es: 'El calor del verano ha desaparecido y las multitudes se han reducido. Estas son las semanas más fáciles del año para visitar el Egeo, Capadocia y el sureste, mientras que los bosques del mar Negro y Bolu empiezan a cambiar de color.',
    ja: '夏の暑さが和らぎ、観光客も減りました。エーゲ海地方、カッパドキア、南東部を訪れるのに一年で最も適した時期であり、黒海地方やボルの森も色づき始めます。',
  },
  winter: {
    tr: 'Kış, büyük müzeleri acele etmeden gezmek ve karla kaplı Kapadokya ya da Kars gibi yerleri bambaşka bir halde görmek için iyi bir zaman.',
    en: 'Winter is a good time to take the big museums slowly and to see places like Cappadocia or Kars under snow, when they look completely different.',
    ru: 'Зима — хорошее время, чтобы не спеша обойти крупные музеи и увидеть Каппадокию или Карс под снегом, совсем другими.',
    ar: 'الشتاء وقت مناسب لزيارة المتاحف الكبرى على مهل، ولرؤية أماكن مثل كابادوكيا وقارص تحت الثلج بمظهر مختلف تماماً.',
    de: 'Der Winter ist eine gute Zeit, um die großen Museen in Ruhe zu besuchen und Orte wie Kappadokien oder Kars im Schnee zu erleben, wenn sie ganz anders wirken.',
    es: 'El invierno es un buen momento para recorrer los grandes museos con calma y ver lugares como Capadocia o Kars bajo la nieve, cuando adquieren un aspecto completamente distinto.',
    ja: '冬は、大きな美術館をじっくり見学したり、雪に覆われたカッパドキアやカルスなど、普段とは全く異なる表情を見せる場所を訪れるのに良い季節です。',
  },
  spring: {
    tr: 'Bahar, güney kıyılarındaki antik kentleri sıcak bastırmadan görmenin en iyi zamanı. Vadiler yeşil, dağ yamaçları çiçekli.',
    en: 'Spring is the best time to see the ancient cities of the south coast before the heat sets in. The valleys are green and the hillsides are in flower.',
    ru: 'Весна — лучшее время для античных городов южного побережья, пока не наступила жара. Долины зеленеют, склоны гор в цветах.',
    ar: 'الربيع أفضل وقت لرؤية المدن الأثرية على الساحل الجنوبي قبل اشتداد الحر. الأودية خضراء والمنحدرات مزهرة.',
    de: 'Der Frühling ist die beste Zeit, um die antiken Städte der Südküste zu erkunden, bevor die große Hitze einsetzt. Die Täler sind grün und die Hänge blühen auf.',
    es: 'La primavera es la mejor época para visitar las ciudades antiguas de la costa sur antes de que llegue el calor. Los valles están verdes y las laderas se llenan de flores.',
    ja: '春は、本格的な暑さが訪れる前に南海岸の古代都市を訪れるベストシーズンです。渓谷は緑に包まれ、丘陵地帯には花が咲き誇ります。',
  },
  summer: {
    tr: 'Güneyde öğle saatleri zorlayıcı olabilir; yazın yaylalar, göller ve adalar öne çıkıyor. Doğu Anadolu’nun yüksek kesimleri de ancak bu aylarda tam olarak gezilebiliyor.',
    en: 'Midday in the south can be punishing, so summer is the season for highland plateaus, lakes and islands. The high parts of Eastern Anatolia are only fully accessible in these months.',
    ru: 'На юге в полдень бывает очень жарко, поэтому летом на первый план выходят плато, озёра и острова. Высокогорья Восточной Анатолии полностью доступны только в эти месяцы.',
    ar: 'قد تكون ساعات الظهيرة في الجنوب مرهقة، لذا تبرز في الصيف الهضاب والبحيرات والجزر. كما أن المرتفعات في شرق الأناضول لا يمكن زيارتها بالكامل إلا في هذه الأشهر.',
    de: 'Die Mittagshitze im Süden kann unbarmherzig sein, daher ist der Sommer die ideale Jahreszeit für Hochplateaus, Seen und Inseln. Die höher gelegenen Regionen Ostanatoliens sind erst in diesen Monaten vollständig zugänglich.',
    es: 'El mediodía en el sur puede ser implacable, por lo que el verano es la temporada ideal para visitar mesetas altas, lagos e islas. Las zonas altas de Anatolia Oriental solo son plenamente accesibles durante estos meses.',
    ja: '南部の昼間は耐え難いほどの暑さになるため、夏は高地、湖、島を訪れる季節です。東アナトリアの高地はこの時期にのみ十分にアクセス可能です。',
  },
};

export const SEASON_PICKS: Record<SeasonKey, SeasonPick[]> = {
  autumn: [
    {
      ref: { city: 'nevsehir', id: 'AzENom7TicgQSs4Fu5ng' },
      note: {
        tr: 'Balon sezonu sürüyor, öğleden sonraları yürüyüş için ideal. Kaya kiliseleri arasında Karanlık Kilise’yi atlamayın; en iyi korunmuş fresklerin olduğu yer orası.',
        en: 'Balloon season is still on and the afternoons are ideal for walking. Among the rock churches, don’t skip the Dark Church, which has the best-preserved frescoes.',
        ru: 'Сезон воздушных шаров продолжается, а днём идеально гулять. Среди пещерных церквей не пропустите Тёмную церковь — там лучше всего сохранились фрески.',
        ar: 'موسم المناطيد مستمر، وفترات ما بعد الظهر مثالية للمشي. لا تفوّت الكنيسة المظلمة بين الكنائس الصخرية، ففيها أفضل الجداريات حفظاً.',
        de: 'Die Ballonsaison ist noch in vollem Gange und die Nachmittage eignen sich ideal zum Wandern. Verpassen Sie unter den Felsenkirchen nicht die Dunkle Kirche, die über die am besten erhaltenen Fresken verfügt.',
        es: 'La temporada de globos aerostáticos continúa y las tardes son ideales para caminar. Entre las iglesias rupestres, no se pierda la Iglesia Oscura, que conserva los frescos mejor preservados.',
        ja: '気球のシーズンは続いており、午後は散策に最適です。岩窟教会群の中でも、最も保存状態の良いフレスコ画がある暗闇の教会は見逃せません。',
      },
    },
    {
      ref: { city: 'sanliurfa', id: 'W0MS0rpQIcFXTufTZ3UM' },
      note: {
        tr: 'Temmuzda 40 dereceyi aşan Şanlıurfa’yı gezmek için en rahat aylar bunlar. Alanda gölge az; sabah erken gitmek hâlâ iyi fikir.',
        en: 'Şanlıurfa passes 40°C in July, so these are the most comfortable months to visit. There is little shade on site, so going early is still a good idea.',
        ru: 'В июле в Шанлыурфе бывает за 40 °C, так что сейчас самые комфортные месяцы. Тени на раскопе мало — ехать лучше с утра.',
        ar: 'تتجاوز الحرارة في شانلي أورفا 40 درجة في يوليو، لذا هذه أنسب الأشهر للزيارة. الظل قليل في الموقع، والذهاب باكراً فكرة جيدة.',
        de: 'In Şanlıurfa übersteigt das Thermometer im Juli 40 °C, daher sind dies die angenehmsten Monate für einen Besuch. Da es vor Ort kaum Schatten gibt, empfiehlt sich nach wie vor ein früher Start.',
        es: 'Şanlıurfa supera los 40 °C en julio, por lo que estos son los meses más cómodos para visitarla. Hay poca sombra en el yacimiento, por lo que se recomienda ir temprano.',
        ja: 'シャンルウルファは7月に40℃を超えるため、この時期が最も快適に観光できます。遺跡には日陰が少ないため、早朝の訪問がおすすめです。',
      },
    },
    {
      ref: { city: 'izmir', id: 'QwwZhZOToP7dhUvLVIpO' },
      note: {
        tr: 'Kalabalık azaldı, mermer caddeler öğlen bile yakmıyor. Celsus Kütüphanesi’ni kapanışa yakın, ışık yumuşakken görmeye çalışın.',
        en: 'The crowds are smaller and the marble streets no longer burn at noon. Try to see the Library of Celsus near closing time, when the light is soft.',
        ru: 'Людей меньше, мраморные улицы уже не раскаляются к полудню. Библиотеку Цельса лучше смотреть ближе к закрытию, при мягком свете.',
        ar: 'قلّ الزوار ولم تعد الشوارع الرخامية تلتهب عند الظهر. حاول رؤية مكتبة سيلسوس قرب موعد الإغلاق حين يكون الضوء ناعماً.',
        de: 'Die Besucherströme sind geringer und die Marmorstraßen glühen mittags nicht mehr so stark. Versuchen Sie, die Celsus-Bibliothek kurz vor Schließung zu besuchen, wenn das Licht weicher wird.',
        es: 'Las multitudes son menores y las calles de mármol ya no queman al mediodía. Intente visitar la Biblioteca de Celso cerca de la hora de cierre, cuando la luz es más suave.',
        ja: '観光客も少なくなり、正午になっても大理石の通りが熱くなることはありません。光が柔らかくなる閉館間際にケルスス図書館を訪れてみてください。',
      },
    },
    {
      ref: { city: 'bolu', id: 'pgsaWKL1ToG61hj6O3cI' },
      note: {
        tr: 'Ekim sonu ile kasım başında gölün çevresindeki kayın ve meşeler sarıya, kızıla döner. Gölü çevreleyen yaklaşık 7 km’lik yürüyüş yolu tek başına gitmek için bir sebep.',
        en: 'In late October and early November the beech and oak trees around the lake turn yellow and red. The roughly 7 km path around the lake is reason enough to go.',
        ru: 'В конце октября и начале ноября буки и дубы вокруг озера желтеют и краснеют. Одна только тропа длиной около 7 км вокруг озера стоит поездки.',
        ar: 'في أواخر أكتوبر وأوائل نوفمبر تتحول أشجار الزان والبلوط حول البحيرة إلى الأصفر والأحمر. ومسار المشي حول البحيرة، بطول 7 كيلومترات تقريباً، سبب كافٍ للذهاب.',
        de: 'Im späten Oktober und frühen November färben sich die Buchen und Eichen rund um den See gelb und rot. Der etwa 7 km lange Rundweg um den See ist Grund genug für einen Besuch.',
        es: 'A finales de octubre y principios de noviembre, loshayas y robles alrededor del lago se vuelven amarillos y rojos. El sendero de unos 7 km que rodea el lago es motivo suficiente para ir.',
        ja: '10月下旬から11月上旬にかけて、湖畔のブナやオークの木々が黄色や赤に色づきます。湖の周りを巡る約7kmの遊歩道だけでも、訪れる価値が十分にあります。',
      },
    },
    {
      ref: { city: 'karabuk', id: 'LuoBU0nNsLDs5qW1BJ4s' },
      note: {
        tr: 'Serin havada çarşı ile konaklar arasında dolaşmak keyifli. Akşamüstü Hıdırlık Tepesi’ne çıkıp kiremit çatılara yukarıdan bakın.',
        en: 'Cool weather makes it pleasant to wander between the bazaar and the mansions. In the late afternoon, climb Hıdırlık Hill and look down over the tiled roofs.',
        ru: 'В прохладную погоду приятно бродить между базаром и старыми особняками. Под вечер поднимитесь на холм Хыдырлык и посмотрите на черепичные крыши сверху.',
        ar: 'الطقس المعتدل يجعل التجوّل بين السوق والقصور العثمانية ممتعاً. اصعد عند العصر إلى تلة خدرلك وانظر إلى الأسطح القرميدية من الأعلى.',
        de: 'Das kühle Wetter macht es angenehm, zwischen dem Basar und den historischen Herrenhäusern zu schlendern. Steigen Sie am späten Nachmittag auf den Hıdırlık-Hügel und blicken Sie auf die Ziegeldächer herab.',
        es: 'El clima fresco hace que sea agradable pasear entre el bazar y las mansiones. Al final de la tarde, suba a la colina Hıdırlık y contemple los tejados de tejas desde arriba.',
        ja: '涼しい気候のおかげで、バザールや古い邸宅の間を心地よく散策できます。夕方遅くにヒドゥルルクの丘に登り、瓦屋根の街並みを眺めてみてください。',
      },
    },
    {
      ref: { city: 'mardin', id: 'bRKX8oaUxvCoNvHSTNcc' },
      note: {
        tr: 'Mezopotamya ovasının sıcağı kırılınca Mardin’in taş sokakları yeniden yürünür hale geliyor. Manastır şehir merkezine yaklaşık 5 km uzaklıkta.',
        en: 'Once the heat of the Mesopotamian plain breaks, Mardin’s stone streets become walkable again. The monastery is about 5 km from the town centre.',
        ru: 'Когда спадает жара Месопотамской равнины, по каменным улочкам Мардина снова можно гулять. Монастырь — примерно в 5 км от центра.',
        ar: 'حين تنكسر حرارة سهل ميزوبوتاميا تعود أزقّة ماردين الحجرية صالحة للمشي. يبعد الدير نحو 5 كيلومترات عن وسط المدينة.',
        de: 'Sobald die Hitze der mesopotamischen Ebene nachlässt, werden Mardins Steingassen wieder gut zu Fuß begehbar. Das Kloster liegt etwa 5 km vom Stadtzentrum entfernt.',
        es: 'Una vez que cede el calor de la llanura mesopotámica, las calles de piedra de Mardin vuelven a ser transitables a pie. El monasterio está a unos 5 km del centro de la ciudad.',
        ja: 'メソポタミア平原の猛暑が和らぐと、マルディンの石畳の通りを再び歩いて散策できるようになります。修道院は町中心部から約5kmのところにあります。',
      },
    },
  ],
  winter: [
    {
      ref: { city: 'konya', id: 'RplUIKGOx9Wc3qjmcQma' },
      note: {
        tr: 'Her yıl 7–17 Aralık arasında Şeb-i Arus anma törenleri yapılır. Sema gösterilerinin biletleri erken tükenebilir.',
        en: 'The Şeb-i Arus commemoration is held every year from 7 to 17 December. Tickets for the whirling ceremonies can sell out early.',
        ru: 'Каждый год с 7 по 17 декабря проходят памятные церемонии Шеб-и Арус. Билеты на выступления дервишей могут закончиться заранее.',
        ar: 'تُقام مراسم إحياء ذكرى «شب عروس» كل عام من 7 إلى 17 ديسمبر، وقد تنفد تذاكر عروض السماع مبكراً.',
        de: 'Die Şeb-i-Arus-Gedenkfeiern finden jedes Jahr vom 7. bis 17. Dezember statt. Die Tickets für die Zeremonien der tanzenden Derwische können schnell ausverkauft sein.',
        es: 'La conmemoración del Şeb-i Arus se celebra todos los años del 7 al 17 de diciembre. Las entradas para las ceremonias de los derviches giróvagos pueden agotarse con antelación.',
        ja: 'シェビ・アルス（メヴレヴィー教団の儀式）の記念行事は、毎年12月7日から17日まで開催されます。回旋舞踊のチケットは早々に売り切れることがあります。',
      },
    },
    {
      ref: { city: 'kars', id: '5epTWIj4pBD3n35iyaAw' },
      note: {
        tr: 'Karla kaplı Ani bambaşka görünür. Kars’a Doğu Ekspresi ile gitmek başlı başına bir deneyim; biletleri erken almak gerekiyor.',
        en: 'Ani under snow looks like a different place. Getting to Kars on the Doğu Ekspresi train is an experience in itself, but tickets need to be booked early.',
        ru: 'Заснеженный Ани выглядит совсем иначе. Поездка в Карс на поезде «Доу Экспреси» — отдельное впечатление, билеты стоит брать заранее.',
        ar: 'تبدو آني تحت الثلج مكاناً آخر. والوصول إلى قارص بقطار «الشرق السريع» تجربة بحد ذاتها، لكن التذاكر تحتاج إلى حجز مبكر.',
        de: 'Ani im Schnee wirkt wie ein völlig anderer Ort. Die Anreise nach Kars mit dem Doğu Ekspresi ist ein Erlebnis für sich, allerdings müssen die Tickets frühzeitig gebucht werden.',
        es: 'Ani bajo la nieve parece un lugar completamente distinto. Llegar a Kars en el tren Doğu Ekspresi es toda una experiencia, pero los billetes deben reservarse con tiempo.',
        ja: '雪化粧をしたアニは、まるで別世界のように見えます。東方急行（ドゥ・エクスプレス）に乗ってカルスへ行くこと自体が一つの体験ですが、チケットは早めの予約が必要です。',
      },
    },
    {
      ref: { city: 'erzurum', id: 'Uxqj4Nrbl4IeiVELqAQN' },
      note: {
        tr: 'Sabah Palandöken’de kayak yapıp öğleden sonra şehirdeki Selçuklu yapılarını gezmek mümkün. Medresenin iki minaresi Erzurum’un simgesi.',
        en: 'You can ski on Palandöken in the morning and see the city’s Seljuk buildings in the afternoon. The madrasa’s twin minarets are the symbol of Erzurum.',
        ru: 'Утром можно покататься на лыжах в Паландёкене, а днём осмотреть сельджукские постройки города. Два минарета медресе — символ Эрзурума.',
        ar: 'يمكنك التزلج صباحاً في بالاندوكن ثم زيارة المباني السلجوقية في المدينة بعد الظهر. مئذنتا المدرسة رمز أرضروم.',
        de: 'Sie können morgens auf dem Palandöken Ski fahren und am Nachmittag die seldschukischen Bauten der Stadt besichtigen. Die Zwillingsminarette der Medrese sind das Wahrzeichen von Erzurum.',
        es: 'Puede esquiar en Palandöken por la mañana y ver los edificios selyúcidas de la ciudad por la tarde. Los minaretes gemelos de la madrasa son el símbolo de Erzurum.',
        ja: '午前中はパランドケ、でスキーを楽しみ、午後は街のセルジューク朝時代の建造物を見学することができます。メドレセ（神学校）の双塔はエルズルムのシンボルです。',
      },
    },
    {
      ref: { city: 'gaziantep', id: 'o5ArQz9Qck07EGbeJqnY' },
      note: {
        tr: 'Kapalı ve geniş bir müze; soğuk bir günde saatlerce gezilebilir. Ünlü “Çingene Kızı” mozaiği ayrı, loş bir odada sergileniyor.',
        en: 'A large indoor museum you can spend hours in on a cold day. The famous “Gypsy Girl” mosaic is displayed in its own dimly lit room.',
        ru: 'Большой крытый музей, где в холодный день можно провести несколько часов. Знаменитая мозаика «Цыганская девочка» выставлена в отдельном затемнённом зале.',
        ar: 'متحف مغلق وواسع يمكن قضاء ساعات فيه في يوم بارد. تُعرض فسيفساء «الفتاة الغجرية» الشهيرة في غرفة خاصة خافتة الإضاءة.',
        de: 'Ein großes Hallenmuseum, in dem Sie an einem kalten Tag stundenlang verweilen können. Das berühmte Mosaik des „Zigeunermädchens“ ist in einem eigenen, gedimmten Raum ausgestellt.',
        es: 'Un gran museo cubierto en el que pasar horas durante un día frío. El famoso mosaico de la «Gitana» se exhibe en su propia sala con iluminación tenue.',
        ja: '寒い日に何時間も過ごせる、大きな屋内博物館です。有名な「ジプシーの少女」のモザイク画は、薄暗い専用の部屋に展示されています。',
      },
    },
    {
      ref: { city: 'ankara', id: 'IDtR2FG5KkW6yZ7tbLgk' },
      note: {
        tr: 'Paleolitik çağdan Osmanlı’ya Anadolu’nun tamamı tek binada. Çıkışta hemen yukarıdaki Ankara Kalesi’ne yürüyüp kışın berrak havasında şehre bakın.',
        en: 'All of Anatolia, from the Palaeolithic to the Ottomans, under one roof. Afterwards, walk up to Ankara Castle right above and look over the city in the clear winter air.',
        ru: 'Вся Анатолия — от палеолита до османов — в одном здании. После музея поднимитесь к крепости Анкары прямо над ним и посмотрите на город в ясном зимнем воздухе.',
        ar: 'الأناضول كله، من العصر الحجري القديم حتى العثمانيين، في مبنى واحد. بعد الزيارة اصعد إلى قلعة أنقرة القريبة وتأمل المدينة في هواء الشتاء الصافي.',
        de: 'Ganz Anatolien – von der Altsteinzeit bis zu den Osmanen – unter einem Dach. Spazieren Sie anschließend hinauf zur direkt darüber liegenden Zitadelle von Ankara und blicken Sie in der klaren Winterluft über die Stadt.',
        es: 'Toda Anatolia, desde el Paleolítico hasta los otomanos, bajo un mismo techo. Después, suba al castillo de Ankara, situado justo encima, y contemple la ciudad bajo el aire despejado del invierno.',
        ja: '旧石器時代からオスマン帝国時代に至るまで、アナトリアのすべてが一つ屋根の下に集まっています。見学後は、すぐ上のアンカラ城まで歩いて、冬の澄んだ空気の中で街を一望しましょう。',
      },
    },
    {
      ref: { city: 'nevsehir', id: 'vzdIRj89n08eamyyw0GI' },
      note: {
        tr: 'Kar yağdığında peribacaları beyaza bürünür, kalabalık da azalır. Kalenin tepesinden Göreme’nin vadilerinin tamamı görünür.',
        en: 'When it snows, the fairy chimneys turn white and the crowds disappear. From the top of the castle you can see all of Göreme’s valleys.',
        ru: 'Когда выпадает снег, скалы-«дымоходы» белеют, а туристов почти нет. С вершины крепости видны все долины Гёреме.',
        ar: 'حين يتساقط الثلج تكتسي المداخن الصخرية بالبياض ويقلّ الزوار. ومن قمة القلعة تظهر أودية غوريمة كلها.',
        de: 'Wenn es schneit, färben sich die Feenkamine weiß und die Menschenmassen verschwören sich. Von der Spitze der Burg aus können Sie alle Täler von Göreme überblicken.',
        es: 'Cuando nieva, las chimeneas de hadas se vuelven blancas y las multitudes desaparecen. Desde lo alto del castillo se pueden ver todos los valles de Göreme.',
        ja: '雪が降ると、奇岩（妖精の煙突）が白く染まり、観光客の姿も消えていきます。城の頂上からはギョレメのすべての渓谷を一望できます。',
      },
    },
  ],
  spring: [
    {
      ref: { city: 'denizli', id: '5E_Fq_e_O9QalZh2m4L6' },
      note: {
        tr: 'Travertenlerde çıplak ayakla yürümek zorunlu; bahar güneşi taşları henüz yakmıyor. Antik havuzda yüzmek ayrıca ücretli.',
        en: 'You must walk barefoot on the travertines, and the spring sun doesn’t heat the stone too much yet. Swimming in the Antique Pool costs extra.',
        ru: 'По травертинам ходят только босиком, а весеннее солнце ещё не раскаляет камень. Купание в античном бассейне оплачивается отдельно.',
        ar: 'المشي على المدرجات الكلسية يكون حافي القدمين إلزامياً، وشمس الربيع لا تُسخّن الحجر كثيراً بعد. السباحة في الحوض الأثري برسوم إضافية.',
        de: 'Sie müssen barfuß über die Travertinterrassen gehen, und die Frühlingssonne wärmt den Stein noch nicht zu stark auf. Das Schwimmen im Antiken Pool kostet extra.',
        es: 'Debe caminar descalzo sobre los travertinos, y el sol primaveral todavía no calienta demasiado la piedra. Nadar en la Piscina Antigua tiene un coste adicional.',
        ja: '石灰棚の上は裸足で歩く必要があり、春の太陽はまだ石をそれほど熱くしません。アンティーク・プール（古代のプール）での遊泳は別料金です。',
      },
    },
    {
      ref: { city: 'antalya', id: '86BnIWEiKIyHA8t5gIaX' },
      note: {
        tr: 'Roma döneminden kalan en iyi korunmuş tiyatrolardan biri. Nisan ve mayısta Antalya sıcağı henüz bastırmadan rahatça gezilebiliyor.',
        en: 'One of the best-preserved Roman theatres anywhere. In April and May you can visit comfortably before the Antalya heat sets in.',
        ru: 'Один из лучше всего сохранившихся римских театров. В апреле и мае его удобно осматривать, пока не пришла анталийская жара.',
        ar: 'من أفضل المسارح الرومانية حفظاً. في أبريل ومايو يمكن زيارته براحة قبل أن تشتد حرارة أنطاليا.',
        de: 'Eines der am besten erhaltenen römischen Theater überhaupt. Im April und Mai lässt es sich hier wunderbar besichtigen, bevor die Hitze Antalyas einsetzt.',
        es: 'Uno de los teatros romanos mejor conservados que existen. En abril y mayo se puede visitar cómodamente antes de que comience el calor de Antalya.',
        ja: '世界でも最も保存状態の良いローマ劇場の一つです。アンタルヤの暑さが本格化する前の4月と5月なら快適に観光できます。',
      },
    },
    {
      ref: { city: 'burdur', id: 'HYwGe6X8nCtqpBNTbTMa' },
      note: {
        tr: '1.500 metre civarında, Toroslar’ın arasında bir antik kent. Karlar erir erimez yamaçlar kır çiçekleriyle kaplanıyor.',
        en: 'An ancient city at around 1,500 metres in the Taurus Mountains. As soon as the snow melts, the slopes fill with wildflowers.',
        ru: 'Античный город на высоте около 1500 метров в горах Тавр. Как только сходит снег, склоны покрываются полевыми цветами.',
        ar: 'مدينة أثرية على ارتفاع نحو 1500 متر في جبال طوروس. ما إن يذوب الثلج حتى تكتسي المنحدرات بالزهور البرية.',
        de: 'Eine antike Stadt auf rund 1.500 Metern im Taurusgebirge. Sobald der Schnee schmilzt, füllen sich die Hänge mit Wildblumen.',
        es: 'Una ciudad antigua situada a unos 1.500 metros de altitud en los montes Tauro. En cuanto la nieve se derrite, las laderas se llenan de flores silvestres.',
        ja: 'タウルス山脈の標高約1,500メートルに位置する古代都市です。雪解けとともに、斜面には高山植物が咲き乱れます。',
      },
    },
    {
      ref: { city: 'canakkale', id: 'GFmsCgNPLi15KiiT9Ii6' },
      note: {
        tr: 'Ören yerinden önce yakınındaki Troya Müzesi’ne uğrayın; buluntular kazı katmanlarını anlamayı çok kolaylaştırıyor.',
        en: 'Stop at the nearby Troy Museum before the site; the finds make the layers of the excavation much easier to understand.',
        ru: 'Перед раскопками загляните в соседний музей Трои — находки помогают разобраться в слоях древнего города.',
        ar: 'مرّ على متحف طروادة القريب قبل الموقع؛ فالمكتشفات تسهّل كثيراً فهم طبقات التنقيب.',
        de: 'Halten Sie vor dem Besuch der Ausgrabungsstätte am nahegelegenen Troia-Museum an; die Funde machen die verschiedenen Schichten der Ausgrabung wesentlich verständlicher.',
        es: 'Deténgase en el cercano Museo de Troya antes de visitar el yacimiento; los hallazgos facilitan enormemente la comprensión de los estratos de la excavación.',
        ja: '遺跡に入る前に近くのトロイ博物館に立ち寄ってみてください。出土品を見ることで、発掘された地層が非常に理解しやすくなります。',
      },
    },
    {
      ref: { city: 'edirne', id: 'rNagnfRTOCFkmTcSJueR' },
      note: {
        tr: 'Mimar Sinan’ın ustalık eserim dediği cami. Edirne’nin taş köprüleri ve Meriç kıyısıyla birlikte bir hafta sonuna rahatça sığıyor.',
        en: 'The mosque Mimar Sinan called his masterpiece. Together with Edirne’s stone bridges and the banks of the Meriç, it fits easily into a weekend.',
        ru: 'Мечеть, которую Мимар Синан называл своим шедевром. Вместе с каменными мостами Эдирне и берегом Марицы легко укладывается в выходные.',
        ar: 'الجامع الذي وصفه المعمار سنان بأنه تحفته. ويمكن مع جسور أدرنة الحجرية وضفاف نهر مريج أن يملأ عطلة نهاية أسبوع.',
        de: 'Die Moschee, die Mimar Sinan als sein Meisterwerk bezeichnete. Zusammen mit den Steinbrücken von Edirne und den Ufern der Mariza lässt sie sich perfekt in ein Wochenende einbinden.',
        es: 'La mezquita que Mimar Sinan consideraba su obra maestra. Junto con los puentes de piedra de Edirne y las orillas del río Meriç, encaja fácilmente en una escapada de fin de semana.',
        ja: 'ミマル・シナンが自身の最高傑作と称したモスクです。エディルネの石橋やメリチ川の土手とともに、週末の小旅行にぴったりです。',
      },
    },
    {
      ref: { city: 'aksaray', id: 'SmtH7tVMYx6pBUV77BpK' },
      note: {
        tr: 'Melendiz Çayı boyunca uzanan yaklaşık 14 km’lik vadi baharda yemyeşil. Kayaya oyulmuş kiliseler yürüyüş yolunun iki yanına dağılmış durumda.',
        en: 'The valley follows the Melendiz stream for about 14 km and is at its greenest in spring. Rock-cut churches are scattered on both sides of the path.',
        ru: 'Долина тянется вдоль реки Мелендиз примерно на 14 км и весной особенно зелёная. Пещерные церкви разбросаны по обе стороны тропы.',
        ar: 'يمتد الوادي بمحاذاة جدول ملنديز نحو 14 كيلومتراً ويكون في أشد خضرته في الربيع، والكنائس المنحوتة في الصخر منتشرة على جانبي المسار.',
        de: 'Das Tal folgt dem Fluss Melendiz für etwa 14 km und zeigt sich im Frühling von seiner grünsten Seite. Felsenkirchen sind auf beiden Seiten des Weges verstreut.',
        es: 'El valle sigue el arroyo Melendiz durante unos 14 km y alcanza su máximo verde en primavera. Las iglesias excavadas en la roca se dispersan a ambos lados del sendero.',
        ja: 'この渓谷はメレンディズ川に沿って約14km続き、春には最も緑が深くなります。遊歩道の両側には岩をくり抜いた教会が点在しています。',
      },
    },
  ],
  summer: [
    {
      ref: { city: 'rize', id: 'W5sW6tP34JpJEWW44mXr' },
      note: {
        tr: 'Sıcaktan kaçmak için en iyi adreslerden biri; gündüz bile serin. Yakındaki Pokut ve Gito yaylalarına yarım günlük gezi yapılabilir.',
        en: 'One of the best places to escape the heat; it stays cool even in the daytime. The nearby Pokut and Gito plateaus make good half-day trips.',
        ru: 'Одно из лучших мест, чтобы спрятаться от жары: прохладно даже днём. На соседние плато Покут и Гито можно съездить на полдня.',
        ar: 'من أفضل الأماكن للهرب من الحر؛ الجو معتدل حتى في النهار. ويمكن زيارة هضبتي بوكوت وغيتو القريبتين في نصف يوم.',
        de: 'Einer der besten Zufluchtsorte vor der Hitze; selbst tagsüber bleibt es hier kühl. Die nahegelegenen Hochplateaus von Pokut und Gito eignen sich hervorragend für Halbtagesausflüge.',
        es: 'Uno de los mejores lugares para escapar del calor; se mantiene fresco incluso durante el día. Las cercanas mesetas de Pokut y Gito son ideales para excursiones de medio día.',
        ja: '暑さから逃れるのに最高の場所の一つで、日中でも涼しさが保たれています。近くのポクト高原やギト高原は、半日観光に最適です。',
      },
    },
    {
      ref: { city: 'adiyaman', id: 'Ztm3OZpMlwR2ZatL9Mne' },
      note: {
        tr: 'Zirve yolu kışın çoğu zaman kapalı; yazın gün doğumunda ya da batımında dev heykellerin arasında olmak buranın asıl deneyimi. Tepede hava serin, yanınıza hırka alın.',
        en: 'The summit road is often closed in winter. In summer, being among the giant statues at sunrise or sunset is the whole point. It gets cold at the top, so bring a layer.',
        ru: 'Зимой дорога к вершине часто закрыта. Летом главное — встретить среди гигантских статуй рассвет или закат. Наверху прохладно, возьмите тёплую кофту.',
        ar: 'غالباً ما يُغلق طريق القمة في الشتاء. أما في الصيف فجوهر الزيارة هو الوقوف بين التماثيل العملاقة عند الشروق أو الغروب. الجو بارد في الأعلى، فاحمل سترة.',
        de: 'Die Gipfelstraße ist im Winter oft gesperrt. Im Sommer ist es das eigentliche Highlight, bei Sonnenaufgang oder -untergang zwischen den riesigen Statuen zu sein. Oben wird es kalt, nehmen Sie also eine Jacke mit.',
        es: 'La carretera de la cumbre suele estar cerrada en invierno. En verano, estar entre las estatuas gigantes al amanecer o al atardecer es lo principal. Hace frío en la cima, así que lleve ropa de abrigo.',
        ja: '山頂への道路は冬期には閉鎖されることがよくあります。夏には、日の出や日没の時に巨大な彫像の間で過ごすのが最大の醍醐味です。山頂は冷え込むため、一枚羽織るものをお持ちください。',
      },
    },
    {
      ref: { city: 'burdur', id: 'XhezLICIXWoGz6BMkDvJ' },
      note: {
        tr: 'Beyaz kıyıları ve turkuaz rengiyle tanınıyor. Göl özel koruma altında; yalnızca belirlenmiş alanları kullanın ve kıyıdaki beyaz tortulara basmayın.',
        en: 'Known for its white shores and turquoise water. The lake is specially protected: stay within the designated areas and don’t step on the white sediment along the shore.',
        ru: 'Известно белыми берегами и бирюзовой водой. Озеро находится под особой охраной: оставайтесь в отведённых зонах и не ходите по белым отложениям у берега.',
        ar: 'تشتهر بشواطئها البيضاء ومياهها الفيروزية. البحيرة تحت حماية خاصة؛ التزم بالمناطق المخصصة ولا تدُس على الترسبات البيضاء على الشاطئ.',
        de: 'Bekannt für seine weißen Ufer und das türkisfarbene Wasser. Der See steht unter besonderem Schutz: Bitte bleiben Sie in den dafür vorgesehenen Bereichen und treten Sie nicht auf die weißen Sedimente am Ufer.',
        es: 'Conocido por sus costas blancas y agua turquesa. El lago está especialmente protegido: permanezca en las áreas designadas y no pise el sedimento blanco de la orilla.',
        ja: '白い砂浜とターコイズブルーの海で知られています。湖は特別に保護されているため、指定されたエリア内に留まり、岸辺の白い堆積物には立ち入らないようにしてください。',
      },
    },
    {
      ref: { city: 'antalya', id: 'IiiMwvnsbPksKERm8KEq' },
      note: {
        tr: 'Batık kent kalıntılarını görmenin en kolay yolu tekne turu; su yazın en berrak halinde. Kalıntıların üzerinde yüzmek ve dalmak yasak.',
        en: 'A boat tour is the easiest way to see the sunken ruins, and the water is clearest in summer. Swimming and diving over the ruins is forbidden.',
        ru: 'Проще всего увидеть затонувшие руины с лодки, а вода летом самая прозрачная. Плавать и нырять над руинами запрещено.',
        ar: 'أسهل طريقة لرؤية أطلال المدينة الغارقة هي جولة بالقارب، والمياه في أصفى حالاتها صيفاً. السباحة والغوص فوق الأطلال ممنوعان.',
        de: 'Eine Bootstour ist der einfachste Weg, um die versunkenen Ruinen zu sehen, und das Wasser ist im Sommer am klarsten. Das Schwimmen und Tauchen über den Ruinen ist verboten.',
        es: 'Un paseo en bote es la forma más fácil de ver las ruinas sumergidas, y el agua es más clara en verano. Está prohibido nadar y bucear sobre las ruinas.',
        ja: '水没した遺跡を見るにはボートツアーが一番手軽で、水が最も透き通るのは夏です。遺跡の上での遊泳やダイビングは禁止されています。',
      },
    },
    {
      ref: { city: 'canakkale', id: 'DIW5Ttxpi8wiQryFuXzX' },
      note: {
        tr: 'Bağları, kalesi ve rüzgârıyla küçük bir ada. Feribotlar Geyikli iskelesinden kalkıyor; yaz aylarında araç sırası uzun olabiliyor.',
        en: 'A small island of vineyards, a castle and steady wind. Ferries leave from Geyikli; in summer the queue for cars can be long.',
        ru: 'Небольшой остров с виноградниками, крепостью и постоянным ветром. Паромы отходят из Гейикли; летом очередь для машин бывает длинной.',
        ar: 'جزيرة صغيرة من الكروم والقلعة والرياح. تنطلق العبّارات من ميناء غييكلي، وقد يطول طابور السيارات في الصيف.',
        de: 'Eine kleine Insel voller Weinberge, mit einer Burg und stetigem Wind. Fähren legen in Geyikli ab; im Sommer kann die Warteschlange für Autos lang sein.',
        es: 'Una pequeña isla de viñedos, un castillo y viento constante. Los ferris salen desde Geyikli; en verano la fila para automóviles puede ser larga.',
        ja: 'ブドウ畑、城、そして常に吹き抜ける風が特徴の小さな島です。ゲイクリからフェリーが出ていますが、夏場は車の列が長くなることがあります。',
      },
    },
    {
      ref: { city: 'van', id: 'f1j4hIgxJqnWMhmtaLLv' },
      note: {
        tr: '10. yüzyıldan kalan kilisenin dış cephe kabartmaları olağanüstü iyi korunmuş. Adaya Gevaş’tan kalkan teknelerle yaklaşık 20 dakikada geçiliyor.',
        en: 'The 10th-century church has remarkably well-preserved reliefs on its outer walls. Boats from Gevaş reach the island in about 20 minutes.',
        ru: 'На внешних стенах церкви X века прекрасно сохранились рельефы. Лодки из Геваша доходят до острова примерно за 20 минут.',
        ar: 'تحتفظ الكنيسة التي تعود إلى القرن العاشر بنقوش خارجية محفوظة بشكل لافت. تصل القوارب من غواش إلى الجزيرة في نحو 20 دقيقة.',
        de: 'Die Kirche aus dem 10. Jahrhundert besitzt bemerkenswert gut erhaltene Reliefs an ihren Außenwänden. Boote ab Gevaş erreichen die Insel in etwa 20 Minuten.',
        es: 'La iglesia del siglo X tiene relieves notablemente bien conservados en sus muros exteriores. Los botes desde Gevaş llegan a la isla en unos 20 minutos.',
        ja: '10世紀に建てられた教会は、外壁のレリーフが驚くほど良好な状態で保存されています。ゲヴァシュからのボートで島へは約20分で到着します。',
      },
    },
  ],
};
