import type { Category } from "@/types";

/**
 * Palettes impression cartes JSCA — même gabarit partout, couleurs différenciées :
 * - Dirigeants : prestige ardoise + or + touche émeraude
 * - Entraîneurs : cyan / teal + ambre (jaune chaud)
 * - Sportifs : une palette forte et distincte par catégorie (teal, ciel, orange, violet, indigo, rose, or/seniors) avec accents club vert + jaune
 */

const chip =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold leading-tight tracking-wide";

/** Pastille saison : lisible partout (écran clair/sombre + impression) — bandeau gauche = couleur catégorie */
function playerSeasonBadge(categoryBorderLeft: string): string {
  return `${chip} border-2 border-amber-600 bg-amber-100 text-neutral-900 shadow-md ${categoryBorderLeft} dark:border-amber-400 dark:bg-amber-200 dark:text-neutral-950 print:border-neutral-900 print:bg-amber-100 print:text-black print:shadow-none`;
}

/** Pastille « Officiel » : vert dense + texte clair */
const PLAYER_BADGE_OFFICIAL = `${chip} border-2 border-emerald-900 bg-emerald-800 text-white shadow-sm dark:border-emerald-700 dark:bg-emerald-700 dark:text-white print:border-black print:bg-emerald-900 print:text-white`;

/** Libellé catégorie sur la carte : chaque âge a son duo vert + jaune/or */
const catVal =
  "inline-flex max-w-full items-center rounded-md border-2 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-sm";

export type LicenceRectoTheme = {
  /** Classe pour la bordure carte (ex. border-lime-500/70) — utiliser avec border-2 */
  cardBorder: string;
  /**
   * Surface carte (sportifs) : doit écraser `bg-card` / backdrop du composant Card
   * pour que chaque catégorie soit visuellement distincte à l’écran et à l’impression.
   */
  cardFace?: string;
  overlay: string;
  sidebar: string;
  numberPill: string;
  photoFrame: string;
  jscaBar: string;
  emblemRing: string;
  badgeSeason: string;
  badgeOfficial: string;
  contactStrip: string;
  /** Badges catégories encadrées (entraîneurs) */
  badgeCategory?: string;
  /** Pastille couleur pour la valeur « Catégorie » (U9, U11…) — cartes sportifs */
  categoryValue?: string;
};

export type LicenceVersoTheme = {
  cardBorder: string;
  headerRule: string;
  qrFrame: string;
  noticeBg: string;
};

export type PlayerLicenceFullTheme = {
  recto: LicenceRectoTheme;
  verso: LicenceVersoTheme;
};

/** Cartes membres dirigeants — sobre, institutionnel, or & vert discret */
export const DIRIGEANT_LICENCE_RECTO: LicenceRectoTheme = {
  cardBorder: "border-[color:rgba(168,124,72,0.88)]",
  overlay: "from-slate-900/[0.14] via-indigo-950/[0.05] to-amber-100/[0.20]",
  sidebar:
    "border-[color:rgba(168,124,72,0.42)] bg-gradient-to-b from-slate-900/[0.09] via-slate-800/[0.04] to-amber-50/[0.16]",
  numberPill:
    "border border-amber-500/45 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-amber-50 shadow-sm",
  photoFrame: "border-dashed border-[color:rgba(168,124,72,0.48)] bg-slate-950/[0.03]",
  jscaBar: "border-[color:rgba(168,124,72,0.32)] bg-gradient-to-r from-slate-900/[0.07] to-amber-100/[0.18]",
  emblemRing: "ring-2 ring-amber-400/80 ring-offset-2 ring-offset-background print:ring-offset-0",
  badgeSeason: `${chip} border-2 border-amber-600 border-l-4 border-l-slate-700 bg-amber-100 text-neutral-900 shadow-md dark:border-amber-400 dark:bg-amber-200 dark:text-neutral-950 print:border-black print:bg-amber-100 print:text-black`,
  badgeOfficial: `${chip} border-2 border-emerald-900 bg-emerald-800 text-white shadow-sm dark:border-emerald-700 dark:bg-emerald-700 print:border-black print:bg-emerald-900 print:text-white`,
  contactStrip: "border-dashed border-amber-900/18 bg-slate-900/[0.04]",
};

