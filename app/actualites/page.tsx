import type { Metadata } from "next";

import { ActualitesPageClient } from "@/components/actualites-page-client";
import { clubProfile } from "@/data/club";

export const metadata: Metadata = {
  title: "Actualités & communiqués JSCA",
  description: `Annonces officielles — ${clubProfile.name}`,
};

export default function ActualitesPage() {
  return <ActualitesPageClient />;
}
