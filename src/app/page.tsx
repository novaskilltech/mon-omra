import type { Metadata } from 'next';
import BentoLandingHub from '@/components/BentoLandingHub';
import ThemeSelector from '@/components/ThemeSelector';

export const metadata: Metadata = {
  title: "OMRAYANAIR — Conciergerie Omra Autonome & Voyage Spirituel",
  description: "Simplifiez votre voyage en Terre Sainte. Réservez votre Omra, pré-inscrivez-vous au Hajj 2027+, suivez la Formation Conciergerie et accédez à votre compagnon spirituel.",
  keywords: ["omra", "hajj 2027", "conciergerie omra", "formation conciergerie", "voyage spirituel", "omrayanair"],
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
                        "url": "https://omrayanair.vercel.app",
                        "logo": "https://omrayanair.vercel.app/logo.png",
                        "image": "https://omrayanair.vercel.app/og-image.png",
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
