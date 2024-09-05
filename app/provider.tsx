"use client";

import { SessionProvider } from "next-auth/react";
import { Wallet } from "./components/WalletProvider";


export function Providers({ children }: {
    children: React.ReactNode
}) {
    return (
        <SessionProvider>
            <Wallet>
                {children}
            </Wallet>
        </SessionProvider>
    ) 
}