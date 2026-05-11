export type PublicLocale = "fr" | "ar";

export const LOCALE_STORAGE_KEY = "jsca-public-locale";

export const landingStrings: Record<
  PublicLocale,
  {
    clubTag: string;
    clubName: string;
    navNews: string;
    navPresentation: string;
    navActivities: string;
    navNewsSummary: string;
    navContact: string;
    adminLogin: string;
    seasonBadge: string;
    newsBandKicker: string;
    newsBandLead: string;
    newsCta: string;
    newsMail: string;
    readInNews: string;
    heroBadge: string;
    heroTitleBefore: string;
    heroTitleAccent: string;
    heroTitleAfter: string;
    heroLead: string;
    heroMail: string;
    heroAnnouncements: string;
    statFootballTitle: string;
    statFootballSub: string;
    statCategoriesTitle: string;
    statCategoriesSub: string;
    cardInscriptionsTitle: string;
    cardInscriptionsDesc: string;
    cardDashboard: string;
    cardSecretariat: string;
    aboutKicker: string;
    aboutTitle: string;
    aboutDesc: string;
    cardQualityTitle: string;
    cardQualityDesc: string;
    cardTransparencyTitle: string;
    cardTransparencyDesc: string;
    cardOmnichannelTitle: string;
    cardOmnichannelDesc: string;
    branchesKicker: string;
    branchesTitle: string;
    branchesDesc: string;
    branchesCardTitle: string;
    branchesCardDesc: string;
    categoriesCardTitle: string;
    categoriesCardDesc: string;
    newsSectionKicker: string;
    newsSectionTitle: string;
    mediaKicker: string;
    mediaTitle: string;
    mediaSlotKicker: string;
    mediaSlotTitle: string;
    mediaCaption: string;
    contactBadge: string;
    contactTitle: string;
    contactDesc: string;
    contactPhoneLabel: string;
    contactEmailLabel: string;
    contactAddressLabel: string;
    contactCta: string;
    footerName: string;
    footerLine: string;
    footerCopyright: string;
  }
