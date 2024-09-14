"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function Appbar() {
  const session = useSession();
  const router= useRouter();

  return (
    <div className="flex justify-between px-5 md:px-10 xl:px-20 py-4">
      <div onClick={()=>{
        router.push('/home') // If using oldstream view this goes to home where you can see all the spaces
      }}  className="text-lg font-bold flex flex-col hover:cursor-pointer justify-center text-white">
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
            onClick={() => signIn("google", { callbackUrl: "/home" })}// Use /dashboard for web socket version
          >
            Signin
          </Button>
        )}
      </div>
    </div>
  );
}
