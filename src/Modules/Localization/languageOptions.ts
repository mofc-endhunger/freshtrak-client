/**
 * Shared language options used by the header dropdown and household preferred-language inputs.
 * Each option has an id (matching backend `languages` table), code (for setLanguage/Redux),
 * and display text (native name).
 *
 * Code conventions:
 *  - MUST match the key in LocalizationComponent.js for languages that have translations
 *    (en, spa, som, rus, tur, ara, zho, hin, nep). react-localization uses this key to
 *    look up the translation block; a mismatch makes the site fall back to English.
 *  - Uses ISO 639-1 (2-letter) for untranslated languages when available.
 *  - Uses ISO 639-2 (3-letter) for languages without ISO 639-1 (ASL → asl, Hmong → hmn).
 *  - Uses locale codes for Spanish regional variants (es-MX, es-419, es-CO, es-ES).
 */
export interface LanguageOption {
	id: number;
	code: string;
	text: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
	{ id: 1,  code: "en",     text: "English" },
	{ id: 2,  code: "spa",    text: "Español" },
	{ id: 3,  code: "som",    text: "Soomaali" },
	{ id: 4,  code: "rus",    text: "Русский" },
	{ id: 5,  code: "tur",    text: "Türkçe" },
	{ id: 6,  code: "zho",    text: "中文" },
	{ id: 7,  code: "ara",    text: "العربية" },
	{ id: 8,  code: "asl",    text: "American Sign Language" },
	{ id: 9,  code: "ht",     text: "Kreyòl Ayisyen" },
	{ id: 10, code: "fr",     text: "Français" },
	{ id: 11, code: "uk",     text: "Українська" },
	{ id: 12, code: "nep",    text: "नेपाली" },
	{ id: 13, code: "tl",     text: "Tagalog" },
	{ id: 14, code: "vi",     text: "Tiếng Việt" },
	{ id: 15, code: "ko",     text: "한국어" },
	{ id: 16, code: "de",     text: "Deutsch" },
	{ id: 17, code: "it",     text: "Italiano" },
	{ id: 18, code: "hin",    text: "हिन्दी" },
	{ id: 19, code: "pt",     text: "Português" },
	{ id: 20, code: "ja",     text: "日本語" },
	{ id: 21, code: "pl",     text: "Polski" },
	{ id: 22, code: "el",     text: "Ελληνικά" },
	{ id: 23, code: "fa",     text: "فارسی" },
	{ id: 24, code: "nl",     text: "Nederlands" },
	{ id: 25, code: "nv",     text: "Diné bizaad" },
	{ id: 26, code: "ur",     text: "اردو" },
	{ id: 27, code: "te",     text: "తెలుగు" },
	{ id: 28, code: "gu",     text: "ગુજરાતી" },
	{ id: 29, code: "bn",     text: "বাংলা" },
	{ id: 30, code: "ta",     text: "தமிழ்" },
	{ id: 31, code: "pa",     text: "ਪੰਜਾਬੀ" },
	{ id: 32, code: "th",     text: "ภาษาไทย" },
	{ id: 33, code: "hr",     text: "Hrvatski" },
	{ id: 34, code: "hy",     text: "Հայերեն" },
	{ id: 35, code: "hmn",    text: "Hmoob" },
	{ id: 36, code: "he",     text: "עברית" },
	{ id: 37, code: "km",     text: "ភាសាខ្មែរ" },
	{ id: 38, code: "sw",     text: "Kiswahili" },
	{ id: 39, code: "sr",     text: "Српски" },
	{ id: 40, code: "es-MX",  text: "Español (México)" },
	{ id: 41, code: "es-419", text: "Español (Caribe)" },
	{ id: 42, code: "es-CO",  text: "Español (Sudamérica)" },
	{ id: 43, code: "es-ES",  text: "Español (España)" },
];

/**
 * Codes that have a full translation block in LocalizationComponent.js.
 * Only these should appear in the header language switcher.
 */
const TRANSLATED_CODES = new Set([
	"en", "spa", "som", "rus", "tur", "ara", "zho", "hin", "nep",
]);

export function getLanguageOptionByCode(code: string): LanguageOption | undefined {
	return LANGUAGE_OPTIONS.find((opt) => opt.code === code);
}

export function getLanguageOptionById(id: number): LanguageOption | undefined {
	return LANGUAGE_OPTIONS.find((opt) => opt.id === id);
}

export function getLanguageCodes(): string[] {
	return LANGUAGE_OPTIONS.map((opt) => opt.code);
}

/** Subset of LANGUAGE_OPTIONS that have translations in LocalizationComponent.js. */
export function getTranslatedLanguageOptions(): LanguageOption[] {
	return LANGUAGE_OPTIONS.filter((opt) => TRANSLATED_CODES.has(opt.code));
}
