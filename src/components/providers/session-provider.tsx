"use client";

import { SessionProvider } from "next-auth/react";
import { useLocale } from "@/components/providers/locale-provider";

export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}