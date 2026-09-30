import type { Locale } from '../listings';
import type { PlaceRef } from './places';

export type HomeRoute = {
  id: string;
  days: number;
  stops: PlaceRef[];
  copy: Record<Locale, { title: string; summary: string }>;
};

export const HOME_ROUTES: HomeRoute[] = [
  {
    id: 'istanbul-tarihi-yarimada',
    days: 1,
    stops: [
      { city: 'istanbul', id: 'tAhmK3g81xN8BYqRUm9E' },
      { city: 'istanbul', id: 'eoGmvy0inGkkPddv8y7Y' },
      { city: 'istanbul', id: 'EC2r7gZDKkjceFl2hNLZ' },
      { city: 'istanbul', id: 'dUJuY0RbdMKImg3TFcZh' },
      { city: 'istanbul', id: 'hS0qKkBm99C1gRL1oBQ0' },
    ],
    copy: {
      tr: {
        title: 'İstanbul Tarihi Yarımada',
        summary:
          'Sabah Sultanahmet Meydanı’ndan başlayın: Ayasofya, Sultanahmet Camii ve Yerebatan Sarnıcı birbirine birkaç dakika yürüme mesafesinde. Öğleden sonrayı Topkapı Sarayı’na ayırın, günü Haliç’in karşı yakasında Galata Kulesi’nde bitirin.',
      },
      en: {
        title: 'Istanbul’s Historic Peninsula',
        summary:
          'Start early at Sultanahmet Square: Hagia Sophia, the Blue Mosque and the Basilica Cistern are only a few minutes apart on foot. Give the afternoon to Topkapı Palace, then cross the Golden Horn and end the day at Galata Tower.',
      },
      ru: {
        title: 'Исторический полуостров Стамбула',
        summary:
          'Начните утром с площади Султанахмет: Айя-София, Голубая мечеть и цистерна Базилика находятся в нескольких минутах ходьбы друг от друга. После обеда — дворец Топкапы, а вечером переходите через Золотой Рог к Галатской башне.',
      },
      ar: {
        title: 'شبه الجزيرة التاريخية في إسطنبول',
        summary:
          'ابدأ صباحاً من ميدان السلطان أحمد: آيا صوفيا والجامع الأزرق وصهريج البازيليك على بعد دقائق سيراً. خصّص فترة ما بعد الظهر لقصر طوب قابي، ثم اعبر القرن الذهبي لتنهي يومك عند برج غلطة.',
      },
    },
  },
  {
    id: 'kapadokya-iki-gun',
    days: 2,
    stops: [
      { city: 'nevsehir', id: 'AzENom7TicgQSs4Fu5ng' },
      { city: 'nevsehir', id: '9z7Xw9I8EsFVuqPVvty2' },
      { city: 'nevsehir', id: '5vj6zu1Nz3d6TKsnx15h' },
      { city: 'nevsehir', id: 'vzdIRj89n08eamyyw0GI' },
      { city: 'nevsehir', id: 'NnCZvqm65OQyt0w8xvzd' },
      { city: 'aksaray', id: 'SmtH7tVMYx6pBUV77BpK' },
    ],
    copy: {
      tr: {
        title: 'Kapadokya’da İki Gün',
        summary:
          'İlk gün Göreme Açık Hava Müzesi’nin kaya kiliseleriyle başlayıp Paşabağ ve Zelve’nin peribacalarına geçin, gün batımını Uçhisar Kalesi’nde izleyin. İkinci gün yerin altına inin: Derinkuyu’dan sonra Ihlara Vadisi’nde dere boyunca yürüyün.',
      },
      en: {
        title: 'Two Days in Cappadocia',
        summary:
          'On day one, start with the rock-cut churches of Göreme Open-Air Museum, move on to the fairy chimneys of Paşabağ and Zelve, and watch the sunset from Uçhisar Castle. On day two, go underground at Derinkuyu, then walk along the stream through Ihlara Valley.',
      },
      ru: {
        title: 'Два дня в Каппадокии',
        summary:
          'В первый день — пещерные церкви музея под открытым небом Гёреме, затем «каменные грибы» Пашабаг и Зельве и закат с крепости Учхисар. Во второй день спуститесь в подземный город Деринкую, а потом пройдите вдоль ручья по долине Ыхлара.',
      },
      ar: {
        title: 'يومان في كابادوكيا',
        summary:
          'في اليوم الأول ابدأ بالكنائس المنحوتة في متحف غوريمة المفتوح، ثم مداخن الجنيات في باشا باغ وزلفه، وشاهد الغروب من قلعة أوتشحصار. في اليوم الثاني انزل إلى مدينة ديرينكويو تحت الأرض، ثم امشِ بمحاذاة الجدول في وادي إهلارا.',
      },
    },
  },
  {
    id: 'antik-iyonya',
    days: 2,
    stops: [
      { city: 'izmir', id: 'QwwZhZOToP7dhUvLVIpO' },
      { city: 'izmir', id: 'qGCFKxRe5EPbtlKNN3cj' },
      { city: 'izmir', id: 'CM1pzMIWZyydNgmfDAIf' },
      { city: 'aydin', id: 'k60fi5cf6REDd3LyuWNv' },
      { city: 'aydin', id: 'kROzKOyt7LrPqWEf5wnr' },
      { city: 'aydin', id: 'B9ssyQmcB4hRGB1EuYfA' },
    ],
    copy: {
      tr: {
        title: 'Efes’ten Didim’e Antik İyonya',
        summary:
          'Efes’i sabah erken, tur otobüsleri gelmeden gezin; buluntuların çoğu Selçuk’taki Efes Müzesi’nde. Akşamı Şirince’de geçirin. Ertesi gün güneye inip Priene, Milet ve Didim’deki Apollon Tapınağı’nı aynı günde görebilirsiniz.',
      },
      en: {
        title: 'Ancient Ionia: Ephesus to Didyma',
        summary:
          'See Ephesus early in the morning before the tour buses arrive; most of the finds are in the Ephesus Museum in Selçuk. Spend the evening in Şirince. The next day, head south: Priene, Miletus and the Temple of Apollo at Didyma fit into a single day.',
      },
      ru: {
        title: 'Древняя Иония: от Эфеса до Дидим',
        summary:
          'Осмотрите Эфес рано утром, до прихода туристических автобусов; большинство находок хранится в Эфесском музее в Сельчуке. Вечер проведите в Ширидже. На следующий день отправляйтесь на юг: Приена, Милет и храм Аполлона в Дидимах легко умещаются в один день.',
      },
      ar: {
        title: 'إيونيا القديمة: من أفسس إلى ديديم',
        summary:
          'زر أفسس في الصباح الباكر قبل وصول الحافلات السياحية؛ معظم المكتشفات معروضة في متحف أفسس في سلجوق. اقضِ المساء في شيرينجه. في اليوم التالي اتجه جنوباً: بريني وميليتوس ومعبد أبولو في ديديم تتسع ليوم واحد.',
      },
    },
  },
  {
    id: 'likya-kiyisi',
    days: 3,
    stops: [
      { city: 'mugla', id: 'nKphUSxlc3l5i4SxZZKu' },
      { city: 'mugla', id: 'HeUeKgIc2w0yG44YtPbF' },
      { city: 'antalya', id: 'w42irveEWguKV4YvqY1i' },
      { city: 'antalya', id: 'DyjDGUB7ZP1EVMWXhdRp' },
      { city: 'antalya', id: '1hYT9uAPojmHn4UgnKPd' },
      { city: 'antalya', id: 'IiiMwvnsbPksKERm8KEq' },
      { city: 'antalya', id: 'Ib5gHlSYGWxx7Xh9rqaV' },
      { city: 'antalya', id: 'EjGjfS5LhlBS45vsB78p' },
    ],
    copy: {
      tr: {
        title: 'Likya Kıyısı Boyunca',
        summary:
          'Fethiye’den Antalya’ya uzanan kıyı yolu Likya kentlerini sırayla dolaşır. Tlos’un kaya mezarlarından sonra Letoon ve Xanthos’a, oradan 18 km’lik kumsalıyla Patara’ya geçin. Demre’de Myra’yı gördükten sonra Kekova’nın batık kalıntılarına tekneyle gidin; son durak Olympos.',
      },
      en: {
        title: 'Along the Lycian Coast',
        summary:
          'The coastal road from Fethiye to Antalya passes the Lycian cities one after another. After the rock tombs of Tlos, visit Letoon and Xanthos, then continue to Patara and its 18-kilometre beach. See Myra in Demre, take a boat to the sunken ruins of Kekova, and finish at Olympos.',
      },
      ru: {
        title: 'Вдоль Ликийского побережья',
        summary:
          'Прибрежная дорога от Фетхие до Анталии проходит мимо ликийских городов один за другим. После скальных гробниц Тлоса — Летоон и Ксанф, затем Патара с 18-километровым пляжем. В Демре осмотрите Миру, на лодке доберитесь до затонувших руин Кековы и завершите путь в Олимпосе.',
      },
      ar: {
        title: 'على امتداد الساحل الليقي',
        summary:
          'يمرّ الطريق الساحلي من فتحية إلى أنطاليا بالمدن الليقية واحدة تلو الأخرى. بعد مقابر تلوس الصخرية زر ليتون وزانثوس، ثم تابع إلى باتارا وشاطئها البالغ طوله 18 كيلومتراً. شاهد ميرا في دمره، واركب قارباً إلى أطلال كيكوفا الغارقة، واختم رحلتك في أوليمبوس.',
      },
    },
  },
  {
    id: 'gobeklitepe-mardin',
    days: 3,
    stops: [
      { city: 'sanliurfa', id: 'W0MS0rpQIcFXTufTZ3UM' },
      { city: 'sanliurfa', id: '31DDmn6oXG6cJmrQnTJx' },
      { city: 'sanliurfa', id: 'Kbk4k7lAvpv8qInswGim' },
      { city: 'mardin', id: 'MEvL7DVshKZrKRvoP0S8' },
      { city: 'mardin', id: 'bRKX8oaUxvCoNvHSTNcc' },
      { city: 'mardin', id: 'oWtI7B5H9O8SLpwsuk8U' },
      { city: 'mardin', id: '4cACNpiHMQPsK0jnwE3k' },
    ],
    copy: {
      tr: {
        title: 'Göbeklitepe’den Mardin’e',
        summary:
          'Şanlıurfa’da ilk durak Göbeklitepe; öğleden sonra Balıklıgöl çevresindeki çarşıda dolaşın. Ertesi sabah Harran’ın kümbet evlerine gidip Mardin’e geçin. Mardin’de Zinciriye Medresesi ile Deyrulzafaran Manastırı’nı, son gün Dara antik kenti ile Midyat yakınlarındaki Mor Gabriel Manastırı’nı görün.',
      },
      en: {
        title: 'From Göbeklitepe to Mardin',
        summary:
          'Start in Şanlıurfa with Göbeklitepe, then wander the bazaar around Balıklıgöl in the afternoon. The next morning, visit the beehive houses of Harran and drive on to Mardin. There, see the Zinciriye Madrasa and Deyrulzafaran Monastery; on the last day, visit ancient Dara and Mor Gabriel Monastery near Midyat.',
      },
      ru: {
        title: 'От Гёбекли-Тепе до Мардина',
        summary:
          'Начните в Шанлыурфе с Гёбекли-Тепе, а после обеда прогуляйтесь по базару вокруг озера Балыклыгёль. Утром следующего дня — купольные дома Харрана и дорога в Мардин. Там — медресе Зинджирие и монастырь Дейрульзафаран, а в последний день — античная Дара и монастырь Мор Габриэль около Мидьята.',
      },
      ar: {
        title: 'من غوبكلي تبه إلى ماردين',
        summary:
          'ابدأ في شانلي أورفا بزيارة غوبكلي تبه، ثم تجوّل بعد الظهر في السوق المحيط ببركة إبراهيم. في صباح اليوم التالي زر بيوت حرّان ذات القباب وتابع إلى ماردين، حيث مدرسة الزنجيرية ودير الزعفران. وفي اليوم الأخير زر مدينة دارا الأثرية ودير مار كبرئيل قرب مديات.',
      },
    },
  },
  {
    id: 'dogu-karadeniz-yaylalari',
    days: 3,
    stops: [
      { city: 'trabzon', id: 'bVLg8qijGKzzAYXgGfWO' },
      { city: 'trabzon', id: 'yfEEz9MlhDsgPrQz4z3m' },
      { city: 'trabzon', id: 'NOCzMJ8W7mf6qEJct8Xs' },
      { city: 'rize', id: 'ToBZvH1q91oeKdDYHRuL' },
      { city: 'rize', id: 'Ld3eSyzfanlb4BmOa38Z' },
      { city: 'rize', id: 'W5sW6tP34JpJEWW44mXr' },
      { city: 'rize', id: 'DAv6LvxVk8QaYgAX6WyP' },
    ],
    copy: {
      tr: {
        title: 'Doğu Karadeniz Yaylaları',
        summary:
          'Trabzon’da Ayasofya’nın fresklerini gördükten sonra Altındere Vadisi’ndeki Sümela Manastırı’na çıkın. İkinci gün Uzungöl’e, üçüncü gün Rize’ye geçip Fırtına Vadisi boyunca Zilkale’ye ve Ayder’e ilerleyin. Havası açık bir sabah Pokut Yaylası’ndaki bulut denizini kaçırmayın.',
      },
      en: {
        title: 'Eastern Black Sea Highlands',
        summary:
          'In Trabzon, see the frescoes of Hagia Sophia, then drive up to Sumela Monastery in the Altındere Valley. On day two go to Uzungöl; on day three cross into Rize and follow the Fırtına Valley to Zilkale and Ayder. On a clear morning, don’t miss the sea of clouds at Pokut plateau.',
      },
      ru: {
        title: 'Высокогорья Восточного Причерноморья',
        summary:
          'В Трабзоне посмотрите фрески Айя-Софии, затем поднимитесь к монастырю Сумела в долине Алтындере. На второй день — озеро Узунгёль, на третий — Ризе: вдоль долины Фыртына к крепости Зилькале и плато Айдер. Ясным утром не пропустите море облаков на плато Покут.',
      },
      ar: {
        title: 'هضاب البحر الأسود الشرقية',
        summary:
          'في طرابزون شاهد جداريات آيا صوفيا، ثم اصعد إلى دير سوميلا في وادي ألتين دره. في اليوم الثاني توجّه إلى أوزون غول، وفي الثالث إلى ريزه على طول وادي فيرتينا حتى قلعة زيل وهضبة آيدر. وفي صباح صافٍ لا تفوّت بحر الغيوم في هضبة بوكوت.',
      },
    },
  },
];
