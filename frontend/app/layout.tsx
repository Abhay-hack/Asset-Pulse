import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Asset Pulse",
  description: "Track your assets with ease",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full overflow-x-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white`}>
        <Navbar />
        <main className="pt-16 pb-0 min-h-[calc(100vh-4rem)] flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}