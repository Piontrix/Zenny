/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				roseclub: {
					bg: "#f8dada",
					light: "#f4b6b6",
					medium: "#d76767",
					dark: "#9e2a2b",
					accent: "#e63946",
					paper: "#fff8f7",
				},
			},
			fontFamily: {
				sans: ["Inter", "sans-serif"],
				serif: ['"Playfair Display"', "serif"],
				romantic: ['"Dancing Script"', "cursive"],
			},
		},
	},
	plugins: [],
};
