"use client";
import AuthScreen from "@/app/components/auth/auth-screen";
import { SignInFlow } from "@/types/auth-types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthPage({
  searchParams,
}: {
  searchParams: { authType: SignInFlow; mailId?: string };
}) {
  const formType = searchParams.authType;
  const session = useSession();
  const router = useRouter();

  if (session.status === "authenticated") {
    return router.push("/dashboard");
  }
  return (
    <AuthScreen
      authType={formType}
    />
  );
}
