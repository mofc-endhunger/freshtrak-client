/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
	theme: {
		extend: {
			colors: {
				primary: "#28CE85",
				secondary: "#392947",
				"color-white": "#ffffff",
				"color-black": "#000000",
				"text-color": "#392947",
				"content-text-color": "#666666",
				"color-light": "#F2F0F4",
				"color-light-grey": "#999999",
				"color-red": "#ff0000",
				"default-button": "#E5E5E5",
				"switch-button": "#F2F0F4",
				"text-primary": "#009F56",
				link: "#2563eb",
				"link-hover": "#1d4ed8",
				"content-text": "#616161",
				highlight: "#392947",
				"gray-light": "#F2F0F4",
				"gray-dark": "#424242",
				"gray-inner": "#e5e5e5",
				"shadow-color": "#e6e6e6",
				"shadow-dark": "#b9b9b9",
			},
			fontFamily: {
				"noto-sans": ["Noto Sans", "sans-serif"],
				varela: ["Varela Round", "sans-serif"],
			},
			spacing: {
				50: "50px",
				60: "60px",
				100: "100px",
				150: "150px",
				200: "200px",
				// Custom spacing for Registration module
				"pt-100": "100px",
				"pb-100": "100px",
				"mt-100": "100px",
				"mb-100": "100px",
			},
			animation: {
				"spin-slow": "spin 1.2s linear infinite",
				fadeIn: "fadeIn 0.5s ease-in-out",
			},
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
			},
			borderWidth: {
				3: "3px",
				5: "5px",
			},
			minHeight: {
				25: "100px",
			},
			minWidth: {
				55: "220px",
			},
		},
	},
	plugins: [
		require("@tailwindcss/forms"),
		require("@tailwindcss/typography"),
	],
	// Custom components for Registration module
	components: {
		".btn": {
			"@apply px-4 py-2 rounded font-medium transition-colors duration-200":
				{},
		},
		".btn-primary": {
			"@apply bg-primary text-white hover:bg-primary/90": {},
		},
		".btn-secondary": {
			"@apply bg-secondary text-white hover:bg-secondary/90": {},
		},
		".btn-custom": {
			"@apply bg-default-button text-text-color hover:bg-default-button/90":
				{},
		},
		".container-custom": {
			"@apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8": {},
		},
		".form-input": {
			"@apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent":
				{},
		},
	},
};
