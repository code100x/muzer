"use client";

import { SessionProvider } from "next-auth/react";
import WalletProviders from "@/app/components/WalletProviders";

export function Providers({ children }: {
    children: React.ReactNode
}) {
    return <SessionProvider>
        <WalletProviders>
        {children}
        </WalletProviders>
    </SessionProvider>
}