> = {
  fr: {
    clubTag: "Club football · Bouïra · depuis 1986",
    clubName: "Jeunesse Sportive Commune Aghbalou",
    navNews: "Actualités club",
    navPresentation: "Présentation",
    navActivities: "Activités",
    navNewsSummary: "Résumé actus",
    navContact: "Contacts",
    adminLogin: "Connexion administration",
    seasonBadge: "Saison 2025/2026",
    newsBandKicker: "À l’affiche JSCA · actualités officielles",
    newsBandLead:
      "Communiqués, tournois, reprise des entraînements et événements du complexe municipal.",
    newsCta: "Découvrir la page Actualités complète →",
    newsMail: "Informer le secrétariat",
    readInNews: "Lire dans Actualités · ⵣ",
    heroBadge: "Plateforme professionnelle de pilotage club",
    heroTitleBefore: "JSCA : performance sportive avec une base",
    heroTitleAccent: "SaaS",
    heroTitleAfter: "évolutive",
    heroLead:
      "entraînements, compétitions, finances et équipe administrative centralisées dans une expérience simple et élégante.",
    heroMail: "Écrire au club —",
    heroAnnouncements: "Consulter les annonces",
    statFootballTitle: "Football",
    statFootballSub: "discipline phare du complexe JSCA",
    statCategoriesTitle: "Catégories U9 → Seniors",
    statCategoriesSub: "accompagnement global des jeunes",
    cardInscriptionsTitle: "Inscriptions & équipe projet",
    cardInscriptionsDesc:
      "Prévoir authentification et base de données (Supabase, PostgreSQL, MySQL) — la maquette utilise des données exemple contrôlables dans le dashboard.",
    cardDashboard: "Accéder au tableau de bord",
    cardSecretariat: "Joindre le secrétariat",
    aboutKicker: "À propos · vision",
    aboutTitle: "Une jeunesse structurée autour du football",
    aboutDesc:
      "développement du sport communautaire, éducation des valeurs d’effort collectif et suivi longitudinal des équipes jusqu’aux catégories adultes.",
    cardQualityTitle: "Encadrement & qualité",
    cardQualityDesc:
      "Staff technique certifié, protocoles santé et communication parents — modèle prêt pour passer en production lorsque vos APIs seront connectées.",
    cardTransparencyTitle: "Transparence club",
    cardTransparencyDesc:
      "Flux financiers, stock matériel, matchs officiels · base documentée pensée pour vos impressions PDF / audits FAF.",
    cardOmnichannelTitle: "Omnicanalités futures",
    cardOmnichannelDesc:
      "Support arabe RTL : structure de layout et champs métier prévus sans doublons de données.",
    branchesKicker: "Activités · complexe JSCA",
    branchesTitle: "Catégories, groupes & branche football",
    branchesDesc:
      "Une architecture modulaire : U9 jusqu’aux Seniors avec la branche football — reflétée également dans votre espace d’administration.",
    branchesCardTitle: "Branche du club",
    branchesCardDesc: "Une équipe projet dédiée à la discipline suivie dans le tableau de pilotage.",
    categoriesCardTitle: "Catégories sportives officielles",
    categoriesCardDesc: "Alignées sur vos groupes JSCA : U9, U11, U13, U16, U18, U20, Seniors.",
    newsSectionKicker: "Annonces & informations",
    newsSectionTitle: "Actualités officielles du club JSCA",
    mediaKicker: "Galerie multimédias",
    mediaTitle: "Temps fort du complexe JSCA · à enrichir avec vos shootings",
    mediaSlotKicker: "Médias · JSCA",
    mediaSlotTitle: "Remplacez ces visuels par vos photos officielles",
    mediaCaption: "Séquence",
    contactBadge: "Contact club",
    contactTitle: "Secrétariat général JSCA",
    contactDesc:
      "accompagne famille, élèves-sportifs et partenaires publics. Coordonnées de travail officielles : email & téléphone ci-dessous.",
    contactPhoneLabel: "Téléphone",
    contactEmailLabel: "Email",
    contactAddressLabel: "Adresse siège · collecte dossiers sportifs",
    contactCta: "Planifier vos opérations · connexion sécurisée",
    footerName: "Jeunesse Sportive Commune Aghbalou",
    footerLine: "JSCA — engagement sportif territorial · Bouïra · Algérie",
    footerCopyright: "2026 © Jeunesse Sportive Commune Aghbalou - JSCA",
  },
  ar: {
    clubTag: "نادي كرة قدم · البويرة · منذ 1986",
    clubName: "الشبيبة الرياضية لبلدية أغبالو",
    navNews: "أخبار النادي",
    navPresentation: "التعريف",
    navActivities: "الأنشطة",
    navNewsSummary: "ملخص الأخبار",
    navContact: "اتصل بنا",
    adminLogin: "دخول الإدارة",
    seasonBadge: "موسم 2025/2026",
    newsBandKicker: "JSCA · أخبار رسمية",
    newsBandLead:
      "بلاغات، دورات، استئناف التدريبات وأحداث المجمع البلدي.",
    newsCta: "صفحة الأخبار الكاملة ←",
    newsMail: "مراسلة الأمانة",
    readInNews: "اقرأ في الأخبار · ⵣ",
    heroBadge: "منصة احترافية لإدارة النادي",
    heroTitleBefore: "JSCA : أداء رياضي مع قاعدة",
    heroTitleAccent: "SaaS",
    heroTitleAfter: "قابلة للتطوير",
    heroLead:
      "تدريبات، مباريات، مالية وفريق إداري في تجربة بسيطة وأنيقة.",
    heroMail: "مراسلة النادي —",
    heroAnnouncements: "الاطلاع على البلاغات",
    statFootballTitle: "كرة القدم",
    statFootballSub: "الرياضة الأساسية لمجمع JSCA",
    statCategoriesTitle: "فئات U9 → الكبار",
    statCategoriesSub: "مواكبة شاملة للشباب",
    cardInscriptionsTitle: "التسجيلات وفريق المشروع",
    cardInscriptionsDesc:
      "الاستعداد لقاعدة البيانات والمصادقة — النموذج يعرض بيانات تجريبية قابلة للضبط من لوحة التحكم.",
    cardDashboard: "لوحة التحكم",
    cardSecretariat: "الاتصال بالأمانة",
    aboutKicker: "حولنا · الرؤية",
    aboutTitle: "شباب منظم حول كرة القدم",
    aboutDesc:
      "تطوير الرياضة المجتمعية، قيم الجماعية والمتابعة طويلة المدى حتى فئات الكبار.",
    cardQualityTitle: "الإطار والجودة",
    cardQualityDesc:
      "طاقم تقني معتمد، بروتوكولات صحية وتواصل مع الأهالي — جاهز للإنتاج عند ربط واجهاتكم.",
    cardTransparencyTitle: "شفافية النادي",
    cardTransparencyDesc:
      "تدفقات مالية، مخزون، مباريات رسمية — قاعدة موثقة للطباعة والمراجعة.",
    cardOmnichannelTitle: "توسعات مستقبلية",
    cardOmnichannelDesc:
      "دعم العربية (RTL) مدمج في البنية دون تكرار البيانات.",
    branchesKicker: "الأنشطة · مجمع JSCA",
    branchesTitle: "الفئات والمجموعات وفرع كرة القدم",
    branchesDesc:
      "هيكلة منظمة من U9 إلى الكبار ضمن فرع كرة القدم — كما في فضاء الإدارة.",
    branchesCardTitle: "فرع النادي",
    branchesCardDesc: "فريق مشروع مخصص للرياضة المتبعة في لوحة القيادة.",
    categoriesCardTitle: "الفئات الرسمية",
    categoriesCardDesc: "مواكبة لمجموعات JSCA : U9، U11، U13، U16، U18، U20، الكبار.",
    newsSectionKicker: "الإعلانات والمعلومات",
    newsSectionTitle: "الأخبار الرسمية لنادي JSCA",
    mediaKicker: "معرض وسائط",
    mediaTitle: "لحظات من مجمع JSCA — ثرِ المحتوى بصوركم",
    mediaSlotKicker: "وسائط · JSCA",
    mediaSlotTitle: "استبدلوا هذه اللقطات بصوركم الرسمية",
    mediaCaption: "مقطع",
    contactBadge: "اتصل بالنادي",
    contactTitle: "الأمانة العامة — JSCA",
    contactDesc:
      "ترافق العائلات والرياضيين والشركاء. الإحداثيات الرسمية أدناه.",
    contactPhoneLabel: "الهاتف",
    contactEmailLabel: "البريد",
    contactAddressLabel: "عنوان المقر · استلام الملفات",
    contactCta: "تخطيط العمليات · دخول آمن",
    footerName: "الشبيبة الرياضية لبلدية أغبالو",
    footerLine: "JSCA — التزام رياضي محلي · البويرة · الجزائر",
    footerCopyright: "2026 © الشبيبة الرياضية لبلدية أغبالو - JSCA",
  },
};
