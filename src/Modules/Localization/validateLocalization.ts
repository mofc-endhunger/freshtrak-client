/**
 * Localization Validation Utility
 * 
 * Validates that all localization keys exist in all supported languages.
 * This helps ensure consistency across translations and identifies missing keys.
 */

import localization from "./LocalizationComponent";

/**
 * Supported language codes
 */
const SUPPORTED_LANGUAGES = [
	"en",
	"spa",
	"som",
	"rus",
	"tur",
	"ara",
	"zho",
	"hin",
	"nep",
] as const;

type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

/**
 * Result of validation check
 */
interface ValidationResult {
	/**
	 * Whether all keys are present in all languages
	 */
	isValid: boolean;
	/**
	 * Missing keys by language
	 */
	missingKeys: Record<SupportedLanguage, string[]>;
	/**
	 * Total number of keys in English (baseline)
	 */
	totalKeys: number;
	/**
	 * Keys that exist in English but are missing in other languages
	 */
	missingByLanguage: Record<SupportedLanguage, number>;
}

/**
 * Validates that all localization keys exist in all supported languages
 * 
 * @param currentLanguage - The current language to use as baseline (default: 'en')
 * @returns Validation result with missing keys information
 * 
 * @example
 * ```tsx
 * const result = validateLocalization();
 * if (!result.isValid) {
 *   console.warn('Missing translations:', result.missingKeys);
 * }
 * ```
 */
export function validateLocalization(
	currentLanguage: SupportedLanguage = "en"
): ValidationResult {
	const result: ValidationResult = {
		isValid: true,
		missingKeys: {} as Record<SupportedLanguage, string[]>,
		totalKeys: 0,
		missingByLanguage: {} as Record<SupportedLanguage, number>,
	};

	// Initialize missing keys arrays for each language
	SUPPORTED_LANGUAGES.forEach(lang => {
		result.missingKeys[lang] = [];
		result.missingByLanguage[lang] = 0;
	});

	try {
		// Get all keys from the baseline language (English)
		const baselineKeys = Object.keys(localization);
		result.totalKeys = baselineKeys.length;

		// Check each language
		SUPPORTED_LANGUAGES.forEach(language => {
			// Temporarily switch to this language to check keys
			const originalLanguage = localization.getLanguage?.() || "en";
			
			try {
				if (typeof localization.setLanguage === "function") {
					localization.setLanguage(language);
				}

				// Check each key from baseline
				baselineKeys.forEach(key => {
					const value = localization[key as keyof typeof localization];
					
					// Check if key exists and has a value
					if (
						value === undefined ||
						value === null ||
						(typeof value === "string" && value.trim() === "")
					) {
						result.missingKeys[language].push(key);
						result.missingByLanguage[language]++;
						result.isValid = false;
					}
				});
			} catch (error) {
				console.error(`Error validating language ${language}:`, error);
				result.isValid = false;
			} finally {
				// Restore original language
				if (typeof localization.setLanguage === "function") {
					localization.setLanguage(originalLanguage);
				}
			}
		});
	} catch (error) {
		console.error("Error during localization validation:", error);
		result.isValid = false;
	}

	return result;
}

/**
 * Prints validation results to console in a formatted way
 * 
 * @param result - Validation result from validateLocalization()
 * 
 * @example
 * ```tsx
 * const result = validateLocalization();
 * printValidationResults(result);
 * ```
 */
export function printValidationResults(result: ValidationResult): void {
	console.group("🌐 Localization Validation Results");
	
	if (result.isValid) {
		console.log("✅ All localization keys are present in all languages!");
		console.log(`📊 Total keys: ${result.totalKeys}`);
	} else {
		console.warn("⚠️ Missing localization keys detected!");
		console.log(`📊 Total keys: ${result.totalKeys}`);
		
		SUPPORTED_LANGUAGES.forEach(language => {
			const missingCount = result.missingByLanguage[language];
			if (missingCount > 0) {
				console.group(`❌ ${language.toUpperCase()} - ${missingCount} missing keys`);
				result.missingKeys[language].forEach(key => {
					console.log(`  - ${key}`);
				});
				console.groupEnd();
			} else {
				console.log(`✅ ${language.toUpperCase()} - All keys present`);
			}
		});
	}
	
	console.groupEnd();
}

