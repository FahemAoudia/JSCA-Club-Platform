"use client";

import * as React from "react";
import { useJscaStore } from "@/stores/use-jsca-store";

export function DbHydrator() {
  const load = useJscaStore((s) => s.loadFromDb);
  React.useEffect(() => {
    void load();
  }, [load]);
  return null;
}

