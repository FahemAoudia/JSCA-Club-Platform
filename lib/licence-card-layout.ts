/**
 * Gabarit cartes JSCA — format ISO 7810 ID-1 (carte nationale / biométrique DZ ≈ 85,6 × 54 mm).
 * Styles détaillés dans `app/globals.css` (classes `jsca-card-*`).
 */
export const ID_CARD_WIDTH_MM = 85.6;
export const ID_CARD_HEIGHT_MM = 53.98;

export const licenceCardClasses = {
  sheet: "jsca-print-sheet",
  card: "jsca-print-card",
  content: "jsca-card-content",
  body: "jsca-card-body",
  sidebar: "jsca-card-sidebar",
  photoSlot: "jsca-card-photo-slot",
  photoImg: "jsca-card-photo",
  logo: "jsca-card-logo",
  numberPill: "jsca-card-number",
  jscaBar: "jsca-card-jsca-bar",
  emblem: "jsca-card-emblem",
  kicker: "jsca-card-kicker",
  name: "jsca-card-name",
  meta: "jsca-card-meta",
  fields: "jsca-card-fields",
  badges: "jsca-card-badges",
  strip: "jsca-card-strip",
  versoBody: "jsca-card-verso-body",
  versoHeader: "jsca-card-verso-header",
  qr: "jsca-card-qr",
  notice: "jsca-card-notice",
  signatures: "jsca-card-signatures",
} as const;
