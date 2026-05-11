import { NextResponse } from "next/server";

import { requireDashboardAdmin } from "@/lib/api-auth";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import {
  adherentsSeed,
  clubCoachesSeed,
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
import { mediaGallerySeed, newsSeed } from "@/data/club";

export async function POST() {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;

  const result = await db.$transaction(async (tx) => {
    // Club profile (single row) + bank accounts
    const { bankAccounts, ...clubProfileRow } = clubProfile;
    await tx.clubProfile.upsert({
      where: { id: "club" },
      create: { id: "club", ...clubProfileRow } satisfies Prisma.ClubProfileUncheckedCreateInput,
      update: { ...clubProfileRow } satisfies Prisma.ClubProfileUncheckedUpdateInput,
    });
    await tx.bankAccount.deleteMany({ where: { clubId: "club" } });
    if (bankAccounts?.length) {
      await tx.bankAccount.createMany({
        data: bankAccounts.map((b) => ({ ...b, clubId: "club" })),
      });
    }

    // General settings (single row)
    await tx.generalSettings.upsert({
      where: { id: "settings" },
      create: { id: "settings", ...generalSettingsSeed },
      update: { ...generalSettingsSeed },
    });

    // Security
    for (const r of rolesSeed) {
      await tx.role.upsert({
        where: { id: r.id },
        create: r,
        update: r,
      });
    }
    for (const u of adminUsersSeed) {
      await tx.adminUser.upsert({
        where: { id: u.id },
        create: u,
        update: u,
      });
    }

    // Club / bureau / adherents
    for (const bm of boardMembersSeed) {
      await tx.boardMember.upsert({ where: { id: bm.id }, create: bm, update: bm });
    }
    for (const ad of adherentsSeed) {
      await tx.adherent.upsert({ where: { id: ad.id }, create: ad, update: ad });
    }
    for (const c of clubCoachesSeed) {
      await tx.clubCoach.upsert({ where: { id: c.id }, create: c, update: c });
    }

    // Sport groups
    for (const g of sportGroupsSeed) {
      await tx.sportGroup.upsert({ where: { id: g.id }, create: g, update: g });
    }

    // Players
    for (const p of playersSeed) {
      const { parentPhotoUrl: _parentPhotoUrl, ...rest } = p;
      void _parentPhotoUrl;
      await tx.player.upsert({
        where: { id: p.id },
        create: rest satisfies Prisma.PlayerUncheckedCreateInput,
        update: rest satisfies Prisma.PlayerUncheckedUpdateInput,
      });
    }

    // Trainings
    for (const t of trainingsSeed) {
      await tx.trainingSession.upsert({ where: { id: t.id }, create: t, update: t });
    }

    // Subscriptions
    for (const s of subscriptionsSeed) {
      await tx.subscription.upsert({ where: { id: s.id }, create: s, update: s });
    }

    // Matches + stats
    for (const m of matchesSeed) {
      await tx.matchRecord.upsert({ where: { id: m.id }, create: m, update: m });
    }
    for (const st of playerMatchStatsSeed) {
      await tx.playerMatchStat.upsert({ where: { id: st.id }, create: st, update: st });
    }

    // Competitions
    for (const op of opponentsSeed) {
      await tx.opponent.upsert({ where: { id: op.id }, create: op, update: op });
    }
    for (const d of divisionsSeed) {
      await tx.competitionDivision.upsert({ where: { id: d.id }, create: d, update: d });
    }
    for (const cp of competitionProgramSeed) {
      await tx.competitionProgramEntry.upsert({ where: { id: cp.id }, create: cp, update: cp });
    }

    // Stock
    for (const it of stockItemsSeed) {
      await tx.stockItem.upsert({ where: { id: it.id }, create: it, update: it });
    }
    for (const mv of stockMovementsSeed) {
      await tx.stockMovement.upsert({ where: { id: mv.id }, create: mv, update: mv });
    }

    // Finance
    for (const tr of transactionsSeed) {
      await tx.financeTransaction.upsert({ where: { id: tr.id }, create: tr, update: tr });
    }

    // School
    for (const sl of schoolLevelsSeed) {
      await tx.schoolLevel.upsert({ where: { id: sl.id }, create: sl, update: sl });
    }
    for (const sr of schoolResultsSeed) {
      await tx.schoolResult.upsert({ where: { id: sr.id }, create: sr, update: sr });
    }

    // News + media
    for (const n of newsSeed) {
      await tx.newsItem.upsert({ where: { id: n.id }, create: n, update: n });
    }
    for (const m of mediaGallerySeed) {
      await tx.mediaItem.upsert({ where: { id: m.id }, create: m, update: m });
    }

    const landingRow = await tx.landingPageSettings.findUnique({ where: { id: "landing" } });
    if (!landingRow) {
      await tx.landingPageSettings.create({
        data: {
          id: "landing",
          copyFr: {},
          copyAr: {},
          actualitesFr: {},
          actualitesAr: {},
          logoUrl: null,
          bannerEmoji: "ⵣ",
        },
      });
    }

    return {
      club: 1,
      players: playersSeed.length,
      sportGroups: sportGroupsSeed.length,
      trainings: trainingsSeed.length,
      subscriptions: subscriptionsSeed.length,
      matches: matchesSeed.length,
      stockItems: stockItemsSeed.length,
      transactions: transactionsSeed.length,
    };
  });

  return NextResponse.json({ ok: true, data: result });
}

