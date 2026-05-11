import type {
  CompetitionDivision,
  CompetitionProgramEntry,
  Opponent,
} from "@/types";

export const opponentsSeed: Opponent[] = [
  {
    id: "op1",
    name: "JS Bouïra Nord",
    city: "Bouïra",
    contact: "M. Dahmani",
    phone: "0560 11 22 33",
  },
  {
    id: "op2",
    name: "IRB Lakhdaria",
    city: "Lakhdaria",
    contact: "Mme Benyahia",
    phone: "0561 44 55 66",
  },
  {
    id: "op3",
    name: "AS Sour El Ghozlane",
    city: "Sour El Ghozlane",
    contact: "M. Zerrouki",
    phone: "0562 77 88 99",
  },
];

export const divisionsSeed: CompetitionDivision[] = [
  {
    id: "div1",
    label: "Excellence Régionale — Poule Centre",
    season: "2025/2026",
    branch: "football",
  },
  {
    id: "div2",
    label: "Honneur U18 — Poule nord",
    season: "2025/2026",
    branch: "football",
  },
  {
    id: "div3",
    label: "Championnat U11 — Poule régionale",
    season: "2025/2026",
    branch: "football",
  },
];

export const competitionProgramSeed: CompetitionProgramEntry[] = [
  {
    id: "cp1",
    title: "Journée 3 — CSC Aghbalou vs JS Bouïra Nord",
    date: "2026-03-07T14:30:00.000Z",
    location: "Stade JSCA — Aghbalou",
    phase: "Aller — Excellence",
    notes: "Récupération 12h • Bus départ siège à 13h.",
  },
  {
    id: "cp2",
    title: "Coupe régionale — 1/16 final",
    date: "2026-03-22T09:30:00.000Z",
    location: "Stade ville — Lakhdaria",
    phase: "Coupe wilaya Bouïra",
  },
];
