import type { Branch, Category, MatchCompetitionType } from "@/types";

export const CLUB_CONTACT = {
  email: "jscaghbalou@gmail.com",
  /** Numéro officiel secrétariat */
  phone: "05 55 52 80 56",
  /** Lien téléphone (format international sans espaces) */
  telHref: "tel:+213555528056",
} as const;

export const BRANCH_OPTIONS: { value: Branch; label: string }[] = [{ value: "football", label: "Football" }];

export const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "u9", label: "U9" },
  { value: "u11", label: "U11" },
  { value: "u13", label: "U13" },
  { value: "u16", label: "U16" },
  { value: "u18", label: "U18" },
  { value: "u20", label: "U20" },
  { value: "senior", label: "Seniors" },
];

export const MATCH_TYPE_OPTIONS: { value: MatchCompetitionType; label: string }[] = [
  { value: "championnat", label: "Championnat" },
  { value: "coupe", label: "Coupe" },
  { value: "tournoi", label: "Tournoi" },
];

export const ADMIN_NAV = [
  { href: "/dashboard", label: "Accueil", icon: "LayoutDashboard" },
  {
    href: "/dashboard/club/donnees",
    label: "Club",
    icon: "Building2",
    children: [
      { href: "/dashboard/club/donnees", label: "Données du club" },
      { href: "/dashboard/club/adherents", label: "Membres dirigeants" },
      { href: "/dashboard/club/entraineurs", label: "Entraîneurs" },
      { href: "/dashboard/club/cartes-membres", label: "Cartes dirigeants" },
      { href: "/dashboard/club/cartes-entraineurs", label: "Cartes entraîneurs" },
    ],
  },
  { href: "/dashboard/bureau", label: "Membres du bureau", icon: "Users" },
  {
    href: "/dashboard/sportifs",
    label: "Sportifs / joueurs",
    icon: "Shirt",
    children: [
      { href: "/dashboard/sportifs", label: "Liste des sportifs" },
      { href: "/dashboard/sportifs/nouveau", label: "Ajouter un sportif" },
      { href: "/dashboard/sportifs/stats-matchs", label: "Statistiques matchs" },
      { href: "/dashboard/sportifs/cartes", label: "Cartes sportives" },
      { href: "/dashboard/sportifs/cartes-verso", label: "Arrière-cartes sportives" },
    ],
  },
  { href: "/dashboard/abonnements", label: "Abonnements", icon: "Wallet" },
  {
    href: "/dashboard/complexe/categories",
    label: "Complexe sportif",
    icon: "LandPlot",
    children: [
      { href: "/dashboard/complexe/categories", label: "Catégories sportives" },
      { href: "/dashboard/complexe/groupes", label: "Groupes" },
    ],
  },
  {
    href: "/dashboard/seances",
    label: "Séances d’entraînement",
    icon: "CalendarClock",
    children: [
      { href: "/dashboard/seances", label: "Liste des séances" },
      { href: "/dashboard/seances/nouvelle", label: "Programmer une séance" },
      { href: "/dashboard/seances/calendrier", label: "Calendrier mensuel" },
    ],
  },
  { href: "/dashboard/matchs", label: "Matchs", icon: "Trophy" },
  {
    href: "/dashboard/competitions/adversaires",
    label: "Compétitions",
    icon: "Flag",
    children: [
      { href: "/dashboard/competitions/adversaires", label: "Équipes adverses" },
      { href: "/dashboard/competitions/divisions", label: "Divisions championnat" },
      { href: "/dashboard/competitions/programme", label: "Programme compétition" },
    ],
  },
  {
    href: "/dashboard/stock/reception",
    label: "Stock",
    icon: "Package",
    children: [
      { href: "/dashboard/stock/reception", label: "Réception matériel" },
      { href: "/dashboard/stock/sortie", label: "Sortie matériel" },
      { href: "/dashboard/stock/consultation", label: "Consultation stock" },
    ],
  },
  { href: "/dashboard/finances", label: "Finances", icon: "CircleDollarSign" },
  { href: "/dashboard/rapports", label: "Rapports / impression", icon: "Printer" },
  {
    href: "/dashboard/parametres/utilisateurs",
    label: "Paramètres",
    icon: "Settings",
    children: [
      { href: "/dashboard/parametres/page-accueil", label: "Page d’accueil (site public)" },
      { href: "/dashboard/parametres/utilisateurs", label: "Utilisateurs admin" },
      { href: "/dashboard/parametres/roles", label: "Rôles et permissions" },
      { href: "/dashboard/parametres/general", label: "Informations générales" },
      { href: "/dashboard/parametres/sauvegarde", label: "Sauvegarde base de données" },
    ],
  },
] as const;
