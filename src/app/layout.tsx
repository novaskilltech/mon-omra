import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://omrayanair.novaskill.tech"),
  title: "OMRAYANAIR — Plateforme Premium de Gestion de Voyage spirituel",
  description: "Simplifiez votre voyage en Terre Sainte. Centralisez vos documents, suivez votre programme en temps réel et accédez à une assistance 24/7. Excellence et sérénité pour votre Omra.",
  keywords: ["Omra", "Mequel", "Voyage Spirituel", "Hajj", "Guide Omra", "Pèlerinage"],
  authors: [{ name: "OMRAYANAIR Team" }],
  openGraph: {
    title: "OMRAYANAIR — L’Omra de la Fraternité Musulmane 2027 & Conciergerie Spirituelle",
    description: "Du 27 janvier au 10 février 2027 : 23 aéroports, 13 pays, 2 Omras (Chaabane & Ramadan*) et 2 Joumouaa dès 1 195 €. Réservez votre Omra ou préinscrivez-vous au Hajj 2027+.",
    url: "https://omrayanair.novaskill.tech",
    siteName: "OMRAYANAIR",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "OMRAYANAIR — L'Omra de la Fraternité Musulmane (27 janvier au 10 février 2027)",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OMRAYANAIR — L’Omra de la Fraternité Musulmane 2027",
    description: "23 aéroports, 3 continents, 2 Omras (Chaabane & Ramadan*) et 14 nuits dès 1 195 €. Préinscrivez-vous dès maintenant.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

import { ToastProvider } from "@/components/ui/Toast";
import FlashInfoBanner from "@/components/FlashInfoBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const savedTheme = localStorage.getItem('theme-choice-v2') || 'theme-haramain';
                document.documentElement.setAttribute('data-theme', savedTheme);
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ToastProvider>
          <FlashInfoBanner />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

// Trigger Vercel rebuild to push metadata changes

