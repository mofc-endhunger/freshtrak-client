/**
 * Localization Utility Functions
 *
 * Provides helper functions for consistent localization access and error handling.
 * This utility ensures that missing keys are handled gracefully with fallbacks
 * and provides development-time warnings for missing translations.
 */

import localization from './LocalizationComponent';

/**
 * Type definition for localization key
 */
type LocalizationKey = keyof typeof localization;

/**
 * Configuration for localization utility
 */
interface LocalizationConfig {
  /**
   * Whether to log warnings for missing keys (default: true in development)
   */
  logMissingKeys?: boolean;
  /**
   * Default fallback value when key is missing (default: empty string)
   */
  defaultFallback?: string;
  /**
   * Whether to show key name as fallback (default: false)
   */
  showKeyAsFallback?: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<LocalizationConfig> = {
  logMissingKeys: process.env.NODE_ENV === 'development',
  defaultFallback: '',
  showKeyAsFallback: false,
};

/**
 * Gets a localized string by key with safe error handling
 *
 * @param key - The localization key
 * @param config - Optional configuration for error handling
 * @returns The localized string or fallback value
 *
 * @example
 * ```tsx
 * const text = getLocalizedString('button_continue');
 * // Returns: "Continue" (or localized version)
 * ```
 */
export function getLocalizedString(key: string, config: LocalizationConfig = {}): string {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  try {
    // Check if key exists in localization object
    if (key in localization) {
      const value = localization[key as LocalizationKey];

      // Handle function values (for string interpolation)
      // react-localization may return functions for dynamic content
      if (typeof value === 'function') {
        // Try to call the function with empty args if it's a simple getter
        try {
          const result = (value as () => string)();
          return typeof result === 'string' ? result : String(value);
        } catch {
          // If calling fails, return string representation
          return String(value);
        }
      }

      // Return the localized string
      if (value !== undefined && value !== null) {
        return String(value);
      }
    }

    // Key not found or value is undefined/null
    if (finalConfig.logMissingKeys) {
      console.warn(
        `[Localization] Missing key: "${key}". ` +
          `Current language: ${localization.getLanguage?.() || 'unknown'}`,
      );
    }

    // Return fallback
    if (finalConfig.showKeyAsFallback) {
      return `[${key}]`;
    }

    return finalConfig.defaultFallback;
  } catch (error) {
    if (finalConfig.logMissingKeys) {
      console.error(`[Localization] Error accessing key "${key}":`, error);
    }

    return finalConfig.showKeyAsFallback ? `[${key}]` : finalConfig.defaultFallback;
  }
}

/**
 * Gets a localized string with string interpolation support
 *
 * @param key - The localization key
 * @param params - Parameters for string interpolation (e.g., { name: "John" })
 * @param config - Optional configuration for error handling
 * @returns The localized string with interpolated values
 *
 * @example
 * ```tsx
 * const text = getLocalizedStringWithParams('welcome_message', { name: 'John' });
 * // If key is "Welcome, {name}!" returns: "Welcome, John!"
 * ```
 */
export function getLocalizedStringWithParams(
  key: string,
  params: Record<string, string | number> = {},
  config: LocalizationConfig = {},
): string {
  const localizedString = getLocalizedString(key, config);

  // Simple string interpolation: replace {key} with value
  return localizedString.replace(/\{(\w+)\}/g, (match, paramKey) => {
    return params[paramKey] !== undefined ? String(params[paramKey]) : match;
  });
}

/**
 * Checks if a localization key exists
 *
 * @param key - The localization key to check
 * @returns True if the key exists, false otherwise
 *
 * @example
 * ```tsx
 * if (hasLocalizationKey('button_continue')) {
 *   // Key exists
 * }
 * ```
 */
export function hasLocalizationKey(key: string): boolean {
  try {
    return key in localization && localization[key as LocalizationKey] !== undefined;
  } catch {
    return false;
  }
}

/**
 * Gets the current language code
 *
 * @returns The current language code (e.g., 'en', 'es', 'som')
 *
 * @example
 * ```tsx
 * const lang = getCurrentLanguage();
 * // Returns: "en"
 * ```
 */
export function getCurrentLanguage(): string {
  try {
    // react-localization provides getLanguage method
    if (typeof localization.getLanguage === 'function') {
      return localization.getLanguage();
    }
    // Fallback: check if language property exists
    if ('language' in localization) {
      return String(localization.language);
    }
    return 'en'; // Default fallback
  } catch {
    return 'en';
  }
}

/**
 * Sets the language for localization
 *
 * @param languageCode - The language code to set (e.g., 'en', 'es', 'som')
 *
 * @example
 * ```tsx
 * setLanguage('es');
 * ```
 */
export function setLanguage(languageCode: string): void {
  try {
    if (typeof localization.setLanguage === 'function') {
      localization.setLanguage(languageCode);
    } else {
      console.warn(
        `[Localization] setLanguage method not available. ` +
          `Language code requested: ${languageCode}`,
      );
    }
  } catch (error) {
    console.error(`[Localization] Error setting language to "${languageCode}":`, error);
  }
}

/**
 * Gets all available language codes
 *
 * @returns Array of available language codes
 *
 * @example
 * ```tsx
 * const languages = getAvailableLanguages();
 * // Returns: ['en', 'es', 'som', 'rus', 'tur', 'ara', 'zho', 'hin', 'nep']
 * ```
 */
export function getAvailableLanguages(): string[] {
  // Based on the LocalizationComponent, these are the supported languages
  return ['en', 'spa', 'som', 'rus', 'tur', 'ara', 'zho', 'hin', 'nep'];
}

/**
 * Validates that a language code is supported
 *
 * @param languageCode - The language code to validate
 * @returns True if the language is supported, false otherwise
 *
 * @example
 * ```tsx
 * if (isLanguageSupported('es')) {
 *   setLanguage('es');
 * }
 * ```
 */
export function isLanguageSupported(languageCode: string): boolean {
  return getAvailableLanguages().includes(languageCode);
}

/**
 * Safe wrapper for accessing localization with fallback
 * This is a convenience function that combines getLocalizedString with a fallback value
 *
 * @param key - The localization key
 * @param fallback - Fallback value if key is missing
 * @returns The localized string or fallback
 *
 * @example
 * ```tsx
 * const text = getLocalizedStringSafe('button_continue', 'Continue');
 * ```
 */
export function getLocalizedStringSafe(key: string, fallback: string): string {
  return getLocalizedString(key, {
    defaultFallback: fallback,
    logMissingKeys: process.env.NODE_ENV === 'development',
    showKeyAsFallback: false,
  });
}

/**
 * Batch get multiple localization strings
 *
 * @param keys - Array of localization keys
 * @param config - Optional configuration for error handling
 * @returns Object with keys mapped to their localized strings
 *
 * @example
 * ```tsx
 * const texts = getLocalizedStrings(['button_continue', 'button_cancel']);
 * // Returns: { button_continue: "Continue", button_cancel: "Cancel" }
 * ```
 */
export function getLocalizedStrings(
  keys: string[],
  config: LocalizationConfig = {},
): Record<string, string> {
  const result: Record<string, string> = {};

  keys.forEach((key) => {
    result[key] = getLocalizedString(key, config);
  });

  return result;
}

// Export the localization object for direct access when needed
export { localization };

// Export default for convenience
const localizationUtils = {
  getLocalizedString,
  getLocalizedStringWithParams,
  hasLocalizationKey,
  getCurrentLanguage,
  setLanguage,
  getAvailableLanguages,
  isLanguageSupported,
  getLocalizedStringSafe,
  getLocalizedStrings,
  localization,
};

export default localizationUtils;