/** Cartes entraîneurs — énergie terrain : teal / cyan + jaune */
export const COACH_LICENCE_RECTO: LicenceRectoTheme = {
  cardBorder: "border-cyan-500/78",
  overlay: "from-cyan-500/[0.20] via-teal-800/[0.08] to-amber-200/[0.22]",
  sidebar:
    "border-cyan-500/42 bg-gradient-to-b from-teal-950/[0.10] via-cyan-950/[0.04] to-amber-50/[0.18]",
  numberPill:
    "border border-amber-200/55 bg-gradient-to-br from-teal-600 via-cyan-700 to-teal-800 text-amber-50 shadow-md",
  photoFrame: "border-dashed border-cyan-600/38 bg-cyan-950/[0.05]",
  jscaBar: "border-cyan-500/32 bg-gradient-to-r from-teal-900/[0.08] to-amber-100/[0.22]",
  emblemRing: "ring-2 ring-cyan-400/78 ring-offset-2 ring-offset-background print:ring-offset-0",
  badgeSeason: `${chip} border-2 border-amber-600 border-l-4 border-l-cyan-600 bg-amber-100 text-neutral-900 shadow-md dark:border-amber-400 dark:bg-amber-200 dark:text-neutral-950 print:border-black print:bg-amber-100 print:text-black`,
  badgeOfficial: `${chip} border-2 border-teal-800 bg-teal-800 text-white shadow-sm dark:border-teal-600 dark:bg-teal-700 print:border-black print:bg-teal-900 print:text-white`,
  badgeCategory: `${chip} border-2 border-cyan-700 bg-cyan-50 text-cyan-950 shadow-sm dark:border-cyan-500 dark:bg-cyan-950/50 dark:text-cyan-50 print:border-cyan-900 print:bg-white print:text-black`,
  contactStrip: "border-dashed border-teal-700/22 bg-gradient-to-r from-cyan-950/[0.07] to-transparent",
};

