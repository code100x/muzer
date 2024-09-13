"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function Appbar() {
  const session = useSession();
  const isUserLoggedIn = session.data?.user;
  const buttonTitle = isUserLoggedIn ? "Logout" : "Login";

  const handleButtonClick = () => {
    isUserLoggedIn
      ? signOut({ callbackUrl: "/" })
      : signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="flex justify-between px-5 py-4 md:px-10 xl:px-20">
      <div className="flex flex-col justify-center text-lg font-bold text-white">
        Muzer
      </div>
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
        <Button
          className="bg-purple-600 text-white hover:bg-purple-700"
          onClick={handleButtonClick}
        >
          {buttonTitle}
        </Button>
      </div>
    </div>
  );
}
