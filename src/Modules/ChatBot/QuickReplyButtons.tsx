import React from 'react';

import { Button } from '../../components/ui/button';

import type { QuickReply } from './types/chatbot.types';

interface QuickReplyButtonsProps {
  replies: QuickReply[];
  onSelect: (reply: QuickReply) => void;
}

const QuickReplyButtons: React.FC<QuickReplyButtonsProps> = ({ replies, onSelect }) => {
  if (replies.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-4 py-2" data-testid="quick-reply-buttons">
      {replies.map((reply) => (
        <Button
          key={reply.id}
          variant="outline"
          size="sm"
          className="text-xs h-auto py-1.5 px-3 whitespace-normal text-left"
          onClick={() => onSelect(reply)}
          data-testid={`quick-reply-${reply.id}`}
        >
          {reply.label}
        </Button>
      ))}
    </div>
  );
};

export default QuickReplyButtons;
