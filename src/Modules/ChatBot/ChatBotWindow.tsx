import React, { useState, useCallback } from 'react';
import { X, RotateCcw } from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';

import MessageList from './MessageList';
import ChatBotInput from './ChatBotInput';
import { WELCOME_MESSAGE, FALLBACK_MESSAGE, NO_MATCH_SUGGESTIONS_MESSAGE } from './chatBotData';
import {
  findBestMatch,
  findSuggestions,
  isGreeting,
  getEntriesByCategory,
  getEntryById,
  getFollowUpReplies,
  getCategoryQuickReplies,
  createBotMessage,
  createUserMessage,
  resetMessageCounter,
} from './chatBotMatcher';
import type { ChatMessage, QuickReply } from './types/chatbot.types';

interface ChatBotWindowProps {
  onClose: () => void;
}

function buildWelcomeMessage(): ChatMessage {
  return createBotMessage(WELCOME_MESSAGE, getCategoryQuickReplies());
}

const ChatBotWindow: React.FC<ChatBotWindowProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([buildWelcomeMessage()]);

  const addMessages = useCallback((...newMessages: ChatMessage[]) => {
    setMessages((prev) => [...prev, ...newMessages]);
  }, []);

  const handleUserInput = useCallback(
    (text: string) => {
      const userMsg = createUserMessage(text);

      if (isGreeting(text)) {
        const botMsg = createBotMessage(
          'Hello! How can I help you today?',
          getCategoryQuickReplies(),
        );
        addMessages(userMsg, botMsg);
        return;
      }

      const bestMatch = findBestMatch(text);

      if (bestMatch) {
        const followUps = getFollowUpReplies(bestMatch);
        const botMsg = createBotMessage(
          bestMatch.answer,
          followUps.length > 0 ? followUps : getCategoryQuickReplies(),
          bestMatch.link,
        );
        addMessages(userMsg, botMsg);
        return;
      }

      const suggestions = findSuggestions(text);

      if (suggestions.length > 0) {
        const suggestionReplies: QuickReply[] = suggestions.map((s) => ({
          id: s.id,
          label: s.question,
          type: 'question' as const,
        }));
        const botMsg = createBotMessage(NO_MATCH_SUGGESTIONS_MESSAGE, suggestionReplies);
        addMessages(userMsg, botMsg);
        return;
      }

      const botMsg = createBotMessage(FALLBACK_MESSAGE, getCategoryQuickReplies());
      addMessages(userMsg, botMsg);
    },
    [addMessages],
  );

  const handleQuickReply = useCallback(
    (reply: QuickReply) => {
      if (reply.type === 'category') {
        const entries = getEntriesByCategory(reply.id);
        const questionReplies: QuickReply[] = entries.map((e) => ({
          id: e.id,
          label: e.question,
          type: 'question' as const,
        }));
        const userMsg = createUserMessage(reply.label);
        const botMsg = createBotMessage(
          `Here are some common questions about ${reply.label.toLowerCase()}:`,
          questionReplies,
        );
        addMessages(userMsg, botMsg);
        return;
      }

      if (reply.type === 'question') {
        const entry = getEntryById(reply.id);
        if (!entry) return;

        const followUps = getFollowUpReplies(entry);
        const userMsg = createUserMessage(entry.question);
        const botMsg = createBotMessage(
          entry.answer,
          followUps.length > 0 ? followUps : getCategoryQuickReplies(),
          entry.link,
        );
        addMessages(userMsg, botMsg);
      }
    },
    [addMessages],
  );

  const handleReset = useCallback(() => {
    resetMessageCounter();
    setMessages([buildWelcomeMessage()]);
  }, []);

  return (
    <Card
      className="fixed bottom-20 right-4 w-[360px] h-[500px] z-50 flex flex-col gap-0 py-0 bg-white shadow-xl border sm:right-6"
      data-testid="chatbot-window"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-semibold">FreshTrak Assistant</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={handleReset}
            aria-label="Start over"
            data-testid="chatbot-reset"
          >
            <RotateCcw className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onClose}
            aria-label="Close chat"
            data-testid="chatbot-close"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Messages */}
      <MessageList messages={messages} onQuickReply={handleQuickReply} />

      {/* Input */}
      <ChatBotInput onSend={handleUserInput} />
    </Card>
  );
};

export default ChatBotWindow;
