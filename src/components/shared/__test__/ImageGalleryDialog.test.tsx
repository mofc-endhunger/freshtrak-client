import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ImageGalleryDialog from '../ImageGalleryDialog';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock the carousel UI component to avoid embla-carousel jsdom issues
jest.mock('../../ui/carousel', () => ({
  Carousel: ({ children, ...props }: any) => (
    <div data-testid="carousel" {...props}>
      {children}
    </div>
  ),
  CarouselContent: ({ children, ...props }: any) => (
    <div data-testid="carousel-content" {...props}>
      {children}
    </div>
  ),
  CarouselItem: ({ children, ...props }: any) => (
    <div data-testid="carousel-item" {...props}>
      {children}
    </div>
  ),
  CarouselPrevious: (props: any) => <button {...props}>Prev</button>,
  CarouselNext: (props: any) => <button {...props}>Next</button>,
}));

jest.mock('../../../Utils/imageUrl', () => ({
  resolveImageUrl: (src: string) => `https://images.test.com${src}`,
}));

jest.mock('../../../Modules/Localization/LocalizationComponent', () => ({
  button_view_photos: 'View Photos',
  label_location_photos: 'Location',
  label_event_instructions: 'Event Info',
  label_more_photos: '+{0} more',
  formatString: (template: string, ...args: unknown[]) => template.replace('{0}', String(args[0])),
}));

const mockAgencyImages = [
  { id: 1, type: 'Logo', caption: 'Agency Logo', src: '/logo.png' },
  { id: 2, type: 'Building', caption: 'Front view', src: '/building.png' },
];

const mockEventImages = [
  { id: 3, type: 'Instructions', caption: 'Check-in guide', src: '/checkin.png' },
];

describe('ImageGalleryDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when no images are provided', () => {
    const { container } = render(<ImageGalleryDialog trigger={<button>Open</button>} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when both arrays are empty', () => {
    const { container } = render(
      <ImageGalleryDialog agencyImages={[]} eventImages={[]} trigger={<button>Open</button>} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the trigger button when images exist', () => {
    render(
      <ImageGalleryDialog
        agencyImages={mockAgencyImages}
        trigger={<button>Open Gallery</button>}
      />,
    );
    expect(screen.getByText('Open Gallery')).toBeInTheDocument();
  });

  it('opens dialog and shows title when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ImageGalleryDialog
        agencyImages={mockAgencyImages}
        trigger={<button>Open Gallery</button>}
      />,
    );
    await user.click(screen.getByText('Open Gallery'));
    await waitFor(() => {
      expect(screen.getByText('View Photos')).toBeInTheDocument();
    });
  });

  it('shows tabs when both agency and event images exist', async () => {
    const user = userEvent.setup();
    render(
      <ImageGalleryDialog
        agencyImages={mockAgencyImages}
        eventImages={mockEventImages}
        trigger={<button>Open Gallery</button>}
      />,
    );
    await user.click(screen.getByText('Open Gallery'));
    await waitFor(() => {
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('Event Info')).toBeInTheDocument();
    });
  });

  it('does not show tabs when only agency images exist', async () => {
    const user = userEvent.setup();
    render(
      <ImageGalleryDialog
        agencyImages={mockAgencyImages}
        trigger={<button>Open Gallery</button>}
      />,
    );
    await user.click(screen.getByText('Open Gallery'));
    await waitFor(() => {
      expect(screen.queryByText('Location')).not.toBeInTheDocument();
      expect(screen.queryByText('Event Info')).not.toBeInTheDocument();
    });
  });

  it('renders images with correct alt text and src', async () => {
    const user = userEvent.setup();
    render(
      <ImageGalleryDialog
        agencyImages={[mockAgencyImages[0]]}
        trigger={<button>Open Gallery</button>}
      />,
    );
    await user.click(screen.getByText('Open Gallery'));
    await waitFor(() => {
      const img = screen.getByAltText('Agency Logo');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://images.test.com/logo.png');
    });
  });

  it('displays the image type badge', async () => {
    const user = userEvent.setup();
    render(
      <ImageGalleryDialog
        agencyImages={[mockAgencyImages[0]]}
        trigger={<button>Open Gallery</button>}
      />,
    );
    await user.click(screen.getByText('Open Gallery'));
    await waitFor(() => {
      expect(screen.getByText('Logo')).toBeInTheDocument();
    });
  });
});
