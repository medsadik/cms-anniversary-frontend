"use client";

import React, { Suspense } from "react";
import { I18nProvider } from "@/lib/i18n/provider";
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "./keycloak";
import { getUserManager } from "./keycloak/keycloakConfig";
import { UserManager } from "oidc-client-ts";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider userManager={getUserManager()}>
      <I18nProvider>
        <Suspense fallback={null}>
          {children}
          <Toaster />
        </Suspense>
      </I18nProvider>
    </AuthProvider>
  );
}
