import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "./components/Navbar";

export const metadata: Metadata = {
  title: "Kunskapsarkivet",
  description:
    "Ett levande svenskt kunskapsblock – delad äldre kunskap för framtiden.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <body className="antialiased bg-white text-slate-900">
        <Navbar />
        <main className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
