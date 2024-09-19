import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers, ThemeProvider } from "@/components/provider";

import "./globals.css";
import { ToastContainer, toast, ToastContainerProps, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const globalToastOptions: ToastContainerProps = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light",
  transition: Bounce,
};
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Muzer | Fan-Curated Live Music Streaming",
  description: "Live fan-curated music streaming. High-quality audio, real-time engagement.",
  keywords: "music stream, fan interaction, live streaming, high-quality audio, curate music, Muzer", 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
      <ToastContainer {...globalToastOptions}/>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
