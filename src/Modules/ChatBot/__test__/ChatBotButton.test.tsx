import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

import ChatBotButton from '../ChatBotButton';

jest.mock('../../Localization/LocalizationComponent', () => ({}));

beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

describe('ChatBotButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <ChatBotButton />
      </MemoryRouter>,
    );

  describe('Rendering', () => {
    it('renders the toggle button', () => {
      renderComponent();
      expect(screen.getByTestId('chatbot-toggle')).toBeInTheDocument();
    });

    it('has the correct aria-label when closed', () => {
      renderComponent();
      expect(screen.getByTestId('chatbot-toggle')).toHaveAttribute('aria-label', 'Open chat');
    });

    it('does not render the chat window initially', () => {
      renderComponent();
      expect(screen.queryByTestId('chatbot-window')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('opens the chat window on click', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByTestId('chatbot-toggle'));

      expect(screen.getByTestId('chatbot-window')).toBeInTheDocument();
    });

    it('changes aria-label to Close chat when open', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByTestId('chatbot-toggle'));

      expect(screen.getByTestId('chatbot-toggle')).toHaveAttribute('aria-label', 'Close chat');
    });

    it('closes the chat window when toggle is clicked again', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByTestId('chatbot-toggle'));
      expect(screen.getByTestId('chatbot-window')).toBeInTheDocument();

      await user.click(screen.getByTestId('chatbot-toggle'));
      expect(screen.queryByTestId('chatbot-window')).not.toBeInTheDocument();
    });

    it('closes the chat window via the close button in the header', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByTestId('chatbot-toggle'));
      expect(screen.getByTestId('chatbot-window')).toBeInTheDocument();

      await user.click(screen.getByTestId('chatbot-close'));
      expect(screen.queryByTestId('chatbot-window')).not.toBeInTheDocument();
    });
  });
});
