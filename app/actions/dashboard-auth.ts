"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DASH_SESSION_COOKIE, DASH_SESSION_VALUE } from "@/lib/session";

function getExpectedPassword() {
  return process.env.ADMIN_PASSWORD ?? "jsca-admin";
}

export async function loginDashboardAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const expected = getExpectedPassword();

  if (!password || password !== expected) {
    redirect("/dashboard/login?e=credentials");
  }

  const jar = await cookies();
  jar.set(DASH_SESSION_COOKIE, DASH_SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  redirect("/dashboard");
}

export async function logoutDashboardAction() {
  const jar = await cookies();
  // Même attributs que lors du login, sinon le navigateur peut garder la session.
  jar.set(DASH_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  redirect("/dashboard/login");
}
