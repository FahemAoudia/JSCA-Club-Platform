"use client";

import { create } from "zustand";
import type {
  ActivityEntry,
  Adherent,
  ClubCoach,
  AdminUser,
  BankAccount,
  BoardMember,
  ClubProfile,
  CompetitionDivision,
  CompetitionProgramEntry,
  FinanceTransaction,
  GeneralSettings,
  MatchRecord,
  Opponent,
  Player,
  PlayerMatchStat,
  Role,
  SchoolLevel,
  SchoolResult,
  SportGroup,
  StockItem,
  StockMovement,
  Subscription,
  TrainingAttendance,
  TrainingSession,
} from "@/types";
import {
  adherentsSeed,
  adminUsersSeed,
  boardMembersSeed,
  clubProfile,
  competitionProgramSeed,
  divisionsSeed,
  generalSettingsSeed,
  matchesSeed,
  opponentsSeed,
  playerMatchStatsSeed,
  playersSeed,
  rolesSeed,
  schoolLevelsSeed,
  schoolResultsSeed,
  sportGroupsSeed,
  stockItemsSeed,
  stockMovementsSeed,
  subscriptionsSeed,
  trainingsSeed,
  transactionsSeed,
} from "@/data";
import { id } from "@/lib/utils";

function nowISO() {
  return new Date().toISOString();
}

function act(title: string, detail?: string): ActivityEntry {
  return { id: id("log"), at: nowISO(), title, detail };
}

let didAutoSeedMigration = false;

type JscaState = {
  hydrated: boolean;
  club: ClubProfile;
  generalSettings: GeneralSettings;
  boardMembers: BoardMember[];
  adherents: Adherent[];
  clubCoaches: ClubCoach[];
  players: Player[];
  playerMatchStats: PlayerMatchStat[];
  subscriptions: Subscription[];
  sportGroups: SportGroup[];
  trainings: TrainingSession[];
  trainingAttendances: TrainingAttendance[];
  matches: MatchRecord[];
  opponents: Opponent[];
  divisions: CompetitionDivision[];
  competitionProgram: CompetitionProgramEntry[];
  stockItems: StockItem[];
  stockMovements: StockMovement[];
  transactions: FinanceTransaction[];
  schoolLevels: SchoolLevel[];
  schoolResults: SchoolResult[];
  roles: Role[];
  adminUsers: AdminUser[];
  activities: ActivityEntry[];
};

