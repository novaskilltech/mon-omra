'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Printer, Phone, User, Calendar, MapPin, Shield } from 'lucide-react';
import './BadgePrint.css';

interface BadgeClientProps {
  badge: {
    fullName: string;
    phone: string;
    groupName: string;
    makkahHotel: string;
    madinahHotel: string;
    departureDate: string;
    returnDate: string;
    photoUrl: string | null;
  };
}

export default function BadgeClient({ badge }: BadgeClientProps) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen pb-12 bg-light dark:bg-dark">
      {/* Navigation Header */}
      <nav className="glass px-6 py-4 flex items-center justify-between sticky top-0 z-50 border-emerald-500/5 no-print">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-emerald-500/10 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-main" />
          </Link>
          <div className="text-xl font-bold tracking-tighter text-main">
            MON <span className="text-emerald-500">BADGE PÈLERIN</span>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
        >
          <Printer className="w-4 h-4" /> Imprimer
        </button>
      </nav>

      {/* Page Content */}
      <div className="max-w-4xl mx-auto p-6 flex flex-col md:flex-row gap-8 items-center justify-center mt-8">
        
        {/* Info & instructions Column */}
        <div className="md:w-1/2 space-y-6 no-print">
          <header className="space-y-2">
            <h1 className="text-3xl font-black text-main uppercase tracking-tighter">Votre Pass de Voyage</h1>
            <p className="text-sub font-light leading-relaxed">
              Conservez ce badge sur votre téléphone ou imprimez-le pour l'avoir avec vous durant tout votre séjour en Terre Sainte. Il regroupe vos coordonnées et vos hôtels de séjour pour faciliter l'assistance en cas de besoin.
            </p>
          </header>

          <div className="glass p-6 rounded-3xl border-emerald-500/5 space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <p className="text-xs text-sub leading-relaxed font-light">
                <strong>Sécurité & Assistance :</strong> En cas de perte dans les foules de Makkah ou de Médine, présentez ce badge à tout agent ou guide de l'agence.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                <Printer className="w-4 h-4" />
              </div>
              <p className="text-xs text-sub leading-relaxed font-light">
                <strong>Format d'Impression :</strong> Le bouton "Imprimer" génère automatiquement le badge au format physique standard (85mm x 120mm), parfait pour les cordons tour de cou.
              </p>
            </div>
          </div>
        </div>

        {/* Badge Card Container */}
        <div className="badge-print-container relative w-[340px] h-[480px] bg-gradient-to-b from-[#064e3b] to-[#022c22] text-white rounded-[2rem] border border-[#d97706]/30 shadow-2xl p-6 flex flex-col justify-between overflow-hidden">
          
          {/* Decorative Islamic Background Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500 via-transparent to-transparent" />
          
          {/* Top Header Section */}
          <div className="relative z-10 flex justify-between items-start border-b border-white/10 pb-3">
            <div className="flex items-center gap-1.5">
              <div className="relative w-7 h-7 bg-white rounded-lg flex items-center justify-center">
                <span className="text-[#064e3b] font-black text-sm">O</span>
              </div>
              <div>
                <p className="text-[12px] font-black tracking-tight leading-none uppercase">OMRA<span className="text-emerald-400">YANAIR</span></p>
                <p className="text-[7px] text-white/50 tracking-wider leading-none uppercase">Accompagnement Spirituel</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-black tracking-widest text-[#fbbf24] bg-white/10 px-2 py-0.5 rounded-full border border-white/5 uppercase">
                PASS PÈLERIN
              </span>
            </div>
          </div>

          {/* Photo & General Info */}
          <div className="relative z-10 my-4 flex gap-4 items-center">
            {/* Pilgrim Photo / Placeholder */}
            <div className="relative w-28 h-32 rounded-2xl border-2 border-[#fbbf24]/50 overflow-hidden bg-emerald-950 flex-shrink-0 flex items-center justify-center">
              {badge.photoUrl ? (
                <img 
                  src={badge.photoUrl} 
                  alt={badge.fullName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-1.5 opacity-40">
                  <User className="w-10 h-10 text-white" />
                  <span className="text-[7px] font-bold uppercase tracking-wider">Pas de photo</span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-[8px] text-white/60 font-black uppercase tracking-wider leading-none">Nom & Prénom</p>
                <h2 className="text-lg font-black tracking-tight leading-tight text-white uppercase mt-0.5">{badge.fullName}</h2>
              </div>
              <div>
                <p className="text-[8px] text-white/60 font-black uppercase tracking-wider leading-none">Groupe</p>
                <p className="text-xs font-bold text-emerald-300 leading-tight uppercase mt-0.5">{badge.groupName}</p>
              </div>
              <div className="flex gap-2">
                <div>
                  <p className="text-[7px] text-white/50 font-bold uppercase tracking-wider leading-none">Départ</p>
                  <p className="text-[10px] font-black text-white/90 leading-tight mt-0.5">{badge.departureDate.split(' ')[0]} {badge.departureDate.split(' ')[1]}</p>
                </div>
                <div>
                  <p className="text-[7px] text-white/50 font-bold uppercase tracking-wider leading-none">Retour</p>
                  <p className="text-[10px] font-black text-white/90 leading-tight mt-0.5">{badge.returnDate.split(' ')[0]} {badge.returnDate.split(' ')[1]}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stays Info (Hotels) */}
          <div className="relative z-10 bg-black/20 rounded-2xl p-3 border border-white/5 space-y-2.5">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <div className="leading-tight">
                <span className="text-[7px] text-white/40 uppercase font-black tracking-wider leading-none">Hébergement Makkah</span>
                <p className="text-[11px] font-bold text-white leading-tight uppercase">{badge.makkahHotel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#fbbf24] flex-shrink-0" />
              <div className="leading-tight">
                <span className="text-[7px] text-white/40 uppercase font-black tracking-wider leading-none">Hébergement Médine</span>
                <p className="text-[11px] font-bold text-white leading-tight uppercase">{badge.madinahHotel}</p>
              </div>
            </div>
          </div>

          {/* Emergency & Contact Footer */}
          <div className="relative z-10 border-t border-white/10 pt-3 flex justify-between items-center text-[10px]">
            <div>
              <p className="text-[7px] text-white/40 uppercase font-black tracking-wider leading-none">Mon Contact</p>
              <p className="font-bold text-white/90 mt-0.5">{badge.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-[7px] text-[#fbbf24] uppercase font-black tracking-wider leading-none">Urgence Agence</p>
              <p className="font-black text-[#fbbf24] flex items-center gap-1 mt-0.5 justify-end">
                <Phone className="w-3 h-3 flex-shrink-0" /> +33 7 52 28 08 90
              </p>
            </div>
          </div>

          {/* Bottom Gold Strip */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-[#fbbf24] to-amber-600" />
        </div>

      </div>
    </div>
  );
}
