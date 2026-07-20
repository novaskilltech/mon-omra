'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Sparkles, HelpCircle, ArrowLeft, Check, Compass, Layers, ShieldCheck, Heart, User, Rocket, Globe } from 'lucide-react';

export default function DecouverteMethode() {
  const [activeTab, setActiveTab] = useState<'packages' | 'programme'>('packages');

  return (
    <main className="min-h-screen bg-[#07090C] text-[#F6F3EB] font-inter selection:bg-[#D8AA4D]/30 py-12 px-4 md:px-8 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(216,170,77,0.05),transparent_50%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation / Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-6">
          <Link href="/la-methode" className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#A8B0BC] hover:text-[#D8AA4D] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour à la méthode
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-[#D8AA4D] tracking-widest bg-[#D8AA4D]/10 px-3 py-1 rounded border border-[#D8AA4D]/20">
              FICHE SYNTHÈSE NOTEBOOK
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-left space-y-4 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-tight">
            La Conciergerie Omra <br />
            <span className="text-[#D8AA4D] underline decoration-wavy decoration-[#D8AA4D]/40">Expliquée Simplement.</span>
          </h1>
          <p className="text-xs md:text-sm text-[#A8B0BC] font-medium leading-relaxed">
            Pas besoin de jargon technique ni de diplômes complexes. Voici notre guide vulgarisé (« Pour les Nuls ») inspiré de notre NotebookLM pour tout comprendre en 3 minutes.
          </p>
        </div>

        {/* Notebook Layout Wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Sources (NotebookLM style) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0D1117] border border-white/5 rounded-3xl p-6 space-y-6 shadow-xl">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-[#D8AA4D] mb-3">Sources de la fiche</h3>
                <p className="text-[10px] text-[#A8B0BC] font-medium leading-relaxed">
                  Cette synthèse vulgarisée est extraite de notre manuel de formation de 240 pages pour l'accompagnement des concierges autonomes.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-[#D8AA4D]/20 transition-all">
                  <BookOpen className="w-4 h-4 text-[#D8AA4D] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[11px] font-bold text-white">Source 1 : Le Modèle Direct</h4>
                    <p className="text-[9px] text-[#A8B0BC] mt-0.5">Négociation vols + hôtels en Arabie sans intermédiaires.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-[#D8AA4D]/20 transition-all">
                  <Compass className="w-4 h-4 text-[#D8AA4D] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[11px] font-bold text-white">Source 2 : L'Écosystème Digital</h4>
                    <p className="text-[9px] text-[#A8B0BC] mt-0.5">Le logiciel automatisé sous votre propre marque.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-[#D8AA4D]/20 transition-all">
                  <Sparkles className="w-4 h-4 text-[#D8AA4D] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[11px] font-bold text-white">Source 3 : TikTok & Acquisition IA</h4>
                    <p className="text-[9px] text-[#A8B0BC] mt-0.5">Trouver des pèlerins sans budget publicitaire.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <blockquote className="text-[10px] text-[#A8B0BC] italic leading-relaxed bg-[#D8AA4D]/5 p-4 rounded-xl border border-[#D8AA4D]/10">
                  💡 <strong>Principe de base :</strong> <br />
                  « Passer de revendeur commissionné (marge faible, peu de liberté) à créateur de voyages autonome (marge élevée, contrôle de la qualité). »
                </blockquote>
              </div>
            </div>
          </div>

          {/* Main Content Document (NotebookLM style) */}
          <div className="lg:col-span-8 bg-[#0D1117] border border-white/5 rounded-[2rem] p-6 md:p-8 space-y-8 shadow-2xl relative">
            
            {/* Tabs Selector */}
            <div className="flex border-b border-white/5 pb-4 gap-6">
              <button 
                onClick={() => setActiveTab('packages')}
                className={`text-xs font-black uppercase tracking-wider transition-all pb-2 border-b-2 ${activeTab === 'packages' ? 'text-[#D8AA4D] border-[#D8AA4D]' : 'text-[#A8B0BC] border-transparent'}`}
              >
                1. Les 3 Packages de Lancement
              </button>
              <button 
                onClick={() => setActiveTab('programme')}
                className={`text-xs font-black uppercase tracking-wider transition-all pb-2 border-b-2 ${activeTab === 'programme' ? 'text-[#D8AA4D] border-[#D8AA4D]' : 'text-[#A8B0BC] border-transparent'}`}
              >
                2. Ce qu'on apprend (Vulgarisé)
              </button>
            </div>

            {/* Content Tab 1 : Packages */}
            {activeTab === 'packages' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-[#D8AA4D]/5 p-4 rounded-2xl border border-[#D8AA4D]/10 flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-[#D8AA4D] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Comment choisir sa formule ?</h4>
                    <p className="text-[10px] text-[#A8B0BC] mt-1 leading-relaxed">
                      Chaque formule correspond à votre budget de départ et au niveau d'accompagnement souhaité. Voici les 3 options expliquées simplement :
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Pack 1 */}
                  <div className="p-5 rounded-2xl border border-white/5 bg-black/40 hover:border-white/10 transition-all space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-white/5 text-[#A8B0BC] text-xs font-black flex items-center justify-center border border-white/10">1</span>
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">Formule Individuelle</h4>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#D8AA4D]">PACK DÉMARRAGE</span>
                    </div>
                    <p className="text-[10px] text-[#A8B0BC] leading-relaxed">
                      <strong>Pour qui ?</strong> Ceux qui ont un petit budget et souhaitent tout apprendre pour être 100% autonomes.
                    </p>
                    <div className="bg-white/5 p-3 rounded-xl space-y-1.5 text-[9px] text-[#A8B0BC]">
                      <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#D8AA4D]" /> Formation intensive de 5 jours.</div>
                      <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#D8AA4D]" /> Accès au réseau de fournisseurs saoudiens en direct.</div>
                    </div>
                  </div>

                  {/* Pack 2 */}
                  <div className="p-5 rounded-2xl border border-[#D8AA4D]/20 bg-[#D8AA4D]/5 hover:border-[#D8AA4D]/40 transition-all space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#D8AA4D] text-black text-xs font-black flex items-center justify-center">2</span>
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">Formule Prête à Lancer</h4>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#D8AA4D] bg-[#D8AA4D]/10 px-2 py-0.5 rounded border border-[#D8AA4D]/20">LE PLUS POPULAIRE</span>
                    </div>
                    <p className="text-[10px] text-[#A8B0BC] leading-relaxed">
                      <strong>Pour qui ?</strong> Ceux qui veulent gagner du temps. On s'occupe de créer et de paramétrer toute la partie technique sous votre propre marque.
                    </p>
                    <div className="bg-white/5 p-3 rounded-xl space-y-1.5 text-[9px] text-[#A8B0BC]">
                      <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#D8AA4D]" /> Tout le Pack Individuel.</div>
                      <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#D8AA4D]" /> Création complète de votre site internet et de vos outils de gestion.</div>
                      <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#D8AA4D]" /> Accès au réseau d'hôtels présélectionnés.</div>
                    </div>
                  </div>

                  {/* Pack 3 */}
                  <div className="p-5 rounded-2xl border border-white/5 bg-black/40 hover:border-white/10 transition-all space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-white/5 text-[#A8B0BC] text-xs font-black flex items-center justify-center border border-white/10">3</span>
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">Formule Immersion Arabie</h4>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#D8AA4D]">PACK MASTERCLASS</span>
                    </div>
                    <p className="text-[10px] text-[#A8B0BC] leading-relaxed">
                      <strong>Pour qui ?</strong> Ceux qui veulent le top du top. On part sur place à La Mecque et Médine pour rencontrer directement les hôteliers et signer des contrats exclusifs.
                    </p>
                    <div className="bg-white/5 p-3 rounded-xl space-y-1.5 text-[9px] text-[#A8B0BC]">
                      <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#D8AA4D]" /> Tout le Pack Prêt à Lancer.</div>
                      <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#D8AA4D]" /> Accompagnement physique en Arabie Saoudite.</div>
                      <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#D8AA4D]" /> Négociation en direct avec les hôtels et transports devant vous.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab 2 : Programme */}
            {activeTab === 'programme' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-[#D8AA4D]/5 p-4 rounded-2xl border border-[#D8AA4D]/10 flex items-start gap-3">
                  <Layers className="w-5 h-5 text-[#D8AA4D] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Le programme découpé en 5 blocs faciles</h4>
                    <p className="text-[10px] text-[#A8B0BC] mt-1 leading-relaxed">
                      Voici les 5 blocs indispensables que nous allons vous apprendre à maîtriser pour lancer votre activité, de manière simplifiée et concrète.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Bloc 1 */}
                  <div className="p-4 rounded-xl border border-white/5 bg-black/40 space-y-2">
                    <h4 className="text-xs font-black uppercase text-[#D8AA4D]">1. Les Vols (Aérien)</h4>
                    <p className="text-[9px] text-[#A8B0BC] leading-relaxed">
                      Comment repérer les vols les moins chers (low-cost ou réguliers), comment les combiner sans risques de retard et comment les réserver pour vos groupes de pèlerins.
                    </p>
                  </div>

                  {/* Bloc 2 */}
                  <div className="p-4 rounded-xl border border-white/5 bg-black/40 space-y-2">
                    <h4 className="text-xs font-black uppercase text-[#D8AA4D]">2. L'Hébergement (Hôtels)</h4>
                    <p className="text-[9px] text-[#A8B0BC] leading-relaxed">
                      Comment contacter et négocier en direct avec les hôtels à La Mecque et à Médine, sans passer par des agences intermédiaires qui prennent d'importantes commissions.
                    </p>
                  </div>

                  {/* Bloc 3 */}
                  <div className="p-4 rounded-xl border border-white/5 bg-black/40 space-y-2">
                    <h4 className="text-xs font-black uppercase text-[#D8AA4D]">3. La Logistique (Transports)</h4>
                    <p className="text-[9px] text-[#A8B0BC] leading-relaxed">
                      Comment réserver les bus, les voitures privées et les billets de train à grande vitesse Haramain pour assurer des déplacements parfaits et sécurisés sur place.
                    </p>
                  </div>

                  {/* Bloc 4 */}
                  <div className="p-4 rounded-xl border border-white/5 bg-black/40 space-y-2">
                    <h4 className="text-xs font-black uppercase text-[#D8AA4D]">4. Les Outils Techniques</h4>
                    <p className="text-[9px] text-[#A8B0BC] leading-relaxed">
                      Comment utiliser notre logiciel de gestion pour centraliser les passeports des pèlerins, suivre les paiements, éditer les badges d'identification et gérer le planning en 1 clic.
                    </p>
                  </div>

                  {/* Bloc 5 */}
                  <div className="p-4 rounded-xl border border-[#D8AA4D]/10 bg-[#D8AA4D]/5 md:col-span-2 space-y-2">
                    <h4 className="text-xs font-black uppercase text-[#D8AA4D]">5. Trouver vos Pèlerins (Marketing Organique & IA)</h4>
                    <p className="text-[9px] text-[#A8B0BC] leading-relaxed">
                      La méthode simple pour créer des vidéos attractives sur TikTok et Instagram en utilisant l'intelligence artificielle pour générer du contenu, afin d'attirer des pèlerins gratuitement sans dépenser d'argent en publicité.
                    </p>
                  </div>

                </div>
              </div>
            )}

            {/* Bottom Form Redirection */}
            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h4 className="text-xs font-bold text-white uppercase">Prêt à franchir le pas ?</h4>
                <p className="text-[9px] text-[#A8B0BC] mt-0.5">Candidatez dès aujourd'hui pour réserver votre session d'incubation.</p>
              </div>
              <Link 
                href="/la-methode#candidature" 
                className="bg-[#D8AA4D] hover:bg-[#F2CE79] text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-102"
              >
                Remplir ma candidature
              </Link>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