function playerFull(cat: Category): PlayerLicenceFullTheme {
  const versoAccent = (border: string, rule: string, qr: string, notice: string): LicenceVersoTheme => ({
    cardBorder: border,
    headerRule: `border-b border-dashed ${rule}`,
    qrFrame: qr,
    noticeBg: notice,
  });

  /**
   * Écrase `bg-card` / `supports-[backdrop-filter]:bg-card/92` du composant `Card`.
   * `dFrom` / `dVia` / `dTo` : mêmes utilitaires que le mode clair (`!from-…`) sans préfixe `dark:`.
   */
  const playerCardFace = (
    from: string,
    via: string,
    to: string,
    dFrom: string,
    dVia: string,
    dTo: string,
  ): string => {
    const sup = (c: string) => `supports-[backdrop-filter]:${c}`;
    const dk = (c: string) => `dark:${c}`;
    const dksup = (c: string) => `dark:supports-[backdrop-filter]:${c}`;
    return [
      "!bg-gradient-to-br",
      from,
      via,
      to,
      dk(dFrom),
      dk(dVia),
      dk(dTo),
      sup("!bg-gradient-to-br"),
      sup(from),
      sup(via),
      sup(to),
      dksup(dFrom),
      dksup(dVia),
      dksup(dTo),
    ].join(" ");
  };

  const map: Record<Category, PlayerLicenceFullTheme> = {
    u9: {
      recto: {
        cardBorder: "border-teal-500/90",
        cardFace: playerCardFace(
          "!from-teal-100",
          "!via-white",
          "!to-lime-50",
          "!from-teal-900",
          "!via-slate-900",
          "!to-emerald-950/45",
        ),
        overlay: "from-teal-500/[0.08] via-transparent to-yellow-300/[0.09]",
        sidebar:
          "border-teal-500/50 bg-gradient-to-b from-teal-50/90 via-white/75 to-lime-50/90 dark:from-teal-950/32 dark:via-slate-900/32 dark:to-lime-950/18",
        numberPill:
          "border border-yellow-200/80 bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-900 text-yellow-50 shadow-sm",
        photoFrame: "border-dashed border-teal-600/55 bg-white/50 dark:bg-teal-950/30",
        jscaBar:
          "border-teal-600/40 bg-gradient-to-r from-teal-50/95 to-yellow-50/88 dark:from-teal-950/40 dark:to-lime-950/30",
        emblemRing: "ring-2 ring-teal-400/80 ring-offset-2 ring-offset-background print:ring-offset-0",
        badgeSeason: playerSeasonBadge("border-l-4 border-teal-500"),
        badgeOfficial: PLAYER_BADGE_OFFICIAL,
        contactStrip:
          "border-dashed border-teal-800/32 bg-white/65 text-neutral-900",
        categoryValue: `${catVal} border-yellow-400/85 bg-gradient-to-r from-teal-600 via-emerald-700 to-teal-800 text-yellow-50 dark:border-yellow-300/55 dark:text-yellow-100 print:border-yellow-600`,
      },
      verso: versoAccent(
        "border-teal-600/70",
        "border-teal-700/30",
        "border-teal-600/40 bg-teal-950/[0.06]",
        "bg-gradient-to-br from-teal-950/[0.10] to-lime-50/[0.12]",
      ),
    },
    u11: {
      recto: {
        // (طلب المستخدم "U12 أصفر") — لا يوجد u12 في الـ enum، نطبّقها على U11 (أقرب فئة عمرية)
        cardBorder: "border-amber-400/90",
        cardFace: playerCardFace(
          "!from-amber-100",
          "!via-yellow-50",
          "!to-lime-50",
          "!from-amber-950",
          "!via-slate-950",
          "!to-emerald-950/35",
        ),
        overlay: "from-amber-400/[0.08] via-yellow-300/[0.05] to-lime-200/[0.07]",
        sidebar:
          "border-amber-400/55 bg-gradient-to-b from-amber-50/95 via-yellow-50/80 to-lime-50/90 dark:from-amber-950/30 dark:via-slate-900/32 dark:to-emerald-950/20",
        numberPill:
          "border border-lime-200/80 bg-gradient-to-br from-amber-600 via-amber-700 to-amber-950 text-yellow-50 shadow-sm",
        photoFrame: "border-dashed border-amber-500/55 bg-white/55 dark:bg-amber-950/22",
        jscaBar:
          "border-amber-500/40 bg-gradient-to-r from-amber-50/95 to-lime-50/88 dark:from-amber-950/30 dark:to-emerald-950/22",
        emblemRing: "ring-2 ring-amber-400/80 ring-offset-2 ring-offset-background print:ring-offset-0",
        badgeSeason: playerSeasonBadge("border-l-4 border-amber-500"),
        badgeOfficial: PLAYER_BADGE_OFFICIAL,
        contactStrip:
          "border-dashed border-amber-700/30 bg-white/70 text-neutral-900",
        categoryValue: `${catVal} border-lime-400/85 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-yellow-50 dark:border-lime-300/55 dark:text-yellow-100 print:border-lime-600`,
      },
      verso: versoAccent(
        "border-amber-600/68",
        "border-amber-700/28",
        "border-amber-600/38 bg-amber-950/[0.05]",
        "bg-gradient-to-br from-amber-950/[0.10] to-lime-50/[0.11]",
      ),
    },
    u13: {
      recto: {
        // U13: focus vert (طلب المستخدم)
        cardBorder: "border-emerald-500/90",
        cardFace: playerCardFace(
          "!from-emerald-100",
          "!via-lime-50",
          "!to-yellow-50",
          "!from-emerald-950",
          "!via-slate-950",
          "!to-lime-950/35",
        ),
        overlay: "from-emerald-500/[0.08] via-lime-400/[0.05] to-yellow-200/[0.07]",
        sidebar:
          "border-emerald-500/55 bg-gradient-to-b from-emerald-50/95 via-lime-50/78 to-yellow-50/90 dark:from-emerald-950/30 dark:via-slate-900/32 dark:to-lime-950/18",
        numberPill:
          "border border-yellow-200/80 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-950 text-yellow-50 shadow-sm",
        photoFrame: "border-dashed border-emerald-600/55 bg-white/55 dark:bg-emerald-950/22",
        jscaBar:
          "border-emerald-600/40 bg-gradient-to-r from-emerald-50/95 to-yellow-50/88 dark:from-emerald-950/30 dark:to-lime-950/22",
        emblemRing: "ring-2 ring-emerald-400/80 ring-offset-2 ring-offset-background print:ring-offset-0",
        badgeSeason: playerSeasonBadge("border-l-4 border-emerald-600"),
        badgeOfficial: PLAYER_BADGE_OFFICIAL,
        contactStrip:
          "border-dashed border-emerald-900/28 bg-white/70 text-neutral-900",
        categoryValue: `${catVal} border-yellow-400/85 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 text-yellow-50 dark:border-yellow-300/55 dark:text-yellow-100 print:border-yellow-600`,
      },
      verso: versoAccent(
        "border-emerald-600/70",
        "border-emerald-800/28",
        "border-emerald-600/40 bg-emerald-950/[0.07]",
        "bg-gradient-to-br from-emerald-950/[0.12] to-yellow-50/[0.10]",
      ),
    },
    u16: {
      recto: {
        // U16 : rouge + vert (طلب المستخدم)
        // (طلب المستخدم) أخضر مختلف تماماً عن U13 (emerald/lime) => hunter/forest green بدون lime/أصفر
        cardBorder: "border-green-800/80",
        cardFace: playerCardFace(
          "!from-green-200",
          "!via-rose-50",
          "!to-red-100",
          "!from-green-950",
          "!via-slate-950",
          "!to-red-950/45",
        ),
        overlay: "from-green-900/[0.06] via-transparent to-red-600/[0.06]",
        sidebar:
          "border-green-800/40 bg-gradient-to-b from-green-100/92 via-rose-50/72 to-red-50/88 dark:from-green-950/28 dark:via-slate-900/30 dark:to-red-950/18",
        numberPill:
          "border border-green-200/85 bg-gradient-to-br from-red-600 via-red-700 to-red-950 text-white shadow-sm",
        photoFrame: "border-dashed border-green-800/40 bg-white/55 dark:bg-green-950/18",
        jscaBar:
          "border-green-800/32 bg-gradient-to-r from-green-50/95 to-rose-50/90 dark:from-green-950/26 dark:to-red-950/16",
        emblemRing: "ring-2 ring-red-400/75 ring-offset-2 ring-offset-background print:ring-offset-0",
        badgeSeason: playerSeasonBadge("border-l-4 border-green-800"),
        badgeOfficial: PLAYER_BADGE_OFFICIAL,
        contactStrip:
          "border-dashed border-green-900/24 bg-white/72 text-neutral-900",
        categoryValue: `${catVal} border-green-500/80 bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white dark:border-green-400/55 dark:text-white print:border-green-700`,
      },
      verso: versoAccent(
        "border-green-800/62",
        "border-red-800/28",
        "border-green-800/32 bg-green-950/[0.05]",
        "bg-gradient-to-br from-green-950/[0.12] to-red-50/[0.09]",
      ),
    },
    u18: {
      recto: {
        // U18: jaune + rouge (طلب المستخدم)
        cardBorder: "border-red-500/88",
        cardFace: playerCardFace(
          "!from-yellow-100",
          "!via-orange-50",
          "!to-rose-50",
          "!from-red-950",
          "!via-slate-950",
          "!to-amber-950/35",
        ),
        overlay: "from-yellow-400/[0.08] via-orange-400/[0.05] to-red-400/[0.07]",
        sidebar:
          "border-red-500/50 bg-gradient-to-b from-yellow-50/95 via-orange-50/78 to-rose-50/90 dark:from-red-950/32 dark:via-slate-900/32 dark:to-amber-950/18",
        numberPill:
          "border border-yellow-200/80 bg-gradient-to-br from-red-600 via-red-700 to-red-950 text-yellow-50 shadow-sm",
        photoFrame: "border-dashed border-red-600/55 bg-white/55 dark:bg-red-950/22",
        jscaBar:
          "border-red-600/38 bg-gradient-to-r from-yellow-50/95 to-rose-50/86 dark:from-red-950/32 dark:to-amber-950/22",
        emblemRing: "ring-2 ring-yellow-400/75 ring-offset-2 ring-offset-background print:ring-offset-0",
        badgeSeason: playerSeasonBadge("border-l-4 border-red-600"),
        badgeOfficial: PLAYER_BADGE_OFFICIAL,
        contactStrip:
          "border-dashed border-red-900/28 bg-white/70 text-neutral-900",
        categoryValue: `${catVal} border-yellow-400/85 bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-yellow-50 dark:border-yellow-300/55 dark:text-yellow-100 print:border-yellow-600`,
      },
      verso: versoAccent(
        "border-red-600/70",
        "border-red-800/28",
        "border-red-600/40 bg-red-950/[0.07]",
        "bg-gradient-to-br from-red-950/[0.12] to-yellow-50/[0.10]",
      ),
    },
    u20: {
      recto: {
        cardBorder: "border-rose-600/88",
        cardFace: playerCardFace(
          "!from-rose-100",
          "!via-orange-50",
          "!to-emerald-50",
          "!from-rose-900",
          "!via-slate-900",
          "!to-emerald-950/40",
        ),
        // U20: دمج أخضر + أصفر (مع لمسة دافئة خفيفة)
        overlay: "from-emerald-500/[0.08] via-yellow-300/[0.06] to-amber-300/[0.07]",
        sidebar:
          "border-emerald-500/50 bg-gradient-to-b from-emerald-50/95 via-yellow-50/78 to-amber-50/90 dark:from-emerald-950/30 dark:via-slate-900/32 dark:to-amber-950/18",
        numberPill:
          "border border-yellow-200/85 bg-gradient-to-br from-emerald-600 via-emerald-700 to-amber-800 text-yellow-50 shadow-sm",
        photoFrame: "border-dashed border-emerald-600/55 bg-white/55 dark:bg-emerald-950/22",
        jscaBar:
          "border-emerald-600/38 bg-gradient-to-r from-emerald-50/95 to-amber-50/88 dark:from-emerald-950/30 dark:to-amber-950/22",
        emblemRing: "ring-2 ring-yellow-400/75 ring-offset-2 ring-offset-background print:ring-offset-0",
        badgeSeason: playerSeasonBadge("border-l-4 border-emerald-600"),
        badgeOfficial: PLAYER_BADGE_OFFICIAL,
        contactStrip:
          "border-dashed border-emerald-900/28 bg-white/70 text-neutral-900",
        categoryValue: `${catVal} border-yellow-400/85 bg-gradient-to-r from-emerald-600 via-amber-600 to-emerald-800 text-yellow-50 dark:border-yellow-300/55 dark:text-yellow-100 print:border-yellow-600`,
      },
      verso: versoAccent(
        "border-emerald-600/70",
        "border-emerald-800/28",
        "border-emerald-600/40 bg-emerald-950/[0.07]",
        "bg-gradient-to-br from-emerald-950/[0.12] to-amber-50/[0.10]",
      ),
    },
    senior: {
      recto: {
        cardBorder: "border-amber-600/85",
        cardFace: playerCardFace(
          "!from-amber-100",
          "!via-stone-50",
          "!to-emerald-50",
          "!from-stone-900",
          "!via-slate-950",
          "!to-emerald-950/42",
        ),
        overlay: "from-emerald-900/[0.06] via-amber-200/[0.08] to-yellow-100/[0.08]",
        sidebar:
          "border-amber-500/48 bg-gradient-to-b from-amber-50/92 via-stone-50/78 to-emerald-50/90 dark:from-stone-900/45 dark:via-slate-900/36 dark:to-emerald-950/22",
        numberPill:
          "border border-amber-300/75 bg-gradient-to-br from-emerald-900 via-stone-900 to-slate-950 text-amber-100 shadow-md",
        photoFrame: "border-dashed border-amber-500/52 bg-white/40 dark:bg-emerald-950/32",
        jscaBar:
          "border-amber-600/35 bg-gradient-to-r from-amber-50/95 to-emerald-50/85 dark:from-stone-900/45 dark:to-emerald-950/28",
        emblemRing: "ring-2 ring-amber-400/75 ring-offset-2 ring-offset-background print:ring-offset-0",
        badgeSeason: playerSeasonBadge("border-l-4 border-l-emerald-800"),
        badgeOfficial: PLAYER_BADGE_OFFICIAL,
        contactStrip:
          "border-dashed border-stone-700/32 bg-white/65 text-neutral-900",
        categoryValue: `${catVal} border-amber-500/90 bg-gradient-to-r from-emerald-900 via-stone-800 to-emerald-950 text-amber-100 dark:border-amber-400/55 dark:text-amber-50 print:border-amber-700`,
      },
      verso: versoAccent(
        "border-emerald-900/72",
        "border-emerald-950/32",
        "border-emerald-900/45 bg-emerald-950/[0.09]",
        "bg-gradient-to-br from-emerald-950/[0.14] to-amber-100/[0.12]",
      ),
    },
  };

  return map[cat];
}

export function getPlayerLicenceTheme(category: Category): PlayerLicenceFullTheme {
  return playerFull(category);
}
