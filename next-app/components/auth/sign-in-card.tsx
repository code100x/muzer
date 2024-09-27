"use client";
import React, { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignInFlow } from "@/types/auth-types";

interface SigninCardProps {
  setFormType: (state: SignInFlow) => void;
}

export default function SigninCard({ setFormType: setState }: SigninCardProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const signInWithProvider = async (provider: "google" | "credentials") => {
    try {
      if (provider === "credentials") {
        const res = signIn(provider, {
          email,
          password,
          redirect: false,
          callbackUrl: "/home",
        });
        res.then((res) => {
          if (res?.error) {
            setError(res.error);
          }
          if (!res?.error) {
            router.push("/");
          }
          setPending(false);
        });
      }
      if (provider === "google") {
        const res = signIn(provider, {
          redirect: false,
          callbackUrl: "/home",
        });
        res.then((res) => {
          if (res?.error) {
            setError(res.error);
          }

          if (!res?.error) {
            router.push("/");
          }
          console.log(res);
          setPending(false);
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlerCredentialSignin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setPending(true);
    signInWithProvider("credentials");
  };

  const handleGoogleSignin = (provider: "google") => {
    setError("");
    setPending(true);
    signInWithProvider(provider);
  };

  return (
    <Card className="h-full w-full border-purple-600 bg-gray-800 bg-opacity-50 p-8">
      <CardHeader className="w-full">
        <CardTitle className="text-center text-3xl font-bold text-white">
          Login to Muzer
        </CardTitle>
      </CardHeader>
      {!!error && (
        <div className="mb-6 flex w-full items-center gap-x-2 rounded-md bg-destructive p-3 text-sm text-white">
          <TriangleAlert className="size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      <CardContent className="space-y-6 px-0 pb-0">
        <form onSubmit={handlerCredentialSignin} className="space-y-4">
          <Input
            disabled={pending}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="border-gray-400 bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-purple-600 focus-visible:ring-offset-0"
            type="email"
            required
          />
          <Input
            disabled={pending}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="border-gray-400 bg-transparent text-white placeholder:text-gray-400 focus-visible:ring-purple-600 focus-visible:ring-offset-0"
            type="password"
            required
          />
          <Button
            disabled={pending}
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
            size={"lg"}
          >
            Continue
          </Button>
        </form>
        <Separator className="bg-gradient-to-r from-gray-800 via-neutral-500 to-gray-800" />
        <div className="flex flex-col items-center gap-y-2.5">
          <Button
            disabled={pending}
            onClick={() => {
              handleGoogleSignin("google");
            }}
            size={"lg"}
            className="relative w-full bg-white text-black hover:bg-white/90"
          >
            <FcGoogle className="absolute left-2.5 top-3 size-5" />
            Continue with google
          </Button>
          <p className="text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <span
              className="cursor-pointer text-sky-700 hover:underline"
              onClick={() => setState("signUp")}
            >
              Sign up
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
