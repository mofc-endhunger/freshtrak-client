import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FeedbackContainer from '../FeedbackContainer';

let mockModalState = 'form';
const mockSaveProgress = jest.fn();

jest.mock('../components/FeedbackModal', () => {
  return function MockFeedbackModal(props: any) {
    return props.isOpen ? (
      <div data-testid="feedback-modal">
        <button data-testid="close-modal" onClick={props.onClose}>
          Close
        </button>
      </div>
    ) : null;
  };
});

jest.mock('../components/FeedbackConfirmation', () => {
  return function MockFeedbackConfirmation(props: any) {
    return props.isOpen ? (
      <div data-testid="feedback-confirmation">
        <button data-testid="close-confirmation" onClick={props.onClose}>
          Close
        </button>
      </div>
    ) : null;
  };
});

jest.mock('../context', () => ({
  FeedbackProvider: ({ children }: any) => <div data-testid="feedback-provider">{children}</div>,
  useFeedback: () => ({
    modalState: mockModalState,
    saveProgress: mockSaveProgress,
  }),
}));

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  registrationId: 123,
};

describe('FeedbackContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockModalState = 'form';
  });

  it('returns null when isOpen is false (nothing rendered)', () => {
    const { container } = render(<FeedbackContainer {...defaultProps} isOpen={false} />);

    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId('feedback-modal')).not.toBeInTheDocument();
    expect(screen.queryByTestId('feedback-confirmation')).not.toBeInTheDocument();
  });

  it('renders FeedbackModal when isOpen is true', () => {
    render(<FeedbackContainer {...defaultProps} />);

    expect(screen.getByTestId('feedback-modal')).toBeInTheDocument();
  });

  it('does NOT render FeedbackConfirmation initially when isOpen is true (confirmation is hidden until modalState becomes confirmation)', () => {
    render(<FeedbackContainer {...defaultProps} />);

    expect(screen.getByTestId('feedback-modal')).toBeInTheDocument();
    expect(screen.queryByTestId('feedback-confirmation')).not.toBeInTheDocument();
  });

  it('calls saveProgress and onClose when form is closed (handleClose with modalState=form)', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<FeedbackContainer {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByTestId('close-modal'));

    expect(mockSaveProgress).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmitComplete and onClose when confirmation is closed (handleConfirmationClose)', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const onSubmitComplete = jest.fn();
    const { rerender } = render(
      <FeedbackContainer {...defaultProps} onClose={onClose} onSubmitComplete={onSubmitComplete} />,
    );

    // Transition to confirmation state
    await act(async () => {
      mockModalState = 'confirmation';
      rerender(
        <FeedbackContainer
          {...defaultProps}
          onClose={onClose}
          onSubmitComplete={onSubmitComplete}
        />,
      );
    });

    expect(screen.getByTestId('feedback-confirmation')).toBeInTheDocument();

    await act(async () => {
      await user.click(screen.getByTestId('close-confirmation'));
    });

    expect(onSubmitComplete).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onSubmitComplete when form is closed (only on confirmation close)', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const onSubmitComplete = jest.fn();
    render(
      <FeedbackContainer {...defaultProps} onClose={onClose} onSubmitComplete={onSubmitComplete} />,
    );

    // Close the form modal (not confirmation)
    await user.click(screen.getByTestId('close-modal'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSubmitComplete).not.toHaveBeenCalled();
  });
});
