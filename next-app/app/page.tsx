import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
//@ts-ignore
import { Users, Radio, Headphones } from "lucide-react";
import { Appbar } from "@/components/home/Appbar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import Hero from "@/components/home/Hero";
import CTA from "@/components/home/CTA";
import Feature from "@/components/home/Feature";
import Footer from "@/components/home/Footer";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session?.user.id) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col bg-stone-950 bg-page-gradient">
      <Appbar showThemeSwitch={false} />
      <Hero/>
      <Feature/>
      <CTA/>
      <Footer/>
    </div>
  );
}
