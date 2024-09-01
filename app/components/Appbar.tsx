"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
//@ts-ignore
import { Music } from "lucide-react";
import { useRouter } from "next/navigation";

export function Appbar() {
  const session = useSession();
  const router = useRouter();

  return (
    <div className="flex justify-between px-20 pt-4">
      <div className="text-lg font-bold flex flex-col justify-center text-white">
        Muzer
      </div>
      <div>
        {session.data?.user && (
          <Button
            className="bg-purple-600 text-white hover:bg-purple-700"
            onClick={() =>
              signOut({
                callbackUrl: "/",
              })
            }>
            Logout
          </Button>
        )}
        {!session.data?.user && (
          <div className="space-x-3">
            <Button
              className="bg-purple-600 text-white hover:bg-purple-700"
              onClick={() => router.push("/auth")}>
              Signin
            </Button>
            <Link
              href={{
                pathname: "/auth",
                query: {
                  authType: "signUp",
                },
              }}>
              <Button
                variant={"ghost"}
                className="text-white">
                Signup
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
