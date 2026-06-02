import {
  isGreeting,
  matchQuestion,
  findBestMatch,
  findSuggestions,
  getEntriesByCategory,
  getEntryById,
  getCategoryQuickReplies,
  getFollowUpReplies,
  createBotMessage,
  createUserMessage,
  resetMessageCounter,
} from '../chatBotMatcher';
import { FAQ_ENTRIES, FAQ_CATEGORIES } from '../chatBotData';

describe('chatBotMatcher', () => {
  beforeEach(() => {
    resetMessageCounter();
  });

  describe('isGreeting', () => {
    it('recognizes common greetings', () => {
      expect(isGreeting('hi')).toBe(true);
      expect(isGreeting('hello')).toBe(true);
      expect(isGreeting('hey')).toBe(true);
      expect(isGreeting('help')).toBe(true);
    });

    it('recognizes greetings with extra text', () => {
      expect(isGreeting('hi there')).toBe(true);
      expect(isGreeting('hello!')).toBe(false);
      expect(isGreeting('need help')).toBe(true);
    });

    it('rejects non-greetings', () => {
      expect(isGreeting('how do I register')).toBe(false);
      expect(isGreeting('find food')).toBe(false);
    });

    it('is case-insensitive', () => {
      expect(isGreeting('Hello')).toBe(true);
      expect(isGreeting('HI')).toBe(true);
    });
  });

  describe('matchQuestion', () => {
    it('returns results sorted by score descending', () => {
      const results = matchQuestion('register for an event');
      expect(results.length).toBeGreaterThan(0);
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });

    it('returns empty array for empty input', () => {
      expect(matchQuestion('')).toEqual([]);
      expect(matchQuestion('  ')).toEqual([]);
    });

    it('returns results for food-related queries', () => {
      const results = matchQuestion('find food near me');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].entry.id).toBe('find-pantry');
    });

    it('returns results for registration queries', () => {
      const results = matchQuestion('how to register');
      expect(results.length).toBeGreaterThan(0);
      const ids = results.map((r) => r.entry.id);
      expect(ids).toContain('register-event');
    });

    it('returns results for password-related queries', () => {
      const results = matchQuestion('forgot my password');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].entry.id).toBe('forgot-password');
    });
  });

  describe('findBestMatch', () => {
    it('returns an entry for a strong match', () => {
      const result = findBestMatch('find food pantry near me');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('find-pantry');
    });

    it('returns null when no match is strong enough', () => {
      const result = findBestMatch('xyzzy garble nonsense');
      expect(result).toBeNull();
    });

    it('matches cancel reservation queries', () => {
      const result = findBestMatch('cancel my reservation');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('cancel-reservation');
    });

    it('matches account creation queries', () => {
      const result = findBestMatch('how to create account');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('create-account');
    });
  });

  describe('findSuggestions', () => {
    it('returns up to 3 suggestions', () => {
      const suggestions = findSuggestions('event');
      expect(suggestions.length).toBeLessThanOrEqual(3);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('returns empty for nonsense input', () => {
      const suggestions = findSuggestions('xyzzy garble nonsense');
      expect(suggestions).toEqual([]);
    });
  });

  describe('getEntriesByCategory', () => {
    it('returns entries for a valid category', () => {
      const entries = getEntriesByCategory('finding');
      expect(entries.length).toBeGreaterThan(0);
      entries.forEach((e) => expect(e.category.id).toBe('finding'));
    });

    it('returns empty for a nonexistent category', () => {
      expect(getEntriesByCategory('nonexistent')).toEqual([]);
    });
  });

  describe('getEntryById', () => {
    it('returns the entry for a valid id', () => {
      const entry = getEntryById('find-pantry');
      expect(entry).toBeDefined();
      expect(entry?.question).toContain('food pantry');
    });

    it('returns undefined for an invalid id', () => {
      expect(getEntryById('nonexistent')).toBeUndefined();
    });
  });

  describe('getCategoryQuickReplies', () => {
    it('returns a quick reply for each category', () => {
      const replies = getCategoryQuickReplies();
      expect(replies.length).toBe(FAQ_CATEGORIES.length);
      replies.forEach((r) => expect(r.type).toBe('category'));
    });
  });

  describe('getFollowUpReplies', () => {
    it('returns follow-ups for an entry with follow-ups', () => {
      const entry = FAQ_ENTRIES.find((e) => e.followUps && e.followUps.length > 0);
      expect(entry).toBeDefined();
      const replies = getFollowUpReplies(entry!);
      expect(replies.length).toBeGreaterThan(0);
      replies.forEach((r) => expect(r.type).toBe('question'));
    });

    it('returns empty for an entry without follow-ups', () => {
      const entry = { ...FAQ_ENTRIES[0], followUps: undefined };
      expect(getFollowUpReplies(entry)).toEqual([]);
    });
  });

  describe('createBotMessage', () => {
    it("creates a message with sender 'bot'", () => {
      const msg = createBotMessage('Hello');
      expect(msg.sender).toBe('bot');
      expect(msg.text).toBe('Hello');
      expect(msg.id).toContain('bot-');
    });

    it('includes quick replies when provided', () => {
      const replies = [{ id: 'test', label: 'Test', type: 'category' as const }];
      const msg = createBotMessage('Hello', replies);
      expect(msg.quickReplies).toEqual(replies);
    });

    it('includes a link when provided', () => {
      const link = { label: 'Go', url: '/go' };
      const msg = createBotMessage('Hello', undefined, link);
      expect(msg.link).toEqual(link);
    });
  });

  describe('createUserMessage', () => {
    it("creates a message with sender 'user'", () => {
      const msg = createUserMessage('Hi');
      expect(msg.sender).toBe('user');
      expect(msg.text).toBe('Hi');
      expect(msg.id).toContain('user-');
    });
  });
});
