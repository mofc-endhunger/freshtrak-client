import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

import { Button } from '../../components/ui/button';

import ChatBotWindow from './ChatBotWindow';

const ChatBotButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && <ChatBotWindow onClose={() => setIsOpen(false)} />}

      <Button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-4 right-4 z-50 size-12 rounded-full shadow-lg sm:right-6"
        size="icon"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        data-testid="chatbot-toggle"
      >
        {isOpen ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </Button>
    </>
  );
};

export default ChatBotButton;
