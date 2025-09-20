import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { createClientRSC } from "./lib/supabase/rsc";

export const metadata: Metadata = {
  title: "Kunskapsarvet - Utforska gammal kunskap",
  description:
    "Ett levande svenskt kunskapsblock – delad äldre kunskap för framtiden.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClientRSC();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="sv">
      <head>
        <script
          defer
          data-domain="kunskapsarvet.se"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body className="antialiased bg-white text-slate-900">
        <Navbar user={user ?? null} />
        <main className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
