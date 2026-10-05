import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PrivacyComponent from '../PrivacyComponent';
import TermsComponent from '../TermsComponent';

/**
 * These pages are plain static content and had no coverage. They are asserted
 * here because Twilio's A2P reviewers read this exact wording when approving our
 * SMS program (SUP-638, SUP-639) — a well-meaning copy edit that drops the SMS
 * section or reinstates the retired contact address would fail the submission
 * silently. The assertions cover only the compliance-critical strings, not the
 * rest of the policy prose.
 */

const renderWithRouter = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

// JSX wraps these sentences across source lines, so the rendered text carries
// newlines and runs of spaces that the author never intended.
const collapseWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

const SMS_SECTION_BODY =
  'If you opt in to receive SMS text messages from FreshTrak (e.g., appointment or food ' +
  'pantry visit confirmations, reminders, and program updates), we collect your mobile ' +
  'phone number for the sole purpose of that messaging program. No mobile information ' +
  'collected as part of the SMS consent process will be shared with third parties or ' +
  'affiliates for marketing or promotional purposes. This information will only be used ' +
  'to send the text messages you have opted into. You may opt out at any time by ' +
  'replying STOP.';

describe('Privacy Policy page (SUP-638)', () => {
  it('carries the Text Messaging / SMS Program section verbatim', () => {
    renderWithRouter(<PrivacyComponent />);

    expect(
      screen.getByRole('heading', { name: 'Text Messaging / SMS Program' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(SMS_SECTION_BODY, { normalizer: collapseWhitespace }),
    ).toBeInTheDocument();
  });

  it('places the SMS section above Information We Collect', () => {
    renderWithRouter(<PrivacyComponent />);

    const sms = screen.getByRole('heading', { name: 'Text Messaging / SMS Program' });
    const collect = screen.getByRole('heading', { name: 'Information We Collect' });

    // Reviewers skim from the top; the SMS disclosure has to be findable there.
    expect(sms.compareDocumentPosition(collect) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('uses the current contact address and no longer references midohiofoodbank.org', () => {
    const { container } = renderWithRouter(<PrivacyComponent />);

    expect(container.textContent).not.toContain('midohiofoodbank.org');
    // Children's Privacy and Contact Information sections.
    expect(screen.getAllByText(/freshtrak@mofc\.org/)).toHaveLength(2);
  });
});

describe('Terms of Use page (SUP-639)', () => {
  it('reduces Contact Us to the current address, dropping the retired phone number', () => {
    const { container } = renderWithRouter(<TermsComponent />);

    expect(screen.getByRole('heading', { name: 'Contact Us' })).toBeInTheDocument();
    expect(
      screen.getByText('Please contact us with any questions you have - freshtrak@mofc.org', {
        normalizer: collapseWhitespace,
      }),
    ).toBeInTheDocument();

    expect(container.textContent).not.toContain('614-317-9450');
    expect(container.textContent).not.toContain('midohiofoodbank.org');
  });
});
