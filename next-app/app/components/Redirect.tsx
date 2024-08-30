"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function Redirect() {
  const session = useSession();
  const router = useRouter();
  const path = usePathname();
  useEffect(() => {
    if (session?.data?.user) {
      if (!path.includes("creator")) {
        router.push("/dashboard");
      }
    }
  }, [session]);
  return null;
}
