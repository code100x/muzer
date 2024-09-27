"use client";

import { useState } from "react";
import { SignInFlow } from "@/types/auth-types";
import SigninCard from "./sign-in-card";
import SignupCard from "./sign-up-card";

export default function AuthScreen({ authType }: { authType?: SignInFlow }) {
  const [formType, setFormType] = useState<SignInFlow>(authType || "signIn");
  return (
    <div className="flex h-full w-full items-center justify-center gap-5 bg-gradient-to-b from-purple-900 to-gray-900">
      <div className="w-full px-4 md:h-auto md:w-[420px]">
        {formType === "signIn" ? (
          <SigninCard setFormType={setFormType} />
        ) : (
          <SignupCard setFormType={setFormType} />
        )}
      </div>
    </div>
  );
}
