import { FAQ_ENTRIES, FAQ_CATEGORIES, GREETING_KEYWORDS } from './chatBotData';
import type { FAQEntry, MatchResult, ChatMessage, QuickReply } from './types/chatbot.types';

const STRONG_MATCH_THRESHOLD = 0.3;
const SUGGESTION_THRESHOLD = 0.15;
const MAX_SUGGESTIONS = 3;

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, '')
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function scoreEntry(tokens: string[], entry: FAQEntry): number {
  const inputText = tokens.join(' ');
  let score = 0;
  let matchedKeywords = 0;

  for (const keyword of entry.keywords) {
    const lowerKeyword = keyword.toLowerCase();

    if (inputText === lowerKeyword) {
      score += 2;
      matchedKeywords++;
      continue;
    }

    if (inputText.includes(lowerKeyword)) {
      score += 1.5;
      matchedKeywords++;
      continue;
    }

    const keywordTokens = lowerKeyword.split(/\s+/);
    let tokenMatches = 0;
    for (const kt of keywordTokens) {
      if (tokens.some((t) => t === kt || t.includes(kt) || kt.includes(t))) {
        tokenMatches++;
      }
    }

    if (tokenMatches > 0) {
      score += tokenMatches / keywordTokens.length;
      matchedKeywords++;
    }
  }

  if (entry.keywords.length > 0) {
    score = score / entry.keywords.length;
  }

  if (matchedKeywords >= 2) {
    score *= 1 + matchedKeywords * 0.1;
  }

  return score;
}

export function isGreeting(input: string): boolean {
  const lower = input.toLowerCase().trim();
  return GREETING_KEYWORDS.some(
    (g) => lower === g || lower.startsWith(g + ' ') || lower.endsWith(' ' + g),
  );
}

export function matchQuestion(input: string): MatchResult[] {
  const tokens = tokenize(input);
  if (tokens.length === 0) return [];

  const results: MatchResult[] = FAQ_ENTRIES.map((entry) => ({
    entry,
    score: scoreEntry(tokens, entry),
  }))
    .filter((r) => r.score > SUGGESTION_THRESHOLD)
    .sort((a, b) => b.score - a.score);

  return results;
}

export function findBestMatch(input: string): FAQEntry | null {
  const results = matchQuestion(input);
  if (results.length > 0 && results[0].score >= STRONG_MATCH_THRESHOLD) {
    return results[0].entry;
  }
  return null;
}

export function findSuggestions(input: string): FAQEntry[] {
  const results = matchQuestion(input);
  return results.slice(0, MAX_SUGGESTIONS).map((r) => r.entry);
}

export function getEntriesByCategory(categoryId: string): FAQEntry[] {
  return FAQ_ENTRIES.filter((e) => e.category.id === categoryId);
}

export function getEntryById(id: string): FAQEntry | undefined {
  return FAQ_ENTRIES.find((e) => e.id === id);
}

export function getCategoryQuickReplies(): QuickReply[] {
  return FAQ_CATEGORIES.map((cat) => ({
    id: cat.id,
    label: cat.label,
    type: 'category' as const,
  }));
}

export function getFollowUpReplies(entry: FAQEntry): QuickReply[] {
  if (!entry.followUps) return [];

  const replies: QuickReply[] = [];
  for (const id of entry.followUps) {
    const followUp = getEntryById(id);
    if (followUp) {
      replies.push({ id: followUp.id, label: followUp.question, type: 'question' });
    }
  }
  return replies;
}

let messageIdCounter = 0;

export function createBotMessage(
  text: string,
  quickReplies?: QuickReply[],
  link?: ChatMessage['link'],
): ChatMessage {
  messageIdCounter++;
  return {
    id: `bot-${messageIdCounter}-${Date.now()}`,
    sender: 'bot',
    text,
    link,
    quickReplies,
    timestamp: Date.now(),
  };
}

export function createUserMessage(text: string): ChatMessage {
  messageIdCounter++;
  return {
    id: `user-${messageIdCounter}-${Date.now()}`,
    sender: 'user',
    text,
    timestamp: Date.now(),
  };
}

export function resetMessageCounter(): void {
  messageIdCounter = 0;
}
