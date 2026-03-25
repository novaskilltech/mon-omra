'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, ArrowLeft } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export default function ThemeSwitcher() {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        setTheme(initialTheme);

        if (initialTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);

        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleBack = () => {
        if (pathname === '/' || pathname === '/dashboard' || pathname === '/backoffice') {
            // On ne recule pas si on est déjà sur un accueil racine
            return;
        }
        router.back();
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4">
            {/* Bouton Retour (Invisible sur la Home) */}
            {pathname !== '/' && (
                <button
                    onClick={handleBack}
                    className="w-14 h-14 rounded-full glass flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-main border-emerald-500/20 shadow-2xl group"
                    title="Retour"
                >
                    <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
            )}

            {/* Switcher de Thème */}
            <button
                onClick={toggleTheme}
                className="w-14 h-14 rounded-full glass flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-emerald-500 border-emerald-500/20 shadow-2xl bg-emerald-500/5"
                title={theme === 'light' ? 'Passer en mode sombre' : 'Passer en mode clair'}
            >
                {theme === 'light' ? (
                    <Moon className="w-6 h-6" />
                ) : (
                    <Sun className="w-6 h-6" />
                )}
            </button>
        </div>
    );
}
