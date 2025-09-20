import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

export const metadata: Metadata = {
  title: "Kunskapsarvet - Utforska gammal kunskap",
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
      <head>
        <script
          defer
          data-domain="kunskapsarvet.se"
          src="https://plausible.io/js/script.js"
        ></script>
      </head>
      <body className="antialiased bg-white text-slate-900">
        <Navbar />
        <main className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
