# Registre des Activités de Traitement (RGPD) - Mon Omra

**Version :** 1.0 (Lot 6 Readiness)
**DPO Référent :** NOVA-DPO (Squad)
**Date de dernière mise à jour :** 11 Mars 2026

## 1. Finalités du Traitement
Les données sont collectées pour les finalités suivantes :
- **Gestion Logistique** : Réservation de vols, attribution de chambres d'hôtel.
- **Sécurité des Pèlerins** : Communication en temps réel (Broadcast) et alertes SOS.
- **Conformité Légale** : Émission de factures et carnet de voyage.
- **Authentification** : Gestion des accès agence via MFA.

## 2. Catégories de Données Collectées
| Catégorie | Données spécifiques | Finalité |
| :--- | :--- | :--- |
| **Identité** | Nom, Prénom, Genre, Date de naissance | Vol, Hôtel, Visa |
| **Contact** | Email, Téléphone | Notifications, SOS |
| **Logistique** | Numéro de vol, Chambre, Dates de séjour | Organisation |
| **Financier** | Montants payés, Historique des transactions | Facturation |

## 3. Base Légale du Traitement
- **Exécution d'un contrat** : Pour la fourniture des services de voyage.
- **Obligation légale** : Conservation des factures et données de sécurité.
- **Intérêt légitime** : Sécurisation des comptes via MFA.

## 4. Durée de Conservation
| Type de donnée | Durée | Justification |
| :--- | :--- | :--- |
| **Données Pèlerins** | **5 ans** après le retour | Preuve juridique & comptable (Décision Nov 2026) |
| **Logs de Connexion** | 1 an | Sécurité SI |
| **Notifications** | 2 ans | Suivi de l'exécution du service |

## 5. Destinataires des Données
- **Hôtels & Compagnies Aériennes** : Pour les réservations nominatives.
- **Ministère du Hajj (SA)** : Pour la validation des visas (via API agence).
- **Hébergeur Cloud** : Supabase (UE/Francfort).

---
### Exercice des Droits (DSAR)
Les pèlerins peuvent exporter leurs données au format JSON ou demander leur suppression anticipée (sous réserve d'obligations légales) via leur dashboard.