type JscaActions = {
  pushActivity: (title: string, detail?: string) => void;
  resetMockData: () => void;
  loadFromDb: () => Promise<void>;

  updateClub: (patch: Partial<ClubProfile>) => void;
  replaceBankAccounts: (accounts: BankAccount[]) => void;

  addBoardMember: (row: Omit<BoardMember, "id">) => Promise<BoardMember | null>;
  updateBoardMember: (idKey: string, patch: Partial<BoardMember>) => Promise<BoardMember | null>;
  removeBoardMember: (idKey: string) => Promise<boolean>;

  addAdherent: (row: Omit<Adherent, "id">) => Promise<Adherent | null>;
  updateAdherent: (idKey: string, patch: Partial<Adherent>) => Promise<Adherent | null>;
  removeAdherent: (idKey: string) => Promise<boolean>;

  addClubCoach: (row: Omit<ClubCoach, "id">) => Promise<ClubCoach | null>;
  updateClubCoach: (idKey: string, patch: Partial<ClubCoach>) => Promise<ClubCoach | null>;
  removeClubCoach: (idKey: string) => Promise<boolean>;

  addPlayer: (row: Omit<Player, "id">) => Promise<Player | null>;
  updatePlayer: (idKey: string, patch: Partial<Player>) => Promise<Player | null>;
  removePlayer: (idKey: string) => Promise<boolean>;

  addPlayerMatchStat: (row: Omit<PlayerMatchStat, "id">) => Promise<PlayerMatchStat | null>;
  updatePlayerMatchStat: (idKey: string, patch: Partial<PlayerMatchStat>) => Promise<PlayerMatchStat | null>;
  removePlayerMatchStat: (idKey: string) => Promise<boolean>;

  addSubscription: (row: Omit<Subscription, "id">) => Promise<Subscription | null>;
  updateSubscription: (idKey: string, patch: Partial<Subscription>) => Promise<Subscription | null>;
  removeSubscription: (idKey: string) => Promise<boolean>;

  addSportGroup: (row: Omit<SportGroup, "id">) => Promise<SportGroup | null>;
  updateSportGroup: (idKey: string, patch: Partial<SportGroup>) => Promise<SportGroup | null>;
  removeSportGroup: (idKey: string) => Promise<boolean>;

  addTraining: (row: Omit<TrainingSession, "id">) => Promise<TrainingSession | null>;
  updateTraining: (idKey: string, patch: Partial<TrainingSession>) => Promise<TrainingSession | null>;
  removeTraining: (idKey: string) => Promise<boolean>;

  setTrainingAttendance: (trainingId: string, playerId: string, status: "present" | "absent") => void;
  resetTrainingAttendance: (trainingId: string) => void;

  addMatch: (row: Omit<MatchRecord, "id">) => Promise<MatchRecord | null>;
  updateMatch: (idKey: string, patch: Partial<MatchRecord>) => Promise<MatchRecord | null>;
  removeMatch: (idKey: string) => Promise<boolean>;

  addOpponent: (row: Omit<Opponent, "id">) => Promise<Opponent | null>;
  updateOpponent: (idKey: string, patch: Partial<Opponent>) => Promise<Opponent | null>;
  removeOpponent: (idKey: string) => Promise<boolean>;

  addDivision: (row: Omit<CompetitionDivision, "id">) => Promise<CompetitionDivision | null>;
  updateDivision: (idKey: string, patch: Partial<CompetitionDivision>) => Promise<CompetitionDivision | null>;
  removeDivision: (idKey: string) => Promise<boolean>;

  addProgramEntry: (row: Omit<CompetitionProgramEntry, "id">) => Promise<CompetitionProgramEntry | null>;
  updateProgramEntry: (idKey: string, patch: Partial<CompetitionProgramEntry>) => Promise<CompetitionProgramEntry | null>;
  removeProgramEntry: (idKey: string) => Promise<boolean>;

  addStockItem: (row: Omit<StockItem, "id">) => Promise<StockItem | null>;
  updateStockItem: (idKey: string, patch: Partial<StockItem>) => Promise<StockItem | null>;
  removeStockItem: (idKey: string) => Promise<boolean>;

  addStockMovement: (row: Omit<StockMovement, "id">) => Promise<StockMovement | null>;
  updateStockMovement: (idKey: string, patch: Partial<StockMovement>) => Promise<StockMovement | null>;
  removeStockMovement: (idKey: string) => Promise<boolean>;

  addTransaction: (row: Omit<FinanceTransaction, "id">) => Promise<FinanceTransaction | null>;
  updateTransaction: (idKey: string, patch: Partial<FinanceTransaction>) => Promise<FinanceTransaction | null>;
  removeTransaction: (idKey: string) => Promise<boolean>;

  addSchoolLevel: (row: Omit<SchoolLevel, "id">) => Promise<SchoolLevel | null>;
  updateSchoolLevel: (idKey: string, patch: Partial<SchoolLevel>) => Promise<SchoolLevel | null>;
  removeSchoolLevel: (idKey: string) => Promise<boolean>;

  addSchoolResult: (row: Omit<SchoolResult, "id">) => Promise<SchoolResult | null>;
  updateSchoolResult: (idKey: string, patch: Partial<SchoolResult>) => Promise<SchoolResult | null>;
  removeSchoolResult: (idKey: string) => Promise<boolean>;

  addRole: (row: Omit<Role, "id">) => Promise<Role | null>;
  updateRole: (idKey: string, patch: Partial<Role>) => Promise<Role | null>;
  removeRole: (idKey: string) => Promise<boolean>;

  addAdminUser: (row: Omit<AdminUser, "id">) => Promise<AdminUser | null>;
  updateAdminUser: (idKey: string, patch: Partial<AdminUser>) => Promise<AdminUser | null>;
  removeAdminUser: (idKey: string) => Promise<boolean>;

  updateGeneralSettings: (patch: Partial<GeneralSettings>) => Promise<GeneralSettings | null>;
};

const initialState = (): JscaState => ({
  hydrated: false,
  club: structuredClone(clubProfile),
  generalSettings: { ...generalSettingsSeed },
  // Start empty: DB is the source of truth. Seeds are migrated into DB once.
  boardMembers: [],
  adherents: [],
  clubCoaches: [],
  players: [],
  playerMatchStats: [],
  subscriptions: [],
  sportGroups: [],
  trainings: [],
  trainingAttendances: [],
  matches: [],
  opponents: [],
  divisions: [],
  competitionProgram: [],
  stockItems: [],
  stockMovements: [],
  transactions: [],
  schoolLevels: [],
  schoolResults: [],
  roles: [],
  adminUsers: [],
  activities: [],
});

