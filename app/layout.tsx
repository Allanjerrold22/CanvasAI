import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CanvasAI — Your Student Workspace",
  description:
    "An AI-powered platform for university students to submit assignments, track courses, and study smarter.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased text-ink">
        <div className="min-h-screen flex">
          <Sidebar />
          <main className="flex-1 min-w-0 ml-[260px]">{children}</main>
        </div>
      </body>
    </html>
  );
}
