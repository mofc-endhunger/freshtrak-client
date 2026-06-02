import React, { useState } from 'react';
import { Send } from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

interface ChatBotInputProps {
  onSend: (message: string) => void;
}

const ChatBotInput: React.FC<ChatBotInputProps> = ({ onSend }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t px-3 py-2"
      data-testid="chatbot-input-form"
    >
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type your question..."
        className="flex-1 h-9 text-sm border-0 shadow-none focus-visible:ring-0"
        data-testid="chatbot-input"
        aria-label="Type your question"
      />
      <Button
        type="submit"
        size="icon"
        variant="ghost"
        className="shrink-0 size-8 text-primary hover:text-primary/80"
        disabled={!value.trim()}
        aria-label="Send message"
        data-testid="chatbot-send-button"
      >
        <Send className="size-4" />
      </Button>
    </form>
  );
};

export default ChatBotInput;
