import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OMRAYANAIR — Plateforme Premium de Gestion de Voyage spirituel",
  description: "Simplifiez votre voyage en Terre Sainte. Centralisez vos documents, suivez votre programme en temps réel et accédez à une assistance 24/7. Excellence et sérénité pour votre Omra.",
  keywords: ["Omra", "Mequel", "Voyage Spirituel", "Hajj", "Guide Omra", "Pèlerinage"],
  authors: [{ name: "OMRAYANAIR Team" }],
  openGraph: {
    title: "OMRAYANAIR — Votre Compagnon en Terre Sainte",
    description: "L'application tout-en-un pour un voyage Omra parfaitement organisé.",
    url: "https://omrayanair.com",
    siteName: "OMRAYANAIR",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OMRAYANAIR Dashboard Preview",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OMRAYANAIR — Votre Compagnon en Terre Sainte",
    description: "L'excellence technologique au service de votre foi.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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
        <ThemeSwitcher />
      </body>
    </html>
  );
}
