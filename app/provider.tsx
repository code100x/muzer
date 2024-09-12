"use client";

import { SessionProvider } from "next-auth/react";
import {NextUIProvider} from '@nextui-org/react'

export function Providers({ children }: {
    children: React.ReactNode
}) {
    return <SessionProvider>
        {children}
    </SessionProvider>
}

export function NextUiProviders({children}: { children: React.ReactNode }) {
    return (
      <NextUIProvider>
        {children}
      </NextUIProvider>
    )
  }