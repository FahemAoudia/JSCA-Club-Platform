"use client";

import {
  Building2,
  CalendarClock,
  CircleDollarSign,
  Flag,
  LandPlot,
  LayoutDashboard,
  Menu,
  Package,
  Printer,
  Settings,
  Shirt,
  Trophy,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ADMIN_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useJscaStore } from "@/stores/use-jsca-store";
import { formatDateFr } from "@/lib/utils";
import { DbHydrator } from "@/components/dashboard/db-hydrator";

const iconMap = {
  LayoutDashboard,
  Building2,
  Users,
  Shirt,
  Wallet,
  LandPlot,
  CalendarClock,
  Trophy,
  Flag,
  Package,
  CircleDollarSign,
  Printer,
  Settings,
} as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const allActivities = useJscaStore((s) => s.activities);
  const activities = React.useMemo(() => allActivities.slice(0, 6), [allActivities]);
  const reset = useJscaStore((s) => s.resetMockData);
  const pushActivity = useJscaStore((s) => s.pushActivity);

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [q, setQ] = React.useState("");

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = React.useCallback(
    (href: string) => pathname === href || pathname.startsWith(`${href}/`),
    [pathname],
  );

  const NavItems = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="space-y-4 px-3 py-4">
      {ADMIN_NAV.map((item) => {
        const Icon = iconMap[item.icon as keyof typeof iconMap];
        const hasChildren = "children" in item && item.children?.length;
        const activeSelf = !hasChildren && isActive(item.href);

        return (
          <div key={item.href} className="space-y-1">
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                activeSelf
                  ? "border border-[color-mix(in_oklch,var(--jsca-gold)_40%,transparent)] bg-[var(--jsca-nav-active)] text-sidebar-foreground shadow-inner"
                  : "text-sidebar-foreground/74 hover:bg-white/10 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="size-4 shrink-0 opacity-95" aria-hidden />
              <span>{item.label}</span>
            </Link>
            {hasChildren ? (
              <div className="ml-9 space-y-1 border-l border-white/14 pl-3">
                {item.children!.map((c) => {
                  const active = isActive(c.href);
                  return (
                    <Link
                      key={c.href}
                      href={c.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] transition-colors",
                        active
                          ? "border border-[color-mix(in_oklch,var(--jsca-gold)_45%,transparent)] bg-[var(--jsca-nav-active)] text-sidebar-foreground shadow-inner"
                          : "text-sidebar-foreground/74 hover:bg-white/10 hover:text-sidebar-foreground",
                      )}
                    >
                      <span>{c.label}</span>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-svh bg-background">
      <DbHydrator />
      {/* Desktop */}
      <aside className="relative hidden shrink-0 border-r border-[color-mix(in_oklch,var(--jsca-gold)_25%,transparent)] bg-sidebar text-sidebar-foreground lg:flex lg:w-72 xl:w-80">
        <div className="flex w-full flex-col">
          <div className="border-b border-sidebar-foreground/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <Image
                src="/branding/jsca-logo.png"
                alt=""
                width={52}
                height={52}
                className="size-[52px] shrink-0 rounded-full object-cover shadow-lg ring-2 ring-[var(--jsca-gold-border)]"
              />
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color-mix(in_oklch,var(--jsca-gold)_70%,white)]">
                  Tableau de bord · 1986
                </div>
                <div className="truncate text-lg font-bold tracking-tight text-sidebar-foreground">JSCA · Aghbalou</div>
              </div>
            </div>
            <p className="mt-3 text-[12px] leading-snug text-sidebar-foreground/80">
              Jeunesse Sportive Commune Aghbalou — gestion club professionnelle.
            </p>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <NavItems />
          </div>
          <div className="border-t border-sidebar-foreground/10 p-4 text-[11px] text-sidebar-foreground/45">
            Version maquette — connecter Supabase / PostgreSQL / MySQL via `lib/data-layer.ts`.
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/75">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Menu">
                  <Menu className="size-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="left-0 top-0 max-w-[min(90vw,360px)] translate-x-0 translate-y-0 rounded-none border-0 bg-sidebar p-0 text-sidebar-foreground">
                <DialogHeader className="border-b border-sidebar-foreground/10 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <DialogTitle className="text-left text-base">Navigation</DialogTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-sidebar-foreground"
                      onClick={() => setMobileOpen(false)}
                      aria-label="Fermer"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </DialogHeader>
                <div className="max-h-[calc(100vh-88px)] overflow-y-auto">
                  <NavItems onNavigate={() => setMobileOpen(false)} />
                </div>
              </DialogContent>
            </Dialog>

            <div className="relative hidden min-w-0 flex-1 md:block">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Recherche globale (prévue — filtre contextuel plus tard)"
                className="h-10 max-w-xl bg-muted/50"
              />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <span className="hidden sm:inline">Notifications</span>
                    <Badge tone="amber">{activities.length}</Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Dernières activités</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-72 space-y-2 overflow-y-auto px-2 py-2">
                    {activities.map((a) => (
                      <div key={a.id} className="rounded-lg border border-border bg-muted/40 p-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-card-foreground">{a.title}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDateFr(a.at)}
                          </span>
                        </div>
                        {a.detail ? (
                          <p className="mt-1 text-xs text-muted-foreground">{a.detail}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      pushActivity("Test", "Notification démo — prête pour webhooks.");
                    }}
                  >
                    Simuler une alerte
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Compte admin
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>Prototype</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/">Retour au site public</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer p-0 focus:bg-muted">
                    <a
                      href="/api/auth/logout"
                      className="relative flex w-full cursor-pointer select-none flex-col gap-0.5 rounded-lg px-2 py-2 text-start text-sm font-medium text-foreground no-underline outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="font-semibold leading-snug">Déconnexion JSCA</span>
                      <span className="text-xs font-normal leading-snug text-muted-foreground">
                        (session navigateur sécurisée)
                      </span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    defaultValue="fr"
                    onValueChange={(v) => pushActivity("Langue UI", String(v))}
                  >
                    <DropdownMenuRadioItem value="fr">Français (actif)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="ar-ar">
                      العربية · RTL prévu (`dir`)
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-700 focus:bg-red-600 focus:text-white dark:text-red-200"
                    onSelect={() => reset()}
                  >
                    Réinitialiser les données exemple
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
