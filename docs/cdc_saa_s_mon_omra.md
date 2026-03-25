# Cahier des charges — SaaS **Mon Omra**

## 1. Vue d’ensemble

### 1.1 Nom de travail
**Mon Omra** / **Omra Companion**

### 1.2 Nature du produit
Plateforme SaaS B2B2C destinée aux agences Omra/Hajj permettant de centraliser l’information voyage, réduire les questions répétitives, rassurer les pèlerins et améliorer la qualité de service.

### 1.3 Problème à résoudre
Les agences reçoivent un volume élevé de questions répétitives et gèrent une forte charge émotionnelle client avant et pendant le voyage. Les informations sont souvent dispersées entre WhatsApp, PDF, appels, emails et documents papier.

### 1.4 Objectifs produit
- Réduire de 60 à 90 % les questions répétitives.
- Centraliser toutes les informations de voyage dans un dossier unique par pèlerin.
- Réduire le stress et l’incertitude avant départ et sur place.
- Améliorer la transparence perçue sur programme, services et paiements.
- Permettre aux agences de gérer plusieurs groupes depuis un back-office unique.

### 1.5 Cibles
**Clients directs** : agences Omra/Hajj.

**Utilisateurs finaux** :
- pèlerins individuels
- chefs de groupe
- guides accompagnateurs
- opérateurs agence / service client

---

## 2. Périmètre

### 2.1 MVP
Le MVP couvre :
- back-office agence
- espace pèlerin web mobile responsive ou application mobile
- dossier voyage individuel
- gestion groupes
- vols, hôtels, programme, paiements
- documents centralisés
- notifications
- FAQ intelligente non critique
- bouton d’assistance / urgence

### 2.2 Hors MVP
- réservation complète de vols/hôtels dans la plateforme
- paiement carte natif complexe multi-prestataires
- marketplace avancée
- chat temps réel complet entre tous les pèlerins
- offline complexe
- module Hajj complet multi-rites si cela retarde le MVP

### 2.3 Évolutions P1/P2
- application mobile native complète
- chatbot IA enrichi multilingue
- guide religieux interactif
- analytics avancées agence
- upsell services (SIM, transferts, excursions)
- e-signature et contrats avancés

---

## 3. Utilisateurs et rôles

### 3.1 Rôles côté agence
- **Super Admin Agence** : paramétrage global, facturation, utilisateurs, branding.
- **Agent Opérations** : création groupes, import pèlerins, affectation vols/hôtels/programme.
- **Agent Support** : consultation dossiers, envoi notifications, traitement incidents.
- **Guide / Accompagnateur** : accès limité au groupe, planning, listes, assistance terrain.

### 3.2 Rôles côté pèlerin
- **Pèlerin** : accès à son dossier personnel.
- **Chef de famille / payeur** : accès à plusieurs dossiers si autorisé.

---

## 4. Proposition de valeur

### 4.1 Pour l’agence
- moins d’appels et de messages répétitifs
- meilleure organisation opérationnelle
- communication standardisée
- image plus professionnelle
- traçabilité des informations envoyées

### 4.2 Pour le pèlerin
- toutes les informations au même endroit
- compréhension claire du voyage
- sentiment d’accompagnement
- accès simple aux documents et étapes à suivre

---

## 5. Architecture fonctionnelle

Le produit se compose de deux surfaces :

1. **Back-office agence**
2. **Application / portail pèlerin**

### 5.1 Back-office agence
Fonctions principales :
- créer un départ / circuit / groupe
- importer et gérer les pèlerins
- renseigner vols, escales, bagages, check-in
- renseigner hôtels et affectations
- publier programme journalier
- suivre paiements et soldes
- déposer documents
- envoyer notifications ciblées
- gérer FAQ et contenus tutoriels
- visualiser incidents et demandes d’assistance

### 5.2 Portail pèlerin
Fonctions principales :
- consulter le dossier voyage
- voir vols, hôtels, programme, groupe
- accéder aux documents
- suivre les paiements
- recevoir notifications et rappels
- consulter tutoriels / FAQ
- remonter un problème

---

## 6. Parcours utilisateur

### 6.1 Parcours agence
1. Création d’un départ.
2. Création ou import d’un groupe.
3. Ajout des pèlerins.
4. Affectation des vols et hôtels.
5. Publication du programme.
6. Ajout des montants payés/restants.
7. Upload des documents.
8. Envoi d’un accès au pèlerin.
9. Suivi des consultations et incidents.

