export interface FAQEntry {
  id: string;
  category: FAQCategory;
  keywords: string[];
  question: string;
  answer: string;
  link?: ChatBotLink;
  followUps?: string[];
}

export interface FAQCategory {
  id: string;
  label: string;
  icon?: string;
}

export interface ChatBotLink {
  label: string;
  url: string;
}

export type MessageSender = 'bot' | 'user';

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  link?: ChatBotLink;
  quickReplies?: QuickReply[];
  timestamp: number;
}

export interface QuickReply {
  id: string;
  label: string;
  type: 'category' | 'question' | 'action';
}

export interface MatchResult {
  entry: FAQEntry;
  score: number;
}
