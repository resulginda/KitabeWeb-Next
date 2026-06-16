import type { Locale } from './places';

export const HUB_LANG_FLAGS: Record<Locale, string> = {
  tr: '🇹🇷',
  en: '🇬🇧',
  ru: '🇷🇺',
  ar: '🇸🇦',
};

export const HUB_HEADER_COPY: Record<
  Locale,
  {
    mainNav: string;
    secondaryNav: string;
    home: string;
    list: string;
    nearby: string;
    route: string;
    cities: string;
    blog: string;
    about: string;
    contact: string;
    suggest: string;
    login: string;
    register: string;
    bottomHome: string;
    bottomList: string;
    bottomNearby: string;
    bottomRoute: string;
    bottomAccount: string;
  }
> = {
  tr: {
    mainNav: 'Ana menü',
    secondaryNav: 'Site menüsü',
    home: 'Ana Sayfa',
    list: 'Liste',
    nearby: 'Yakınımdakiler',
    route: 'Rota',
    cities: 'Şehirler',
    blog: 'Blog',
    about: 'Hakkımızda',
    contact: 'İletişim',
    suggest: 'Yer Öner',
    login: 'Giriş Yap',
    register: 'Kayıt Ol',
    bottomHome: 'Ana Sayfa',
    bottomList: 'Liste',
    bottomNearby: 'Yakın',
    bottomRoute: 'Rota',
    bottomAccount: 'Hesap',
  },
  en: {
    mainNav: 'Main menu',
    secondaryNav: 'Site menu',
    home: 'Home',
    list: 'List',
    nearby: 'Nearby',
    route: 'Route',
    cities: 'Cities',
    blog: 'Blog',
    about: 'About',
    contact: 'Contact',
    suggest: 'Suggest a place',
    login: 'Log in',
    register: 'Sign up',
    bottomHome: 'Home',
    bottomList: 'List',
    bottomNearby: 'Nearby',
    bottomRoute: 'Route',
    bottomAccount: 'Account',
  },
  ru: {
    mainNav: 'Главное меню',
    secondaryNav: 'Меню сайта',
    home: 'Главная',
    list: 'Список',
    nearby: 'Рядом',
    route: 'Маршрут',
    cities: 'Города',
    blog: 'Блог',
    about: 'О нас',
    contact: 'Контакты',
    suggest: 'Предложить место',
    login: 'Войти',
    register: 'Регистрация',
    bottomHome: 'Главная',
    bottomList: 'Список',
    bottomNearby: 'Рядом',
    bottomRoute: 'Маршрут',
    bottomAccount: 'Аккаунт',
  },
  ar: {
    mainNav: 'القائمة الرئيسية',
    secondaryNav: 'قائمة الموقع',
    home: 'الرئيسية',
    list: 'القائمة',
    nearby: 'بالقرب',
    route: 'المسار',
    cities: 'المدن',
    blog: 'المدونة',
    about: 'من نحن',
    contact: 'اتصل بنا',
    suggest: 'اقترح مكاناً',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    bottomHome: 'الرئيسية',
    bottomList: 'القائمة',
    bottomNearby: 'بالقرب',
    bottomRoute: 'المسار',
    bottomAccount: 'الحساب',
  },
};
