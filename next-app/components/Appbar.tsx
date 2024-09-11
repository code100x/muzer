"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Appbar() {
  const session = useSession();

  return (
    <div className="flex justify-between px-5 md:px-10 xl:px-20 py-4">
      <div className="text-lg font-bold flex flex-col justify-center text-white">
        Muzer
      </div>
      <div>
        {session.data?.user && (
          <Button
            className="bg-purple-600 text-white hover:bg-purple-700"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Logout
          </Button>
        )}
        {!session.data?.user && (
          <Button
            className="bg-purple-600 text-white hover:bg-purple-700"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            Signin
          </Button>
        )}
      </div>
    </div>
  );
}
