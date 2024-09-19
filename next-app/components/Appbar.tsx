"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function Appbar({ showThemeSwitch = true }) {
  const session = useSession();
  const router= useRouter();
  const isUserLoggedIn = session.data?.user;
  const buttonTitle = isUserLoggedIn ? "Logout" : "Login";

  const handleButtonClick = () => {
    isUserLoggedIn
      ? signOut({ callbackUrl: "/" })
      : signIn("google", { callbackUrl: "/home" });
  };

  return (
    <div className="flex justify-between px-5 py-4 md:px-10 xl:px-20">
      <div
        onClick={()=>{
        router.push('/home') 
      }}  className={`flex flex-col hover:cursor-pointer justify-center text-lg font-bold ${showThemeSwitch ? "" : "text-white"}`}
      >
        Muzer
      </div>
      <div className="flex items-center gap-2">
        {showThemeSwitch && <ThemeSwitcher />}
        <Button onClick={handleButtonClick}>{buttonTitle}</Button>
      </div>
    </div>
  );
}
