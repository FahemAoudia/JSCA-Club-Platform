import Image from "next/image";
import Link from "next/link";

import { loginDashboardAction } from "@/app/actions/dashboard-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Connexion administration",
};

type Props = {
  searchParams: Promise<{ e?: string }>;
};

export default async function DashboardLoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const showErr = sp.e === "credentials";

  return (
    <div className="relative flex min-h-svh flex-col bg-[var(--background)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.09] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext x='50' y='58' font-size='52' text-anchor='middle' fill='%23c62828'%3Eⵣ%3C/text%3E%3C/svg%3E\")",
          backgroundSize: "120px 120px",
        }}
      />

      <header className="relative z-[1] border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-5 sm:px-6">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
            <Image
              src="/branding/jsca-logo.png"
              alt="JSCA"
              width={48}
              height={48}
              className="size-12 rounded-full object-cover shadow-md ring-2 ring-[var(--jsca-gold-border)]"
              priority
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Retour au site public
              </p>
              <p className="font-semibold text-[var(--jsca-blue)] dark:text-foreground">
                Jeunesse Sportive Commune Aghbalou
              </p>
            </div>
          </Link>
        </div>
      </header>

      <main className="relative z-[1] flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-xl shadow-black/10 [border-color:var(--jsca-gold-border)]">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-xl sm:text-2xl">Administration JSCA</CardTitle>
            <CardDescription>
              Accès réservé au bureau et au staff autorisé. Définissez la variable{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">ADMIN_PASSWORD</code> sur le serveur en production (obligatoire).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={loginDashboardAction} className="space-y-5">
              {showErr ? (
                <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                  Mot de passe incorrect. Réessayez ou contactez le président du club.
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe administrateur</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Saisissez votre mot de passe"
                  className="h-11"
                />
              </div>
              <Button type="submit" className="h-11 w-full">
                Se connecter au tableau de bord
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
