import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                emerald: {
                    50: 'var(--accent-emerald-50, #f0fdf4)',
                    100: 'var(--accent-emerald-100, #dcfce7)',
                    200: 'var(--accent-emerald-200, #bbf7d0)',
                    300: 'var(--accent-emerald-300, #86efac)',
                    400: 'var(--accent-emerald-400, #4ade80)',
                    500: 'var(--accent-emerald)',
                    600: 'var(--accent-emerald-600)',
                    700: 'var(--accent-emerald-700)',
                    800: 'var(--accent-emerald-800, #065f46)',
                    900: 'var(--accent-emerald-900, #064e3b)',
                    950: 'var(--accent-emerald-950, #022c22)',
                }
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    darkMode: "class",
    plugins: [],
};
export default config;
