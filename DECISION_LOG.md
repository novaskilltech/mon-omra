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

---

## 15. Suppression de la règle des Mahrams pour le Rooming
*   **Décision** : Retrait complet des validations de mixité de genres et de noms de familles différents (règle des Mahrams) côté client et serveur lors de la répartition des chambres (rooming).
*   **Justification** : Offre une flexibilité opérationnelle pour les agences de voyage. L'ancienne règle bloquait le rooming des familles recomposées, des conjoints avec des noms de famille distincts (ex: nom de jeune fille), ou des cas comme un couple voyageant avec sa belle-famille sans homonymie directe.
*   **Impacts** :
    *   Modification de `assignPilgrimToRoom` dans `src/lib/actions/logistics.ts` (retrait de la validation de genre et de famille).
    *   Modification de `handleAssign` dans `src/app/backoffice/groups/[id]/rooming/_components/RoomingManager.tsx` (retrait du blocage et du toast d'erreur client).
    *   Mise à jour des tests dans `src/lib/actions/__tests__/mahram.test.ts`.
*   **Version** : v1.9.0

---

## 16. Autorisation de suppression des chambres avec occupants (Rooming)
*   **Décision** : Permettre aux administrateurs de supprimer n'importe quelle chambre, même occupée, en effectuant une désassignation automatique en cascade.
*   **Justification** : Les utilisateurs ne pouvaient pas supprimer de chambres contenant des occupants (bloquées côté serveur et bouton masqué côté client). De plus, si des pèlerins d'autres groupes ou séjours étaient logés dans la chambre, celle-ci apparaissait comme vide dans la vue du groupe actuel tout en restant impossible à supprimer (message d'erreur trompeur).
*   **Impacts** :
    *   Mise à jour de `deleteRoomAction` dans `src/lib/actions/logistics.ts` pour supprimer les lignes de la table `room_assignments` associées avant de supprimer la chambre.
    *   Modification de `RoomingManager.tsx` et `HotelRoomingModal.tsx` pour afficher en permanence le bouton de suppression avec une boîte de confirmation prévenant l'utilisateur en cas d'occupation.
*   **Version** : v1.9.1

---

## 17. Option Makkah First / Madinah First et Dates d'Entrée et Sortie pour les Transferts
*   **Décision** : Ajout d'une option de séquence de voyage (Makkah First ou Madinah First) et de deux dates distinctes (Entrée/Arrivée et Sortie/Départ) pour La Mecque et Médine dans la gestion des transferts terrestres.
*   **Justification** : Simplifie l'organisation logistique pour les agences. Auparavant, la saisie ne gérait qu'une seule date par ville sans distinction d'entrée/sortie, et ne permettait pas d'ordonner dynamiquement les étapes du voyage dans le manifeste WhatsApp.
*   **Impacts** :
    *   Mise à jour de `getLogisticsDefaultsForPilgrim` dans `src/lib/actions/concierge.ts` pour retourner `first_destination`, `makkah_arrival_time`, `makkah_departure_time`, `madinah_arrival_time`, et `madinah_departure_time`.
    *   Mise à jour de `TransfersPage` dans `src/app/backoffice/logistics/transfers/page.tsx` pour ajouter ces états, le sélecteur radio de séquence, les champs d'entrée associés, et formater dynamiquement le manifeste WhatsApp en fonction de l'ordre sélectionné.
*   **Version** : v1.10.0

---

## 18. Accès Espace Famille pour les Chefs de Famille sur le Dashboard
*   **Décision** : Permettre au chef de famille d'accéder au tableau de bord complet (preview) de chacun des pèlerins rattachés à son dossier pour consulter leurs vols, visas, et checklists, et de téléverser/télécharger directement leurs documents.
*   **Justification** : Répond à la demande utilisateur d'avoir un accès centralisé et d'agir au nom des co-voyageurs rattachés sans forcer l'agence à donner des accès de connexion individuels pour les enfants ou la belle-famille.
*   **Impacts** :
    *   Mise à jour de `src/app/dashboard/page.tsx` pour autoriser la consultation par preview si le demandeur est le chef de famille des membres rattachés, afficher un bandeau de signalement "Espace Famille", et ajouter des boutons "Accéder au dossier" pour chaque membre.
    *   Mise à jour de `src/app/dashboard/documents/page.tsx` et `DocumentsClient.tsx` pour accepter `searchParams.pilgrimId` afin d'ouvrir directement l'onglet du membre de famille sélectionné lors d'une redirection depuis son tableau de bord.
*   **Version** : v1.11.0

---

## 19. Intégration de la Plateforme Éditoriale La Voix du Pèlerin
*   **Décision** : Greffer le site statique autonome « La Voix du Pèlerin » au sein du projet principal Next.js.
*   **Justification** : Unifie l'expérience éditoriale et de témoignages avec la plateforme principale de gestion pour éviter aux utilisateurs de naviguer sur deux serveurs/domaines distincts.
*   **Impacts** :
    *   Copie récursive des codes sources, feuilles de style, scripts (`db.js`, `main.js`, `style.css`), pages et images d'illustrations dans le répertoire `/public/la-voix-du-pelerin/` du projet principal.
    *   Mise à jour des liens absolus de ressources (`/src/style.css`, `/src/main.js`, `/logo.png`) dans `index.html` et `db.js` pour pointer proprement sous le préfixe `/la-voix-du-pelerin/`.
    *   Ajout d'une section de promotion esthétique avec lien externe ciblant `/la-voix-du-pelerin/` sur la page d'accueil principale du site (`src/app/page.tsx`).
*   **Version** : v1.12.0

---