### 6.2 Parcours pèlerin
1. Réception du lien / code d’accès.
2. Connexion.
3. Vue tableau de bord.
4. Vérification des étapes avant départ.
5. Consultation du vol, programme, hôtel, paiements, documents.
6. Réception de rappels et alertes.
7. Demande d’assistance si nécessaire.

---

## 7. Modules fonctionnels détaillés

## 7.1 Dashboard pèlerin
Le tableau de bord doit afficher immédiatement :
- date de départ
- ville de départ
- numéro de vol principal
- ville d’arrivée
- prochaine étape importante
- résumé programme
- solde restant
- statut visa / documents

### Critères d’acceptation
- le pèlerin voit en moins de 5 secondes les informations clés de son voyage
- le tableau de bord est lisible sur smartphone
- les informations affichées proviennent d’un back-office unique

## 7.2 Module Vols
Contenus :
- segments aller/retour
- horaires
- escales
- terminaux si connus
- politique bagages
- information check-in
- guide “comment faire l’enregistrement”
- consignes Zamzam au retour si applicable

### Critères d’acceptation
- affichage clair du parcours complet
- possibilité d’ajouter un tutoriel ou une vidéo explicative
- distinction visuelle entre inclus et optionnel

## 7.3 Module Hébergements
Contenus :
- hôtel Médine / Makkah
- adresse
- catégorie
- distance estimée / navette
- informations pratiques
- changement hôtel possible selon clause agence

### Critères d’acceptation
- l’agence peut attribuer 1 ou plusieurs hôtels par voyage
- l’utilisateur voit les infos utiles sans ambiguïté

## 7.4 Module Programme
Contenus :
- planning par jour
- heures et lieux de rendez-vous
- visites et déplacements
- changements éventuels publiés par l’agence

### Critères d’acceptation
- programme trié chronologiquement
- mise à jour visible immédiatement côté pèlerin
- historique minimal des modifications importantes

## 7.5 Module Paiement
Contenus :
- prix total
- acompte payé
- reste à payer
- date limite
- options et suppléments
- explication des écarts de prix possibles

### Critères d’acceptation
- séparation claire entre prix de base et options
- historique minimal des encaissements
- pas de stockage de données carte dans la plateforme

## 7.6 Module Documents
Contenus :
- passeport (si copie autorisée)
- visa
- billet
- carte d’embarquement
- contrat
- facture
- autres documents utiles

### Critères d’acceptation
- documents accessibles par l’utilisateur autorisé uniquement
- téléchargement simple sur mobile
- suppression ou expiration gérée selon rétention

## 7.7 Module Checklist avant départ
Exemples :
- passeport valide
- visa reçu
- solde payé
- bagages préparés
- check-in effectué

### Critères d’acceptation
- checklist configurable par l’agence
- visibilité immédiate de l’état d’avancement
- rappel automatisé des éléments non complétés

## 7.8 Module FAQ intelligente
Le système doit proposer :
- FAQ statique organisée par thème
- moteur de recherche simple
- réponses guidées standardisées
- éventuellement couche IA sur base documentaire validée

Questions typiques :
- pourquoi le siège est payant ?
- pourquoi il n’y a pas de bagage inclus ?
- pourquoi l’autre a payé moins ?
- pourquoi l’hôtel a changé ?
- comment récupérer Zamzam ?

### Critères d’acceptation
- les réponses viennent d’une base contrôlée par l’agence
- l’IA ne doit pas inventer d’informations critiques
- redirection vers support humain si confiance faible

## 7.9 Module Tutoriels
Formats :
- texte
- image
- vidéo
- pas-à-pas

Tutoriels minimum :
- faire l’enregistrement en ligne
- imprimer ou récupérer la carte d’embarquement
- comprendre les bagages
- récupérer Zamzam
- déroulement simplifié de la Omra

## 7.10 Module Groupe
Contenus :
- nom ou identifiant du groupe
- nombre de pèlerins
- guide référent
- date de départ
- informations de rassemblement

### Critères d’acceptation
- le pèlerin comprend qu’il fait partie d’un groupe réel
- le guide peut être affiché avec coordonnées selon politique agence

