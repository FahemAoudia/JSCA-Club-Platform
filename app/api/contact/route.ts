import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

import { CLUB_CONTACT } from "@/lib/constants";

type ContactPayload = {
  firstName: string;
  lastName: string;
  age: string;
  phone: string;
  message: string;
};

function isNonEmptyString(v: unknown) {
  return typeof v === "string" && v.trim().length > 0;
}

function hasSmtpEnv() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function POST(request: Request) {
  try {
    const raw = (await request.json()) as Partial<ContactPayload>;
    const payload: ContactPayload = {
      firstName: String(raw.firstName ?? ""),
      lastName: String(raw.lastName ?? ""),
      age: String(raw.age ?? ""),
      phone: String(raw.phone ?? ""),
      message: String(raw.message ?? ""),
    };

    if (
      !isNonEmptyString(payload.firstName) ||
      !isNonEmptyString(payload.lastName) ||
      !isNonEmptyString(payload.phone) ||
      !isNonEmptyString(payload.message)
    ) {
      return NextResponse.json(
        { ok: false, error: "missing_fields" },
        { status: 400 },
      );
    }

    if (!hasSmtpEnv()) {
      return NextResponse.json(
        {
          ok: false,
          error: "smtp_not_configured",
          to: CLUB_CONTACT.email,
        },
        { status: 501 },
      );
    }

    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
    const secure = process.env.SMTP_SECURE === "true" || port === 465;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const to = process.env.CONTACT_TO_EMAIL || CLUB_CONTACT.email;
    const from = process.env.CONTACT_FROM_EMAIL || process.env.SMTP_USER!;

    const subject = `Contact site JSCA · ${payload.firstName} ${payload.lastName} · ${payload.phone}`;
    const text = [
      `Nom: ${payload.lastName}`,
      `Prénom: ${payload.firstName}`,
      `Âge: ${payload.age || "—"}`,
      `Téléphone: ${payload.phone}`,
      "",
      payload.message,
    ].join("\n");

    await transporter.sendMail({
      to,
      from,
      replyTo: from,
      subject,
      text,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }
}

