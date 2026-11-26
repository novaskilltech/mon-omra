import type { Metadata } from 'next';
import BentoLandingHub from '@/components/BentoLandingHub';
import ThemeSelector from '@/components/ThemeSelector';

export const metadata: Metadata = {
  title: "OMRAYANAIR — L’Omra de la Fraternité Musulmane (27 janv. – 10 févr. 2027) & Conciergerie",
  description: "Offre promotionnelle : L’Islam n’a pas de frontières — Omra de la Fraternité Musulmane du 27 janvier au 10 février 2027 (23 aéroports, 13 pays, dès 1 195 €). Préinscription Omra & Hajj 2027+.",
  keywords: ["omra", "omra fraternité musulmane", "omra janvier 2027", "omra ramadan 2027", "hajj 2027", "conciergerie omra", "omrayanair"],
  openGraph: {
    title: "L’Islam n’a pas de frontières — Omra de la Fraternité Musulmane 2027 | OMRAYANAIR",
    description: "Du 27 janvier au 10 février 2027 : 23 aéroports, 3 continents, 2 Omras (Chaabane puis Ramadan*), 2 Joumouaa et 14 nuits réservées dès 1 195 €.",
    url: "https://omrayanair.novaskill.tech",
    siteName: "OMRAYANAIR",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "OMRAYANAIR — L'Omra de la Fraternité Musulmane 2027",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "L’Islam n’a pas de frontières — Omra de la Fraternité Musulmane 2027",
    description: "23 aéroports, 13 pays, 2 Omras (Chaabane & Ramadan*) dès 1 195 €. Calculez votre devis et préinscrivez-vous en ligne.",
    images: ["/og-image.jpg"],
  },
};

export default function Home() {
    return (
        <main className="min-h-screen text-main selection:bg-emerald-500/30 font-inter relative overflow-x-hidden">
            {/* Structured Data (JSON-LD) for Search Engines */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "TravelAgency",
                        "name": "OMRAYANAIR",
                        "description": "Plateforme Premium d'accompagnement et de voyage spirituel pour l'Omra et le Hajj.",
                        "url": "https://omrayanair.novaskill.tech",
                        "logo": "https://omrayanair.novaskill.tech/logo.png",
                        "image": "https://omrayanair.novaskill.tech/og-image.png",
                        "address": {
                            "@type": "PostalAddress",
                            "addressCountry": "FR"
                        },
                        "serviceType": ["Pèlerinage Omra", "Pèlerinage Hajj", "Formation Conciergerie", "Accompagnement Spirituel"]
                    })
                }}
            />

            {/* Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[140px] rounded-full" />
                <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[140px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-emerald-500/5 blur-[140px] rounded-full" />
            </div>

            {/* Float Theme Selector */}
            <div className="fixed bottom-6 right-6 z-50">
                <ThemeSelector />
            </div>

            {/* Bento Grid Hub */}
            <BentoLandingHub />
        </main>
    );
}
