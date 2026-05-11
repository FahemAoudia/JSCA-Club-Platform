/**
 * Couche d’accès aux données — abstraction pour brancher Supabase, PostgreSQL ou MySQL.
 *
 * Workflow suggéré :
 * 1. Implémenter les interfaces Repository ci-dessous (ex. `SupabasePlayerRepository`).
 * 2. Injecter les implémentations via un provider React ou un module `services/`.
 * 3. Remplacer les appels Zustand côté client par React Query / Server Actions qui appellent ces repositories.
 */

import type {
  ClubProfile,
  Player,
  Subscription,
  TrainingSession,
  MatchRecord,
  StockItem,
} from "@/types";

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface ClubRepository {
  getProfile(): Promise<ClubProfile>;
  updateProfile(p: Partial<ClubProfile>): Promise<ClubProfile>;
}

export interface CrudRepository<T extends { id: string }> {
  list(params?: ListParams): Promise<Paginated<T>>;
  getById(id: string): Promise<T | null>;
  create(input: Omit<T, "id">): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
}

export type PlayerRepository = CrudRepository<Player>;
export type SubscriptionRepository = CrudRepository<Subscription>;
export type TrainingRepository = CrudRepository<TrainingSession>;
export type MatchRepository = CrudRepository<MatchRecord>;
export type StockItemRepository = CrudRepository<StockItem>;

export interface DataLayerConfig {
  club: ClubRepository;
  players: PlayerRepository;
  subscriptions: SubscriptionRepository;
  trainings: TrainingRepository;
  matches: MatchRepository;
  stockItems: StockItemRepository;
  /** Étendre : bureau, adhérents, mouvements de stock, transactions financières, etc. */
}

/** Placeholder — remplacer par une fabrique réelle (env, client Supabase, etc.) */
export function createDataLayer(_config: Partial<DataLayerConfig> = {}): DataLayerConfig {
  throw new Error(
    "createDataLayer : brancher une implémentation (Supabase / PG / MySQL). Voir lib/data-layer.ts",
  );
}