/**
 * Validates localization and returns a summary string
 * Useful for automated testing or CI/CD pipelines
 * 
 * @returns Summary string of validation results
 * 
 * @example
 * ```tsx
 * const summary = getValidationSummary();
 * console.log(summary);
 * ```
 */
export function getValidationSummary(): string {
	const result = validateLocalization();
	
	if (result.isValid) {
		return `✅ All ${result.totalKeys} localization keys are present in all ${SUPPORTED_LANGUAGES.length} languages.`;
	}
	
	const summaryParts: string[] = [];
	summaryParts.push(`⚠️ Missing localization keys detected:`);
	summaryParts.push(`Total keys: ${result.totalKeys}`);
	
	SUPPORTED_LANGUAGES.forEach(language => {
		const missingCount = result.missingByLanguage[language];
		if (missingCount > 0) {
			summaryParts.push(`${language.toUpperCase()}: ${missingCount} missing`);
		}
	});
	
	return summaryParts.join("\n");
}

/**
 * Checks if a specific key exists in all languages
 * 
 * @param key - The localization key to check
 * @returns Object with existence status for each language
 * 
 * @example
 * ```tsx
 * const status = checkKeyInAllLanguages('button_continue');
 * // Returns: { en: true, spa: true, som: true, ... }
 * ```
 */
export function checkKeyInAllLanguages(
	key: string
): Record<SupportedLanguage, boolean> {
	const status: Record<SupportedLanguage, boolean> = {} as Record<
		SupportedLanguage,
		boolean
	>;
	const originalLanguage = localization.getLanguage?.() || "en";

	SUPPORTED_LANGUAGES.forEach(language => {
		try {
			if (typeof localization.setLanguage === "function") {
				localization.setLanguage(language);
			}
			
			const value = localization[key as keyof typeof localization];
			status[language] =
				value !== undefined &&
				value !== null &&
				(typeof value !== "string" || value.trim() !== "");
		} catch {
			status[language] = false;
		}
	});

	// Restore original language
	if (typeof localization.setLanguage === "function") {
		localization.setLanguage(originalLanguage);
	}

	return status;
}

/**
 * Gets statistics about localization coverage
 * 
 * @returns Object with coverage statistics
 * 
 * @example
 * ```tsx
 * const stats = getLocalizationStats();
 * console.log(`Coverage: ${stats.coveragePercentage}%`);
 * ```
 */
export function getLocalizationStats(): {
	totalKeys: number;
	totalLanguages: number;
	coverageByLanguage: Record<SupportedLanguage, number>;
	coveragePercentage: number;
} {
	const result = validateLocalization();
	const totalPossibleKeys = result.totalKeys * SUPPORTED_LANGUAGES.length;
	const totalPresentKeys =
		totalPossibleKeys -
		Object.values(result.missingByLanguage).reduce((sum, count) => sum + count, 0);
	const coveragePercentage = totalPossibleKeys > 0
		? Math.round((totalPresentKeys / totalPossibleKeys) * 100)
		: 100;

	const coverageByLanguage: Record<SupportedLanguage, number> = {} as Record<
		SupportedLanguage,
		number
	>;
	
	SUPPORTED_LANGUAGES.forEach(language => {
		const missing = result.missingByLanguage[language];
		const present = result.totalKeys - missing;
		coverageByLanguage[language] = result.totalKeys > 0
			? Math.round((present / result.totalKeys) * 100)
			: 100;
	});

	return {
		totalKeys: result.totalKeys,
		totalLanguages: SUPPORTED_LANGUAGES.length,
		coverageByLanguage,
		coveragePercentage,
	};
}

// Export for use in development/testing
const localizationValidation = {
	validateLocalization,
	printValidationResults,
	getValidationSummary,
	checkKeyInAllLanguages,
	getLocalizationStats,
};

export default localizationValidation;

