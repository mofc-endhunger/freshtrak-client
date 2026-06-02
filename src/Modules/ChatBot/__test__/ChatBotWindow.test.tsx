import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

import ChatBotWindow from '../ChatBotWindow';
import { WELCOME_MESSAGE, FAQ_CATEGORIES, FALLBACK_MESSAGE } from '../chatBotData';

jest.mock('../../Localization/LocalizationComponent', () => ({}));

beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

describe('ChatBotWindow', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <ChatBotWindow onClose={mockOnClose} />
      </MemoryRouter>,
    );

  describe('Rendering', () => {
    it('renders the chat window', () => {
      renderComponent();
      expect(screen.getByTestId('chatbot-window')).toBeInTheDocument();
    });

    it('displays the title', () => {
      renderComponent();
      expect(screen.getByText('FreshTrak Assistant')).toBeInTheDocument();
    });

    it('displays the welcome message', () => {
      renderComponent();
      expect(screen.getByText(WELCOME_MESSAGE)).toBeInTheDocument();
    });

    it('displays category quick replies', () => {
      renderComponent();
      FAQ_CATEGORIES.forEach((cat) => {
        expect(screen.getByTestId(`quick-reply-${cat.id}`)).toBeInTheDocument();
      });
    });

    it('renders the input form', () => {
      renderComponent();
      expect(screen.getByTestId('chatbot-input-form')).toBeInTheDocument();
    });

    it('renders reset and close buttons', () => {
      renderComponent();
      expect(screen.getByTestId('chatbot-reset')).toBeInTheDocument();
      expect(screen.getByTestId('chatbot-close')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onClose when the close button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByTestId('chatbot-close'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('sends a typed message and receives a response', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByTestId('chatbot-input');
      await user.type(input, 'find food near me');
      await user.click(screen.getByTestId('chatbot-send-button'));

      expect(screen.getByText('find food near me')).toBeInTheDocument();

      const botMessages = screen.getAllByTestId('message-bot');
      expect(botMessages.length).toBeGreaterThan(1);
    });

    it('handles enter key to send message', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByTestId('chatbot-input');
      await user.type(input, 'cancel reservation{enter}');

      expect(screen.getByText('cancel reservation')).toBeInTheDocument();
    });

    it('does not send empty messages', async () => {
      const user = userEvent.setup();
      renderComponent();

      const initialMessageCount = screen.getAllByTestId('message-bot').length;
      await user.click(screen.getByTestId('chatbot-send-button'));
      expect(screen.getAllByTestId('message-bot').length).toBe(initialMessageCount);
    });

    it('navigates categories via quick reply buttons', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByTestId('quick-reply-finding'));

      expect(screen.getByText('Finding Food')).toBeInTheDocument();

      const botMessages = screen.getAllByTestId('message-bot');
      const lastBotMessage = botMessages[botMessages.length - 1];
      expect(lastBotMessage.textContent).toContain('finding food');
    });

    it('shows answer when clicking a question quick reply', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByTestId('quick-reply-finding'));

      const findPantryButton = screen.getByTestId('quick-reply-find-pantry');
      await user.click(findPantryButton);

      expect(screen.getByText(/enter your zip code/i)).toBeInTheDocument();
    });

    it('responds to greetings with welcome prompt', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByTestId('chatbot-input');
      await user.type(input, 'hello{enter}');

      expect(screen.getByText('hello')).toBeInTheDocument();
      expect(screen.getByText('Hello! How can I help you today?')).toBeInTheDocument();
    });

    it('shows fallback message for unrecognized input', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByTestId('chatbot-input');
      await user.type(input, 'xyzzy garble nonsense foobar{enter}');

      expect(screen.getByText(FALLBACK_MESSAGE)).toBeInTheDocument();
    });
  });

  describe('Reset', () => {
    it('resets conversation to welcome state', async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByTestId('chatbot-input');
      await user.type(input, 'hello{enter}');
      expect(screen.getAllByTestId('message-bot').length).toBeGreaterThan(1);

      await user.click(screen.getByTestId('chatbot-reset'));

      const botMessages = screen.getAllByTestId('message-bot');
      expect(botMessages.length).toBe(1);
      expect(screen.getByText(WELCOME_MESSAGE)).toBeInTheDocument();
    });
  });
});
