/** Types centralisés — prêts pour persistance Postgres / Supabase / MySQL */

export type Branch = "football";

export type Category =
  | "u9"
  | "u11"
  | "u13"
  | "u16"
  | "u18"
  | "u20"
  | "senior";

export type MatchCompetitionType = "championnat" | "coupe" | "tournoi";

export type MatchStatus =
  | "programme"
  | "en_cours"
  | "termine"
  | "reporte"
  | "annule";

export type TrainingStatus = "ouverte" | "fermee" | "annulee";

export type PaymentStatus = "paye" | "partiel" | "impaye";

export type SubscriptionMode = "mensuel" | "seances";

export type StockMovementType = "reception" | "sortie";

export type FinanceKind = "recette" | "depense";

export interface BankAccount {
  id: string;
  label: string;
  bank: string;
  rib: string;
}

export interface ClubProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
  fax: string;
  headquarters: string;
  vehicle: string;
  bankAccounts: BankAccount[];
}

export interface BoardMember {
  id: string;
  fullName: string;
  role: string;
  phone: string;
  email: string;
  since: string;
  active: boolean;
}

export interface Adherent {
  id: string;
  memberNumber: string;
  lastName: string;
  firstName: string;
  phone: string;
  email: string;
  joinDate: string;
  active: boolean;
}

export interface ClubCoach {
  id: string;
  staffNumber: string;
  lastName: string;
  firstName: string;
  phone: string;
  email: string;
  joinDate: string;
  active: boolean;
  licenseNumber: string | null;
  diploma: string | null;
  photoUrl: string | null;
  categories: Category[];
}

export interface Player {
  id: string;
  sportNumber: string;
  licenseNumber: string;
  lastName: string;
  firstName: string;
  fatherName: string;
  motherFullName: string;
  birthWilaya: string;
  birthCommune: string;
  birthDate: string;
  joinDate: string;
  branch: Branch;
  groupId: string;
  category: Category;
  idCardNumber: string;
  bloodType: string;
  weightKg: number;
  heightCm: number;
  outfitSize: string;
  shoeSize: string;
  address: string;
  phoneLandline: string;
  phoneMobile: string;
  email: string;
  active: boolean;
  photoUrl: string | null;
  parentPhotoUrl?: string | null;
}

export interface PlayerMatchStat {
  id: string;
  playerId: string;
  matchId: string;
  goals: number;
  assists: number;
  cardsYellow: number;
  cardsRed: number;
  minutesPlayed: number;
  notes?: string;
}

export interface Subscription {
  id: string;
  playerId: string;
  groupId: string;
  mode: SubscriptionMode;
  paymentDate: string;
  month: string;
  monthlyAmount: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  sessionsRemaining: number | null;
}

export interface SportGroup {
  id: string;
  name: string;
  branch: Branch;
  category: Category;
  coach: string;
  scheduleNote: string;
}

export interface TrainingSession {
  id: string;
  title: string;
  groupId: string;
  branch: Branch;
  startAt: string;
  endAt: string;
  location: string;
  status: TrainingStatus;
  notes?: string;
}

export type TrainingAttendanceStatus = "present" | "absent";

export interface TrainingAttendance {
  id: string;
  trainingId: string;
  playerId: string;
  status: TrainingAttendanceStatus;
  markedAt: string;
}

export interface MatchRecord {
  id: string;
  type: MatchCompetitionType;
  season: string;
  division: string;
  category: Category;
  date: string;
  venue: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
}

export interface Opponent {
  id: string;
  name: string;
  city: string;
  contact: string;
  phone: string;
}

export interface CompetitionDivision {
  id: string;
  label: string;
  season: string;
  branch: Branch;
}

export interface CompetitionProgramEntry {
  id: string;
  title: string;
  date: string;
  location: string;
  phase: string;
  notes?: string;
}

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  alertThreshold: number;
  unit: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  purchaseDate: string | null;
  source: string;
  beneficiary: string;
  note: string;
}

export interface FinanceTransaction {
  id: string;
  kind: FinanceKind;
  label: string;
  amount: number;
  date: string;
  category: string;
  reference: string;
}

export interface SchoolLevel {
  id: string;
  label: string;
  order: number;
}

export interface SchoolResult {
  id: string;
  label: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  active: boolean;
  lastLogin: string | null;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface GeneralSettings {
  clubShortName: string;
  defaultCurrency: string;
  locale: "fr";
  /** Basculer en ar — prévu pour extension RTL */
  futureLocale: "fr" | "ar";
}

export interface NewsItem {
  id: string;
  title: string;
  /** Texte arabique affiché quand la langue publique est « ar » */
  titleAr?: string;
  excerpt: string;
  excerptAr?: string;
  date: string;
  category: string;
  categoryAr?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  titleAr?: string | null;
  type: "photo" | "video";
  src: string;
  thumb: string;
}

export interface ActivityEntry {
  id: string;
  at: string;
  title: string;
  detail?: string;
}