## 20. Scaffolding de la Boutique de Cadeaux et Miels d'Exception
*   **Décision** : Implémenter le socle technique et les interfaces d'administration de la boutique en Backoffice, tout en préservant l'invisibilité côté pèlerin via un simple bandeau teaser.
*   **Justification** : Permet à l'agence de configurer sereinement ses produits d'exception et ses liens de paiement Stripe/Revolut avant la mise en ligne complète.
*   **Impacts** :
    *   Création de [shop.ts](file:///c:/Users/P%20C/Documents/OMRA%20APP%20AVEC%20QWEN/src/types/shop.ts) contenant les types de données produits.
    *   Création de l'interface d'administration de catalogue [backoffice/shop/page.tsx](file:///c:/Users/P%20C/Documents/OMRA%20APP%20AVEC%20QWEN/src/app/backoffice/shop/page.tsx) avec les miels (Jujubier Panjab, Cachemire, Peshawar, Yémen, Immunité, Fertilité, Booster), nigelle, henné et café vert saoudien pré-configurés, ainsi que la configuration des liens de paiement.
    *   Ajout d'un bouton d'accès rapide sur le Tableau de bord Backoffice principal [backoffice/page.tsx](file:///c:/Users/P%20C/Documents/OMRA%20APP%20AVEC%20QWEN/src/app/backoffice/page.tsx).
    *   Ajout du bandeau d'annonce premium "Bientôt disponible" sur le Tableau de bord Pèlerin [dashboard/page.tsx](file:///c:/Users/P%20C/Documents/OMRA%20APP%20AVEC%20QWEN/src/app/dashboard/page.tsx).
    *   Ajout d'une section promotionnelle de la boutique "Naturomiel" avec intégration du logo officiel `/public/naturomiel-logo.png`, génération et intégration d'une image d'illustration premium `/public/naturomiel-shop.png` (miel, dattes, nigelle) et mise en avant des cadeaux sains de Médine sur la page d'accueil publique [page.tsx](file:///c:/Users/P%20C/Documents/OMRA%20APP%20AVEC%20QWEN/src/app/page.tsx).
    *   Mise à niveau de l'interface [backoffice/shop/page.tsx](file:///c:/Users/P%20C/Documents/OMRA%20APP%20AVEC%20QWEN/src/app/backoffice/shop/page.tsx) en formulaire dynamique pour inclure l'édition complète, ainsi que l'ajout des "Dattes Ajwa de Médine Premium", des "Feuilles de Jujubier Moulues (Sidr)", des "Feuilles de Séné (Sana Makki)" et de la "Location de Voiture à la Journée" dans le catalogue de produits initiaux, avec support du filtre "Services".
    *   Création, sélection utilisateur et intégration du nouveau logo officiel de l'application sous `/public/app-logo.png` (Concept 1 : Sentier sinueux en métal doré formant un minaret et un croissant sur fond dégradé émeraude et bleu nuit) au niveau de l'en-tête et du bouton d'entrée de la page d'accueil.
    *   Génération et intégration de 4 illustrations 3D premium sous `/public/features-*.png` pour habiller le bento grid des fonctionnalités : Guide interactif des rituels, Documents sécurisés, Logistique et Assistance 24/7.
    *   Intégration d'un grand mockup immersif d'un pèlerin en ihram utilisant l'application `public/pilgrim-mockup.png` dans la section Hero tout en haut de la page d'accueil [page.tsx](file:///c:/Users/P%20C/Documents/OMRA%20APP%20AVEC%20QWEN/src/app/page.tsx).
    *   Refonte visuelle de l'en-tête (Welcome Section) du Dashboard Pèlerin [dashboard/page.tsx](file:///c:/Users/P%20C/Documents/OMRA%20APP%20AVEC%20QWEN/src/app/dashboard/page.tsx) sous forme d'une carte premium détourée en "glass" (adaptable aux thèmes) bordée d'un grand arc doré de style architectural islamique (ogive) s'étendant d'un bord à l'autre, avec le logo Kaaba d'origine au centre (suppression du pavé textuel "Je pars vers" / aéroport pour alléger le visuel).
    *   Ajout d'un thème "Crème & Émeraude" (theme-6) dans [ThemeSelector.tsx](file:///c:/Users/P%20C/Documents/OMRA%20APP%20AVEC%20QWEN/src/components/ThemeSelector.tsx) et [globals.css](file:///c:/Users/P%20C/Documents/OMRA%20APP%20AVEC%20QWEN/src/app/globals.css) avec un fond beige clair et des accents vert émeraude foncé, et intégration de règles CSS globales pour forcer tous les champs de saisie de texte à avoir un fond blanc et une écriture noire pour une lisibilité parfaite.
    *   Mise à disposition du guide pèlerin et ajout d'un accordéon interactif Foire Aux Questions (FAQ) dans l'onglet d'aide pèlerin [dashboard/help/page.tsx](file:///c:/Users/P%20C/Documents/OMRA%20APP%20AVEC%20QWEN/src/app/dashboard/help/page.tsx), avec correction de la politique de bagages standard (renvoi vers le billet ou le dashboard car dépendant du type de réservation).
    *   Mise en place d'un accès sécurisé au passeport signé pour le chauffeur [shared/transfer/[token]/page.tsx](file:///c:/Users/P%20C/Documents/OMRA%20APP%20AVEC%20QWEN/src/app/shared/transfer/[token]/page.tsx) en l'absence de visa approuvé pour le pèlerin, avec récupération dynamique du document de type "PASSPORT" dans la base de données.
    *   Trier automatiquement par vol les passagers sur le manifeste du chauffeur [shared/transfer/[token]/page.tsx](file:///c:/Users/P%20C/Documents/OMRA%20APP%20AVEC%20QWEN/src/app/shared/transfer/[token]/page.tsx) via la fonction backend `getDriverDashboardData` de `concierge.ts`.
*   **Version** : v1.13.0



