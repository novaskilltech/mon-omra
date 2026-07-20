import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "La Méthode OMRAYANAIR — Incubateur & Formation Conciergerie Omra",
  description: "Devenez totalement indépendant dans l'organisation de voyages Omra. Formation présentielle intensive de 5 jours, accès à notre réseau de fournisseurs saoudiens en direct et outils logiciels sur mesure.",
  keywords: ["formation conciergerie omra", "incubateur omra", "entreprendre omra", "agence omra direct", "méthode omrayanair", "lancer agence de voyage"],
};

export default function MethodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
