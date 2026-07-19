'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Sparkles, 
  Check, 
  ChevronDown, 
  CheckCircle2, 
  ShieldCheck, 
  Map, 
  ArrowRight, 
  Plane, 
  Hotel, 
  MessageSquare, 
  Heart, 
  Star, 
  Compass, 
  Menu, 
  X, 
  ShieldAlert, 
  Target, 
  CheckCircle,
  HelpCircle,
  Clock,
  Mail
} from 'lucide-react';

export default function LaMethodePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFloatingBtn, setShowFloatingBtn] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    nomPrenom: '',
    telephone: '',
    email: '',
    pays: '',
    ville: '',
    situation: 'Je démarre de zéro',
    offre: 'Formation individuelle — offre fondateur 4 900 € HT',
    budget: 'Moins de 5 000 €',
    delai: 'Dans le mois',
    description: '',
    consent: false
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleScroll = () => {
      // Show floating button after scrolling down 600px
      if (window.scrollY > 600) {
        setShowFloatingBtn(true);
      } else {
        setShowFloatingBtn(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (formErrors[name]) {
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.nomPrenom.trim()) errors.nomPrenom = 'Nom et prénom requis';
    if (!formData.telephone.trim()) errors.telephone = 'Téléphone / WhatsApp requis';
    if (!formData.email.trim()) {
      errors.email = 'E-mail requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Adresse e-mail invalide';
    }
    if (!formData.pays.trim()) errors.pays = 'Pays de résidence requis';
    if (!formData.ville.trim()) errors.ville = 'Ville requise';
    if (!formData.description.trim()) errors.description = 'Description de votre projet requise';
    if (!formData.consent) errors.consent = 'Vous devez accepter les conditions pour continuer';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getWhatsAppLink = () => {
    const text = `Bonjour, je souhaite postuler au programme *La Méthode OMRAYANAIR* :
- *Nom/Prénom* : ${formData.nomPrenom}
- *Téléphone* : ${formData.telephone}
- *E-mail* : ${formData.email}
- *Résidence* : ${formData.ville}, ${formData.pays}
- *Situation* : ${formData.situation}
- *Offre envisagée* : ${formData.offre}
- *Budget de lancement* : ${formData.budget}
- *Délai souhaité* : ${formData.delai}
- *Projet* : ${formData.description}`;
    return `https://wa.me/33752280890?text=${encodeURIComponent(text)}`;
  };

  const getEmailLink = () => {
    const subject = `Candidature Programme d'Incubation - ${formData.nomPrenom}`;
    const body = `Bonjour,\n\nVoici ma candidature pour le programme La Méthode OMRAYANAIR :\n\n` +
      `- Nom & Prénom : ${formData.nomPrenom}\n` +
      `- Téléphone : ${formData.telephone}\n` +
      `- E-mail : ${formData.email}\n` +
      `- Résidence : ${formData.ville}, ${formData.pays}\n` +
      `- Situation actuelle : ${formData.situation}\n` +
      `- Offre choisie : ${formData.offre}\n` +
      `- Budget estimé : ${formData.budget}\n` +
      `- Délai de lancement : ${formData.delai}\n\n` +
      `Description du projet :\n${formData.description}\n\n` +
      `Je confirme avoir pris connaissance des conditions d'accompagnement.`;
    return `mailto:omrayanair@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      window.open(getWhatsAppLink(), '_blank');
    } else {
      const firstError = Object.keys(formErrors)[0];
      const element = document.getElementsByName(firstError)[0];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleEmailSubmit = () => {
    if (validateForm()) {
      window.location.href = getEmailLink();
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  const faqs = [
    {
      q: "La formation est-elle disponible en vidéo ?",
      a: "Non. La méthode est transmise uniquement en présentiel afin de préserver la confidentialité, la qualité de l’accompagnement et la personnalisation du travail."
    },
    {
      q: "Comment fonctionne l’offre réservée aux cinq premiers inscrits ?",
      a: "Les cinq premières inscriptions validées après entretien bénéficient des tarifs fondateurs. L’inscription est considérée comme confirmée après acceptation du dossier et règlement de l’acompte prévu."
    },
    {
      q: "La création de l’entreprise est-elle incluse ?",
      a: "L’accompagnement à la création est inclus dans certaines formules. Les frais d’immatriculation, honoraires juridiques, comptables, bancaires, assurances, licences et autorisations restent séparés selon le pays."
    },
    {
      q: "Est-ce que je peux créer une société en France, aux États-Unis, aux Émirats ou en Arabie Saoudite ?",
      a: "Plusieurs options peuvent être étudiées, mais le choix dépend de votre résidence, de vos clients, du lieu d’encaissement, de votre activité et des autorisations nécessaires. Aucun pays ne doit être présenté comme une solution universelle."
    },
    {
      q: "Est-ce que la création d’une société suffit pour vendre des voyages ?",
      a: "Non. La création d’une entreprise ne signifie pas automatiquement que cette entreprise peut vendre des billets, des forfaits touristiques ou certaines prestations réglementées. Le modèle doit être validé selon la législation applicable."
    },
    {
      q: "Les billets et l’hébergement en Arabie Saoudite sont-ils inclus ?",
      a: "Non, sauf proposition écrite spécifique. Les frais de déplacement, d’hôtel, de visa, de repas et les dépenses personnelles sont normalement à la charge du participant."
    },
    {
      q: "Le programme garantit-il des revenus ?",
      a: "Non. Le programme fournit une méthode, des outils, des contacts, des procédures et un accompagnement. Les résultats dépendent du marché, du budget, de la réglementation, de la qualité d’exécution et de la capacité commerciale du participant."
    },
    {
      q: "Puis-je utiliser ma propre marque ?",
      a: "Oui. Le programme est précisément conçu pour vous permettre de développer une activité indépendante sous votre propre nom."
    },
    {
      q: "Vais-je devoir acheter mes hôtels ou mes prestations auprès d’OMRAYANAIR ?",
      a: "Non. L’objectif est de vous mettre en relation avec des fournisseurs et de vous apprendre à travailler directement avec eux."
    },
    {
      q: "Est-ce que la plateforme est gratuite à vie ?",
      a: "Non. Les outils numériques peuvent être inclus pendant une période définie selon la formule, puis proposés sous forme d’abonnement pour l’hébergement, la maintenance, le support et les mises à jour."
    }
  ];

  return (
    <div className="min-h-screen bg-[#07090C] text-[#F6F3EB] font-sans selection:bg-[#D8AA4D]/30 relative overflow-x-hidden">
      
      {/* SEO structured data script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOccupationalProgram",
            "name": "La Méthode OMRAYANAIR",
            "description": "Programme présentiel pour créer, structurer et lancer votre propre conciergerie Omra avec fournisseurs, site internet, outils de gestion, stratégie TikTok et immersion en Arabie Saoudite.",
            "provider": {
              "@type": "Organization",
              "name": "OMRAYANAIR",
              "logo": "https://omrayanair.vercel.app/logo.png"
            },
            "programPrerequisites": "Projet entrepreneurial sérieux, capacité d'investissement",
            "educationalCredentialAwarded": "Autonomie dans la création et gestion de Conciergerie Omra"
          })
        }}
      />

      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#D8AA4D]/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-[#D8AA4D]/5 blur-[120px] rounded-full" />
      </div>

      {/* 1. Promotional Bar */}
      <div className="relative z-50 bg-gradient-to-r from-[#0d1117] via-[#1a140a] to-[#0d1117] border-b border-[#D8AA4D]/20 py-3 px-6 text-center flex items-center justify-center gap-3 flex-wrap">
        <span className="bg-[#D8AA4D]/25 border border-[#D8AA4D] text-[#F2CE79] text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
          5 PLACES SEULEMENT
        </span>
        <p className="text-xs md:text-sm font-semibold text-[#A8B0BC] tracking-wide m-0">
          OFFRE FONDATEUR — Tarifs promotionnels réservés aux cinq premiers inscrits
        </p>
      </div>

      {/* 2. Navigation */}
      <nav className="sticky top-0 z-40 bg-[#07090C]/90 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image 
              src="/app-logo.png" 
              alt="OMRAYANAIR Logo" 
              width={34} 
              height={34} 
              className="rounded-lg object-contain border border-white/10" 
            />
            <span className="text-lg font-black tracking-tighter uppercase text-white">
              OMRA<span className="text-[#D8AA4D]">YANAIR</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-[#A8B0BC]">
            <button onClick={() => scrollToSection('home')} className="hover:text-white transition-colors">La Méthode</button>
            <button onClick={() => scrollToSection('details')} className="hover:text-white transition-colors">Programme</button>
            <button onClick={() => scrollToSection('parcours')} className="hover:text-white transition-colors">Parcours</button>
            <button onClick={() => scrollToSection('offres')} className="hover:text-white transition-colors">Offres</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors">FAQ</button>
          </div>

          <div className="hidden md:block">
            <button 
              onClick={() => scrollToSection('candidature')}
              className="bg-[#D8AA4D] hover:bg-[#F2CE79] text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(216,170,77,0.15)]"
            >
              Présenter mon projet
            </button>
          </div>

          {/* Mobile Menu Btn */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#A8B0BC] hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#07090C] border-b border-white/5 py-6 px-6 flex flex-col gap-5 text-left text-xs font-bold uppercase tracking-wider text-[#A8B0BC] animate-in fade-in slide-in-from-top-4 duration-200">
            <button onClick={() => scrollToSection('home')} className="hover:text-white py-2 text-left">La Méthode</button>
            <button onClick={() => scrollToSection('details')} className="hover:text-white py-2 text-left">Programme</button>
            <button onClick={() => scrollToSection('parcours')} className="hover:text-white py-2 text-left">Parcours</button>
            <button onClick={() => scrollToSection('offres')} className="hover:text-white py-2 text-left">Offres</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-white py-2 text-left">FAQ</button>
            <button 
              onClick={() => scrollToSection('candidature')}
              className="w-full bg-[#D8AA4D] text-black py-4 rounded-xl text-center font-black tracking-widest mt-2"
            >
              Présenter mon projet
            </button>
          </div>
        )}
      </nav>

      {/* 3. Hero Section */}
      <header id="home" className="relative z-10 pt-20 pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D8AA4D]/10 border border-[#D8AA4D]/25 text-[#F2CE79] text-[9px] font-black uppercase tracking-[0.2em]">
              <Sparkles className="w-3.5 h-3.5" />
              Incubateur de Conciergerie Omra
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[0.95] uppercase text-white">
              Créez votre propre <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D8AA4D] to-[#F2CE79]">conciergerie Omra</span> <br />
              autonome.
            </h1>
            <p className="text-sm sm:text-base text-[#A8B0BC] font-medium leading-relaxed max-w-2xl">
              Une méthode complète pour structurer votre entreprise, construire vos formules, travailler directement avec les prestataires en Arabie Saoudite et développer votre clientèle sans dépendre d’un intermédiaire.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => scrollToSection('candidature')}
                className="bg-[#D8AA4D] text-black px-8 py-4.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#F2CE79] transition-all shadow-[0_5px_25px_rgba(216,170,77,0.2)] flex items-center justify-center gap-3 group"
              >
                Présenter mon projet
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => scrollToSection('details')}
                className="bg-[#11161D] border border-white/10 hover:bg-[#1a212b] px-8 py-4.5 rounded-xl text-xs font-black uppercase tracking-widest text-[#F6F3EB] transition-all flex items-center justify-center"
              >
                Découvrir le programme
              </button>
            </div>

            {/* Three short proofs */}
            <div className="pt-8 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              {[
                { label: "100 % présentiel", desc: "Immersion et travail direct" },
                { label: "Accompagnement personnalisé", desc: "Adapté à votre profil" },
                { label: "Réseau pro en Arabie", desc: "Accès fournisseurs directs" }
              ].map((p, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#29B36A] shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-white">{p.label}</span>
                  </div>
                  <p className="text-[9px] text-[#A8B0BC] font-medium pl-6">{p.desc}</p>
                </div>
              ))}
            </div>

            {/* Illustration Hero */}
            <div className="relative w-full h-48 sm:h-60 rounded-2xl overflow-hidden border border-white/10 mt-8 shadow-2xl">
              <Image 
                src="/methode-hero.png" 
                alt="Illustration La Méthode OMRAYANAIR" 
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090C] via-transparent to-transparent" />
            </div>
          </div>

          {/* Right Cards */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-[#11161D] border border-[#D8AA4D]/30 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D8AA4D]/5 blur-[50px] rounded-full pointer-events-none" />
              
              <div className="space-y-6">
                <div>
                  <span className="bg-[#D8AA4D]/15 text-[#F2CE79] border border-[#D8AA4D]/20 text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider inline-block mb-3">
                    Formation individuelle en présentiel
                  </span>
                  <h3 className="text-xl font-black uppercase tracking-tight text-white">Offre Fondateur</h3>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-[#F2CE79]">4 900 € HT</span>
                  <span className="text-sm font-semibold text-[#A8B0BC] line-through">6 900 € HT</span>
                </div>
                <p className="text-[10px] text-[#A8B0BC] font-medium leading-relaxed italic">
                  * Tarif fondateur réservé aux cinq premiers inscrits
                </p>

                <div className="pt-6 border-t border-white/5 space-y-4">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Éléments clés inclus :</h4>
                  <ul className="space-y-2.5 text-xs text-[#A8B0BC] font-medium">
                    {[
                      "Construction de votre première formule",
                      "Vols, hôtels, transports et guides",
                      "Calcul des coûts et de la rentabilité",
                      "TikTok et intelligence artificielle appliquée",
                      "Accompagnement après la formation"
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[#D8AA4D] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => scrollToSection('candidature')}
                  className="w-full bg-[#D8AA4D] hover:bg-[#F2CE79] text-black py-4.5 rounded-xl text-center text-xs font-black uppercase tracking-widest transition-all mt-4"
                >
                  Postuler au programme
                </button>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* 4. Bandeau des quatre engagements */}
      <section className="bg-[#0d1117] border-y border-white/5 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: "100 % présentiel",
              desc: "Pas de formation vidéo diffusée ou partageable. Un échange confidentiel et direct."
            },
            {
              title: "Autonomie totale",
              desc: "Vous conservez vos clients, vos fournisseurs et l'intégralité de vos marges."
            },
            {
              title: "Sur mesure",
              desc: "Le projet est adapté à votre pays de résidence, votre budget et votre clientèle."
            },
            {
              title: "Terrain réel",
              desc: "Une méthode issue d'une véritable expérience d'exploitation et de négociation en Arabie."
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-[#11161D]/50 border border-white/5 p-8 rounded-2xl space-y-3">
              <span className="text-[#D8AA4D] font-black text-xs uppercase tracking-widest block">0{idx + 1} // {item.title}</span>
              <p className="text-xs text-[#A8B0BC] font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Section « Bien plus qu’une formation » */}
      <section id="details" className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D8AA4D]">MÉTHODOLOGIE ET STRUCTURE</span>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
            Bien plus qu'une formation théorique
          </h2>
          <p className="text-sm text-[#A8B0BC] font-medium max-w-2xl mx-auto">
            Vous repartez avec une méthode, une offre structurée, un environnement professionnel et un plan de lancement concret.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Création & Structuration",
              items: [
                "Choix du pays d'implantation",
                "Accompagnement à la création d'entreprise",
                "Comptes bancaires & Passerelles de paiement",
                "Organisation administrative & Facturation",
                "Assurance et obligations professionnelles"
              ],
              note: "Note: Les prestations juridiques et réglementées doivent être réalisées ou validées par des professionnels habilités."
            },
            {
              title: "Construction des Formules",
              items: [
                "Négociation vols low cost & réguliers",
                "Sélection & Réservation d'hôtels",
                "Planification des transferts terrestres",
                "Choix des guides & Visites historiques",
                "Calcul des marges & Seuil de rentabilité",
                "Gestion des imprévus terrain"
              ]
            },
            {
              title: "Réseau en Arabie Saoudite",
              items: [
                "Services de réservation d'hôtels",
                "Responsables commerciaux locaux",
                "Transporteurs officiels certifiés",
                "Guides locaux francophones",
                "Accompagnateurs de confiance sur place",
                "Lieux de visites exclusifs"
              ]
            },
            {
              title: "Gestion des Pèlerins",
              items: [
                "Suivi des passeports et visas",
                "Gestion des dossiers & Paiements",
                "Affectation des chambres (rooming)",
                "Gestion des vols & Segments logistiques",
                "Communication client & Gestion d'incidents"
              ]
            },
            {
              title: "Marketing TikTok & IA",
              items: [
                "Création de flyers professionnels",
                "Scripts vidéos TikTok persuasifs",
                "Acquisition organique et publicité",
                "Calendrier éditorial & Création de contenu",
                "Automatisation WhatsApp & IA appliquée"
              ]
            },
            {
              title: "Écosystème Numérique",
              items: [
                "Nom de domaine & E-mails professionnels",
                "Site internet sur mesure personnalisé",
                "Plateforme de gestion client pèlerins",
                "Logiciel de facturation intégré",
                "Boutique en ligne & Paiement sécurisé"
              ]
            }
          ].map((card, idx) => (
            <div key={idx} className="bg-[#11161D] border border-white/5 p-8 rounded-[2rem] flex flex-col justify-between space-y-6 hover:border-[#D8AA4D]/20 transition-all shadow-sm">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D8AA4D]/10 flex items-center justify-center border border-[#D8AA4D]/25">
                    <Target className="w-4 h-4 text-[#D8AA4D]" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white">{card.title}</h3>
                </div>
                <ul className="space-y-2 text-xs text-[#A8B0BC] font-medium">
                  {card.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className="w-3.5 h-3.5 text-[#29B36A] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {card.note && (
                <p className="text-[9px] text-[#A8B0BC] font-medium opacity-60 leading-relaxed italic border-t border-white/5 pt-4 m-0">
                  {card.note}
                </p>
              )}
            </div>
          ))}
          {/* Banner Réseau */}
          <div className="relative w-full h-64 md:h-96 rounded-[3rem] overflow-hidden border border-[#D8AA4D]/25 shadow-2xl mt-16">
            <Image 
              src="/methode-network.png" 
              alt="Réseau professionnel en Arabie Saoudite" 
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-left">
              <span className="bg-[#D8AA4D] text-black text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider inline-block mb-3">
                RÉSEAU EXCLUSIF
              </span>
              <h3 className="text-xl md:text-3xl font-black uppercase text-white m-0">Négociez directement avec les acteurs locaux</h3>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section « Le parcours » */}
      <section id="parcours" className="bg-[#0d1117] border-y border-white/5 py-24 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D8AA4D]">ÉTAPES DU PROJET</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
              De l’idée à la première commercialisation
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Audit du projet",
                items: ["Analyse pays de départ", "Définition budget & cibles", "Expérience et objectifs", "Choix du modèle économique"]
              },
              {
                step: "02",
                title: "Formation présentielle",
                items: ["Transmission de la méthode", "Exercices pratiques", "Construction de votre offre", "Stratégie commerciale"]
              },
              {
                step: "03",
                title: "Mise en place",
                items: ["Création structurelle", "Connexion fournisseurs", "Configuration site & outils", "Création des supports marketing"]
              },
              {
                step: "04",
                title: "Lancement supervisé",
                items: ["Validation de la rentabilité", "Campagne TikTok & Flyers", "Première acquisition client", "Suivi quotidien du lancement"]
              }
            ].map((step, idx) => (
              <div key={idx} className="bg-[#11161D] border border-white/5 p-8 rounded-[2rem] space-y-6 relative overflow-hidden group">
                <span className="text-7xl font-black text-[#D8AA4D]/5 group-hover:text-[#D8AA4D]/10 transition-colors absolute top-2 right-4 pointer-events-none">
                  {step.step}
                </span>
                <div className="space-y-4 pt-4 relative z-10">
                  <h3 className="text-lg font-black uppercase tracking-tighter text-white">{step.title}</h3>
                  <ul className="space-y-2 text-xs text-[#A8B0BC] font-medium">
                    {step.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D8AA4D]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Section « Les trois offres » */}
      <section id="offres" className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D8AA4D]">FORMULES D'ACCOMPAGNEMENT</span>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
            Trois offres adaptées à vos ambitions
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Offre 1 */}
          <div className="bg-[#11161D] border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-between space-y-8 relative overflow-hidden">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-[#D8AA4D] uppercase tracking-widest bg-[#D8AA4D]/10 px-3 py-1 rounded-md border border-[#D8AA4D]/20">
                  Apprendre
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white">Formation Individuelle</h3>
                <p className="text-[10px] text-[#A8B0BC] font-medium mt-1">Transmission pure de la méthode d'exploitation.</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#F2CE79]">4 900 € HT</span>
                  <span className="text-xs font-semibold text-[#A8B0BC] line-through">6 900 € HT</span>
                </div>
                <p className="text-[9px] text-[#A8B0BC] font-medium italic">Tarif fondateur réservé aux 5 premiers inscrits</p>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Inclus :</h4>
                <ul className="space-y-2 text-xs text-[#A8B0BC] font-medium">
                  {["Formation présentielle individuelle", "Construction de la 1ère formule", "Vols, Hôtels, Transports, Guides", "Calcul de rentabilité", "Gestion des pèlerins", "Marketing TikTok & IA appliquée", "Modèles & procédures types", "30 jours d'accompagnement limité"].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="w-3.5 h-3.5 text-[#29B36A] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/5">
                <h4 className="text-[9px] font-black text-[#A8B0BC] uppercase tracking-widest opacity-60">Non Inclus :</h4>
                <p className="text-[9px] text-[#A8B0BC]/60 font-medium leading-relaxed">
                  Frais de création d'entreprise, site internet, frais juridiques, abonnements logiciels, déplacements en Arabie Saoudite.
                </p>
              </div>
            </div>

            <button 
              onClick={() => {
                setFormData(prev => ({ ...prev, offre: 'Formation individuelle — offre fondateur 4 900 € HT' }));
                scrollToSection('candidature');
              }}
              className="w-full bg-[#11161D] border border-white/10 hover:bg-[#1a212b] py-4 rounded-xl text-center text-xs font-black uppercase tracking-widest text-white transition-all mt-4"
            >
              Choisir cette formule
            </button>
          </div>

          {/* Offre 2 (Recommandée) */}
          <div className="bg-[#11161D] border-2 border-[#D8AA4D] p-8 rounded-[2.5rem] flex flex-col justify-between space-y-8 relative overflow-hidden shadow-[0_15px_40px_rgba(216,170,77,0.1)]">
            <div className="absolute top-0 right-0 bg-[#D8AA4D] text-black text-[9px] font-black uppercase tracking-widest py-1.5 px-6 rounded-bl-2xl">
              Recommandé
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-[#D8AA4D] uppercase tracking-widest bg-[#D8AA4D]/10 px-3 py-1 rounded-md border border-[#D8AA4D]/20">
                  Prêt à lancer
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white">Conciergerie Clé en Main</h3>
                <p className="text-[10px] text-[#A8B0BC] font-medium mt-1">Méthode + tous vos outils numériques prêts à l'emploi.</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#F2CE79]">8 900 € HT</span>
                  <span className="text-xs font-semibold text-[#A8B0BC] line-through">11 900 € HT</span>
                </div>
                <p className="text-[9px] text-[#A8B0BC] font-medium italic">Tarif fondateur réservé aux 5 premiers inscrits</p>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Inclus :</h4>
                <ul className="space-y-2 text-xs text-[#A8B0BC] font-medium">
                  {["Tout le contenu individuel", "Accompagnement création entreprise", "Coordination partenaires concernés", "Nom de domaine & E-mails pro", "Site internet personnalisé & hébergé", "Plateforme de gestion pèlerins", "Logiciel de facturation", "Boutique en ligne configurée", "Kit de communication initial", "Accompagnement 1ère campagne TikTok", "60 jours de suivi complet"].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="w-3.5 h-3.5 text-[#29B36A] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/5">
                <h4 className="text-[9px] font-black text-[#A8B0BC] uppercase tracking-widest opacity-60">Non Inclus :</h4>
                <p className="text-[9px] text-[#A8B0BC]/60 font-medium leading-relaxed">
                  Frais administratifs, juridiques, fiscaux, bancaires, licences locales, assurances professionnelles et déplacements.
                </p>
              </div>
            </div>

            <button 
              onClick={() => {
                setFormData(prev => ({ ...prev, offre: 'Conciergerie prête à lancer — offre fondateur 8 900 € HT' }));
                scrollToSection('candidature');
              }}
              className="w-full bg-[#D8AA4D] hover:bg-[#F2CE79] text-black py-4.5 rounded-xl text-center text-xs font-black uppercase tracking-widest transition-all mt-4"
            >
              Demander un entretien
            </button>
          </div>

          {/* Offre 3 */}
          <div className="bg-[#11161D] border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-between space-y-8 relative overflow-hidden">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-[#D8AA4D] uppercase tracking-widest bg-[#D8AA4D]/10 px-3 py-1 rounded-md border border-[#D8AA4D]/20">
                  S'implanter
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white">Immersion Arabie Saoudite</h3>
                <p className="text-[10px] text-[#A8B0BC] font-medium mt-1">Pack clé en main + constitution physique de votre réseau.</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#F2CE79]">13 900 € HT</span>
                  <span className="text-xs font-semibold text-[#A8B0BC] line-through">16 900 € HT</span>
                </div>
                <p className="text-[9px] text-[#A8B0BC] font-medium italic">Tarif fondateur réservé aux 5 premiers inscrits</p>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Inclus :</h4>
                <ul className="space-y-2 text-xs text-[#A8B0BC] font-medium">
                  {["Tout le pack Conciergerie prête à lancer", "Mission pro en Arabie Saoudite", "Visites guidées d'hôtels partenaires", "Rendez-vous services réservation", "Rencontres responsables commerciaux", "Négociations transporteurs & guides", "Découverte des lieux d'excursion", "Constitution physique du réseau local", "Préparation du catalogue de tarifs", "90 jours d'accompagnement"].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="w-3.5 h-3.5 text-[#29B36A] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/5">
                <h4 className="text-[9px] font-black text-[#A8B0BC] uppercase tracking-widest opacity-60">Non Inclus :</h4>
                <p className="text-[9px] text-[#A8B0BC]/60 font-medium leading-relaxed">
                  Billets d'avion, visas, hôtels, repas et dépenses personnelles du participant en Arabie Saoudite (sauf accord écrit).
                </p>
              </div>
            </div>

            <button 
              onClick={() => {
                setFormData(prev => ({ ...prev, offre: 'Premium avec immersion — offre fondateur 13 900 € HT' }));
                scrollToSection('candidature');
              }}
              className="w-full bg-[#11161D] border border-white/10 hover:bg-[#1a212b] py-4 rounded-xl text-center text-xs font-black uppercase tracking-widest text-white transition-all mt-4"
            >
              Présenter mon projet
            </button>
          </div>

        </div>
      </section>

      {/* 8. Section « Notre engagement » */}
      <section className="bg-[#0d1117] border-y border-white/5 py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <span className="text-[10px] font-black text-[#D8AA4D] uppercase tracking-widest bg-[#D8AA4D]/10 px-3 py-1 rounded-md border border-[#D8AA4D]/20 inline-block">
            NOTRE PHILOSOPHIE
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
            Vous rendre autonome, pas dépendant.
          </h2>
          <p className="text-sm text-[#A8B0BC] font-medium leading-relaxed max-w-2xl mx-auto">
            Vous ne devenez pas un simple revendeur OMRAYANAIR sous commission. Vous développez votre propre marque, vos propres formules exclusives et votre propre portefeuille de fournisseurs directs en Arabie Saoudite.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-8">
            {[
              "Vous conservez vos clients",
              "Vous négociez vos propres tarifs",
              "Vous fixez vos propres marges",
              "Vous contrôlez vos propres données"
            ].map((pt, idx) => (
              <div key={idx} className="bg-[#11161D] border border-white/5 p-6 rounded-2xl flex items-center justify-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#29B36A] shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-white">{pt}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Section « Ce programme n’est pas pour tout le monde » */}
      <section className="py-24 px-6 max-w-5xl mx-auto text-center space-y-12">
        <div className="bg-red-500/[0.02] border border-red-500/10 p-10 md:p-16 rounded-[3rem] space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
            Ce programme n’est pas adapté à tout le monde.
          </h2>
          <p className="text-sm text-[#A8B0BC] leading-relaxed max-w-3xl mx-auto font-medium">
            Organiser une Omra ne consiste pas seulement à acheter des billets d'avion et réserver des hôtels. Vous gérez l'argent, les documents officiels, le voyage et parfois les difficultés de vraies personnes. Ce programme s'adresse uniquement à des porteurs de projet sérieux.
          </p>

          <div className="pt-8 border-t border-white/5 text-left grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              "Avoir un projet entrepreneurial concret",
              "Volonté de créer une véritable activité pérenne",
              "Disponibilité pour suivre la formation en présentiel",
              "Capacité financière à investir dans son lancement",
              "Avoir un sens élevé des responsabilités humaines",
              "Respecter strictement les obligations juridiques et pro",
              "Aptitude à travailler avec de vrais clients",
              "Refus absolu de la recherche d'argent facile et passif"
            ].map((crit, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs text-[#A8B0BC] font-medium">
                <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span>{crit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Section « La formation en intelligence artificielle » */}
      <section className="bg-[#0d1117] border-y border-white/5 py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-6 text-left">
            <span className="text-[10px] font-black text-[#D8AA4D] uppercase tracking-widest bg-[#D8AA4D]/10 px-3 py-1 rounded-md border border-[#D8AA4D]/20 inline-block">
              INTELLIGENCE ARTIFICIELLE
            </span>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white leading-tight">
              Utilisez l’IA pour gagner du temps, pas pour déléguer votre responsabilité.
            </h2>
            <p className="text-xs text-[#A8B0BC] font-medium leading-relaxed">
              L'IA est un assistant extraordinaire pour accélérer votre développement, mais elle ne remplace pas la vérification humaine. Nous vous apprenons à l'utiliser de manière responsable et structurée.
            </p>
            <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-2xl text-[10px] text-[#A8B0BC] font-medium italic leading-relaxed">
              ⚠️ Rappel : L'IA doit rester un outil d'assistance. Les informations juridiques, religieuses, financières et opérationnelles critiques doivent être validées manuellement.
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#11161D] border border-white/5 p-8 rounded-[2.5rem] grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Rédiger des annonces impactantes",
              "Préparer des scripts vidéos TikTok",
              "Créer des flyers professionnels",
              "Structurer des messages WhatsApp pro",
              "Traduire des contenus commerciaux",
              "Organiser son calendrier éditorial",
              "Calculer des offres tarifaires complexes",
              "Structurer des formules logistiques",
              "Créer et formater des documents types",
              "Analyser les retours et avis clients",
              "Préparer des FAQ exhaustives",
              "Améliorer la présentation de sa marque"
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-[#07090C]/50 rounded-xl border border-white/5">
                <CheckCircle2 className="w-4 h-4 text-[#D8AA4D] shrink-0" />
                <span className="text-[11px] font-semibold text-[#A8B0BC]">{item}</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 11. Section « L’écosystème numérique » */}
      <section className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D8AA4D]">OUTILS TECHNIQUES CLÉS</span>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
            Un écosystème numérique sur mesure
          </h2>
          <p className="text-sm text-[#A8B0BC] font-medium max-w-2xl mx-auto">
            Les outils digitaux indispensables configurés et personnalisés sous votre propre marque.
          </p>
        </div>

        {/* Banner Écosystème Numérique */}
        <div className="relative w-full h-64 md:h-96 rounded-[3rem] overflow-hidden border border-[#D8AA4D]/20 shadow-2xl mb-12">
          <Image 
            src="/methode-ecosystem.png" 
            alt="Écosystème numérique OMRAYANAIR" 
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-left">
            <span className="bg-[#D8AA4D] text-black text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider inline-block mb-3">
              TECHNOLOGIE INTÉGRÉE
            </span>
            <h3 className="text-xl md:text-3xl font-black uppercase text-white m-0">Pilotez votre activité avec nos solutions logicielles</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Outil 1 */}
          <div className="bg-[#11161D] border border-white/5 p-8 rounded-[2rem] space-y-6">
            <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-3">
              <Compass className="w-5 h-5 text-[#D8AA4D]" /> Site Internet
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#A8B0BC] font-medium">
              {["Présentation conciergerie", "Affichage des départs", "Formulaire de contact", "Redirection WhatsApp direct", "Témoignages clients", "Accès Espace Pèlerin", "Accès à la boutique"].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#29B36A] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Outil 2 */}
          <div className="bg-[#11161D] border border-white/5 p-8 rounded-[2rem] space-y-6">
            <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#D8AA4D]" /> Plateforme de Gestion des Pèlerins
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#A8B0BC] font-medium">
              {["Dossiers & documents", "Paiements & échéances", "Hôtels & Rooming", "Vols & Transferts terrestres", "Bagages & Groupes", "Gestion des incidents", "Historique de voyage"].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#29B36A] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Outil 3 */}
          <div className="bg-[#11161D] border border-white/5 p-8 rounded-[2rem] space-y-6">
            <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-[#D8AA4D]" /> Logiciel de Facturation
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#A8B0BC] font-medium">
              {["Devis & Factures pro", "Gestion des acomptes", "Reçus automatiques", "Suivi des échéanciers", "Avoirs & Remboursements", "Suivi des impayés", "Statistiques financières"].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#29B36A] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Outil 4 */}
          <div className="bg-[#11161D] border border-white/5 p-8 rounded-[2rem] space-y-6">
            <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-3">
              <Hotel className="w-5 h-5 text-[#D8AA4D]" /> Boutique en Ligne (Add-ons)
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#A8B0BC] font-medium">
              {["Bagages en soute extra", "Options petit-déjeuner", "Transferts privés VIP", "Excursions & visites", "Cartes SIM locales", "Miel, Dattes, Huiles d'Arabie", "Accessoires de voyage"].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#29B36A] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
        <p className="text-[10px] text-[#A8B0BC] text-center font-medium opacity-65 leading-relaxed italic max-w-2xl mx-auto">
          * Chaque conciergerie est l'unique responsable juridique et commerciale de ses ventes, encaissements, paiements, remboursements et obligations auprès de ses clients.
        </p>
      </section>

      {/* 12. FAQ Section */}
      <section id="faq" className="bg-[#0d1117] border-y border-white/5 py-24 px-6">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D8AA4D]">FAQ</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
              Questions Fréquentes
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-[#11161D] border border-white/5 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center text-left p-6 text-white font-bold hover:text-[#D8AA4D] transition-colors gap-4"
                >
                  <span className="text-sm sm:text-base uppercase tracking-tight">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#A8B0BC] shrink-0 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180 text-[#D8AA4D]' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-[#A8B0BC] font-medium leading-relaxed border-t border-white/5 pt-4 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 13. Formulaire de candidature */}
      <section id="candidature" className="py-24 px-6 max-w-4xl mx-auto space-y-16">
        <div className="text-center space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D8AA4D]">CANDIDATURE</span>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white">
            Présentez votre projet
          </h2>
          <p className="text-sm text-[#A8B0BC] font-medium">
            Remplissez ce formulaire d'admission pour planifier votre entretien de qualification.
          </p>
        </div>

        <form onSubmit={handleWhatsAppSubmit} className="bg-[#11161D] border border-[#D8AA4D]/25 p-8 sm:p-12 rounded-[2.5rem] space-y-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Nom / Prénom */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#A8B0BC]">Nom et Prénom *</label>
              <input 
                type="text" 
                name="nomPrenom"
                value={formData.nomPrenom}
                onChange={handleInputChange}
                className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-3.5 text-[#F6F3EB] text-sm focus:border-[#D8AA4D] outline-none transition-colors"
                placeholder="Ex: Sofiane Lamkhannet"
              />
              {formErrors.nomPrenom && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{formErrors.nomPrenom}</p>}
            </div>

            {/* Téléphone / WhatsApp */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#A8B0BC]">Téléphone / WhatsApp *</label>
              <input 
                type="text" 
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-3.5 text-[#F6F3EB] text-sm focus:border-[#D8AA4D] outline-none transition-colors"
                placeholder="Ex: +33 6 12 34 56 78"
              />
              {formErrors.telephone && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{formErrors.telephone}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#A8B0BC]">E-mail *</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-3.5 text-[#F6F3EB] text-sm focus:border-[#D8AA4D] outline-none transition-colors"
                placeholder="Ex: exemple@site.com"
              />
              {formErrors.email && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{formErrors.email}</p>}
            </div>

            {/* Pays */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#A8B0BC]">Pays de résidence *</label>
              <input 
                type="text" 
                name="pays"
                value={formData.pays}
                onChange={handleInputChange}
                className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-3.5 text-[#F6F3EB] text-sm focus:border-[#D8AA4D] outline-none transition-colors"
                placeholder="Ex: France"
              />
              {formErrors.pays && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{formErrors.pays}</p>}
            </div>

            {/* Ville */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#A8B0BC]">Ville *</label>
              <input 
                type="text" 
                name="ville"
                value={formData.ville}
                onChange={handleInputChange}
                className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-3.5 text-[#F6F3EB] text-sm focus:border-[#D8AA4D] outline-none transition-colors"
                placeholder="Ex: Paris"
              />
              {formErrors.ville && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{formErrors.ville}</p>}
            </div>

            {/* Situation actuelle */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#A8B0BC]">Situation Actuelle *</label>
              <select 
                name="situation"
                value={formData.situation}
                onChange={handleInputChange}
                className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-3.5 text-[#F6F3EB] text-sm focus:border-[#D8AA4D] outline-none transition-colors"
              >
                <option value="Je démarre de zéro">Je démarre de zéro</option>
                <option value="J’ai déjà une entreprise">J’ai déjà une entreprise</option>
                <option value="J’exerce déjà dans le voyage ou la conciergerie">J’exerce déjà dans le voyage ou la conciergerie</option>
                <option value="J’ai déjà organisé des groupes Omra">J’ai déjà organisé des groupes Omra</option>
              </select>
            </div>

            {/* Offre envisagée */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#A8B0BC]">Offre Envisagée *</label>
              <select 
                name="offre"
                value={formData.offre}
                onChange={handleInputChange}
                className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-3.5 text-[#F6F3EB] text-sm focus:border-[#D8AA4D] outline-none transition-colors"
              >
                <option value="Formation individuelle — offre fondateur 4 900 € HT">Formation individuelle — offre fondateur 4 900 € HT</option>
                <option value="Conciergerie prête à lancer — offre fondateur 8 900 € HT">Conciergerie prête à lancer — offre fondateur 8 900 € HT</option>
                <option value="Premium avec immersion — offre fondateur 13 900 € HT">Premium avec immersion — offre fondateur 13 900 € HT</option>
                <option value="Je souhaite être conseillé">Je souhaite être conseillé</option>
              </select>
            </div>

            {/* Budget de lancement */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#A8B0BC]">Budget de lancement *</label>
              <select 
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-3.5 text-[#F6F3EB] text-sm focus:border-[#D8AA4D] outline-none transition-colors"
              >
                <option value="Moins de 5 000 €">Moins de 5 000 €</option>
                <option value="De 5 000 à 10 000 €">De 5 000 à 10 000 €</option>
                <option value="De 10 000 à 20 000 €">De 10 000 à 20 000 €</option>
                <option value="Plus de 20 000 €">Plus de 20 000 €</option>
              </select>
            </div>

            {/* Délai de lancement */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#A8B0BC]">Délai de lancement souhaité *</label>
              <select 
                name="delai"
                value={formData.delai}
                onChange={handleInputChange}
                className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-3.5 text-[#F6F3EB] text-sm focus:border-[#D8AA4D] outline-none transition-colors"
              >
                <option value="Dans le mois">Dans le mois</option>
                <option value="Dans les 3 mois">Dans les 3 mois</option>
                <option value="Dans les 6 mois">Dans les 6 mois</option>
                <option value="Je suis encore en phase d’étude">Je suis encore en phase d’étude</option>
              </select>
            </div>

            {/* Description du projet */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#A8B0BC]">Description de votre projet & ambitions *</label>
              <textarea 
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full bg-[#07090C] border border-white/10 rounded-xl px-4 py-3.5 text-[#F6F3EB] text-sm focus:border-[#D8AA4D] outline-none transition-colors resize-none"
                placeholder="Parlez-nous de vos motivations, de votre profil et de vos objectifs d'implantation..."
              />
              {formErrors.description && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{formErrors.description}</p>}
            </div>

          </div>

          {/* Consent checkbox */}
          <div className="space-y-2 pt-4 border-t border-white/5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleInputChange}
                className="mt-1 accent-[#D8AA4D] shrink-0"
              />
              <span className="text-xs text-[#A8B0BC] font-medium leading-relaxed">
                Je comprends que ce programme nécessite un investissement financier, du travail personnel et le respect des obligations applicables. *
              </span>
            </label>
            {formErrors.consent && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{formErrors.consent}</p>}
          </div>

          <div className="space-y-4 pt-4">
            <button 
              type="submit"
              className="w-full bg-[#D8AA4D] hover:bg-[#F2CE79] text-black py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-[0_5px_30px_rgba(216,170,77,0.2)] flex items-center justify-center gap-3"
            >
              <MessageSquare className="w-4 h-4" /> Envoyer ma candidature sur WhatsApp
            </button>
            
            <div className="flex items-center justify-center gap-4 text-[#A8B0BC] text-xs font-bold uppercase">
              <div className="h-px bg-white/10 flex-1" />
              <span>Ou</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <button 
              type="button"
              onClick={handleEmailSubmit}
              className="w-full bg-transparent border border-white/10 hover:bg-[#11161D] py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-[#F6F3EB] transition-all flex items-center justify-center gap-3"
            >
              <Mail className="w-4 h-4" /> Envoyer plutôt un e-mail
            </button>
          </div>

          <p className="text-[9px] text-[#A8B0BC] font-medium opacity-65 leading-relaxed italic text-center">
            * En envoyant ce formulaire, vous acceptez d’être contacté au sujet de votre demande. Votre candidature ne vaut pas acceptation automatique dans le programme.
          </p>
        </form>
      </section>

      {/* 14. Mentions importantes / Footer */}
      <footer className="bg-[#07090C] border-t border-white/5 py-16 px-6 relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
            
            <div className="space-y-4 lg:col-span-2 text-left">
              <div className="flex items-center gap-3">
                <Image 
                  src="/app-logo.png" 
                  alt="OMRAYANAIR Logo" 
                  width={28} 
                  height={28} 
                  className="rounded-lg object-contain opacity-80" 
                />
                <span className="text-base font-black uppercase tracking-tighter text-white">
                  OMRA<span className="text-[#D8AA4D]">YANAIR</span>
                </span>
              </div>
              <p className="text-[10px] text-[#A8B0BC] font-medium leading-relaxed max-w-md">
                Programme de formation et d’accompagnement entrepreneurial. Les autorisations, obligations juridiques, fiscales, assurantielles et touristiques dépendent du pays d’implantation et du modèle exploité. Aucun résultat financier n’est garanti.
              </p>
            </div>

            <div className="space-y-3 text-left">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Programme</h4>
              <ul className="space-y-2 text-[10px] font-bold uppercase tracking-wider text-[#A8B0BC]">
                <li><button onClick={() => scrollToSection('details')} className="hover:text-white transition-colors">La Méthode</button></li>
                <li><button onClick={() => scrollToSection('parcours')} className="hover:text-white transition-colors">Le Parcours</button></li>
                <li><button onClick={() => scrollToSection('offres')} className="hover:text-white transition-colors">Les Tarifs</button></li>
              </ul>
            </div>

            <div className="space-y-3 text-left">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Contact</h4>
              <ul className="space-y-2 text-[10px] font-medium text-[#A8B0BC] leading-relaxed">
                <li className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-[#D8AA4D]" />
                  <span>+33 7 52 28 08 90 (WhatsApp)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#D8AA4D]" />
                  <span>omrayanair@gmail.com</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap gap-6 text-[9px] font-black uppercase tracking-widest text-[#A8B0BC]">
              <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
              <Link href="/legal" className="hover:text-white transition-colors">Mentions Légales</Link>
              <span className="opacity-45">© 2026 OMRAYANAIR</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Button on Mobile */}
      {showFloatingBtn && (
        <div className="md:hidden fixed bottom-6 left-0 right-0 z-40 px-6 animate-in fade-in slide-in-from-bottom-6 duration-300">
          <button 
            onClick={() => scrollToSection('candidature')}
            className="w-full bg-[#D8AA4D] text-black font-black uppercase tracking-widest text-xs py-4.5 rounded-xl shadow-[0_5px_25px_rgba(216,170,77,0.3)] text-center block"
          >
            Présenter mon projet
          </button>
        </div>
      )}

    </div>
  );
}
