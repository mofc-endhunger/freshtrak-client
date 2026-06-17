import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FeatureCard from '../FeatureCard';

const DEFAULT_PROPS = {
  title: 'Stay Up to Date',
  content: 'Make a FreshTrak account to stay up to date on local food access events.',
  imageUrl: '/calendar.svg',
};

describe('FeatureCard', () => {
  describe('Rendering', () => {
    it('renders the card container', () => {
      render(<FeatureCard {...DEFAULT_PROPS} />);
      expect(screen.getByTestId('feature-card')).toBeInTheDocument();
    });

    it('renders the title', () => {
      render(<FeatureCard {...DEFAULT_PROPS} />);
      expect(screen.getByText('Stay Up to Date')).toBeInTheDocument();
    });

    it('renders the content text', () => {
      render(<FeatureCard {...DEFAULT_PROPS} />);
      expect(
        screen.getByText(
          'Make a FreshTrak account to stay up to date on local food access events.',
        ),
      ).toBeInTheDocument();
    });

    it('renders the icon image with accessible alt text matching the title', () => {
      render(<FeatureCard {...DEFAULT_PROPS} />);
      const img = screen.getByRole('img', { name: 'Stay Up to Date' });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/calendar.svg');
    });

    it('applies the custom className to the card', () => {
      render(<FeatureCard {...DEFAULT_PROPS} className="custom-class" />);
      expect(screen.getByTestId('feature-card')).toHaveClass('custom-class');
    });
  });

  describe('Action prop', () => {
    it('does not render an action area when action prop is omitted', () => {
      render(<FeatureCard {...DEFAULT_PROPS} />);
      expect(screen.queryByTestId('feature-card-action')).not.toBeInTheDocument();
    });

    it('renders the action element when action prop is provided', () => {
      render(
        <FeatureCard
          {...DEFAULT_PROPS}
          action={<button data-testid="test-action">Create Account</button>}
        />,
      );
      expect(screen.getByTestId('test-action')).toBeInTheDocument();
      expect(screen.getByText('Create Account')).toBeInTheDocument();
    });

    it('renders the action below the content', () => {
      render(<FeatureCard {...DEFAULT_PROPS} action={<button>Create Account</button>} />);
      const content = screen.getByText(DEFAULT_PROPS.content);
      const action = screen.getByText('Create Account');
      expect(content.compareDocumentPosition(action)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });
  });
});
