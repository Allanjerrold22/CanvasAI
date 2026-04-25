import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import { BellIcon } from "@phosphor-icons/react/dist/ssr";
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
          <main className="flex-1 min-w-0 ml-[260px] px-8">{children}</main>
        </div>

        {/* Global notification bell — fixed top-right */}
        <button
          type="button"
          aria-label="Notifications"
          className="fixed top-5 right-6 z-40 relative w-9 h-9 grid place-items-center bg-surface border border-ink-border rounded-full text-ink-muted hover:text-ink shadow-subtle transition-colors"
        >
          <BellIcon size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--brand)]" />
        </button>
      </body>
    </html>
  );
}
