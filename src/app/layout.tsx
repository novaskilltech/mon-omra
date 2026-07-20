import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://omrayanair.vercel.app"),
  title: "OMRAYANAIR — Plateforme Premium de Gestion de Voyage spirituel",
  description: "Simplifiez votre voyage en Terre Sainte. Centralisez vos documents, suivez votre programme en temps réel et accédez à une assistance 24/7. Excellence et sérénité pour votre Omra.",
  keywords: ["Omra", "Mequel", "Voyage Spirituel", "Hajj", "Guide Omra", "Pèlerinage"],
  authors: [{ name: "OMRAYANAIR Team" }],
  openGraph: {
    title: "OMRAYANAIR — Votre Compagnon en Terre Sainte",
    description: "L'application tout-en-un pour un voyage Omra parfaitement organisé.",
    url: "https://omrayanair.vercel.app",
    siteName: "OMRAYANAIR",
    images: [
      {
        url: "/logo.png",
        width: 500,
        height: 500,
        alt: "OMRAYANAIR Logo Preview",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "OMRAYANAIR — Votre Compagnon en Terre Sainte",
    description: "L'excellence technologique au service de votre foi.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

import { ToastProvider } from "@/components/ui/Toast";

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
                const savedTheme = localStorage.getItem('theme-choice') || 'theme-2';
                document.documentElement.setAttribute('data-theme', savedTheme);
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

// Trigger Vercel rebuild to push metadata changes