export const useJscaStore = create<JscaState & JscaActions>((set, get) => ({
  ...initialState(),

  loadFromDb: async () => {
    try {
      const res = await fetch("/api/bootstrap", { credentials: "include" });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        data?: Record<string, unknown>;
      } | null;
      if (!res.ok || !json?.ok || !json.data) {
        console.warn("[JSCA] bootstrap failed", res.status, json);
        return;
      }
      const d = json.data as Partial<JscaState> & { club?: unknown };

      // Auto seed migration (one-time, idempotent) to avoid showing "0" everywhere on a fresh DB.
      // If the DB looks uninitialized/partial, import demo seeds then re-fetch bootstrap.
      // (Upserts are idempotent; safe even if some rows already exist.)
      const maybePlayers = (d.players as unknown[] | undefined) ?? [];
      const maybeGroups = (d.sportGroups as unknown[] | undefined) ?? [];
      const maybeClub = d.club as unknown;
      const maybeRoles = (d.roles as unknown[] | undefined) ?? [];
      const maybeSettings = d.generalSettings as unknown;
      const shouldSeed =
        !didAutoSeedMigration &&
        (!maybeClub ||
          !maybeSettings ||
          maybeGroups.length === 0 ||
          maybeRoles.length === 0 ||
          // If only a few items exist, we still want full demo data.
          maybePlayers.length <= 1);

      if (shouldSeed) {
        didAutoSeedMigration = true;
        const seedRes = await fetch("/api/admin/migrate-seeds", {
          method: "POST",
          credentials: "include",
        });
        if (seedRes.ok) {
          const res2 = await fetch("/api/bootstrap", { credentials: "include" });
          const json2 = (await res2.json().catch(() => null)) as {
            ok?: boolean;
            data?: Record<string, unknown>;
          } | null;
          if (res2.ok && json2?.ok && json2.data) {
            const d2 = json2.data as Partial<JscaState> & { club?: unknown };
            set((s) => ({
              ...s,
              hydrated: true,
              club: (d2.club as ClubProfile) ?? s.club,
              sportGroups: d2.sportGroups ?? s.sportGroups,
              players: d2.players ?? s.players,
              trainings: d2.trainings ?? s.trainings,
              trainingAttendances: d2.trainingAttendances ?? s.trainingAttendances,
              subscriptions: d2.subscriptions ?? s.subscriptions,
              matches: d2.matches ?? s.matches,
              playerMatchStats: d2.playerMatchStats ?? s.playerMatchStats,
              opponents: d2.opponents ?? s.opponents,
              divisions: d2.divisions ?? s.divisions,
              competitionProgram: d2.competitionProgram ?? s.competitionProgram,
              stockItems: d2.stockItems ?? s.stockItems,
              stockMovements: d2.stockMovements ?? s.stockMovements,
              transactions: d2.transactions ?? s.transactions,
              schoolLevels: d2.schoolLevels ?? s.schoolLevels,
              schoolResults: d2.schoolResults ?? s.schoolResults,
              generalSettings: d2.generalSettings ?? s.generalSettings,
              boardMembers: d2.boardMembers ?? s.boardMembers,
              adherents: d2.adherents ?? s.adherents,
              clubCoaches: d2.clubCoaches ?? s.clubCoaches,
              roles: d2.roles ?? s.roles,
              adminUsers: d2.adminUsers ?? s.adminUsers,
              activities: d2.activities ?? s.activities,
            }));
          }
          return;
        }
      }
      set((s) => ({
        ...s,
        hydrated: true,
        club: (d.club as ClubProfile) ?? s.club,
        sportGroups: d.sportGroups ?? s.sportGroups,
        players: d.players ?? s.players,
        trainings: d.trainings ?? s.trainings,
        trainingAttendances: d.trainingAttendances ?? s.trainingAttendances,
        subscriptions: d.subscriptions ?? s.subscriptions,
        matches: d.matches ?? s.matches,
        playerMatchStats: d.playerMatchStats ?? s.playerMatchStats,
        opponents: d.opponents ?? s.opponents,
        divisions: d.divisions ?? s.divisions,
        competitionProgram: d.competitionProgram ?? s.competitionProgram,
        stockItems: d.stockItems ?? s.stockItems,
        stockMovements: d.stockMovements ?? s.stockMovements,
        transactions: d.transactions ?? s.transactions,
        schoolLevels: d.schoolLevels ?? s.schoolLevels,
        schoolResults: d.schoolResults ?? s.schoolResults,
        generalSettings: d.generalSettings ?? s.generalSettings,
        boardMembers: d.boardMembers ?? s.boardMembers,
        adherents: d.adherents ?? s.adherents,
        clubCoaches: d.clubCoaches ?? s.clubCoaches,
        roles: d.roles ?? s.roles,
        adminUsers: d.adminUsers ?? s.adminUsers,
        activities: d.activities ?? s.activities,
      }));
    } catch {
      // ignore
    } finally {
      // Toujours sortir de l’écran « Chargement… » même si l’API échoue (ex. mauvaise variable DB sur Vercel).
      set((s) => ({ ...s, hydrated: true }));
    }
  },

  pushActivity: (title, detail) =>
    set((s) => {
      const entry = act(title, detail);
      // Fire-and-forget persistence so the activity list survives logout/login.
      void fetch("/api/activities", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(entry),
        credentials: "include",
      });
      return { activities: [entry, ...s.activities].slice(0, 120) };
    }),

  resetMockData: () => set(initialState()),

  updateClub: (patch) => {
    set((s) => ({ club: { ...s.club, ...patch } }));
    get().pushActivity("Club", "Informations générales mises à jour");
  },

  replaceBankAccounts: (accounts) => {
    set((s) => ({ club: { ...s.club, bankAccounts: accounts } }));
    get().pushActivity("Club", "Comptes bancaires modifiés");
  },

  addBoardMember: async (row) => {
    const nid = id("bm");
    const res = await fetch("/api/board-members", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...row, id: nid }),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: BoardMember } | null;
    if (!res.ok || !json?.ok || !json.data) return null;
    set((s) => ({ boardMembers: [...s.boardMembers, json.data as BoardMember] }));
    get().pushActivity("Bureau", `Membre ajouté : ${row.fullName}`);
    return json.data as BoardMember;
  },
  updateBoardMember: async (idKey, patch) => {
    const res = await fetch(`/api/board-members/${idKey}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: BoardMember } | null;
    if (!res.ok || !json?.ok) return null;
    set((s) => ({
      boardMembers: s.boardMembers.map((x) => (x.id === idKey ? { ...x, ...(json.data ?? patch) } : x)),
    }));
    get().pushActivity("Bureau", `Membre modifié — ${idKey}`);
    return (json.data as BoardMember) ?? null;
  },
  removeBoardMember: async (idKey) => {
    const res = await fetch(`/api/board-members/${idKey}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) return false;
    set((s) => ({ boardMembers: s.boardMembers.filter((x) => x.id !== idKey) }));
    get().pushActivity("Bureau", `Membre supprimé — ${idKey}`);
    return true;
  },

  addAdherent: async (row) => {
    const nid = id("ad");
    const res = await fetch("/api/adherents", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...row, id: nid }),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: Adherent } | null;
    if (!res.ok || !json?.ok || !json.data) return null;
    set((s) => ({ adherents: [...s.adherents, json.data as Adherent] }));
    get().pushActivity("Dirigeants", `Ajout ${row.memberNumber}`);
    return json.data as Adherent;
  },
  updateAdherent: async (idKey, patch) => {
    const res = await fetch(`/api/adherents/${idKey}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: Adherent } | null;
    if (!res.ok || !json?.ok) return null;
    set((s) => ({
      adherents: s.adherents.map((x) => (x.id === idKey ? { ...x, ...(json.data ?? patch) } : x)),
    }));
    get().pushActivity("Dirigeants", `Modification ${idKey}`);
    return (json.data as Adherent) ?? null;
  },
  removeAdherent: async (idKey) => {
    const res = await fetch(`/api/adherents/${idKey}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) return false;
    set((s) => ({ adherents: s.adherents.filter((x) => x.id !== idKey) }));
    get().pushActivity("Dirigeants", `Suppression ${idKey}`);
    return true;
  },

  addClubCoach: async (row) => {
    const nid = id("cc");
    const res = await fetch("/api/club-coaches", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...row, id: nid }),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: ClubCoach } | null;
    if (!res.ok || !json?.ok || !json.data) return null;
    set((s) => ({ clubCoaches: [...s.clubCoaches, json.data as ClubCoach] }));
    get().pushActivity("Entraîneurs", `Ajout ${row.staffNumber}`);
    return json.data as ClubCoach;
  },
  updateClubCoach: async (idKey, patch) => {
    const res = await fetch(`/api/club-coaches/${idKey}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: ClubCoach } | null;
    if (!res.ok || !json?.ok) return null;
    set((s) => ({
      clubCoaches: s.clubCoaches.map((x) => (x.id === idKey ? { ...x, ...(json.data ?? patch) } : x)),
    }));
    get().pushActivity("Entraîneurs", `Modification ${idKey}`);
    return (json.data as ClubCoach) ?? null;
  },
  removeClubCoach: async (idKey) => {
    const res = await fetch(`/api/club-coaches/${idKey}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) return false;
    set((s) => ({ clubCoaches: s.clubCoaches.filter((x) => x.id !== idKey) }));
    get().pushActivity("Entraîneurs", `Suppression ${idKey}`);
    return true;
  },

  addPlayer: async (row) => {
    const nid = id("pl");
    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...row, id: nid }),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: Player } | null;
    if (!res.ok || !json?.ok || !json.data) return null;
    set((s) => ({ players: [...s.players, json.data as Player] }));
    get().pushActivity("Sportifs", `${row.firstName} ${row.lastName} créé`);
    return json.data as Player;
  },
  updatePlayer: async (idKey, patch) => {
    const res = await fetch(`/api/players/${idKey}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: Player } | null;
    if (!res.ok || !json?.ok) return null;
    set((s) => ({
      players: s.players.map((x) => (x.id === idKey ? { ...x, ...(json.data ?? patch) } : x)),
    }));
    get().pushActivity("Sportifs", `Fiche mise à jour — ${idKey}`);
    return (json.data as Player) ?? null;
  },
  removePlayer: async (idKey) => {
    const res = await fetch(`/api/players/${idKey}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) return false;
    set((s) => ({
      players: s.players.filter((x) => x.id !== idKey),
      playerMatchStats: s.playerMatchStats.filter((x) => x.playerId !== idKey),
      subscriptions: s.subscriptions.filter((x) => x.playerId !== idKey),
    }));
    get().pushActivity("Sportifs", `Suppression joueur ${idKey}`);
    return true;
  },

  addPlayerMatchStat: async (row) => {
    const nid = id("st");
    const res = await fetch("/api/match-stats", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...row, id: nid }),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: PlayerMatchStat } | null;
    if (!res.ok || !json?.ok || !json.data) return null;
    set((s) => ({ playerMatchStats: [...s.playerMatchStats, json.data as PlayerMatchStat] }));
    get().pushActivity("Stats match", `Ligne créée (${nid})`);
    return json.data as PlayerMatchStat;
  },
  updatePlayerMatchStat: async (idKey, patch) => {
    const res = await fetch(`/api/match-stats/${idKey}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: PlayerMatchStat } | null;
    if (!res.ok || !json?.ok) return null;
    set((s) => ({
      playerMatchStats: s.playerMatchStats.map((x) => (x.id === idKey ? { ...x, ...(json.data ?? patch) } : x)),
    }));
    get().pushActivity("Stats match", `Ligne mise à jour — ${idKey}`);
    return (json.data as PlayerMatchStat) ?? null;
  },
  removePlayerMatchStat: async (idKey) => {
    const res = await fetch(`/api/match-stats/${idKey}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) return false;
    set((s) => ({ playerMatchStats: s.playerMatchStats.filter((x) => x.id !== idKey) }));
    get().pushActivity("Stats match", `Ligne supprimée — ${idKey}`);
    return true;
  },

  addSubscription: async (row) => {
    const nid = id("su");
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...row, id: nid }),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: Subscription } | null;
    if (!res.ok || !json?.ok || !json.data) return null;
    set((s) => ({ subscriptions: [...s.subscriptions, json.data as Subscription] }));
    get().pushActivity("Abonnements", "Nouvel abonnement enregistré");
    return json.data as Subscription;
  },
  updateSubscription: async (idKey, patch) => {
    const res = await fetch(`/api/subscriptions/${idKey}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: Subscription } | null;
    if (!res.ok || !json?.ok) return null;
    set((s) => ({
      subscriptions: s.subscriptions.map((x) => (x.id === idKey ? { ...x, ...(json.data ?? patch) } : x)),
    }));
    get().pushActivity("Abonnements", `Mise à jour ${idKey}`);
    return (json.data as Subscription) ?? null;
  },
  removeSubscription: async (idKey) => {
    const res = await fetch(`/api/subscriptions/${idKey}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) return false;
    set((s) => ({ subscriptions: s.subscriptions.filter((x) => x.id !== idKey) }));
    get().pushActivity("Abonnements", `Supprimé ${idKey}`);
    return true;
  },

  addSportGroup: async (row) => {
    const nid = id("gr");
    const res = await fetch("/api/sport-groups", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...row, id: nid }),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: SportGroup } | null;
    if (!res.ok || !json?.ok || !json.data) return null;
    set((s) => ({ sportGroups: [...s.sportGroups, json.data as SportGroup] }));
    get().pushActivity("Complexe", `Groupe ${row.name}`);
    return json.data as SportGroup;
  },
  updateSportGroup: async (idKey, patch) => {
    const res = await fetch(`/api/sport-groups/${idKey}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: SportGroup } | null;
    if (!res.ok || !json?.ok) return null;
    set((s) => ({
      sportGroups: s.sportGroups.map((x) => (x.id === idKey ? { ...x, ...(json.data ?? patch) } : x)),
    }));
    get().pushActivity("Complexe", `Groupe mis à jour — ${idKey}`);
    return (json.data as SportGroup) ?? null;
  },
  removeSportGroup: async (idKey) => {
    const res = await fetch(`/api/sport-groups/${idKey}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) return false;
    set((s) => ({ sportGroups: s.sportGroups.filter((x) => x.id !== idKey) }));
    get().pushActivity("Complexe", `Groupe supprimé — ${idKey}`);
    return true;
  },

  addTraining: async (row) => {
    const nid = id("tr");
    const res = await fetch("/api/trainings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...row, id: nid }),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: TrainingSession } | null;
    if (!res.ok || !json?.ok || !json.data) return null;
    set((s) => ({ trainings: [...s.trainings, json.data as TrainingSession] }));
    get().pushActivity("Séances", row.title);
    return json.data as TrainingSession;
  },
  updateTraining: async (idKey, patch) => {
    const res = await fetch(`/api/trainings/${idKey}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: TrainingSession } | null;
    if (!res.ok || !json?.ok) return null;
    set((s) => ({ trainings: s.trainings.map((x) => (x.id === idKey ? { ...x, ...(json.data ?? patch) } : x)) }));
    get().pushActivity("Séances", `Planning mis à jour — ${idKey}`);
    return (json.data as TrainingSession) ?? null;
  },
  removeTraining: async (idKey) => {
    const res = await fetch(`/api/trainings/${idKey}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) return false;
    set((s) => ({ trainings: s.trainings.filter((x) => x.id !== idKey) }));
    get().pushActivity("Séances", `Annulation / suppression — ${idKey}`);
    return true;
  },

  setTrainingAttendance: (trainingId, playerId, status) => {
    set((s) => {
      const existing = s.trainingAttendances.find(
        (a) => a.trainingId === trainingId && a.playerId === playerId,
      );
      if (!existing) {
        return {
          trainingAttendances: [
            ...s.trainingAttendances,
            { id: id("att"), trainingId, playerId, status, markedAt: nowISO() },
          ],
        };
      }
      return {
        trainingAttendances: s.trainingAttendances.map((a) =>
          a.id === existing.id ? { ...a, status, markedAt: nowISO() } : a,
        ),
      };
    });
    get().pushActivity("Présence", `${trainingId} · ${playerId} → ${status}`);
    void fetch(`/api/trainings/${trainingId}/attendance`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ playerId, status }),
      credentials: "include",
    });
  },

  resetTrainingAttendance: (trainingId) => {
    set((s) => ({
      trainingAttendances: s.trainingAttendances.filter((a) => a.trainingId !== trainingId),
    }));
    get().pushActivity("Présence", `Réinitialisation séance ${trainingId}`);
    void fetch(`/api/trainings/${trainingId}/attendance`, { method: "DELETE", credentials: "include" });
  },

  addMatch: async (row) => {
    const nid = id("mt");
    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...row, id: nid }),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: MatchRecord } | null;
    if (!res.ok || !json?.ok || !json.data) return null;
    set((s) => ({ matches: [...s.matches, json.data as MatchRecord] }));
    get().pushActivity("Matchs", `${row.homeTeam} — ${row.awayTeam}`);
    return json.data as MatchRecord;
  },
  updateMatch: async (idKey, patch) => {
    const res = await fetch(`/api/matches/${idKey}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: MatchRecord } | null;
    if (!res.ok || !json?.ok) return null;
    set((s) => ({ matches: s.matches.map((x) => (x.id === idKey ? { ...x, ...(json.data ?? patch) } : x)) }));
    get().pushActivity("Matchs", `Fiche match ${idKey}`);
    return (json.data as MatchRecord) ?? null;
  },
  removeMatch: async (idKey) => {
    const res = await fetch(`/api/matches/${idKey}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) return false;
    set((s) => ({
      matches: s.matches.filter((x) => x.id !== idKey),
      playerMatchStats: s.playerMatchStats.filter((x) => x.matchId !== idKey),
    }));
    get().pushActivity("Matchs", `Suppression match ${idKey}`);
    return true;
  },

  addOpponent: async (row) => {
    const nid = id("op");
    const res = await fetch("/api/opponents", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...row, id: nid }),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: Opponent } | null;
    if (!res.ok || !json?.ok || !json.data) return null;
    set((s) => ({ opponents: [...s.opponents, json.data as Opponent] }));
    get().pushActivity("Compétitions", `Équipe adverse ${row.name}`);
    return json.data as Opponent;
  },
  updateOpponent: async (idKey, patch) => {
    const res = await fetch(`/api/opponents/${idKey}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: Opponent } | null;
    if (!res.ok || !json?.ok) return null;
    set((s) => ({ opponents: s.opponents.map((x) => (x.id === idKey ? { ...x, ...(json.data ?? patch) } : x)) }));
    get().pushActivity("Compétitions", `Adversaire modifié — ${idKey}`);
    return (json.data as Opponent) ?? null;
  },
  removeOpponent: async (idKey) => {
    const res = await fetch(`/api/opponents/${idKey}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) return false;
    set((s) => ({ opponents: s.opponents.filter((x) => x.id !== idKey) }));
    get().pushActivity("Compétitions", `Adversaire retiré — ${idKey}`);
    return true;
  },

  addDivision: async (row) => {
    const nid = id("dv");
    const res = await fetch("/api/divisions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...row, id: nid }),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: CompetitionDivision } | null;
    if (!res.ok || !json?.ok || !json.data) return null;
    set((s) => ({ divisions: [...s.divisions, json.data as CompetitionDivision] }));
    get().pushActivity("Compétitions", `Division ${row.label}`);
    return json.data as CompetitionDivision;
  },
  updateDivision: async (idKey, patch) => {
    const res = await fetch(`/api/divisions/${idKey}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: CompetitionDivision } | null;
    if (!res.ok || !json?.ok) return null;
    set((s) => ({ divisions: s.divisions.map((x) => (x.id === idKey ? { ...x, ...(json.data ?? patch) } : x)) }));
    get().pushActivity("Compétitions", `Division mise à jour — ${idKey}`);
    return (json.data as CompetitionDivision) ?? null;
  },
  removeDivision: async (idKey) => {
    const res = await fetch(`/api/divisions/${idKey}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) return false;
    set((s) => ({ divisions: s.divisions.filter((x) => x.id !== idKey) }));
    get().pushActivity("Compétitions", `Division retirée — ${idKey}`);
    return true;
  },

  addProgramEntry: async (row) => {
    const nid = id("cp");
    const res = await fetch("/api/competition-program", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...row, id: nid }),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: CompetitionProgramEntry } | null;
    if (!res.ok || !json?.ok || !json.data) return null;
    set((s) => ({ competitionProgram: [...s.competitionProgram, json.data as CompetitionProgramEntry] }));
    get().pushActivity("Compétitions", `Programme : ${row.title}`);
    return json.data as CompetitionProgramEntry;
  },
  updateProgramEntry: async (idKey, patch) => {
    const res = await fetch(`/api/competition-program/${idKey}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: CompetitionProgramEntry } | null;
    if (!res.ok || !json?.ok) return null;
    set((s) => ({ competitionProgram: s.competitionProgram.map((x) => (x.id === idKey ? { ...x, ...(json.data ?? patch) } : x)) }));
    get().pushActivity("Compétitions", `Programme maj — ${idKey}`);
    return (json.data as CompetitionProgramEntry) ?? null;
  },
  removeProgramEntry: async (idKey) => {
    const res = await fetch(`/api/competition-program/${idKey}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) return false;
    set((s) => ({ competitionProgram: s.competitionProgram.filter((x) => x.id !== idKey) }));
    get().pushActivity("Compétitions", `Entrée supprimée — ${idKey}`);
    return true;
  },

  addStockItem: async (row) => {
    const nid = id("stk");
    const res = await fetch("/api/stock/items", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...row, id: nid }),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: StockItem } | null;
    if (!res.ok || !json?.ok || !json.data) return null;
    set((s) => ({ stockItems: [...s.stockItems, json.data as StockItem] }));
    get().pushActivity("Stock", `Article ${row.name}`);
    return json.data as StockItem;
  },
  updateStockItem: async (idKey, patch) => {
    const res = await fetch(`/api/stock/items/${idKey}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: StockItem } | null;
    if (!res.ok || !json?.ok) return null;
    set((s) => ({ stockItems: s.stockItems.map((x) => (x.id === idKey ? { ...x, ...(json.data ?? patch) } : x)) }));
    get().pushActivity("Stock", `Réf ${idKey}`);
    return (json.data as StockItem) ?? null;
  },
  removeStockItem: async (idKey) => {
    const res = await fetch(`/api/stock/items/${idKey}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) return false;
    set((s) => ({
      stockItems: s.stockItems.filter((x) => x.id !== idKey),
      stockMovements: s.stockMovements.filter((x) => x.productId !== idKey),
    }));
    get().pushActivity("Stock", `Réf produit retirée — ${idKey}`);
    return true;
  },

  addStockMovement: async (row) => {
    const nid = id("mov");
    const res = await fetch("/api/stock/movements", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...row, id: nid }),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: StockMovement } | null;
    if (!res.ok || !json?.ok || !json.data) return null;
    set((s) => {
      const items = [...s.stockItems];
      const idx = items.findIndex((x) => x.id === row.productId);
      if (idx !== -1) {
        const q = row.type === "reception" ? row.quantity : -row.quantity;
        items[idx] = { ...items[idx], quantity: Math.max(0, items[idx].quantity + q) };
      }
      return { stockItems: items, stockMovements: [...s.stockMovements, json.data as StockMovement] };
    });
    get().pushActivity("Stock", row.type === "reception" ? "Réception" : "Sortie");
    return json.data as StockMovement;
  },
  updateStockMovement: async (idKey, patch) => {
    const res = await fetch(`/api/stock/movements/${idKey}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: StockMovement } | null;
    if (!res.ok || !json?.ok) return null;
    set((s) => ({ stockMovements: s.stockMovements.map((x) => (x.id === idKey ? { ...x, ...(json.data ?? patch) } : x)) }));
    get().pushActivity("Stock", `Mouvement ${idKey}`);
    return (json.data as StockMovement) ?? null;
  },
  removeStockMovement: async (idKey) => {
    const res = await fetch(`/api/stock/movements/${idKey}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) return false;
    set((s) => ({ stockMovements: s.stockMovements.filter((x) => x.id !== idKey) }));
    get().pushActivity("Stock", `Suppression mouvement ${idKey}`);
    return true;
  },

  addTransaction: async (row) => {
    const nid = id("trx");
    const res = await fetch("/api/finance/transactions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...row, id: nid }),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: FinanceTransaction } | null;
    if (!res.ok || !json?.ok || !json.data) return null;
    set((s) => ({ transactions: [...s.transactions, json.data as FinanceTransaction] }));
    get().pushActivity("Finance", `${row.kind} · ${row.label}`);
    return json.data as FinanceTransaction;
  },
  updateTransaction: async (idKey, patch) => {
    const res = await fetch(`/api/finance/transactions/${idKey}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: FinanceTransaction } | null;
    if (!res.ok || !json?.ok) return null;
    set((s) => ({ transactions: s.transactions.map((x) => (x.id === idKey ? { ...x, ...(json.data ?? patch) } : x)) }));
    get().pushActivity("Finance", `Écriture ${idKey}`);
    return (json.data as FinanceTransaction) ?? null;
  },
  removeTransaction: async (idKey) => {
    const res = await fetch(`/api/finance/transactions/${idKey}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) return false;
    set((s) => ({ transactions: s.transactions.filter((x) => x.id !== idKey) }));
    get().pushActivity("Finance", `Suppression écriture ${idKey}`);
    return true;
  },

  addSchoolLevel: async (row) => {
    const nid = id("lvl");
    const res = await fetch("/api/school-levels", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...row, id: nid }),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: SchoolLevel } | null;
    if (!res.ok || !json?.ok || !json.data) return null;
    set((s) => ({ schoolLevels: [...s.schoolLevels, json.data as SchoolLevel] }));
    get().pushActivity("Paramètres", `Niveau scolaire ${row.label}`);
    return json.data as SchoolLevel;
  },
  updateSchoolLevel: async (idKey, patch) => {
    const res = await fetch(`/api/school-levels/${idKey}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: SchoolLevel } | null;
    if (!res.ok || !json?.ok) return null;
    set((s) => ({ schoolLevels: s.schoolLevels.map((x) => (x.id === idKey ? { ...x, ...(json.data ?? patch) } : x)) }));
    get().pushActivity("Paramètres", `Niveau ${idKey}`);
    return (json.data as SchoolLevel) ?? null;
  },
  removeSchoolLevel: async (idKey) => {
    const res = await fetch(`/api/school-levels/${idKey}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) return false;
    set((s) => ({ schoolLevels: s.schoolLevels.filter((x) => x.id !== idKey) }));
    get().pushActivity("Paramètres", `Niveau retiré — ${idKey}`);
    return true;
  },

  addSchoolResult: async (row) => {
    const nid = id("res");
    const res = await fetch("/api/school-results", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...row, id: nid }),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: SchoolResult } | null;
    if (!res.ok || !json?.ok || !json.data) return null;
    set((s) => ({ schoolResults: [...s.schoolResults, json.data as SchoolResult] }));
    get().pushActivity("Paramètres", `Résultat scolaire ${row.label}`);
    return json.data as SchoolResult;
  },
  updateSchoolResult: async (idKey, patch) => {
    const res = await fetch(`/api/school-results/${idKey}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: SchoolResult } | null;
    if (!res.ok || !json?.ok) return null;
    set((s) => ({ schoolResults: s.schoolResults.map((x) => (x.id === idKey ? { ...x, ...(json.data ?? patch) } : x)) }));
    get().pushActivity("Paramètres", `Résultat ${idKey}`);
    return (json.data as SchoolResult) ?? null;
  },
  removeSchoolResult: async (idKey) => {
    const res = await fetch(`/api/school-results/${idKey}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) return false;
    set((s) => ({ schoolResults: s.schoolResults.filter((x) => x.id !== idKey) }));
    get().pushActivity("Paramètres", `Résultat retiré — ${idKey}`);
    return true;
  },

  addRole: async (row) => {
    const nid = id("role");
    const res = await fetch("/api/roles", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...row, id: nid }),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: Role } | null;
    if (!res.ok || !json?.ok || !json.data) return null;
    set((s) => ({ roles: [...s.roles, json.data as Role] }));
    get().pushActivity("Sécurité", `Rôle ${row.name}`);
    return json.data as Role;
  },
  updateRole: async (idKey, patch) => {
    const res = await fetch(`/api/roles/${idKey}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: Role } | null;
    if (!res.ok || !json?.ok) return null;
    set((s) => ({ roles: s.roles.map((x) => (x.id === idKey ? { ...x, ...(json.data ?? patch) } : x)) }));
    get().pushActivity("Sécurité", `Rôle modifié — ${idKey}`);
    return (json.data as Role) ?? null;
  },
  removeRole: async (idKey) => {
    const res = await fetch(`/api/roles/${idKey}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) return false;
    set((s) => ({
      roles: s.roles.filter((x) => x.id !== idKey),
      adminUsers: s.adminUsers.map((u) => (u.roleId === idKey ? { ...u, roleId: "" } : u)),
    }));
    get().pushActivity("Sécurité", `Rôle supprimé — ${idKey}`);
    return true;
  },

  addAdminUser: async (row) => {
    const nid = id("usr");
    const res = await fetch("/api/admin-users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...row, id: nid }),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: AdminUser } | null;
    if (!res.ok || !json?.ok || !json.data) return null;
    set((s) => ({ adminUsers: [...s.adminUsers, json.data as AdminUser] }));
    get().pushActivity("Utilisateurs", row.email);
    return json.data as AdminUser;
  },
  updateAdminUser: async (idKey, patch) => {
    const res = await fetch(`/api/admin-users/${idKey}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: AdminUser } | null;
    if (!res.ok || !json?.ok) return null;
    set((s) => ({ adminUsers: s.adminUsers.map((x) => (x.id === idKey ? { ...x, ...(json.data ?? patch) } : x)) }));
    get().pushActivity("Utilisateurs", `Modification ${idKey}`);
    return (json.data as AdminUser) ?? null;
  },
  removeAdminUser: async (idKey) => {
    const res = await fetch(`/api/admin-users/${idKey}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) return false;
    set((s) => ({ adminUsers: s.adminUsers.filter((x) => x.id !== idKey) }));
    get().pushActivity("Utilisateurs", `Compte retiré — ${idKey}`);
    return true;
  },

  updateGeneralSettings: async (patch) => {
    const res = await fetch("/api/general-settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
      credentials: "include",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: GeneralSettings } | null;
    if (!res.ok || !json?.ok || !json.data) return null;
    set((s) => ({ generalSettings: { ...s.generalSettings, ...(json.data as GeneralSettings) } }));
    get().pushActivity("Paramètres", "Préférences système");
    return json.data as GeneralSettings;
  },
}));

export function selectorsCashBalance(transactions: FinanceTransaction[]) {
  const recettes = transactions
    .filter((t) => t.kind === "recette")
    .reduce((acc, x) => acc + x.amount, 0);
  const depenses = transactions
    .filter((t) => t.kind === "depense")
    .reduce((acc, x) => acc + x.amount, 0);
  return recettes - depenses;
}
