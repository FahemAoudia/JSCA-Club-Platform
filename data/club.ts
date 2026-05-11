import type {
  AdminUser,
  Adherent,
  BoardMember,
  ClubCoach,
  ClubProfile,
  GeneralSettings,
  MediaItem,
  NewsItem,
  Role,
} from "@/types";

export const clubProfile: ClubProfile = {
  name: "Jeunesse Sportive Commune Aghbalou - JSCA",
  address: "Commune Aghbalou — Bouïra — Algérie",
  phone: "05 55 52 80 56",
  email: "jscaghbalou@gmail.com",
  fax: "026 00 00 00",
  headquarters: "Siège social — Complexe omnisports JSCA — Aghbalou",
  vehicle: "Minibus club — Peugeot Boxer immatriculation 00 xxx 06",
  bankAccounts: [
    {
      id: "bk1",
      label: "Compte club principal — CCP",
      bank: "Banque nationale d’Algérie",
      rib: "000 XXXX XXXXXXXXXXXXXX XX",
    },
    {
      id: "bk2",
      label: "Réserve événements / tournois",
      bank: "CPA",
      rib: "000 YYYY YYYYYYYYYYYYYY YY",
    },
  ],
};

export const boardMembersSeed: BoardMember[] = [
  {
    id: "bm1",
    fullName: "Amine KHELIFI",
    role: "Président",
    phone: "0550 00 00 01",
    email: "president@jsca.local",
    since: "2022-09-01",
    active: true,
  },
  {
    id: "bm2",
    fullName: "Sofiane BENAMAR",
    role: "Secrétaire général",
    phone: "0550 00 00 02",
    email: "sg@jsca.local",
    since: "2023-01-15",
    active: true,
  },
  {
    id: "bm3",
    fullName: "Lynda HAMMOUDI",
    role: "Trésorière",
    phone: "0550 00 00 03",
    email: "tresorerie@jsca.local",
    since: "2021-06-10",
    active: true,
  },
];

export const adherentsSeed: Adherent[] = [
  {
    id: "ad1",
    memberNumber: "ADH-2044",
    lastName: "MEZIANI",
    firstName: "Karim",
    phone: "0551 22 33 44",
    email: "karim.meziani@example.com",
    joinDate: "2024-11-03",
    active: true,
  },
  {
    id: "ad2",
    memberNumber: "ADH-2110",
    lastName: "BOUDRA",
    firstName: "Illès",
    phone: "0552 98 76 54",
    email: "illes.boudra@example.com",
    joinDate: "2025-02-21",
    active: true,
  },
];

export const clubCoachesSeed: ClubCoach[] = [
  {
    id: "cc1",
    staffNumber: "ENT-01",
    lastName: "BENALI",
    firstName: "Youcef",
    phone: "0553 11 22 33",
    email: "y.benali@jsca.local",
    joinDate: "2023-09-01",
    active: true,
    licenseNumber: "FAF-ENC-24001",
    diploma: "Brevet d'État 1er degré",
    photoUrl: null,
    categories: ["u13", "u16"],
  },
  {
    id: "cc2",
    staffNumber: "ENT-02",
    lastName: "KHELIFI",
    firstName: "Samir",
    phone: "0554 44 55 66",
    email: "s.khelifi@jsca.local",
    joinDate: "2024-01-10",
    active: true,
    licenseNumber: "FAF-ENC-24088",
    diploma: "Moniteur fédéral",
    photoUrl: null,
    categories: ["u18", "senior"],
  },
];

export const generalSettingsSeed: GeneralSettings = {
  clubShortName: "JSCA",
  defaultCurrency: "DZD",
  locale: "fr",
  futureLocale: "fr",
};

export const rolesSeed: Role[] = [
  { id: "r_admin", name: "Administrateur", permissions: ["*"] },
  {
    id: "r_finance",
    name: "Finance",
    permissions: ["finance.read", "finance.write", "reports.print"],
  },
  {
    id: "r_sport",
    name: "Responsable sportif",
    permissions: ["players.read", "players.write", "training.write", "matches.write"],
  },
];

export const adminUsersSeed: AdminUser[] = [
  {
    id: "u1",
    name: "Responsable club",
    email: "admin@jsca.local",
    roleId: "r_admin",
    active: true,
    lastLogin: new Date().toISOString(),
  },
];

export const newsSeed: NewsItem[] = [
  {
    id: "nw1",
    title: "Reprise des entraînements — saison 2025/2026",
    titleAr: "استئناف التدريبات — موسم 2025/2026",
    excerpt:
      "Le complexe JSCA rouvre tous les créneaux U9 à Seniors. Consulter les plannings par groupe dans l’espace adhérents.",
    excerptAr:
      "يعيد مجمع JSCA فتح جميع الفترات من U9 إلى الكبار. راجعوا الجداول حسب المجموعة في فضاء المنخرطين.",
    date: "2025-08-20",
    category: "Vie du club",
    categoryAr: "حياة النادي",
  },
  {
    id: "nw2",
    title: "Tournoi interwilayas Bouïra — inscription ouverte",
    titleAr: "دورة بين الولايات — البويرة — التسجيل مفتوح",
    excerpt:
      "Les catégories U13 et U16 sont admises jusqu’au 30 septembre. Tenue officielle obligatoire pour la délégation.",
    excerptAr:
      "تقبل الفئتان U13 و U16 حتى 30 سبتمبر. الزي الرسمي إلزامي للوفد.",
    date: "2025-09-05",
    category: "Compétitions",
    categoryAr: "مسابقات",
  },
  {
    id: "nw3",
    title: "Journée portes ouverts — découverte multisports",
    titleAr: "يوم الأبواب المفتوحة — اكتشاف رياضي",
    excerpt:
      "Football poussins & jeunes — rendez-vous découverte samedi 14h au complexe JSCA.",
    excerptAr: "كرة القدم للصغار والشباب — لقاء اكتشاف يوم السبت 14 ساعة بمجمع JSCA.",
    date: "2025-09-28",
    category: "Évènements",
    categoryAr: "فعاليات",
  },
];

export const mediaGallerySeed: MediaItem[] = [
  {
    id: "mg1",
    title: "JSCA 1987",
    titleAr: "JSCA 1987",
    type: "photo",
    src: "/media/jsca-1987.png",
    thumb: "/media/jsca-1987.png",
  },
  {
    id: "mg2",
    title: "Équipe JSCA",
    titleAr: "فريق JSCA",
    type: "photo",
    src: "/media/jsca-team-1.png",
    thumb: "/media/jsca-team-1.png",
  },
  {
    id: "mg3",
    title: "Équipe JSCA",
    titleAr: "فريق JSCA",
    type: "photo",
    src: "/media/jsca-team-2.png",
    thumb: "/media/jsca-team-2.png",
  },
];
