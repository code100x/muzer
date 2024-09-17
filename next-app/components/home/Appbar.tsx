"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import Logo from "@/assets/Logo";

export function Appbar({ showThemeSwitch = true }) {
  const session = useSession();
  const isUserLoggedIn = session.data?.user;
  const buttonTitle = isUserLoggedIn ? "Logout" : "Login";

  const handleButtonClick = () => {
    isUserLoggedIn
      ? signOut({ callbackUrl: "/" })
      : signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:300ms] px-5 py-4 md:px-10 xl:px-20 fixed z-50 top-0 backdrop-blur-[12px] w-full flex justify-between lg:px-44">
      <div
        className={`flex items-center gap-2 justify-center text-lg font-bold ${showThemeSwitch ? "" : "text-white"}`}
      >
        <Logo/>
        Muzer
      </div>
      <div className="flex items-center gap-2">
        {showThemeSwitch && <ThemeSwitcher />}
        <Button onClick={handleButtonClick}>{buttonTitle}</Button>
      </div>
    </div>
  );
}
