import { getAppVersion, formatVersion, getFormattedAppVersion } from '../VersionUtils';

describe('VersionUtils', () => {
  describe('formatVersion', () => {
    it('should add v prefix to version string', () => {
      expect(formatVersion('1.2.3')).toBe('v1.2.3');
      expect(formatVersion('0.1.0')).toBe('v0.1.0');
      expect(formatVersion('10.20.30')).toBe('v10.20.30');
    });
  });

  describe('getAppVersion', () => {
    it('should return a version string', () => {
      const version = getAppVersion();
      expect(typeof version).toBe('string');
      expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('getFormattedAppVersion', () => {
    it('should return formatted version with v prefix', () => {
      const formattedVersion = getFormattedAppVersion();
      expect(typeof formattedVersion).toBe('string');
      expect(formattedVersion).toMatch(/^v\d+\.\d+\.\d+$/);
    });
  });
});
