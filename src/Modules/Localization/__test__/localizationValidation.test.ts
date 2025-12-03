/**
 * Localization Validation Tests
 * 
 * These tests verify that all localization keys exist in all supported languages.
 * Run these tests to ensure translation completeness.
 */

import {
	validateLocalization,
	printValidationResults,
	getValidationSummary,
	checkKeyInAllLanguages,
	getLocalizationStats,
} from "../validateLocalization";

describe("Localization Validation", () => {
	describe("validateLocalization", () => {
		it("should validate that all keys exist in all languages", () => {
			const result = validateLocalization();
			
			// Print results for debugging
			if (!result.isValid) {
				printValidationResults(result);
			}
			
			// This test will fail if there are missing keys
			expect(result.isValid).toBe(true);
			expect(result.totalKeys).toBeGreaterThan(0);
		});

		it("should have keys in all supported languages", () => {
			const result = validateLocalization();
			
			// Check that we have keys in the baseline (English)
			expect(result.totalKeys).toBeGreaterThan(100); // Should have many keys
			
			// Check that no language has missing keys
			Object.values(result.missingByLanguage).forEach(missingCount => {
				expect(missingCount).toBe(0);
			});
		});
	});

	describe("checkKeyInAllLanguages", () => {
		it("should verify common keys exist in all languages", () => {
			const commonKeys = [
				"button_continue",
				"button_cancel",
				"button_register",
				"label_email",
				"label_password",
				"error_field_required",
			];

			commonKeys.forEach(key => {
				const status = checkKeyInAllLanguages(key);
				
				// All languages should have this key
				Object.values(status).forEach(hasKey => {
					expect(hasKey).toBe(true);
				});
			});
		});
	});

	describe("getLocalizationStats", () => {
		it("should return valid statistics", () => {
			const stats = getLocalizationStats();
			
			expect(stats.totalKeys).toBeGreaterThan(0);
			expect(stats.totalLanguages).toBe(9); // en, spa, som, rus, tur, ara, zho, hin, nep
			expect(stats.coveragePercentage).toBe(100); // Should be 100% if all keys are present
			
			// Check coverage for each language
			Object.values(stats.coverageByLanguage).forEach(coverage => {
				expect(coverage).toBe(100);
			});
		});
	});

	describe("getValidationSummary", () => {
		it("should return a summary string", () => {
			const summary = getValidationSummary();
			
			expect(typeof summary).toBe("string");
			expect(summary.length).toBeGreaterThan(0);
			
			// If validation passes, summary should indicate success
			const result = validateLocalization();
			if (result.isValid) {
				expect(summary).toContain("✅");
			}
		});
	});
});

