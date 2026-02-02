/**
 * Feature Flags
 * 
 * Toggle features on/off without requiring environment variable changes.
 * Useful for quick feature toggles during incidents or rollouts.
 */

/**
 * When true, all event registrations are suspended.
 * Users will see a "Reservations temporarily unavailable" message.
 * 
 * Set to false when the backend issue is resolved.
 */
export const REGISTRATION_SUSPENDED = true;
