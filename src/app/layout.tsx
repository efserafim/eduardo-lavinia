import type { Metadata } from "next";
import { Cormorant_Garamond, Great_Vibes, Outfit } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: ["400"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://eduardo-lavinia.vercel.app";

const title = "Eduardo & Lavínia — Chá de Panela";
const description =
  "Celebre conosco o nosso chá de panela. Escolha um presente e contribua com o valor que desejar.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s · Eduardo & Lavínia",
  },
  description,
  applicationName: "Eduardo & Lavínia",
  authors: [{ name: "Eduardo & Lavínia" }],
  creator: "Eduardo & Lavínia",
  keywords: [
    "chá de panela",
    "Eduardo e Lavínia",
    "lista de presentes",
    "casamento",
    "presente de casamento",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Eduardo & Lavínia",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "wedding",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${cormorant.variable} ${greatVibes.variable} ${outfit.variable} h-full`}
    >
      <body className="paper-bg min-h-full antialiased">{children}</body>
    </html>
  );
}
