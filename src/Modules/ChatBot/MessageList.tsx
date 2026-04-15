import React, { useEffect, useRef } from 'react';

import { cn } from '../../lib/utils';

import QuickReplyButtons from './QuickReplyButtons';
import type { ChatMessage, QuickReply } from './types/chatbot.types';

interface MessageListProps {
  messages: ChatMessage[];
  onQuickReply: (reply: QuickReply) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, onQuickReply }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" data-testid="message-list">
      {messages.map((msg, index) => {
        const isBot = msg.sender === 'bot';
        const isLastMessage = index === messages.length - 1;

        return (
          <div key={msg.id}>
            <div className={cn('flex', isBot ? 'justify-start' : 'justify-end')}>
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  isBot
                    ? 'bg-muted text-foreground rounded-bl-sm'
                    : 'bg-primary text-primary-foreground rounded-br-sm',
                )}
                data-testid={`message-${msg.sender}`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {msg.link && (
                  <a
                    href={msg.link.url}
                    className={cn(
                      'block mt-2 text-xs font-medium underline underline-offset-2',
                      isBot
                        ? 'text-primary hover:text-primary/80'
                        : 'text-primary-foreground/90 hover:text-primary-foreground',
                    )}
                    data-testid="message-link"
                  >
                    {msg.link.label} →
                  </a>
                )}
              </div>
            </div>

            {isBot && isLastMessage && msg.quickReplies && (
              <div className="mt-2">
                <QuickReplyButtons replies={msg.quickReplies} onSelect={onQuickReply} />
              </div>
            )}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
