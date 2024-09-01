"use client";
import React, { useState } from "react";
import { SignInFlow } from "../../../types/auth-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { TriangleAlert } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

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
          callbackUrl: "/",
        });
        res.then((res) => {
          if (res?.error) {
            setError(res.error);
          }
          //console.log(res);
          if (!res?.error) {
            router.push("/dashboard");
          }
          setPending(false);
        });
      }
      if (provider === "google") {
        const res = signIn(provider, {
          redirect: false,
          callbackUrl: "/",
        });
        res.then((res) => {
          if (res?.error) {
            setError(res.error);
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
    <Card className="w-full h-full p-8 bg-gray-800 bg-opacity-50 border-purple-600">
      <CardHeader className="w-full">
        <CardTitle className="text-white text-3xl font-bold text-center">
          Login to Muzer
        </CardTitle>
      </CardHeader>
      {!!error && (
        <div className="w-full bg-destructive p-3 flex rounded-md items-center gap-x-2 text-sm mb-6 text-white">
          <TriangleAlert className="size-4" />
          <p>{error}</p>
        </div>
      )}
      <CardContent className="space-y-6 px-0 pb-0">
        <form
          onSubmit={handlerCredentialSignin}
          className="space-y-4">
          <Input
            disabled={pending}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="focus:ring-purple-600 bg-transparent placeholder:text-gray-400 border-gray-400 text-white"
            type="email"
            required
          />
          <Input
            disabled={pending}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="focus:ring-purple-600 bg-transparent placeholder:text-gray-400 border-gray-400 text-white"
            type="password"
            required
          />
          <Button
            disabled={pending}
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
            size={"lg"}>
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
            variant={"outline"}
            size={"lg"}
            className="w-full relative">
            <FcGoogle className="absolute size-5 top-3 left-2.5" />
            Continue with google
          </Button>
          <p className="text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <span
              className="text-sky-700 hover:underline cursor-pointer"
              onClick={() => setState("signUp")}>
              Sign up
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
