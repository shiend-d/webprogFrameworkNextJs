import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dasasena Admin",
  description: "Admin dashboard for Dasasena",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased bg-[#f8fafc] text-slate-900`}
      >
        <div className="flex min-h-screen bg-[#f8fafc]">
          <Sidebar />
          <div className="flex flex-1 flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto bg-white px-6 py-8 md:px-10 lg:px-12">
              <div className="mx-auto w-full max-w-7xl space-y-8">{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