## 7.11 Module Assistance / Urgence
Bouton “J’ai un problème” avec catégories :
- bagage perdu
- problème hôtel
- urgence santé
- retard / perte groupe
- autre

### Critères d’acceptation
- création d’un ticket ou signalement traçable
- routage côté agence
- niveau de priorité visible

## 7.12 Notifications
Canaux MVP :
- push si app mobile
- email
- éventuellement SMS en P1

Exemples :
- visa disponible
- check-in ouvert
- départ dans 3 jours
- rendez-vous lobby 8h
- changement programme

### Critères d’acceptation
- notifications ciblées par groupe ou par pèlerin
- historique des notifications envoyées
- possibilité d’envoi manuel et automatique

---

## 8. Exigences métier clés

### 8.1 Transparence commerciale
Le produit doit intégrer une section explicative obligatoire avant départ :
- bagages inclus / non inclus
- escales possibles
- hôtels équivalents possibles
- variations tarifaires selon options ou date d’achat

### 8.2 Réassurance émotionnelle
Le produit doit rassurer activement :
- ton clair et non technique
- checklist
- groupe visible
- étapes du voyage explicites
- accès rapide à l’aide

### 8.3 Limitation des conflits
Le produit doit réduire les malentendus grâce à :
- informations horodatées
- source unique de vérité
- distinction entre inclus, optionnel et sujet à modification

---

## 9. Exigences non fonctionnelles

### 9.1 Plateformes
- web responsive obligatoire
- mobile natif ou cross-platform en phase 2 ou dès MVP selon budget

### 9.2 Performance
- chargement page principale < 3 secondes sur réseau standard
- documents légers et optimisés

### 9.3 Disponibilité
- cible 99,5 % minimum sur services critiques MVP

### 9.4 Sécurité
- authentification sécurisée
- contrôle d’accès strict par rôle
- protection contre accès au dossier d’un autre pèlerin
- journalisation sans données sensibles inutiles
- chiffrement des données sensibles en transit et au repos si possible

### 9.5 Scalabilité
- architecture capable de gérer plusieurs agences et plusieurs groupes simultanément

### 9.6 Multilingue
- français au MVP
- arabe et anglais en P1 si marché international

---

## 10. Données principales

### 10.1 Données agence
- nom agence
- branding
- utilisateurs internes
- paramètres communication

### 10.2 Données pèlerin
- identité minimale
- coordonnées
- groupe rattaché
- dossier voyage
- documents
- statut paiement
- préférences de notification

### 10.3 Données voyage
- départ
- vols
- hôtels
- programme
- guide
- documents collectifs

### 10.4 Données paiement
- montant total
- acompte
- solde
- échéances
- statut
- historique simplifié

### 10.5 Données support
- tickets
- catégorie
- statut
- priorité
- historique

---

## 11. Modèle SaaS

### 11.1 Multi-tenant
Le système doit permettre plusieurs agences isolées logiquement entre elles.

### 11.2 Branding léger
Chaque agence peut afficher :
- son nom
- son logo
- ses couleurs principales
- ses coordonnées support

### 11.3 Facturation SaaS
Modèles possibles :
- abonnement mensuel agence
- abonnement + coût par pèlerin actif
- essai limité

---

## 12. Intégrations

### 12.1 MVP
- email transactionnel
- stockage documents
- notifications push si mobile

### 12.2 P1
- passerelle SMS
- provider paiement pour règlement du solde
- génération PDF / attestations
- analytics produit

---

## 13. Contraintes paiement

Si paiement en ligne activé :
- utiliser un provider externe (Checkout/SDK)
- ne jamais stocker les données carte
- état du paiement confirmé côté serveur via webhook
- journal minimal des statuts de paiement

---

## 14. Sécurité et conformité

### 14.1 RGPD / protection des données
- minimisation des données
- base légale définie pour chaque usage
- politique de rétention
- possibilité d’export et suppression selon règles applicables
- information utilisateur claire sur finalités

### 14.2 Contrôles sécurité minimum
- gestion des rôles
- contrôle objet anti-IDOR
- rate limiting
- mots de passe robustes ou magic link / OTP selon design retenu
- secrets stockés hors code

---

## 15. Analytics produit

