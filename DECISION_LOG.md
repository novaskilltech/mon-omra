# Journal de Décisions — OMRAYANAIR

Ce document répertorie l'ensemble des décisions d'architecture, de conception et d'implémentation prises pour le projet OMRAYANAIR.

---

## 1. Remplacement de l'Assistant IA OCR par un Formulaire de Vol Manuel Multi-Vols
*   **Décision** : Suppression complète de l'assistant d'import de billets par OCR au profit d'un formulaire manuel multi-vols (gestion des escales).
*   **Justification** : L'extraction par IA présentait des risques d'erreurs de lecture (hallucinations). Le formulaire manuel garantit une saisie 100% fiable par l'agence.
*   **Alternatives** : Conserver l'OCR avec validation humaine (rejeté car trop lourd en UX).
*   **Impacts** : 
    *   Interface agence simplifiée et plus stable dans `/backoffice/concierge/page.tsx`.
    *   Mise à jour de `getPilgrimDashboardData` pour supporter les tableaux de segments de vols.
*   **Version** : v1.1.0

---

## 2. Liaison des Groupes aux Hébergements et aux Vols
*   **Décision** : Permettre d'associer un groupe à un vol aller, un vol retour et des séjours hôteliers (Makkah/Madinah) par checklist.
*   **Justification** : Évite d'avoir à configurer manuellement la logistique de chaque pèlerin individuellement. L'association par groupe rationalise la gestion de masse.
*   **Impacts** :
    *   Création des tables de jointure `group_logistics` et `group_hotel_stays`.
    *   Intégration d'un formulaire à checklist d'hôtels dans `/backoffice/groups/page.tsx`.
*   **Version** : v1.2.0

---

## 3. Correctif d'Affichage des Groupes (Erreur PGRST200 / PGRST205)
*   **Décision** : Effectuer des requêtes Supabase séparées suivies d'une jointure en mémoire pour `getGroupsDetailed` plutôt qu'une jointure Postgrest imbriquée complexe.
*   **Justification** : Contourne les erreurs de cache de schéma Supabase qui masquaient périodiquement les groupes existants.
*   **Impacts** : Code de `getGroupsDetailed` fiabilisé dans `concierge.ts`.
*   **Version** : v1.2.1

---

## 4. Gestion du Rooming Direct dans l'Annuaire Hôtelier
*   **Décision** : Ajouter un outil de gestion des chambres et d'assignation directe des pèlerins aux lits directement sur `/backoffice/logistics/hotels`.
*   **Justification** : L'administrateur peut visualiser l'allocation globale des chambres par hôtel sans devoir obligatoirement naviguer au sein de chaque groupe de voyage.
*   **Impacts** :
    *   Création des actions serveur `getHotelRoomingState`, `createRoomAction`, `deleteRoomAction`, `assignPilgrimToRoomFromHotel`, `unassignPilgrimFromRoomFromHotel`.
    *   Création du composant modal interactif `HotelRoomingModal.tsx` et ajout du bouton d'action sur `HotelCard.tsx`.
*   **Version** : v1.3.0

---

## 5. Nettoyage des Métadonnées Open Graph (WhatsApp Thumbnail)
*   **Décision** : Configurer la base des métadonnées avec `https://omrayanair.vercel.app` et intégrer une image miniature `og-image.png` au format réglementaire (1200x630px).
*   **Justification** : WhatsApp requiert des chemins d'images absolus et une image physique existante pour pouvoir afficher la vignette de prévisualisation lors du partage de lien.
*   **Impacts** : Fichier `layout.tsx` mis à jour ; image `og-image.png` ajoutée au dossier `public/`.
*   **Version** : v1.3.1

---

## 6. Sécurité des Formulaires & Retrait des Placeholders d'E-mail Hardcodés
*   **Décision** : Remplacement du placeholder e-mail `salah.lamkhannet@gmail.com` par `exemple@site.com` et ajout de l'attribut `autoComplete="off"` sur les champs de saisie.
*   **Justification** : Améliore la confidentialité et évite que les navigateurs ne pré-remplissent par erreur l'adresse de l'administrateur dans les formulaires d'authentification des pèlerins.
*   **Impacts** : Fichier `login/page.tsx` mis à jour.
*   **Version** : v1.3.2

---

## 7. Support Mobile du Back-Office (Responsive Menu Hamburger)
*   **Décision** : Rendre le menu latéral (Sidebar) accessible sur mobile sous forme de tiroir (Drawer) coulissant déclenché par un bouton hamburger.
*   **Justification** : La sidebar était initialement masquée sur mobile, empêchant les administrateurs de naviguer sur l'application depuis un smartphone.
*   **Impacts** : Fichier `backoffice/layout.tsx` restructuré avec intégration d'un état d'ouverture et d'animations CSS.
*   **Version** : v1.4.0

---

## 8. Système d'Évaluation Post-Séjour (Feedback Détaillé Pèlerin)
*   **Décision** : Implémentation d'un système d'évaluation par étoiles (1 à 5) sur 5 critères (vols, hôtel Makkah, hôtel Madinah, guides, et satisfaction générale) avec champ commentaire libre facultatif.
*   **Justification** : Permet à l'agence de recueillir les retours de manière nominative et structurée dès la fin du voyage.
*   **Impacts** :
    *   Création de la table `pilgrim_feedbacks` et des politiques RLS.
    *   Création des actions serveur et de la page mobile `/dashboard/feedback`.
    *   Ajout du lien d'accès sur `/backoffice/feedbacks` et d'un bandeau d'invite conditionnel sur `/dashboard`.
