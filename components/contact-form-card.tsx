"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CLUB_CONTACT } from "@/lib/constants";

type State =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; message: string; mailtoHref?: string };

export function ContactFormCard({
  title,
  description,
  locale,
}: {
  title: string;
  description: string;
  locale: "fr" | "ar";
}) {
  const [state, setState] = React.useState<State>({ status: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.status === "submitting") return;

    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      firstName: String(fd.get("firstName") ?? ""),
      lastName: String(fd.get("lastName") ?? ""),
      age: String(fd.get("age") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      message: String(fd.get("message") ?? ""),
    };

    setState({ status: "submitting" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        form.reset();
        setState({ status: "success" });
        return;
      }

      const data = (await res.json().catch(() => null)) as { error?: string; to?: string } | null;
      if (data?.error === "smtp_not_configured") {
        const subject =
          locale === "ar"
            ? `تواصل موقع JSCA — ${payload.firstName} ${payload.lastName}`
            : `Contact site JSCA — ${payload.firstName} ${payload.lastName}`;
        const body = [
          `${locale === "ar" ? "الاسم" : "Nom"}: ${payload.lastName}`,
          `${locale === "ar" ? "اللقب" : "Prénom"}: ${payload.firstName}`,
          `${locale === "ar" ? "العمر" : "Âge"}: ${payload.age || "—"}`,
          `${locale === "ar" ? "الهاتف" : "Téléphone"}: ${payload.phone}`,
          "",
          payload.message,
        ].join("\n");
        const mailtoHref = `mailto:${data.to ?? CLUB_CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        setState({
          status: "error",
          message:
            locale === "ar"
              ? "خدمة الإرسال غير مهيأة على السيرفر. يمكنك إرسال الرسالة عبر البريد مباشرة."
              : "Service d’envoi non configuré sur le serveur. Vous pouvez envoyer le message par email directement.",
          mailtoHref,
        });
        return;
      }

      setState({
        status: "error",
        message: locale === "ar" ? "حدث خطأ. حاول مرة أخرى." : "Une erreur est survenue. Réessayez.",
      });
    } catch {
      setState({
        status: "error",
        message: locale === "ar" ? "تعذر الاتصال بالخادم." : "Impossible de contacter le serveur.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge tone="violet">{locale === "ar" ? "اتصل بالنادي" : "Contact club"}</Badge>
        <h3 className="text-2xl font-semibold tracking-tight text-card-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {state.status === "success" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/35 dark:text-emerald-100">
          {locale === "ar" ? "تم إرسال رسالتك بنجاح." : "Message envoyé avec succès."}
        </div>
      ) : null}

      {state.status === "error" ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/35 dark:text-amber-100">
          <p>{state.message}</p>
          {state.mailtoHref ? (
            <p className="mt-2">
              <a className="font-semibold underline underline-offset-4" href={state.mailtoHref}>
                {locale === "ar" ? "إرسال عبر البريد" : "Envoyer par email"}
              </a>
            </p>
          ) : null}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">{locale === "ar" ? "الاسم" : "Prénom"}</Label>
            <Input id="firstName" name="firstName" required placeholder={locale === "ar" ? "اكتب اسمك" : "Votre prénom"} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{locale === "ar" ? "اللقب" : "Nom"}</Label>
            <Input id="lastName" name="lastName" required placeholder={locale === "ar" ? "اكتب لقبك" : "Votre nom"} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="age">{locale === "ar" ? "العمر" : "Âge"}</Label>
            <Input id="age" name="age" inputMode="numeric" placeholder={locale === "ar" ? "اختياري" : "Optionnel"} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{locale === "ar" ? "رقم الهاتف" : "Téléphone"}</Label>
            <Input id="phone" name="phone" required placeholder="05 xx xx xx xx" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">{locale === "ar" ? "رسالتك" : "Message"}</Label>
          <Textarea id="message" name="message" required placeholder={locale === "ar" ? "اكتب رسالتك..." : "Écrivez votre message..."} />
        </div>

        <Button type="submit" className="w-full" disabled={state.status === "submitting"}>
          {state.status === "submitting"
            ? locale === "ar"
              ? "جارٍ الإرسال..."
              : "Envoi..."
            : locale === "ar"
              ? "إرسال الرسالة"
              : "Envoyer le message"}
        </Button>
      </form>
    </div>
  );
}