### 15.1 KPIs métier
- nombre de questions support par groupe
- taux de consultation du dashboard
- taux d’ouverture des notifications
- part des documents consultés
- nombre de tickets créés
- temps moyen de résolution

### 15.2 Événements MVP
- connexion utilisateur
- consultation vol
- consultation document
- clic assistance
- check-in checklist complété

---

## 16. User stories MVP

### 16.1 Côté pèlerin
- En tant que pèlerin, je veux voir immédiatement mon départ, mon vol et mon programme afin de me sentir rassuré.
- En tant que pèlerin, je veux accéder à tous mes documents dans un seul espace afin d’éviter les pertes d’information.
- En tant que pèlerin, je veux connaître mon reste à payer afin d’éviter les malentendus.
- En tant que pèlerin, je veux recevoir des rappels importants afin de ne rien oublier.
- En tant que pèlerin, je veux signaler un problème afin d’obtenir de l’aide rapidement.

### 16.2 Côté agence
- En tant qu’agent, je veux créer un groupe et y rattacher des pèlerins afin d’organiser un départ.
- En tant qu’agent, je veux publier les vols, hôtels et programme afin que le pèlerin voie des informations à jour.
- En tant qu’agent, je veux envoyer une notification ciblée afin d’informer rapidement un groupe.
- En tant qu’agent, je veux suivre les soldes et les documents afin d’assurer la préparation du départ.

---

## 17. Priorisation

### P0
- authentification
- gestion agences / groupes / pèlerins
- dashboard pèlerin
- vols
- hôtels
- programme
- paiements simples
- documents
- notifications basiques
- assistance / ticket simple
- FAQ statique

### P1
- tutoriels vidéo
- branding agence
- multilingue
- analytics avancées
- paiement en ligne du solde
- chatbot IA supervisé

### P2
- marketplace services
- recommandation personnalisée
- communauté / social groupe
- intégrations GDS / travel avancées

---

## 18. Stack recommandée

### Option pragmatique faible budget
- Frontend web : Next.js
- Mobile : Flutter ou React Native
- Backend : Supabase / Firebase / Node.js selon complexité
- Base de données : PostgreSQL
- Stockage fichiers : cloud object storage
- Notifications : Firebase Cloud Messaging + email provider
- IA FAQ : base documentaire + LLM avec garde-fous

---

## 19. Planning indicatif

### Phase 1 — cadrage (1 à 2 semaines)
- validation périmètre MVP
- maquettes
- modèle de données
- architecture cible

### Phase 2 — MVP (4 à 8 semaines)
- back-office
- portail pèlerin
- documents
- notifications
- support basique

### Phase 3 — pilote (2 à 4 semaines)
- tests avec 1 à 3 agences
- corrections
- instrumentation analytics

### Phase 4 — industrialisation
- mobile complet
- IA améliorée
- SaaS multi-agences renforcé

---

## 20. Critères de réussite

À 3 mois après lancement pilote :
- baisse mesurable des questions répétitives
- taux de connexion pèlerin > 70 %
- taux d’ouverture notifications > 50 %
- diminution des incidents liés aux documents et au check-in
- satisfaction agence positive

---

## 21. Risques principaux

1. **Promesse marketing floue**
Mitigation : intégrer contenus obligatoires de transparence.

2. **Données sensibles mal gérées**
Mitigation : minimisation + rôles + rétention.

3. **FAQ IA qui invente**
Mitigation : base validée + fallback humain.

4. **Back-office trop complexe dès le départ**
Mitigation : limiter le MVP aux modules critiques.

5. **Adoption faible par les pèlerins âgés ou peu digitaux**
Mitigation : UX ultra simple, gros boutons, parcours guidé, support papier complémentaire si besoin.

---

## 22. Recommandation finale

Le MVP ne doit pas être pensé comme une “application d’information”, mais comme un **outil de gestion des attentes, de réassurance et d’exécution opérationnelle**.

Le bon angle produit est :

**“Chaque pèlerin a un dossier clair, vivant et rassurant, et chaque agence gagne du temps, de la confiance et de la traçabilité.”**

---

## 23. Livrables attendus pour passer en build

Avant développement, il faudra compléter :
- maquettes écran par écran
- modèle de données détaillé
- contrat API
- règles d’authentification
- stratégie documents
- stratégie notifications
- plan de test MVP
- règles RGPD et rétention
- wording exact des messages critiques

