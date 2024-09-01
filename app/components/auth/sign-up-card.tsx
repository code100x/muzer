import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { SignInFlow } from "@/types/auth-types";
import { TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

interface SignupCardProps {
  setFormType: (state: SignInFlow) => void;
}

export default function SignupCard({ setFormType: setState }: SignupCardProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
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

  const handlerCredentialSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setPending(true);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setPending(false);
      return;
    }
    signInWithProvider("credentials");
  };

  const handleGoogleSignup = (provider: "google") => {
    setError("");
    setPending(true);
    signInWithProvider(provider);
  };

  return (
    <Card className="w-full h-full p-8 bg-gray-800 bg-opacity-50 border-purple-600">
      <CardHeader className="w-full">
        <CardTitle className="text-white text-3xl font-bold text-center">
          Signup to Start listening
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
          className="space-y-4"
          onSubmit={handlerCredentialSignup}>
          <Input
            disabled={false}
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="focus:ring-purple-600 bg-transparent placeholder:text-gray-400 border-gray-400 text-white"
            type="email"
            required
          />
          <Input
            disabled={false}
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="focus:ring-purple-600 bg-transparent placeholder:text-gray-400 border-gray-400 text-white"
            type="password"
            required
          />
          <Input
            disabled={false}
            value={confirmPassword}
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="focus:ring-purple-600 bg-transparent placeholder:text-gray-400 border-gray-400 text-white"
            type="password"
            required
          />
          <Button
            type="submit"
            className="w-full bg-purple-600"
            size={"lg"}
            disabled={false}>
            Continue
          </Button>
        </form>
        <Separator className="bg-gradient-to-r from-gray-800 via-neutral-500 to-gray-800" />
        <div className="flex flex-col items-center gap-y-2.5">
          <Button
            disabled={false}
            onClick={() => {
              handleGoogleSignup("google");
            }}
            variant={"outline"}
            size={"lg"}
            className="w-full relative">
            <FcGoogle className="absolute size-5 top-3 left-2.5" />
            Continue with google
          </Button>
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <span
              className="text-sky-700 hover:underline cursor-pointer"
              onClick={() => setState("signIn")}>
              Sign in
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
