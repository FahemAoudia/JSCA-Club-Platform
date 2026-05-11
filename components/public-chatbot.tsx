"use client";

import * as React from "react";
import { MessageCircle, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CLUB_CONTACT } from "@/lib/constants";
import { LOCALE_STORAGE_KEY, type PublicLocale } from "@/lib/landing-i18n";
import { cn } from "@/lib/utils";

type QA = {
  id: string;
  q: { fr: string; ar: string };
  a: { fr: string; ar: string };
};

type ChatMessage =
  | { id: string; role: "assistant"; kind: "text"; text: string }
  | { id: string; role: "user"; kind: "text"; text: string }
  | { id: string; role: "assistant"; kind: "contact" };

const qa: QA[] = [
  {
    id: "hours",
    q: { fr: "Quels sont les horaires des entraînements ?", ar: "ما هي أوقات التدريبات؟" },
    a: {
      fr: "Les créneaux dépendent des catégories. Écrivez-nous via le formulaire et indiquez l’âge/catégorie.",
      ar: "الأوقات تختلف حسب الفئة. اكتب لنا عبر الاستمارة واذكر الفئة/العمر.",
    },
  },
  {
    id: "tryouts",
    q: { fr: "Comment s’inscrire au club ?", ar: "كيف يتم التسجيل في النادي؟" },
    a: {
      fr: "Envoyez votre nom, âge et numéro de téléphone via le formulaire, puis nous vous recontacterons pour les documents et la date d’essai.",
      ar: "أرسل الاسم، العمر ورقم الهاتف عبر الاستمارة وسنتواصل معك لتأكيد الوثائق وموعد التجربة.",
    },
  },
  {
    id: "fees",
    q: { fr: "Combien coûtent les cotisations ?", ar: "كم ثمن الاشتراك؟" },
    a: {
      fr: "Les cotisations varient selon la catégorie et la saison. Laissez un message et on vous répond rapidement.",
      ar: "الاشتراك يختلف حسب الفئة والموسم. اترك رسالة وسنجيبك سريعاً.",
    },
  },
];

export function PublicChatbot() {
  const [open, setOpen] = React.useState(false);
  const [locale, setLocale] = React.useState<PublicLocale>("fr");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    try {
      const s = window.localStorage.getItem(LOCALE_STORAGE_KEY) as PublicLocale | null;
      if (s === "fr" || s === "ar") setLocale(s);
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    if (!open) return;
    setMessages((prev) => {
      if (prev.length > 0) return prev;
      return [
        {
          id: "hello",
          role: "assistant",
          kind: "text",
          text:
            locale === "ar"
              ? "مرحباً! كيف يمكنني مساعدتك؟ اختر سؤالاً من الأسفل."
              : "Bonjour ! Comment puis-je vous aider ? Choisissez une question ci-dessous.",
        },
      ];
    });
  }, [open, locale]);

  React.useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [open, messages.length]);

  const dir = locale === "ar" ? "rtl" : "ltr";
  const t = {
    title: locale === "ar" ? "مساعد JSCA" : "Assistant JSCA",
    subtitle: locale === "ar" ? "محادثة سريعة" : "Chat rapide",
    reset: locale === "ar" ? "إعادة" : "Réinitialiser",
    contactLabel: locale === "ar" ? "معلومات الاتصال" : "Contact",
    contactChip: locale === "ar" ? "معلومات الاتصال (JSCA)" : "Contact (JSCA)",
  };

  const chips = React.useMemo(
    () => [
      ...qa.map((x) => ({
        id: x.id,
        label: locale === "ar" ? x.q.ar : x.q.fr,
        kind: "qa" as const,
      })),
      { id: "contact", label: t.contactChip, kind: "contact" as const },
    ],
    [locale, t.contactChip],
  );

  function resetChat() {
    setMessages([
      {
        id: "hello",
        role: "assistant",
        kind: "text",
        text:
          locale === "ar"
            ? "مرحباً! كيف يمكنني مساعدتك؟ اختر سؤالاً من الأسفل."
            : "Bonjour ! Comment puis-je vous aider ? Choisissez une question ci-dessous.",
      },
    ]);
  }

  function addQa(id: string) {
    const item = qa.find((x) => x.id === id);
    if (!item) return;
    const q = locale === "ar" ? item.q.ar : item.q.fr;
    const a = locale === "ar" ? item.a.ar : item.a.fr;
    setMessages((prev) => [
      ...prev,
      { id: `q_${id}_${prev.length}`, role: "user", kind: "text", text: q },
      { id: `a_${id}_${prev.length}`, role: "assistant", kind: "text", text: a },
    ]);
  }

  function addContact() {
    setMessages((prev) => [...prev, { id: `contact_${prev.length}`, role: "assistant", kind: "contact" }]);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <Card
          dir={dir}
          className={cn(
            "w-[min(92vw,392px)] overflow-hidden border-[var(--jsca-gold-border)] shadow-2xl",
            locale === "ar" && "font-[system-ui,'Segoe UI',Tahoma,sans-serif]",
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between gap-3 bg-muted/40">
            <div className="min-w-0">
              <CardTitle className="text-base">{t.title}</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">{t.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={resetChat}
                aria-label={t.reset}
                title={t.reset}
              >
                <RotateCcw className="size-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setOpen(false)} aria-label="Close">
                <X className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <Button
                  key={c.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-auto rounded-full py-2 text-start"
                  onClick={() => (c.kind === "contact" ? addContact() : addQa(c.id))}
                >
                  {c.label}
                </Button>
              ))}
            </div>

            <div
              ref={scrollRef}
              className="mt-4 max-h-[52vh] space-y-3 overflow-y-auto rounded-2xl border border-border bg-background/40 p-3"
            >
              {messages.map((m) => {
                if (m.kind === "contact") {
                  return (
                    <div key={m.id} className="flex justify-start">
                      <div className="max-w-[88%] rounded-2xl border border-dashed border-border bg-muted/30 p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            {t.contactLabel}
                          </p>
                          <Badge className="border-[var(--jsca-gold-border)] bg-[var(--accent)] text-accent-foreground">
                            JSCA
                          </Badge>
                        </div>
                        <p className="text-sm font-semibold text-card-foreground">{CLUB_CONTACT.phone}</p>
                        <p className="text-sm text-muted-foreground">{CLUB_CONTACT.email}</p>
                        <p className="mt-3 text-xs text-muted-foreground">
                          <a className="underline underline-offset-4" href="#contact">
                            {locale === "ar" ? "اذهب إلى الاستمارة" : "Aller au formulaire"}
                          </a>
                        </p>
                      </div>
                    </div>
                  );
                }

                const isUser = m.role === "user";
                return (
                  <div key={m.id} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm",
                        isUser
                          ? "bg-[var(--jsca-green)] text-primary-foreground"
                          : "border border-[color-mix(in_oklch,var(--jsca-gold)_22%,var(--border))] bg-[color-mix(in_oklch,var(--jsca-gold)_10%,var(--card))] text-card-foreground",
                      )}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-3 h-12 w-12 rounded-full shadow-xl"
        aria-label="Open chatbot"
      >
        <MessageCircle className="size-5" />
      </Button>
    </div>
  );
}

