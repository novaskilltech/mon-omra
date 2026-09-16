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

---

## 21. Création de la Landing Page « La Méthode OMRAYANAIR »
*   **Décision** : Implémenter une landing page premium, responsive et persuasive sous `/la-methode` pour promouvoir le programme d'incubation en présentiel visant à lancer sa propre conciergerie Omra.
*   **Justification** : Permet de capter des porteurs de projet sérieux via un parcours explicatif complet, se terminant par un formulaire de candidature qualifiant qui redirige vers WhatsApp ou e-mail.
*   **Impacts** :
    *   Création de [page.tsx](file:///c:/Users/P%20C/Documents/OMRA%20APP%20AVEC%20QWEN/src/app/la-methode/page.tsx) avec styles sombres et dorés isolés.
    *   Formulaire dynamique avec validation locale et génération d'URL WhatsApp et Mailto structurées.
    *   Optimisation SEO et balisage sémantique Schema.org (EducationalOccupationalProgram).
*   **Version** : v1.14.0

---

## 22. Remplacement des Demandes d'Accès par des Demandes de Renseignement
*   **Décision** : Transformer le flux de demande d'accès côté pèlerin en formulaire de demande de renseignement (inquiry form) et retirer le mécanisme d'approbation automatique en backoffice au profit d'options de contact direct (WhatsApp, Mail, Téléphone).
*   **Justification** : Élimine les erreurs d'adresses e-mail en doublon lorsque l'administrateur crée le dossier d'un pèlerin en premier et que le pèlerin tente de s'inscrire manuellement ensuite. Les pèlerins se connectent directement avec l'e-mail saisi par l'admin via OTP.
*   **Impacts** :
    *   Modification de la table `registration_requests` avec les nouveaux critères (message, ancien client, club de fidélité).
    *   Mise à jour de l'action serveur `requestRegistration` et retrait/adaptation de la validation d'accès.
    *   Remplacement des placeholders réels "Salah / Lamkhannet" par des noms fictifs neutres "Karim / Dupont" dans le formulaire de connexion/renseignement [login/page.tsx](file:///c:/Users/P%20C/Documents/OMRA%20APP%20AVEC%20QWEN/src/app/login/page.tsx).
    *   Intégration du tableau enrichi et des boutons d'actions directes (WhatsApp, E-mail, Téléphone) avec bouton "Traité" dans [backoffice/concierge/page.tsx](file:///c:/Users/P%20C/Documents/OMRA%20APP%20AVEC%20QWEN/src/app/backoffice/concierge/page.tsx).
*   **Version** : v1.15.0

---

## 23. Normalisation et Recherche d'E-mails Insensible à la Casse
*   **Décision** : Normalisation automatique en minuscules de toutes les adresses e-mail lors de la création ou modification d'un pèlerin par le concierge, et passage à des recherches insensibles à la casse (`.ilike`) lors de la résolution de compte et de l'authentification (OTP).
*   **Justification** : Évite les blocages de connexion pour les pèlerins enregistrés avec des majuscules dans leur e-mail (ex: par l'agence ou le client).
*   **Impacts** :
    *   Normalisation de l'e-mail avec `.trim().toLowerCase()` dans `createPilgrim` et `updatePilgrimAction` (`concierge.ts`).
    *   Remplacement de `.eq('email', ...)` par `.ilike('email', ...)` dans `checkEmailRegistration`, `sendOtpToPilgrim`, `verifyPilgrimOtp` (`auth.ts`), `resolvePilgrimIdByEmail` (`logistics.ts`) et `approveRegistrationRequest` (`concierge.ts`).
*   **Version** : v1.15.1

---

## 24. Résolution de l'Erreur RLS sur les Évaluations Pèlerins (Feedbacks)
*   **Décision** : Remplacement du client Supabase standard par le client d'administration (`createAdminClient()`) pour l'écriture, la lecture et la validation de statut de soumission des évaluations sur la table `pilgrim_feedbacks`.
*   **Justification** : Les sessions pèlerins et administrateurs n'utilisant pas Supabase Auth standard côté client mais des cookies de session dédiés, l'identifiant Supabase `auth.uid()` était évalué à `NULL`, provoquant un blocage par les politiques RLS à l'insertion et à la lecture. La sécurité d'accès est garantie côté serveur par les validations de cookies avant l'usage du client d'administration.
*   **Impacts** :
    *   Mise à jour de `submitFeedbackAction`, `getPilgrimFeedback`, `getAllFeedbacks` et `checkFeedbackStatus` dans [feedback.ts](file:///c:/Users/P%20C/Documents/OMRA%20APP%20AVEC%20QWEN/src/lib/actions/feedback.ts).
*   **Version** : v1.15.2

---

## 25. Sélection et Affichage du Type de Chambre dans le Dossier Pèlerin
*   **Décision** : Ajout du choix de type de chambre souhaitée (Single, Double, Triple, Quadruple, Quintuple) dans les formulaires d'ajout et de modification de pèlerins, et affichage dans la fiche détaillée du backoffice.
*   **Justification** : Simplifie l'organisation logistique et le rooming pour l'agence de voyage en spécifiant le souhait d'hébergement au niveau du dossier pèlerin.
*   **Impacts** :
    *   Ajout de la colonne `requested_room_type` sur la table `pilgrims`.
    *   Mise à jour des Server Actions `getPilgrimsList`, `createPilgrim`, et `updatePilgrimAction` dans `src/lib/actions/concierge.ts`.
    *   Mise à jour de `src/app/backoffice/concierge/page.tsx` pour afficher les sélecteurs et l'information "Chambre Souhaitée".
*   **Version** : v1.16.0

---

## 26. Option Petit Déjeuner dans le Dossier Pèlerin
*   **Décision** : Ajout d'une case à cocher "Option Petit Déjeuner" dans les formulaires de création et de modification de pèlerin et affichage de l'état souscrit ("Oui / Non") dans sa fiche détaillée.
*   **Justification** : Permet à l'agence d'enregistrer et de suivre l'option petit déjeuner de manière individuelle au niveau du dossier du client.
*   **Impacts** :
    *   Ajout de la colonne `has_breakfast` (booléen) à la table `pilgrims`.
    *   Mise à jour des Server Actions `getPilgrimsList`, `createPilgrim` et `updatePilgrimAction` dans `src/lib/actions/concierge.ts`.
    *   Mise à jour de `src/app/backoffice/concierge/page.tsx` pour afficher la case à cocher dans les formulaires et la valeur sur la fiche détaillée.
*   **Version** : v1.16.1

---

## 27. Configuration du Type de Vol et de Formule de Package par Groupe
*   **Décision** : Ajout de la sélection du type de vol (Direct / Avec Escale) et de la formule (Classique / Eco) lors de la création et de la modification d'un groupe, avec badges d'information associés dans les listes.
*   **Justification** : Permet aux organisateurs de catégoriser les offres et d'afficher clairement les spécificités des vols et des formules.
*   **Impacts** :
    *   Ajout des colonnes `flight_type` et `formula_type` sur la table `groups`.
    *   Mise à jour des Server Actions `getGroupsDetailed`, `createGroupAction` et `updateGroupAction` dans `src/lib/actions/concierge.ts`.
    *   Mise à jour de `src/app/backoffice/groups/page.tsx` pour inclure les formulaires et les badges de cartes de groupe.
*   **Version** : v1.17.0

---

## 28. Effets Premium 3D Interactifs au Survol (Tableaux de bord)
*   **Décision** : Ajout d'une classe CSS utilitaire `.hover-3d` et `.btn-3d` dans le fichier de styles globaux et application sur les sections clés et les boutons des tableaux de bord.
*   **Justification** : Améliore significativement l'expérience utilisateur (UX/UI) en créant une sensation de relief, de profondeur et d'interactivité premium.
*   **Impacts** :
    *   Mise à jour de `src/app/globals.css`.
    *   Mise à jour de `src/app/backoffice/page.tsx` et `src/app/dashboard/page.tsx`.
*   **Version** : v1.18.0

---

## 29. Résolution du Blocage RLS du Tableau de Bord Pèlerin
*   **Décision** : Remplacement de `createClient()` par `createAdminClient()` pour les fonctions de lecture de données pèlerins sur le serveur (`getPilgrimDashboardData`, `resolvePilgrimIdByEmail`, et `getDepartureRequest`).
*   **Justification** : Permet aux pèlerins connectés via un cookie personnalisé de session (`pilgrim_id`) de charger correctement leurs vols, hôtels, et visas sans être bloqués par les politiques RLS de Supabase.
*   **Impacts** :
    *   Mise à jour de `src/lib/actions/logistics.ts`.
    *   Mise à jour du mock de test dans `src/lib/actions/__tests__/logistics.test.ts`.
*   **Version** : v1.18.1

---

## 30. Signal d'Alerte 3D et Pointeur Index Animé pour les Inscriptions Hajj
*   **Décision** : Ajout d'un badge d'alerte flottant 3D en or biseauté (`.btn-3d-gold`), avec un voyant LED d'urgence clignotant rouge et une main à doigt index (`👇`) animée en lévitation verticale continue (`@keyframes bob3DPointer` / `.animate-3d-bob`) pointant directement vers la tuile Bento Grand Hajj.
*   **Justification** : Maximise le taux de conversion et attire immédiatement le regard du visiteur vers les pré-inscriptions prioritaires au Grand Hajj 2027/2028+.
*   **Impacts** :
    *   Mise à jour des animations et des styles 3D dans [globals.css](file:///c:/Users/P%20C/Documents/OMRA%20APP%20AVEC%20QWEN/src/app/globals.css).
    *   Intégration du composant d'alerte et enrichissement de la tuile Hajj dans [BentoLandingHub.tsx](file:///c:/Users/P%20C/Documents/OMRA%20APP%20AVEC%20QWEN/src/components/BentoLandingHub.tsx).
*   **Version** : v1.19.0

---

## 31. Optimisation CSP pour DevTools et Environnement Local
*   **Décision** :
    1. Conditionnement de la directive CSP `upgrade-insecure-requests` à l'environnement de production (`NODE_ENV === 'production'`) pour empêcher le forçage HTTPS sur `http://localhost`.
    2. Ajout explicite des protocoles et origines locales (`ws:`, `wss:`, `http://localhost:*`, `ws://localhost:*`) dans `connect-src`.
    3. Création du gestionnaire de route standard `/.well-known/appspecific/com.chrome.devtools.json` renvoyant un statut 200 OK.
*   **Justification** : Supprime les avertissements de violation CSP et les erreurs 404 émises par Chrome DevTools lors de l'inspection de l'application en développement local.
*   **Impacts** :
    *   Mise à jour de `src/middleware.ts`.
    *   Création de `src/app/.well-known/appspecific/com.chrome.devtools.json/route.ts`.
*   **Version** : v1.19.1

---

## 32. Système d'Audit Nusuk Hajj et Réponses 1-Clic WhatsApp & E-mail
*   **Décision** : 
    1. Ajout de questions de qualification Nusuk Hajj dans le formulaire de pré-inscription (compte créé OUI/NON/EN_COURS, année d'ouverture 2026-2027 vs 2025+, statut de vérification des pièces, créneau d'appel WhatsApp souhaité).
    2. Ajout de boutons de réponse immédiate en 1 clic ("Répondre par WhatsApp", "Répondre par E-mail") générant des messages d'audit pré-rédigés personnalisés.
    3. Ajout d'un modal d'audit complet dans `/backoffice/hajj` permettant la mise à jour des statuts de validation Nusuk et la prise de notes d'audit internes agence.
*   **Justification** : Permet à l'agence de qualifier instantanément les candidats au Hajj, de planifier les sessions d'appel de vérification WhatsApp et de sécuriser l'accès aux quotas officiels Nusuk sans perte de temps.
*   **Impacts** :
    *   Migration Supabase `docs/supabase/20260830_add_nusuk_audit_to_hajj_requests.sql`.
    *   Mise à jour des Server Actions `src/lib/actions/hajj.ts` et tests `src/lib/actions/__tests__/hajj.test.ts`.
    *   Mise à jour de `src/components/BentoLandingHub.tsx` et `src/app/backoffice/hajj/page.tsx`.
*   **Version** : v1.20.0

---

## 33. Configuration du Nom de Domaine Canonique et SSL Gratuit
*   **Décision** : Liaison officielle du sous-domaine `omrayanair.novaskill.tech` au projet Vercel `omrayanair` avec génération automatique du certificat SSL / TLS (HTTPS) gratuit Let's Encrypt, et mise à jour de l'URL canonique dans les métadonnées (`layout.tsx`, `page.tsx`, `robots.ts`, `sitemap.ts`).
*   **Justification** : Permet d'offrir une adresse web personnalisée, professionnelle et 100% sécurisée sous l'infrastructure `novaskill.tech`.
*   **Impacts** :
    *   Mise à jour des métadonnées SEO, OpenGraph, JSON-LD, sitemap et robots.
    *   Validation DNS Vercel `omrayanair.novaskill.tech` avec certificat SSL actif.
*   **Version** : v1.20.1

---

## 34. Normalisation Téléphonique Internationale E.164 & Résolution Redirection WhatsApp
*   **Décision** : 
    1. Création de l'utilitaire `src/lib/utils/phone.ts` pour convertir automatiquement les numéros nationaux français/internationaux (ex: `0755...` -> `33755...`, `06...` -> `336...`, indicatifs Maghreb et Europe) en format universel E.164.
    2. Utilisation de l'API standard `api.whatsapp.com/send` et `web.whatsapp.com/send` avec le numéro international propre pour garantir l'ouverture instantanée de la discussion ciblée dans WhatsApp Desktop et WhatsApp Web.
    3. Ajout de boutons directs ("Ouvrir WhatsApp Bureau/App" et "Ouvrir WhatsApp Web") dans le tableau de bord Hajj et Conciergerie.
*   **Justification** : Résout le blocage où WhatsApp Desktop s'ouvrait sur son écran d'accueil sans ouvrir la conversation avec le client en raison de l'absence du code pays (+33).
*   **Impacts** :
    *   Création de `src/lib/utils/phone.ts` et tests unitaires `src/lib/utils/__tests__/phone.test.ts`.
    *   Mise à jour de `src/app/backoffice/hajj/page.tsx` et `src/app/backoffice/concierge/page.tsx`.
*   **Version** : v1.20.2

---

## 35. Formule Vedette Omra & Bento 3D Pyramidal Animé (Landing Page ↔ Backoffice)
*   **Décision** : 
    1. Ajout d'une action serveur sécurisée `toggleGroupFeaturedAction` et `getFeaturedGroupAction` dans `src/lib/actions/concierge.ts` pour définir le départ prioritaire en 1 clic.
    2. Ajout du bouton 1-clic ⭐ "Mettre en Vedette (Landing Page)" / "🌟 En Vedette" sur chaque carte de groupe dans `/backoffice/groups` avec bannière de contrôle supérieure.
    3. Création des animations CSS 3D d'avance/recul continu (`@keyframes bento3DPushPull` / `.bento-featured-3d` / `.animate-3d-push-pull`) dans `src/app/globals.css`.
    4. Intégration du composant Bento 3D Pyramidal au sommet de la Landing Page (`BentoLandingHub.tsx`), affichant la formule star et ouvrant directement le formulaire de réservation pré-rempli au clic.
*   **Justification** : Maximise le taux de conversion en captant immédiatement l'attention du visiteur sur une offre coup de cœur tout en offrant à l'agence un contrôle total et instantané depuis son tableau de bord.
*   **Impacts** :
    *   Mise à jour de `src/lib/actions/concierge.ts` et tests `src/lib/actions/__tests__/concierge.test.ts`.
    *   Mise à jour de `src/app/globals.css`.
    *   Mise à jour de `src/app/backoffice/groups/page.tsx` et `src/components/BentoLandingHub.tsx`.
*   **Version** : v1.21.0

---

## 36. Dissimulation des Tarifs Non-Vedettes & Contact Direct WhatsApp (07 52 28 08 90)
*   **Décision** : 
    1. Dissimulation des tarifs fixes sur toutes les offres et départs Omra réguliers (`/depart/[airport]` et sélecteur modal landing page). Seule l'offre mise en avant (formule vedette) conserve son tarif affiché.
    2. Ajout d'une constante `AGENCY_WHATSAPP_PHONE = '0752280890'` et de l'utilitaire `getGroupInquiryWhatsAppUrl` dans `src/lib/utils/phone.ts`.
    3. Sur chaque formule non-vedette dans `/depart/[airport]`, remplacement de l'affichage des prix fixes par la mention *"Tarif personnalisé sur devis immédiat"* et intégration du bouton WhatsApp direct vers le `07 52 28 08 90` avec le message automatique intégrant le nom et les dates du séjour : *"Bonjour, je suis intéressé par cette formule : [Nom] (Départ du [Date]), pouvez-vous m'en dire plus ?"*.
*   **Justification** : Les tarifs des billets d'avion et des hôtels étant trop fluctuants pour garantir un prix fixe sur le catalogue complet, cette approche protège la rentabilité de l'agence tout en convertissant immédiatement le pèlerin vers une discussion commerciale directe sur WhatsApp.
*   **Impacts** :
    *   Mise à jour de `src/lib/utils/phone.ts` et tests unitaires `src/lib/utils/__tests__/phone.test.ts` (28/28 tests réussis).
    *   Mise à jour de `src/app/depart/[airport]/page.tsx` et `src/components/BentoLandingHub.tsx`.
*   **Version** : v1.22.0

---

## 37. Résolution Violation RLS (Row-Level Security) lors de la Création de Groupes & Upload de Flyers
*   **Décision** :
    1. Bascule systématique des actions d'administration des groupes (`createGroupAction`, `updateGroupAction`, `deleteGroupAction`, `uploadGroupFlyerAction`, `getGroupFlyerUrlAction`, `uploadVisaDocument`) vers `createAdminClient()` (clé de service Supabase) dans `src/lib/actions/concierge.ts`.
    2. Synchronisation de la mise en avant (`isFeatured`) lors de la création et modification de groupe pour garantir l'unicité du groupe vedette et la revalidation instantanée de la landing page (`/`).
    3. Nettoyage en cascade sécurisé des tables de jointure `group_hotel_stays` et `group_logistics` lors de la suppression d'un groupe.
*   **Justification** : 
    *   L'authentification du backoffice administrateur repose sur une session de cookie d'administration (`isAdminAuthenticated()`) sans JWT utilisateur Supabase public.
    *   L'utilisation de `createClient()` (clé publique anonyme) provoquait l'interdiction d'insertion PostgreSQL `new row violates row-level security policy` lors de l'upload d'un flyer dans le bucket privé `group-flyers` (protégé par RLS sur `storage.objects`).
    *   Le passage au client d'administration Supabase sécurisé (`createAdminClient()`) garantit le bon déroulement des créations de groupes avec ou sans flyer, tout en maintenant l'étanchéité et la sécurité des données.
*   **Impacts** :
    *   Fichier `src/lib/actions/concierge.ts` corrigé et fiabilisé.
    *   Tests de non-régression validés (28/28 tests réussis, vérification TypeScript `tsc --noEmit` à 0 erreur).
*   **Version** : v1.22.1

---

## 38. Affichage Dynamique des Hôtels Réels & Fin des Mentions Hardcodées "Pieds dans le Haram"
*   **Décision** :
    1. Récupération et jointure automatique des hôtels sélectionnés (`group_hotel_stays` ↔ `hotels`) dans `getPublicActiveGroups` et `getFeaturedGroupAction` dans `src/lib/actions/concierge.ts`.
    2. Sur le Bento 3D de la page d'accueil (`BentoLandingHub.tsx`), remplacement du badge et du texte descriptif hardcodés ("Hôtels 5★ Pieds dans le Haram") par les **hôtels réels cochés par l'administrateur** lors de la création du groupe (ex: `🏨 Hôtels : M Makkah & Zaha Taiba`, description avec hôtels confirmés à La Mecque et Médine).
    3. Retrait de la mention trompeuse "hôtels 5★ au pied du Haram" sur le bloc Omra général au profit d'une mention conforme : "Formules tout-compris, vols sélectionnés & hébergements certifiés".
    4. Enrichissement du sélecteur de Formule dans le backoffice (`/backoffice/groups`) avec options explicites : `Classique (Hôtels Confort)`, `Confort (Navette 24h)`, `Économique (Hôtels Standard)`, et `Prestige (5★ Pieds dans le Haram)`, assorti d'un message informatif rappelant que les hôtels cochés s'affichent automatiquement en temps réel sur la landing page.
*   **Justification** : Évite les descriptions mensongères ou inexactes pour les pèlerins lorsqu'un groupe utilise des hôtels de confort de type navette ou à distance du parvis (comme M Makkah by Millennium ou Zaha Taiba), et garantit la parfaite adéquation entre les sélections faites en backoffice et les informations affichées aux clients.
*   **Impacts** :
    *   Mise à jour de `src/lib/actions/concierge.ts`, `src/components/BentoLandingHub.tsx` et `src/app/backoffice/groups/page.tsx`.
    *   Tests de non-régression validés (28/28 tests réussis, vérification TypeScript `tsc --noEmit` à 0 erreur).
*   **Version** : v1.22.2

---

## 39. Carrousel 3D Multi-Formules Vedettes sur la Landing Page & Gestion Backoffice
*   **Décision** :
    1. **Autorisation du multi-vedettes** : Levée de la restriction d'exclusivité sur `is_featured = true`. L'administrateur peut mettre en avant plusieurs formules simultanément depuis le backoffice (`/backoffice/groups`).
    2. **Carrousel 3D Interactif sur la Landing Page (`BentoLandingHub.tsx`)** :
        *   Si plusieurs formules sont en vedette : affichage d'un carrousel interactif avec flèches de navigation (précédent/suivant), pillules de pagination dynamiques, indicateur de slide (`🌟 FORMULE VEDETTE (1 / N)`), défilement automatique toutes les 6 secondes avec pause au survol de la souris (`hover`) et au toucher (`touch`), et prise en charge des gestes tactiles mobiles (`swipe left / swipe right`).
        *   Si une seule formule est en vedette : affichage du Bento 3D pyramidal individuel sans commandes superflues (rétro-compatibilité intégrale).
        *   Si aucune formule n'est en vedette : masquage gracieux de la section.
        *   Chaque slide permet de réserver directement l'offre correspondante en ouvrant le modal pré-rempli avec le nom du groupe et la date de départ spécifique.
    3. **Expérience Backoffice Enrichie (`/backoffice/groups`)** :
        *   Le bandeau d'alerte supérieur recense désormais l'ensemble des formules en vedette actives avec leur nombre total, leurs caractéristiques et un bouton de retrait en un clic.
        *   Le toggle rapide de mise en avant en 1-clic préserve l'état des autres formules sans désélection intempestive.
*   **Justification** : Répond à la demande utilisateur de pouvoir promouvoir plusieurs départs stratégiques simultanément tout en maintenant l'impact visuel fort du Bento 3D animé sur desktop comme sur mobile.
*   **Impacts** :
    *   Fichiers modifiés : `src/lib/actions/concierge.ts`, `src/components/BentoLandingHub.tsx`, `src/app/backoffice/groups/page.tsx`, `src/lib/actions/__tests__/concierge.test.ts`.
    *   Tests unitaires et d'intégration validés (29/29 tests réussis, vérification TypeScript `tsc --noEmit` à 0 erreur).
*   **Version** : v1.23.0

---

## 40. Tri Chronologique des Départs dans les Listes et Sélecteurs de Groupes du Backoffice Conciergerie
*   **Décision** :
    1. Mise à jour de l'action serveur `getGroups()` dans `src/lib/actions/concierge.ts` pour extraire `departure_date` et `status` et ordonner systématiquement les groupes par `.order('departure_date', { ascending: true }).order('name', { ascending: true })`.
    2. Tri chronologique côté client (défense en profondeur) dans le tableau de bord de la Conciergerie (`src/app/backoffice/concierge/page.tsx`) et dans le module des transferts logistiques (`src/app/backoffice/logistics/transfers/page.tsx`).
    3. Impact direct sur le filtre principal *"Tous les groupes"* ainsi que sur les modales d'ajout de pèlerins, d'approbation d'inscriptions et de modification de groupe : les départs s'enchaînent désormais chronologiquement (Lyon, Marseille, Paris, etc. selon les dates de départs effectives).
*   **Justification** : Évite le désordre issu de l'ordre d'insertion Postgres non déterministe et permet aux concierges de localiser immédiatement le prochain départ à gérer.
*   **Impacts** :
    *   Fichiers modifiés : `src/lib/actions/concierge.ts`, `src/app/backoffice/concierge/page.tsx`, `src/app/backoffice/logistics/transfers/page.tsx`, `src/lib/actions/__tests__/concierge.test.ts`.
    *   Tests unitaires et d'intégration validés (30/30 tests réussis, vérification TypeScript `tsc --noEmit` à 0 erreur).
*   **Version** : v1.23.1

---

## 41. Rubrique "Le Cercle Privilège & Club Fidélité" sur la Landing Page
*   **Décision** :
    1. Intégration d'une rubrique dédiée premium sur la Landing Page (`src/components/BentoLandingHub.tsx`), positionnée stratégiquement après la grille des 6 Bento univers.
    2. Mise en avant des 4 privilèges fidélité concrets de l'agence sous forme de cartes glassmorphism dorées et émeraudes :
        * 🎒 **Bagage en Soute Retour Offert** (vols sélectionnés, transport d'eau de Zamzam et souvenirs sans franchise additionnelle).
        * 🍳 **Petit-Déjeuner Offert à La Mecque** (séjours de 10 jours ou moins, valeur 10 €/jour/pers).
        * 🛂 **Visa Enfant (-16 ans) Offert** (voyages en famille pendant les vacances scolaires).
        * 🏷️ **Remise Fidélité Immédiate de 75 €** (déduite directement du forfait de voyage).
    3. Bandeau VIP des engagements permanents de la conciergerie : Ligne WhatsApp concierge 24/7 dédiée, attribution prioritaire des chambres, et application mobile/web compagnon spirituel utilisable 100% hors-ligne.
    4. Call-to-actions interactifs :
        * Bouton *« Activer mes Avantages Fidélité »* ouvrant directement la modale de pré-réservation Omra avec les flags `isFormerClient: true` et `wantsLoyaltyBenefits: true`.
        * Bouton *« Échanger avec mon Concierge Privilège »* ciblant WhatsApp (`07 52 28 08 90`) avec message pré-rempli.
*   **Justification** : Répond à la demande utilisateur d'exposer clairement les privilèges clients sur la vitrine publique pour fidéliser les pèlerins récurrents et maximiser la conversion des familles.
*   **Impacts** :
    *   Fichier modifié : `src/components/BentoLandingHub.tsx`.
    *   Tests de non-régression validés (30/30 tests réussis, vérification TypeScript `tsc --noEmit` à 0 erreur).
*   **Version** : v1.24.0

---

## 42. Résolution de l'Expiration de Session d'Administration Backoffice (Erreur "Non autorisé")
*   **Décision** :
    1. **Prolongation de la session d'administration** : Extension de la durée de validité du cookie `omra_admin_session` de 24 heures à 30 jours (`maxAge: 60 * 60 * 24 * 30`) avec attribut `sameSite: 'lax'` dans `src/lib/actions/auth.ts` pour empêcher les déconnexions inopinées pendant le travail quotidien.
    2. **Authentification Hybride & Fallback Supabase Auth** : Ajout d'une détection automatique du compte connecté via Supabase Auth pour les rôles `SUPER_ADMIN`, `ADMIN` et `AGENCY` dans `isAdminAuthenticated()`, garantissant la persistance des droits même en cas de rafraîchissement des cookies.
    3. **Expérience Utilisateur & Redirection Intelligente** : Dans `src/app/backoffice/groups/page.tsx` (modifications de groupe, ajouts, suppressions, toggle vedette), interception proactive de l'erreur `"Non autorisé"` avec notification claire (« *Votre session administrateur a expiré. Vous allez être redirigé vers la page de connexion.* ») et redirection automatique vers `/backoffice/login`. Maintien de la modale ouverte en cas d'erreur standard pour éviter toute perte de saisie.
    4. **Confirmation de conformité du statut "Complet"** : Validation que le statut `Complet` est 100% supporté par la base de données PostgreSQL (`CHECK (status IN ('En préparation', 'Complet', 'Brouillon', 'Terminé'))`).
*   **Justification** : L'alerte navigateur signalée par l'utilisateur résultait de l'expiration du jeton de session après 24h d'inactivité et non d'un refus du statut "Complet".
*   **Impacts** :
*   **Version** : v1.24.1

---

## 43. Prise en Compte du Statut "Complet" sur la Landing Page (Bento 3D / Formules Vedettes & Catalogues)
*   **Décision** :
    1. **Bento 3D & Carrousel des Formules Vedettes (`src/components/BentoLandingHub.tsx`)** :
        *   Remplacement du badge hardcodé *"Places Disponibles Immédiates"* par un badge dynamique *"🔴 Formule Complète (Liste d'attente)"* dès que le groupe est marqué au statut `Complet`.
        *   Ajout d'un badge distinctif `⚠️ Complet` dans la ligne départ/date et d'un encart informatif précisant que le départ a atteint sa capacité maximale et qu'une inscription sur liste d'attente prioritaire est disponible.
        *   Transformation du bouton CTA de réservation : passage de *"Réserver cette Offre"* à *"Liste d'Attente (Complet)"* avec style dégradé ambre/rose.
        *   Pré-remplissage intelligent du formulaire de contact orienté désistement / réouverture de places.
    2. **Catalogue Public des Départs (`src/components/PublicDeparturesCatalog.tsx`)** :
        *   Mise en valeur du statut `Complet` avec badge rose vif et pastille pulsante (*"Complet (Liste d'attente)"*).
        *   Adaptation de la modale de renseignement dédiée.
    3. **Page Départs par Aéroport (`src/app/depart/[airport]/page.tsx`)** :
        *   Ajout du badge `Complet` sur l'en-tête de chaque départ et remplacement du tarif dans l'aperçu par *"Complet (Liste d'attente)"*.
    4. **Sélecteurs Modales & Backoffice** :
        *   Mentions `🔴 [COMPLET - LISTE D'ATTENTE]` ajoutées dans les listes déroulantes de choix de voyage (`BentoLandingHub.tsx` et `PromoInquiryBanner.tsx`).
        *   Badge de statut plus visible et contrasté dans l'annuaire des groupes du Backoffice (`/backoffice/groups`).
*   **Justification** : Le statut `Complet` était bien persistant en base de données Postgres, mais les composants d'affichage de la Landing Page n'adaptaient pas dynamiquement leurs libellés et badges selon le champ `status`.
*   **Impacts** :
    *   Fichiers modifiés : `src/components/BentoLandingHub.tsx`, `src/components/PublicDeparturesCatalog.tsx`, `src/app/depart/[airport]/page.tsx`, `src/components/PromoInquiryBanner.tsx`, `src/app/backoffice/groups/page.tsx`.
    *   Tests de non-régression validés (30/30 tests réussis, vérification TypeScript `tsc --noEmit` à 0 erreur).
*   **Version** : v1.25.0

---

## 44. Déclaration des Paiements Pèlerins avec Justificatif & Validation Agence Conciergerie
*   **Décision** :
    1. **Évolution Schéma Base de Données (`payments`)** :
        *   Ajout des colonnes `proof_path TEXT`, `admin_notes TEXT`, `validated_at TIMESTAMPTZ`, `validated_by UUID`.
        *   Maintien de la contrainte CHECK existante `('PENDING', 'COMPLETED', 'REFUNDED', 'FAILED')`.
    2. **Actions Serveur Sécurisées (`src/lib/actions/concierge.ts`)** :
        *   `submitPilgrimPaymentProofAction(formData)` : vérification anti-IDOR stricte (pèlerin connecté ou chef de famille), contrôle MIME (PDF/JPEG/PNG/WebP <= 5 Mo), téléversement dans le bucket privé `pelerin-documents/payment-proofs/${pilgrimId}/...`, insertion du paiement au statut `PENDING`, et création automatique d'une alerte dans la table `notifications`.
        *   `getPendingPaymentsAction()` : réservé administrateur, extrait l'ensemble des paiements `PENDING` enrichis des coordonnées pèlerin (nom, email, téléphone WhatsApp direct) et du nom de groupe.
        *   `approvePaymentAction(paymentId)` : validation de l'encaissement par l'agence (bascule vers `COMPLETED`, horodatage `validated_at`, notification de confirmation au pèlerin et mise à jour en temps réel du solde).
        *   `rejectPaymentAction(paymentId, reason)` : refus motivé obligatoire (bascule vers `FAILED`, enregistrement d'`admin_notes = reason`, notification au pèlerin pour régularisation).
        *   `getPaymentProofSignedUrlAction(proofPath)` : génération exclusive d'URLs signées temporaires (15 minutes) avec contrôle d'accès propriétaire / admin.
        *   `getPilgrimPaymentSummary(pilgrimId)` : synthèse financière consolidée (prix du forfait, total encaissé, total en attente, solde restant dû).
    3. **Espace Pèlerin Client (`/dashboard`)** :
        *   Création du composant interactif `PaymentManager.tsx` affichant la jauge financière (Forfait, Encaissé & Validé, En cours de vérification agence, Reste à solder).
        *   Barre de progression visuelle bicolore (vert pour les paiements validés, ambre pulsant pour les paiements en attente de pointage).
        *   Modale de déclaration avec rappel clair des coordonnées bancaires officielles de l'agence (IBAN, BIC BNP Paribas, libellé recommandé avec bouton copie 1-clic) et zone de téléversement sécurisée du justificatif.
        *   Tableau d'historique des règlements avec badges de statuts explicites (🟡 *« Pointage bancaire en cours »*, 🟢 *« Validé »*, 🔴 *« Non validé »* avec motif du refus visible).
        *   Bouton d'ouverture sécurisée du reçu bancaire par URL signée éphémère.
    4. **Espace Conciergerie Agence (`/backoffice/concierge`)** :
        *   Ajout de l'onglet prioritaire **« Paiements à valider (N) »** avec pastille numérique animée signalant instantanément les déclarations en attente.
        *   Tableau dédié permettant de prévisualiser la preuve, de contacter le pèlerin sur WhatsApp en 1 clic, de valider l'encaissement en 1 clic (*« Valider l'encaissement »*), ou de refuser (*« Refuser »*) via une modale de motif obligatoire.
        *   Intégration du suivi dans le tiroir latéral individuel de chaque pèlerin avec statuts colorés, bouton d'accès au justificatif et actions rapides de validation/refus.
*   **Justification** : Répond à la demande utilisateur d'offrir une traçabilité financière totale : les pèlerins peuvent déclarer leurs acomptes/soldes avec preuve pour être rassurés, tandis que l'agence garde le contrôle absolu sur le pointage bancaire avant de marquer le forfait comme payé.
*   **Impacts** :
    *   Fichiers créés : `src/app/dashboard/_components/PaymentManager.tsx`.
    *   Fichiers modifiés : `src/lib/actions/concierge.ts`, `src/lib/actions/logistics.ts`, `src/app/dashboard/page.tsx`, `src/app/backoffice/concierge/page.tsx`, `src/lib/actions/__tests__/payments.test.ts`.
    *   Tests : 38/38 tests Vitest réussis (100% de réussite), compilation TypeScript `tsc --noEmit` à 0 erreur.
*   **Version** : v1.26.0


