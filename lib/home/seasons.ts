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
  return `إلى أين تذهب في ${name}؟`;
}

export const SEASON_LEAD: Record<SeasonKey, Record<Locale, string>> = {
  autumn: {
    tr: 'Yaz sıcağı geçti, kalabalık dağıldı. Ege, Kapadokya ve Güneydoğu için yılın en rahat haftaları; Karadeniz ve Bolu ormanları da renk değiştirmeye başladı.',
    en: 'The summer heat is gone and the crowds have thinned. These are the easiest weeks of the year for the Aegean, Cappadocia and the southeast, and the forests of the Black Sea and Bolu are starting to turn.',
    ru: 'Летняя жара спала, туристов стало меньше. Самое удобное время для Эгейского побережья, Каппадокии и юго-востока, а леса Причерноморья и Болу начинают менять цвет.',
    ar: 'انتهى حرّ الصيف وخفّت الزحمة. هذه أنسب أسابيع السنة لزيارة بحر إيجة وكابادوكيا والجنوب الشرقي، وبدأت غابات البحر الأسود وبولو تتلوّن.',
  },
  winter: {
    tr: 'Kış, büyük müzeleri acele etmeden gezmek ve karla kaplı Kapadokya ya da Kars gibi yerleri bambaşka bir halde görmek için iyi bir zaman.',
    en: 'Winter is a good time to take the big museums slowly and to see places like Cappadocia or Kars under snow, when they look completely different.',
    ru: 'Зима — хорошее время, чтобы не спеша обойти крупные музеи и увидеть Каппадокию или Карс под снегом, совсем другими.',
    ar: 'الشتاء وقت مناسب لزيارة المتاحف الكبرى على مهل، ولرؤية أماكن مثل كابادوكيا وقارص تحت الثلج بمظهر مختلف تماماً.',
  },
  spring: {
    tr: 'Bahar, güney kıyılarındaki antik kentleri sıcak bastırmadan görmenin en iyi zamanı. Vadiler yeşil, dağ yamaçları çiçekli.',
    en: 'Spring is the best time to see the ancient cities of the south coast before the heat sets in. The valleys are green and the hillsides are in flower.',
    ru: 'Весна — лучшее время для античных городов южного побережья, пока не наступила жара. Долины зеленеют, склоны гор в цветах.',
    ar: 'الربيع أفضل وقت لرؤية المدن الأثرية على الساحل الجنوبي قبل اشتداد الحر. الأودية خضراء والمنحدرات مزهرة.',
  },
  summer: {
    tr: 'Güneyde öğle saatleri zorlayıcı olabilir; yazın yaylalar, göller ve adalar öne çıkıyor. Doğu Anadolu’nun yüksek kesimleri de ancak bu aylarda tam olarak gezilebiliyor.',
    en: 'Midday in the south can be punishing, so summer is the season for highland plateaus, lakes and islands. The high parts of Eastern Anatolia are only fully accessible in these months.',
    ru: 'На юге в полдень бывает очень жарко, поэтому летом на первый план выходят плато, озёра и острова. Высокогорья Восточной Анатолии полностью доступны только в эти месяцы.',
    ar: 'قد تكون ساعات الظهيرة في الجنوب مرهقة، لذا تبرز في الصيف الهضاب والبحيرات والجزر. كما أن المرتفعات في شرق الأناضول لا يمكن زيارتها بالكامل إلا في هذه الأشهر.',
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
      },
    },
    {
      ref: { city: 'sanliurfa', id: 'W0MS0rpQIcFXTufTZ3UM' },
      note: {
        tr: 'Temmuzda 40 dereceyi aşan Şanlıurfa’yı gezmek için en rahat aylar bunlar. Alanda gölge az; sabah erken gitmek hâlâ iyi fikir.',
        en: 'Şanlıurfa passes 40°C in July, so these are the most comfortable months to visit. There is little shade on site, so going early is still a good idea.',
        ru: 'В июле в Шанлыурфе бывает за 40 °C, так что сейчас самые комфортные месяцы. Тени на раскопе мало — ехать лучше с утра.',
        ar: 'تتجاوز الحرارة في شانلي أورفا 40 درجة في يوليو، لذا هذه أنسب الأشهر للزيارة. الظل قليل في الموقع، والذهاب باكراً فكرة جيدة.',
      },
    },
    {
      ref: { city: 'izmir', id: 'QwwZhZOToP7dhUvLVIpO' },
      note: {
        tr: 'Kalabalık azaldı, mermer caddeler öğlen bile yakmıyor. Celsus Kütüphanesi’ni kapanışa yakın, ışık yumuşakken görmeye çalışın.',
        en: 'The crowds are smaller and the marble streets no longer burn at noon. Try to see the Library of Celsus near closing time, when the light is soft.',
        ru: 'Людей меньше, мраморные улицы уже не раскаляются к полудню. Библиотеку Цельса лучше смотреть ближе к закрытию, при мягком свете.',
        ar: 'قلّ الزوار ولم تعد الشوارع الرخامية تلتهب عند الظهر. حاول رؤية مكتبة سيلسوس قرب موعد الإغلاق حين يكون الضوء ناعماً.',
      },
    },
    {
      ref: { city: 'bolu', id: 'pgsaWKL1ToG61hj6O3cI' },
      note: {
        tr: 'Ekim sonu ile kasım başında gölün çevresindeki kayın ve meşeler sarıya, kızıla döner. Gölü çevreleyen yaklaşık 7 km’lik yürüyüş yolu tek başına gitmek için bir sebep.',
        en: 'In late October and early November the beech and oak trees around the lake turn yellow and red. The roughly 7 km path around the lake is reason enough to go.',
        ru: 'В конце октября и начале ноября буки и дубы вокруг озера желтеют и краснеют. Одна только тропа длиной около 7 км вокруг озера стоит поездки.',
        ar: 'في أواخر أكتوبر وأوائل نوفمبر تتحول أشجار الزان والبلوط حول البحيرة إلى الأصفر والأحمر. ومسار المشي حول البحيرة، بطول 7 كيلومترات تقريباً، سبب كافٍ للذهاب.',
      },
    },
    {
      ref: { city: 'karabuk', id: 'LuoBU0nNsLDs5qW1BJ4s' },
      note: {
        tr: 'Serin havada çarşı ile konaklar arasında dolaşmak keyifli. Akşamüstü Hıdırlık Tepesi’ne çıkıp kiremit çatılara yukarıdan bakın.',
        en: 'Cool weather makes it pleasant to wander between the bazaar and the mansions. In the late afternoon, climb Hıdırlık Hill and look down over the tiled roofs.',
        ru: 'В прохладную погоду приятно бродить между базаром и старыми особняками. Под вечер поднимитесь на холм Хыдырлык и посмотрите на черепичные крыши сверху.',
        ar: 'الطقس المعتدل يجعل التجوّل بين السوق والقصور العثمانية ممتعاً. اصعد عند العصر إلى تلة خدرلك وانظر إلى الأسطح القرميدية من الأعلى.',
      },
    },
    {
      ref: { city: 'mardin', id: 'bRKX8oaUxvCoNvHSTNcc' },
      note: {
        tr: 'Mezopotamya ovasının sıcağı kırılınca Mardin’in taş sokakları yeniden yürünür hale geliyor. Manastır şehir merkezine yaklaşık 5 km uzaklıkta.',
        en: 'Once the heat of the Mesopotamian plain breaks, Mardin’s stone streets become walkable again. The monastery is about 5 km from the town centre.',
        ru: 'Когда спадает жара Месопотамской равнины, по каменным улочкам Мардина снова можно гулять. Монастырь — примерно в 5 км от центра.',
        ar: 'حين تنكسر حرارة سهل ميزوبوتاميا تعود أزقّة ماردين الحجرية صالحة للمشي. يبعد الدير نحو 5 كيلومترات عن وسط المدينة.',
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
      },
    },
    {
      ref: { city: 'kars', id: '5epTWIj4pBD3n35iyaAw' },
      note: {
        tr: 'Karla kaplı Ani bambaşka görünür. Kars’a Doğu Ekspresi ile gitmek başlı başına bir deneyim; biletleri erken almak gerekiyor.',
        en: 'Ani under snow looks like a different place. Getting to Kars on the Doğu Ekspresi train is an experience in itself, but tickets need to be booked early.',
        ru: 'Заснеженный Ани выглядит совсем иначе. Поездка в Карс на поезде «Доу Экспреси» — отдельное впечатление, билеты стоит брать заранее.',
        ar: 'تبدو آني تحت الثلج مكاناً آخر. والوصول إلى قارص بقطار «الشرق السريع» تجربة بحد ذاتها، لكن التذاكر تحتاج إلى حجز مبكر.',
      },
    },
    {
      ref: { city: 'erzurum', id: 'Uxqj4Nrbl4IeiVELqAQN' },
      note: {
        tr: 'Sabah Palandöken’de kayak yapıp öğleden sonra şehirdeki Selçuklu yapılarını gezmek mümkün. Medresenin iki minaresi Erzurum’un simgesi.',
        en: 'You can ski on Palandöken in the morning and see the city’s Seljuk buildings in the afternoon. The madrasa’s twin minarets are the symbol of Erzurum.',
        ru: 'Утром можно покататься на лыжах в Паландёкене, а днём осмотреть сельджукские постройки города. Два минарета медресе — символ Эрзурума.',
        ar: 'يمكنك التزلج صباحاً في بالاندوكن ثم زيارة المباني السلجوقية في المدينة بعد الظهر. مئذنتا المدرسة رمز أرضروم.',
      },
    },
    {
      ref: { city: 'gaziantep', id: 'o5ArQz9Qck07EGbeJqnY' },
      note: {
        tr: 'Kapalı ve geniş bir müze; soğuk bir günde saatlerce gezilebilir. Ünlü “Çingene Kızı” mozaiği ayrı, loş bir odada sergileniyor.',
        en: 'A large indoor museum you can spend hours in on a cold day. The famous “Gypsy Girl” mosaic is displayed in its own dimly lit room.',
        ru: 'Большой крытый музей, где в холодный день можно провести несколько часов. Знаменитая мозаика «Цыганская девочка» выставлена в отдельном затемнённом зале.',
        ar: 'متحف مغلق وواسع يمكن قضاء ساعات فيه في يوم بارد. تُعرض فسيفساء «الفتاة الغجرية» الشهيرة في غرفة خاصة خافتة الإضاءة.',
      },
    },
    {
      ref: { city: 'ankara', id: 'IDtR2FG5KkW6yZ7tbLgk' },
      note: {
        tr: 'Paleolitik çağdan Osmanlı’ya Anadolu’nun tamamı tek binada. Çıkışta hemen yukarıdaki Ankara Kalesi’ne yürüyüp kışın berrak havasında şehre bakın.',
        en: 'All of Anatolia, from the Palaeolithic to the Ottomans, under one roof. Afterwards, walk up to Ankara Castle right above and look over the city in the clear winter air.',
        ru: 'Вся Анатолия — от палеолита до османов — в одном здании. После музея поднимитесь к крепости Анкары прямо над ним и посмотрите на город в ясном зимнем воздухе.',
        ar: 'الأناضول كله، من العصر الحجري القديم حتى العثمانيين، في مبنى واحد. بعد الزيارة اصعد إلى قلعة أنقرة القريبة وتأمل المدينة في هواء الشتاء الصافي.',
      },
    },
    {
      ref: { city: 'nevsehir', id: 'vzdIRj89n08eamyyw0GI' },
      note: {
        tr: 'Kar yağdığında peribacaları beyaza bürünür, kalabalık da azalır. Kalenin tepesinden Göreme’nin vadilerinin tamamı görünür.',
        en: 'When it snows, the fairy chimneys turn white and the crowds disappear. From the top of the castle you can see all of Göreme’s valleys.',
        ru: 'Когда выпадает снег, скалы-«дымоходы» белеют, а туристов почти нет. С вершины крепости видны все долины Гёреме.',
        ar: 'حين يتساقط الثلج تكتسي المداخن الصخرية بالبياض ويقلّ الزوار. ومن قمة القلعة تظهر أودية غوريمة كلها.',
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
      },
    },
    {
      ref: { city: 'antalya', id: '86BnIWEiKIyHA8t5gIaX' },
      note: {
        tr: 'Roma döneminden kalan en iyi korunmuş tiyatrolardan biri. Nisan ve mayısta Antalya sıcağı henüz bastırmadan rahatça gezilebiliyor.',
        en: 'One of the best-preserved Roman theatres anywhere. In April and May you can visit comfortably before the Antalya heat sets in.',
        ru: 'Один из лучше всего сохранившихся римских театров. В апреле и мае его удобно осматривать, пока не пришла анталийская жара.',
        ar: 'من أفضل المسارح الرومانية حفظاً. في أبريل ومايو يمكن زيارته براحة قبل أن تشتد حرارة أنطاليا.',
      },
    },
    {
      ref: { city: 'burdur', id: 'HYwGe6X8nCtqpBNTbTMa' },
      note: {
        tr: '1.500 metre civarında, Toroslar’ın arasında bir antik kent. Karlar erir erimez yamaçlar kır çiçekleriyle kaplanıyor.',
        en: 'An ancient city at around 1,500 metres in the Taurus Mountains. As soon as the snow melts, the slopes fill with wildflowers.',
        ru: 'Античный город на высоте около 1500 метров в горах Тавр. Как только сходит снег, склоны покрываются полевыми цветами.',
        ar: 'مدينة أثرية على ارتفاع نحو 1500 متر في جبال طوروس. ما إن يذوب الثلج حتى تكتسي المنحدرات بالزهور البرية.',
      },
    },
    {
      ref: { city: 'canakkale', id: 'GFmsCgNPLi15KiiT9Ii6' },
      note: {
        tr: 'Ören yerinden önce yakınındaki Troya Müzesi’ne uğrayın; buluntular kazı katmanlarını anlamayı çok kolaylaştırıyor.',
        en: 'Stop at the nearby Troy Museum before the site; the finds make the layers of the excavation much easier to understand.',
        ru: 'Перед раскопками загляните в соседний музей Трои — находки помогают разобраться в слоях древнего города.',
        ar: 'مرّ على متحف طروادة القريب قبل الموقع؛ فالمكتشفات تسهّل كثيراً فهم طبقات التنقيب.',
      },
    },
    {
      ref: { city: 'edirne', id: 'rNagnfRTOCFkmTcSJueR' },
      note: {
        tr: 'Mimar Sinan’ın ustalık eserim dediği cami. Edirne’nin taş köprüleri ve Meriç kıyısıyla birlikte bir hafta sonuna rahatça sığıyor.',
        en: 'The mosque Mimar Sinan called his masterpiece. Together with Edirne’s stone bridges and the banks of the Meriç, it fits easily into a weekend.',
        ru: 'Мечеть, которую Мимар Синан называл своим шедевром. Вместе с каменными мостами Эдирне и берегом Марицы легко укладывается в выходные.',
        ar: 'الجامع الذي وصفه المعمار سنان بأنه تحفته. ويمكن مع جسور أدرنة الحجرية وضفاف نهر مريج أن يملأ عطلة نهاية أسبوع.',
      },
    },
    {
      ref: { city: 'aksaray', id: 'SmtH7tVMYx6pBUV77BpK' },
      note: {
        tr: 'Melendiz Çayı boyunca uzanan yaklaşık 14 km’lik vadi baharda yemyeşil. Kayaya oyulmuş kiliseler yürüyüş yolunun iki yanına dağılmış durumda.',
        en: 'The valley follows the Melendiz stream for about 14 km and is at its greenest in spring. Rock-cut churches are scattered on both sides of the path.',
        ru: 'Долина тянется вдоль реки Мелендиз примерно на 14 км и весной особенно зелёная. Пещерные церкви разбросаны по обе стороны тропы.',
        ar: 'يمتد الوادي بمحاذاة جدول ملنديز نحو 14 كيلومتراً ويكون في أشد خضرته في الربيع، والكنائس المنحوتة في الصخر منتشرة على جانبي المسار.',
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
      },
    },
    {
      ref: { city: 'adiyaman', id: 'Ztm3OZpMlwR2ZatL9Mne' },
      note: {
        tr: 'Zirve yolu kışın çoğu zaman kapalı; yazın gün doğumunda ya da batımında dev heykellerin arasında olmak buranın asıl deneyimi. Tepede hava serin, yanınıza hırka alın.',
        en: 'The summit road is often closed in winter. In summer, being among the giant statues at sunrise or sunset is the whole point. It gets cold at the top, so bring a layer.',
        ru: 'Зимой дорога к вершине часто закрыта. Летом главное — встретить среди гигантских статуй рассвет или закат. Наверху прохладно, возьмите тёплую кофту.',
        ar: 'غالباً ما يُغلق طريق القمة في الشتاء. أما في الصيف فجوهر الزيارة هو الوقوف بين التماثيل العملاقة عند الشروق أو الغروب. الجو بارد في الأعلى، فاحمل سترة.',
      },
    },
    {
      ref: { city: 'burdur', id: 'XhezLICIXWoGz6BMkDvJ' },
      note: {
        tr: 'Beyaz kıyıları ve turkuaz rengiyle tanınıyor. Göl özel koruma altında; yalnızca belirlenmiş alanları kullanın ve kıyıdaki beyaz tortulara basmayın.',
        en: 'Known for its white shores and turquoise water. The lake is specially protected: stay within the designated areas and don’t step on the white sediment along the shore.',
        ru: 'Известно белыми берегами и бирюзовой водой. Озеро находится под особой охраной: оставайтесь в отведённых зонах и не ходите по белым отложениям у берега.',
        ar: 'تشتهر بشواطئها البيضاء ومياهها الفيروزية. البحيرة تحت حماية خاصة؛ التزم بالمناطق المخصصة ولا تدُس على الترسبات البيضاء على الشاطئ.',
      },
    },
    {
      ref: { city: 'antalya', id: 'IiiMwvnsbPksKERm8KEq' },
      note: {
        tr: 'Batık kent kalıntılarını görmenin en kolay yolu tekne turu; su yazın en berrak halinde. Kalıntıların üzerinde yüzmek ve dalmak yasak.',
        en: 'A boat tour is the easiest way to see the sunken ruins, and the water is clearest in summer. Swimming and diving over the ruins is forbidden.',
        ru: 'Проще всего увидеть затонувшие руины с лодки, а вода летом самая прозрачная. Плавать и нырять над руинами запрещено.',
        ar: 'أسهل طريقة لرؤية أطلال المدينة الغارقة هي جولة بالقارب، والمياه في أصفى حالاتها صيفاً. السباحة والغوص فوق الأطلال ممنوعان.',
      },
    },
    {
      ref: { city: 'canakkale', id: 'DIW5Ttxpi8wiQryFuXzX' },
      note: {
        tr: 'Bağları, kalesi ve rüzgârıyla küçük bir ada. Feribotlar Geyikli iskelesinden kalkıyor; yaz aylarında araç sırası uzun olabiliyor.',
        en: 'A small island of vineyards, a castle and steady wind. Ferries leave from Geyikli; in summer the queue for cars can be long.',
        ru: 'Небольшой остров с виноградниками, крепостью и постоянным ветром. Паромы отходят из Гейикли; летом очередь для машин бывает длинной.',
        ar: 'جزيرة صغيرة من الكروم والقلعة والرياح. تنطلق العبّارات من ميناء غييكلي، وقد يطول طابور السيارات في الصيف.',
      },
    },
    {
      ref: { city: 'van', id: 'f1j4hIgxJqnWMhmtaLLv' },
      note: {
        tr: '10. yüzyıldan kalan kilisenin dış cephe kabartmaları olağanüstü iyi korunmuş. Adaya Gevaş’tan kalkan teknelerle yaklaşık 20 dakikada geçiliyor.',
        en: 'The 10th-century church has remarkably well-preserved reliefs on its outer walls. Boats from Gevaş reach the island in about 20 minutes.',
        ru: 'На внешних стенах церкви X века прекрасно сохранились рельефы. Лодки из Геваша доходят до острова примерно за 20 минут.',
        ar: 'تحتفظ الكنيسة التي تعود إلى القرن العاشر بنقوش خارجية محفوظة بشكل لافت. تصل القوارب من غواش إلى الجزيرة في نحو 20 دقيقة.',
      },
    },
  ],
};
