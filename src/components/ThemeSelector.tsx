'use client';

import { useState, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';

const THEMES = [
  { id: 'theme-1', name: 'Combo #1', bg: '#000F08', accent: '#FB3640', label: 'Rouge & Noir' },
  { id: 'theme-2', name: 'Combo #2', bg: '#004643', accent: '#F0EDE5', label: 'Deep Teal & Crème' },
  { id: 'theme-3', name: 'Combo #3', bg: '#222222', accent: '#89E900', label: 'Gray & Lime' },
  { id: 'theme-4', name: 'Combo #4', bg: '#27187E', accent: '#F7F7FF', label: 'Royal Blue & Lavender' },
  { id: 'theme-5', name: 'Combo #5', bg: '#381932', accent: '#FFF3E6', label: 'Deep Plum & Crème' },
];

export default function ThemeSelector() {
  const [activeTheme, setActiveTheme] = useState('theme-2');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-choice') || 'theme-2';
    setActiveTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const selectTheme = (themeId: string) => {
    setActiveTheme(themeId);
    localStorage.setItem('theme-choice', themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    
    // Dispatch a global event so that other components can adapt if needed
    window.dispatchEvent(new Event('themeChanged'));
  };

  return (
    <div className="glass p-3 rounded-2xl border-white/10 flex items-center gap-3 shadow-2xl backdrop-blur-md bg-black/20">
      <div className="flex items-center gap-2 text-dim text-[10px] font-black uppercase tracking-widest pl-2 border-r border-white/10 pr-3">
        <Palette className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
        Thèmes
      </div>
      <div className="flex gap-2">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => selectTheme(t.id)}
            style={{ backgroundColor: t.bg }}
            className={`w-7 h-7 rounded-full border relative flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border-white/15`}
            title={t.label}
          >
            {/* Accent color dot */}
            <span
              style={{ backgroundColor: t.accent }}
              className="w-2 h-2 rounded-full absolute -bottom-0.5 -right-0.5 border border-black"
            />
            {activeTheme === t.id && (
              <Check className="w-3.5 h-3.5 text-white drop-shadow" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
