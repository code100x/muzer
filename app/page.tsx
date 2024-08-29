import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// @ts-ignore
import { Users, Radio, Headphones } from "lucide-react";
import { Appbar } from "./components/Appbar";
import { Redirect } from "./components/Redirect";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Appbar />
      <Redirect />
      <main className="flex-1 py-8 md:py-16 lg:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl text-white">
                Let Your Fans Choose the Beat
              </h1>
              <p className="mx-auto max-w-[90%] sm:max-w-[700px] text-gray-400 text-sm sm:text-base md:text-lg">
                Empower your audience to curate your music stream. Connect with fans like never before.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <Button className="w-full sm:w-auto bg-purple-600 text-white hover:bg-purple-700">
                Get Started
              </Button>
              <Button variant="outline" className="w-full sm:w-auto text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-gray-900">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </main>
      <section className="w-full py-8 md:py-16 lg:py-24 bg-gray-800 bg-opacity-50">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl text-center mb-6 text-white">
            Key Features
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { icon: Users, color: "text-yellow-400", title: "Fan Interaction", description: "Let fans choose the music." },
              { icon: Radio, color: "text-green-400", title: "Live Streaming", description: "Stream with real-time input." },
              { icon: Headphones, color: "text-blue-400", title: "High-Quality Audio", description: "Crystal clear sound quality." },
            ].map((feature, index) => (
              <div key={index} className="flex flex-col items-center space-y-3 text-center">
                <feature.icon className={`h-10 w-10 ${feature.color}`} />
                <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="w-full py-8 md:py-16 lg:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-white">
                Ready to Transform Your Streams?
              </h2>
              <p className="mx-auto max-w-[90%] sm:max-w-[600px] text-gray-400 text-sm sm:text-base md:text-lg">
                Join MusicStreamChoice today and create unforgettable experiences.
              </p>
            </div>
            <div className="w-full max-w-sm space-y-2">
              <form className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Input
                  className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  placeholder="Enter your email"
                  type="email"
                />
                <Button type="submit" className="w-full sm:w-auto bg-purple-600 text-white hover:bg-purple-700">
                  Sign Up
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full items-center px-4 md:px-8 border-t border-gray-700">
        <p className="text-xs text-gray-400">© 2023 MusicStreamChoice. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs text-gray-400 hover:text-purple-400 transition-colors" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs text-gray-400 hover:text-purple-400 transition-colors" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
