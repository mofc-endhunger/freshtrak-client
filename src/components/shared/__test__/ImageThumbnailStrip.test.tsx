import React from 'react';
import { render, screen } from '@testing-library/react';

import ImageThumbnailStrip from '../ImageThumbnailStrip';

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

describe('ImageThumbnailStrip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when no images are provided', () => {
    const { container } = render(<ImageThumbnailStrip />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when both arrays are empty', () => {
    const { container } = render(<ImageThumbnailStrip agencyImages={[]} eventImages={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders thumbnail images when agency images are provided', () => {
    render(<ImageThumbnailStrip agencyImages={mockAgencyImages} />);
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThanOrEqual(2);
    expect(images[0]).toHaveAttribute('alt', 'Agency Logo');
  });

  it('renders thumbnail images when event images are provided', () => {
    render(<ImageThumbnailStrip eventImages={mockEventImages} />);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(1);
    expect(images[0]).toHaveAttribute('alt', 'Check-in guide');
  });

  it("always shows 'View Photos' text regardless of image count", () => {
    render(
      <ImageThumbnailStrip
        agencyImages={mockAgencyImages}
        eventImages={mockEventImages}
        maxVisible={2}
      />,
    );
    expect(screen.getByText('View Photos')).toBeInTheDocument();
  });

  it("shows 'View Photos' text with a single image", () => {
    render(<ImageThumbnailStrip agencyImages={[mockAgencyImages[0]]} maxVisible={3} />);
    expect(screen.getByText('View Photos')).toBeInTheDocument();
  });

  it('puts logo first regardless of input order', () => {
    const nonLogoFirst = [
      { id: 10, type: 'Building', caption: 'Building', src: '/b.png' },
      { id: 11, type: 'Logo', caption: 'The Logo', src: '/l.png' },
    ];
    render(<ImageThumbnailStrip agencyImages={nonLogoFirst} />);
    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('alt', 'The Logo');
  });

  it('resolves image URLs correctly', () => {
    render(<ImageThumbnailStrip agencyImages={[mockAgencyImages[0]]} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://images.test.com/logo.png');
  });

  it('has the data-testid attribute on the trigger', () => {
    render(<ImageThumbnailStrip agencyImages={mockAgencyImages} />);
    expect(screen.getByTestId('image-thumbnail-strip')).toBeInTheDocument();
  });
});
