"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signIn } from "next-auth/react";

const SignInComponent = () => {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Card className="w-[90%] sm:w-[400px] bg-gradient-to-br from-white via-gray-200 to-white shadow-2xl shadow-slate-900">
        <CardHeader>
          <CardTitle className="text-center pb-1 text-[30px] font-bold">
            Sign in
          </CardTitle>
          <CardDescription className="text-center text-[14px]">
            Let fans curate your music stream. Connect like never before.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Button
              className="w-full flex gap-2 rounded-xl font-semibold text-[14px]"
              variant="outline"
              onClick={async () => {
                await signIn("google", { callbackUrl: "/dashboard" });
              }}
            >
              <Image src="/google.png" width={22} height={22} alt="google" />
              Continue with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInComponent;
