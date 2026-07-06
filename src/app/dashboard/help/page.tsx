'use client';

import { useState } from 'react';
import { Play, FileText, CheckCircle2, Info, ChevronRight, HelpCircle, Smartphone, Luggage, Waves, BookOpen, ChevronDown, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
    question: string;
    answer: string;
}

export default function TutorialsPage() {
    const [activeFaq, setActiveFaq] = useState<number | null>(null);
    const [showGuide, setShowGuide] = useState(false);

    const tutorials = [
        {
            id: 1,
            title: "Enregistrement en ligne",
            duration: "3:45",
            desc: "Comment effectuer votre check-in sur le site de la compagnie aérienne pas-à-pas.",
            icon: Smartphone,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-500/10"
        },
        {
            id: 2,
            title: "Gestion des Bagages",
            duration: "2:15",
            desc: "Comprendre les franchises bagages, les liquides et les objets interdits en cabine.",
            icon: Luggage,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-500/10"
        },
        {
            id: 3,
            title: "Récupérer Zamzam",
            duration: "1:50",
            desc: "La procédure officielle à l'aéroport de Jeddah pour l'achat et l'enregistrement de l'eau Zamzam.",
            icon: Waves,
            color: "text-emerald-600 dark:text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            id: 4,
            title: "Utilisation de l'App",
            duration: "4:20",
            desc: "Découvrez toutes les fonctionnalités de votre compagnon OMRAYANAIR.",
            icon: CheckCircle2,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-500/10"
        }
    ];

    const faqs: FAQItem[] = [
        {
            question: "Comment puis-je obtenir mon Visa Omra ?",
            answer: "Votre agence s'occupe de toutes les démarches administratives. Dès que le ministère saoudien de l'Omra approuve et émet votre visa, un bouton vert de téléchargement apparaît automatiquement tout en haut de votre dashboard dans l'application."
        },
        {
            question: "Que faire si mon code de réservation (PNR) n'est pas reconnu à l'aéroport ?",
            answer: "Vérifiez que vous avez bien saisi les 6 caractères du code PNR (chiffres et lettres majuscules) indiqués sous la section Prochain Vol de l'application. Si le problème persiste, contactez directement l'assistance 24/7 via la section logistique."
        },
        {
            question: "Combien de bagages sont inclus dans mon forfait de voyage ?",
            answer: "La franchise bagage dépend de votre type de réservation et de la compagnie aérienne choisie. Veuillez vérifier les détails indiqués directement sous votre carte de vol dans le dashboard ou vous référer à votre billet d'avion."
        },
        {
            question: "Comment fonctionne l'accès hors-ligne à mes documents ?",
            answer: "Lorsque vous ouvrez l'application sous couverture internet, vos documents importants (visa, billets, assurance) sont sauvegardés localement. Vous pouvez ainsi les consulter à l'aéroport même sans aucune connexion réseau."
        },
        {
            question: "Comment modifier les éléments de ma checklist de préparation ?",
            answer: "Cliquez simplement sur les cases à cocher dans le module de préparation du dashboard. Vos actions sont instantanément enregistrées dans notre base de données sécurisée."
        }
    ];

    const toggleFaq = (index: number) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    return (
        <div className="min-h-screen p-6 animate-in fade-in duration-500">
            <header className="mb-12">
                <Link href="/dashboard" className="text-dim text-[10px] font-black uppercase tracking-widest hover:text-[#D4AF37] transition-colors mb-4 inline-block">
                    ← Retour au Dashboard
                </Link>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-main">Centre d'<span className="text-amber-500">Aide</span></h1>
                <p className="text-sub text-sm mt-1">Tutoriels et guides pratiques pour un voyage spirituel serein.</p>
            </header>

            {/* Expandable Application Guide Card */}
            <div className="glass p-1 rounded-[3rem] border-amber-500/10 mb-12 overflow-hidden bg-gradient-to-br from-amber-500/5 to-transparent">
                <div className="p-8 md:p-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500 shrink-0">
                                <BookOpen className="w-8 h-8" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 block mb-1">Guide Officiel Pèlerin</span>
                                <h2 className="text-2xl font-black uppercase tracking-tighter text-main leading-none">Guide d'utilisation de l'Espace Pèlerin</h2>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowGuide(!showGuide)}
                            className="w-full md:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
                        >
                            {showGuide ? "Masquer le Guide" : "Ouvrir le Guide"}
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showGuide ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {showGuide && (
                        <div className="mt-8 pt-8 border-t border-white/5 text-sub text-sm leading-relaxed max-w-4xl text-left space-y-6 animate-slide-up">
                            <div>
                                <h3 className="font-bold text-main text-lg uppercase tracking-tight mb-2">1. Compte à Rebours & Accueil</h3>
                                <p className="font-light">
                                    En haut de votre dashboard, l'arche dorée encadre la Kaaba et affiche le temps restant exact avant votre départ en Terre Sainte. Le compte à rebours s'actualise en temps réel.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-main text-lg uppercase tracking-tight mb-2">2. Suivi de Vol & Référence PNR</h3>
                                <p className="font-light">
                                    Consultez vos aéroports de départ et d'arrivée, la compagnie aérienne et surtout votre référence PNR. Ce code à 6 caractères est requis pour le check-in automatique.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-main text-lg uppercase tracking-tight mb-2">3. Checklist de Préparation</h3>
                                <p className="font-light">
                                    Cochez les tâches logistiques (change, visa, passeport) et spirituelles (apprentissage des douas, rites de l'Ihram) à votre rythme. Le pourcentage de préparation est synchronisé avec l'agence.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-main text-lg uppercase tracking-tight mb-2">4. Coffre-fort numérique de Documents</h3>
                                <p className="font-light">
                                    Vos billets électroniques et votre Visa Omra officiel (bouton vert) sont téléchargeables directement dans votre espace. Ils restent consultables hors-ligne.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* FAQs Accordion Section */}
            <div className="glass p-8 rounded-[2.5rem] border-amber-500/5 mb-12">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-main mb-8 flex items-center gap-3">
                    <HelpCircle className="w-6 h-6 text-amber-500" />
                    Foire Aux Questions (FAQ)
                </h3>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border-b border-white/5 pb-4">
                            <button
                                onClick={() => toggleFaq(index)}
                                className="w-full flex justify-between items-center text-left py-2 text-main font-bold hover:text-amber-500 transition-colors gap-4"
                            >
                                <span className="text-sm md:text-base uppercase tracking-tight">{faq.question}</span>
                                <ChevronDown className={`w-5 h-5 text-dim shrink-0 transition-transform ${activeFaq === index ? 'rotate-180 text-amber-500' : ''}`} />
                            </button>
                            {activeFaq === index && (
                                <div className="mt-3 text-xs md:text-sm text-sub font-light leading-relaxed pl-1 pr-6 animate-fade-in">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Video Tutorials Grid */}
            <div className="space-y-6">
                <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 text-main">
                    <Play className="w-6 h-6 text-amber-500" />
                    Tutoriels Vidéo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tutorials.map((t) => (
                        <div key={t.id} className="glass p-6 rounded-[2.5rem] border-amber-500/5 flex items-center gap-6 group hover:border-amber-500/10 transition-all shadow-sm">
                            <div className={`w-16 h-16 rounded-[1.5rem] ${t.bg} ${t.color.split(' ')[0]} ${t.color.split(' ')[1]} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                <t.icon className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-black text-main uppercase tracking-tighter text-base">{t.title}</h4>
                                    <span className="text-[10px] font-black text-dim">{t.duration}</span>
                                </div>
                                <p className="text-xs text-sub leading-relaxed pr-4 line-clamp-2 font-light">{t.desc}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-dim group-hover:text-main transition-colors" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Support Footer Contact */}
            <div className="mt-16 p-8 bg-amber-500/5 rounded-[2.5rem] border border-amber-500/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-inner">
                <div className="flex items-center gap-6 text-left">
                    <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/10 text-amber-500">
                        <MessageSquare className="w-8 h-8" />
                    </div>
                    <div>
                        <h4 className="font-black text-main uppercase tracking-tighter">Une autre question ?</h4>
                        <p className="text-xs text-sub font-light">Notre équipe logistique et nos guides sont disponibles 24/7 depuis l'onglet Assistance de votre application.</p>
                    </div>
                </div>
                <Link href="/dashboard" className="px-8 py-4 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/10">
                    Contacter mon Guide
                </Link>
            </div>
        </div>
    );
}