*   **Version** : v1.5.0

---

## 9. Résolution de l'affichage des Hôtels et Documents Client (Cookie Auth Fallback)
*   **Décision** : Ajout du support de la session basée sur le cookie `pilgrim_id` dans les pages `/dashboard/hotels` et `/dashboard/documents`.
*   **Justification** : La connexion pèlerin n'utilise pas de session d'authentification Supabase (User Auth) standard mais repose sur un cookie `pilgrim_id`. Les pages d'hôtels et de documents ne vérifiaient que l'utilisateur de l'authentification Supabase, ce qui masquait les hébergements et documents pour les pèlerins connectés.
*   **Impacts** :
    *   Mise à jour de [page.tsx](file:///c:/Users/P%20C/Documents/OMRA%20APP%20AVEC%20QWEN/src/app/dashboard/hotels/page.tsx) pour utiliser le cookie.
    *   Mise à jour de [page.tsx](file:///c:/Users/P%20C/Documents/OMRA%20APP%20AVEC%20QWEN/src/app/dashboard/documents/page.tsx) pour utiliser le cookie.
*   **Version** : v1.5.1

---

## 10. Ajustement de la Politique de Sécurité du Contenu (CSP)
*   **Décision** : Mise à jour de la politique de sécurité (Content Security Policy) dans le middleware pour autoriser le script de feedback de Vercel (`https://vercel.live`) et le chargement de données de types Base64/WASM (`data:application/octet-stream` via `connect-src`).
*   **Justification** : Le middleware bloquait le script de feedback de Vercel en cours d'exécution ainsi que les requêtes locales de données chiffrées en Base64 nécessaires aux modules WebAssembly côté client (WASM).
*   **Impacts** :
    *   Mise à jour des directives `script-src`, `img-src`, `connect-src` et `frame-src` dans [middleware.ts](file:///c:/Users/P%20C/Documents/OMRA%20APP%20AVEC%20QWEN/src/middleware.ts).
*   **Version** : v1.5.2

---

## 11. Gestion et Téléchargement Sécurisé des Visas PDF/Image (RGPD)
*   **Décision** : Téléchargement des visas pèlerin dans un bucket de stockage privé (`pelerin-documents`) sous le dossier `/visas` et génération d'URLs signées temporaires (durée 1 heure).
*   **Justification** : Conformité réglementaire RGPD pour sécuriser les données d'identité sensibles contenues sur les documents de visa.
*   **Impacts** :
    *   Création de l'action `uploadVisaDocument` et re-calcul des URLs signées dans `getPilgrimDashboardData`.
    *   Intégration d'un bouton de téléchargement sécurisé sur le Dashboard pèlerin.
*   **Version** : v1.6.0

---

## 12. Séparation Ergonomique du Bouton de Suppression Pèlerin ("delete")
*   **Décision** : Ajout du bouton de suppression d'un pèlerin en bas de sa fiche détaillée avec un modal de double confirmation par saisie textuelle forcée ("SUPPRIMER").
*   **Justification** : Évite les suppressions de comptes accidentelles tout en offrant un moyen de nettoyage de base de données synchrone et complet (table pèlerins, profils et Supabase Auth).
*   **Impacts** :
    *   Création de l'action serveur d'administration `deletePilgrimAction`.
    *   Mise à jour de `/backoffice/concierge/page.tsx` avec placement du bouton en fin de document.
*   **Version** : v1.7.0

---

## 13. Optimisation pour Google Agentic Search (Sitemap, Robots, Schema.org)
*   **Décision** : Création automatique d'un sitemap XML dynamique, d'un fichier robots d'exploration de moteurs de recherche et inclusion de données structurées JSON-LD.
*   **Justification** : Permettre aux moteurs de recherche et aux agents IA comme Google Gemini d'analyser, d'identifier et de citer les informations publiques du site web sans exposer les espaces privés.
*   **Impacts** :
    *   Création de [robots.ts](file:///c:/Users/P%20C/Documents/OMRA%20APP%20AVEC%20QWEN/src/app/robots.ts).
    *   Création de [sitemap.ts](file:///c:/Users/P%20C/Documents/OMRA%20APP%20AVEC%20QWEN/src/app/sitemap.ts).
    *   Inclusion de balises Schema.org `TravelAgency` sur la page d'accueil.
*   **Version** : v1.8.0

---

## 14. Mise en place de la validation du formulaire de vol par Zod
*   **Décision** : Intégration de schémas de validation Zod côté serveur pour les entrées de formulaires de vols.
*   **Justification** : Garantir l'intégrité des données avant insertion en base et fournir des messages d'erreur explicites lors de la saisie manuelle des escales.
*   **Impacts** :
    *   Création du fichier de validation `src/lib/schemas/flight.ts`.
    *   Refactoring de l'action serveur de création de vol pour inclure `safeParse`.
*   **Version** : v1.8.1
