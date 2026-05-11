import type { PublicLocale } from "@/lib/landing-i18n";

export const actualitesUi: Record<
  PublicLocale,
  {
    headerKicker: string;
    heroBadge: string;
    heroTitle: string;
    heroLead: string;
    sectionLead: string;
    reactEmail: string;
    asideTitle: string;
    asideDesc: string;
    categoriesLabel: string;
    branchesLabel: string;
    contactCta: string;
    homeBtn: string;
    adminBtn: string;
    clubNameShort: string;
    footerCopyright: string;
  }
> = {
  fr: {
    headerKicker: "Actualités officielles",
    heroBadge: "Communiqués · saison en cours",
    heroTitle: "Nouvelles du complexe JSCA · agenda, tournois, inscription et vie associative.",
    heroLead: "Rubrique publique avant CMS riche. Contacts :",
    sectionLead: "À la une",
    reactEmail: "Réagir par email",
    asideTitle: "JSCA · identité locale",
    asideDesc: "Club football — commune Aghbalou (wilaya Bouïra), depuis 1986.",
    categoriesLabel: "Catégories",
    branchesLabel: "Branches",
    contactCta: "Contact & siège club",
    homeBtn: "Accueil club",
    adminBtn: "Connexion gestionnaire",
    clubNameShort: "Jeunesse Sportive Commune Aghbalou",
    footerCopyright: "2026 © Jeunesse Sportive Commune Aghbalou — JSCA",
  },
  ar: {
    headerKicker: "أخبار رسمية",
    heroBadge: "بلاغات · الموسم الحالي",
    heroTitle: "جديد مجمع JSCA — أجندة، دورات، تسجيلات وحياة الجمعية.",
    heroLead: "قسم عام قبل نظام المحتوى الكامل. للاتصال:",
    sectionLead: "في الصدارة",
    reactEmail: "رد عبر البريد",
    asideTitle: "JSCA · الهوية المحلية",
    asideDesc: "نادي كرة القدم — بلدية أغبالو (ولاية البويرة)، منذ 1986.",
    categoriesLabel: "الفئات",
    branchesLabel: "الفروع",
    contactCta: "الاتصال والمقر",
    homeBtn: "الرئيسية",
    adminBtn: "دخول المسؤول",
    clubNameShort: "الشبيبة الرياضية لبلدية أغبالو",
    footerCopyright: "2026 © الشبيبة الرياضية لبلدية أغبالو — JSCA",
  },
};
