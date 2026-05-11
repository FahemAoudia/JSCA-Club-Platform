import { actualitesUi } from "@/lib/actualites-i18n";
import { landingStrings, type PublicLocale } from "@/lib/landing-i18n";

export type LandingCopy = (typeof landingStrings)["fr"];
export type ActualitesCopy = (typeof actualitesUi)["fr"];

export const LANDING_COPY_KEYS = Object.keys(landingStrings.fr) as (keyof LandingCopy)[];
export const ACTUALITES_COPY_KEYS = Object.keys(actualitesUi.fr) as (keyof ActualitesCopy)[];

/** Groupes d’aide à la saisie (admin) — ordre d’affichage. */
export const LANDING_FIELD_GROUPS: { label: string; keys: (keyof LandingCopy)[] }[] = [
  {
    label: "En-tête & navigation",
    keys: [
      "clubTag",
      "clubName",
      "navNews",
      "navPresentation",
      "navActivities",
      "navNewsSummary",
      "navContact",
      "adminLogin",
      "seasonBadge",
    ],
  },
  {
    label: "Bandeau actualités (haut de page)",
    keys: ["newsBandKicker", "newsBandLead", "newsCta", "newsMail", "readInNews"],
  },
  {
    label: "Hero principal",
    keys: [
      "heroBadge",
      "heroTitleBefore",
      "heroTitleAccent",
      "heroTitleAfter",
      "heroLead",
      "heroMail",
      "heroAnnouncements",
    ],
  },
  {
    label: "Cartes statistiques",
    keys: ["statFootballTitle", "statFootballSub", "statCategoriesTitle", "statCategoriesSub"],
  },
  {
    label: "Carte inscriptions / actions",
    keys: ["cardInscriptionsTitle", "cardInscriptionsDesc", "cardDashboard", "cardSecretariat"],
  },
  {
    label: "Présentation & cartes qualité",
    keys: [
      "aboutKicker",
      "aboutTitle",
      "aboutDesc",
      "cardQualityTitle",
      "cardQualityDesc",
      "cardTransparencyTitle",
      "cardTransparencyDesc",
      "cardOmnichannelTitle",
      "cardOmnichannelDesc",
    ],
  },
  {
    label: "Branches & catégories",
    keys: [
      "branchesKicker",
      "branchesTitle",
      "branchesDesc",
      "branchesCardTitle",
      "branchesCardDesc",
      "categoriesCardTitle",
      "categoriesCardDesc",
    ],
  },
  {
    label: "Bloc actualités (accueil)",
    keys: ["newsSectionKicker", "newsSectionTitle"],
  },
  {
    label: "Section médias (légendes)",
    keys: ["mediaKicker", "mediaTitle", "mediaSlotKicker", "mediaSlotTitle", "mediaCaption"],
  },
  {
    label: "Contact (carte formulaire)",
    keys: [
      "contactBadge",
      "contactTitle",
      "contactDesc",
      "contactPhoneLabel",
      "contactEmailLabel",
      "contactAddressLabel",
      "contactCta",
    ],
  },
  {
    label: "Pied de page",
    keys: ["footerName", "footerLine", "footerCopyright"],
  },
];

export const ACTUALITES_FIELD_GROUPS: { label: string; keys: (keyof ActualitesCopy)[] }[] = [
  {
    label: "Page /actualités",
    keys: [
      "headerKicker",
      "heroBadge",
      "heroTitle",
      "heroLead",
      "sectionLead",
      "reactEmail",
      "asideTitle",
      "asideDesc",
      "categoriesLabel",
      "branchesLabel",
      "contactCta",
      "homeBtn",
      "adminBtn",
      "clubNameShort",
      "footerCopyright",
    ],
  },
];

function asStringRecord(raw: unknown): Partial<Record<string, string>> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Partial<Record<string, string>> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
}

export function mergeLandingCopy(locale: PublicLocale, patch: unknown): LandingCopy {
  const base = landingStrings[locale];
  const p = asStringRecord(patch);
  return { ...base, ...p } as LandingCopy;
}

export function mergeActualitesCopy(locale: PublicLocale, patch: unknown): ActualitesCopy {
  const base = actualitesUi[locale];
  const p = asStringRecord(patch);
  return { ...base, ...p } as ActualitesCopy;
}
