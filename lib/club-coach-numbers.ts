import type { ClubCoach } from "@/types";

function parseStaffInt(s: string) {
  const v = Number.parseInt(String(s).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(v) ? v : null;
}

/** Prochain numéro sous forme ENT-01, ENT-02… (aligné sur les seeds). */
export function nextStaffNumber(coaches: ClubCoach[]) {
  const used = new Set<number>();
  for (const c of coaches) {
    const v = parseStaffInt(c.staffNumber);
    if (v != null) used.add(v);
  }
  let next = 1;
  while (used.has(next)) next += 1;
  return `ENT-${String(next).padStart(2, "0")}`;
}

/** Licence proposée automatiquement (distincte du format joueur). */
export function autoCoachLicense(staffNumber: string) {
  const year = new Date().getFullYear();
  const n = parseStaffInt(staffNumber) ?? 1;
  const pad = String(n).padStart(2, "0");
  return `ENC-JSCA-${year}-${pad}`;
}
