import { NextResponse } from "next/server";

import { requireDashboardAdmin } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { mapMediaRowForJsonTransport } from "@/lib/media-inline-proxy";

export async function GET() {
  const guard = await requireDashboardAdmin();
  if (guard) return guard;

  const [
    clubProfile,
    sportGroups,
    players,
    trainings,
    trainingAttendances,
    subscriptions,
    matches,
    playerMatchStats,
    opponents,
    divisions,
    competitionProgram,
    stockItems,
    stockMovements,
    transactions,
    schoolLevels,
    schoolResults,
    generalSettings,
    boardMembers,
    adherents,
    clubCoaches,
    roles,
    adminUsers,
    activities,
    news,
    media,
  ] = await Promise.all([
    db.clubProfile.findUnique({ where: { id: "club" }, include: { bankAccounts: true } }),
    db.sportGroup.findMany(),
    db.player.findMany(),
    db.trainingSession.findMany(),
    db.trainingAttendance.findMany(),
    db.subscription.findMany(),
    db.matchRecord.findMany(),
    db.playerMatchStat.findMany(),
    db.opponent.findMany(),
    db.competitionDivision.findMany(),
    db.competitionProgramEntry.findMany(),
    db.stockItem.findMany(),
    db.stockMovement.findMany(),
    db.financeTransaction.findMany(),
    db.schoolLevel.findMany(),
    db.schoolResult.findMany(),
    db.generalSettings.findUnique({ where: { id: "settings" } }),
    db.boardMember.findMany(),
    db.adherent.findMany(),
    db.clubCoach.findMany(),
    db.role.findMany(),
    db.adminUser.findMany(),
    db.activityEntry.findMany({ orderBy: { at: "desc" } }),
    db.newsItem.findMany({ orderBy: { date: "desc" } }),
    db.mediaItem.findMany(),
  ]);

  const mediaOut = media.map((m) => mapMediaRowForJsonTransport(m));

  return NextResponse.json({
    ok: true,
    data: {
      club: clubProfile,
      sportGroups,
      players,
      trainings,
      trainingAttendances,
      subscriptions,
      matches,
      playerMatchStats,
      opponents,
      divisions,
      competitionProgram,
      stockItems,
      stockMovements,
      transactions,
      schoolLevels,
      schoolResults,
      generalSettings,
      boardMembers,
      adherents,
      clubCoaches,
      roles,
      adminUsers,
      activities,
      news,
      media: mediaOut,
    },
  });
}

