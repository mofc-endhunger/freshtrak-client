import React, { useMemo } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '../ui/button';
import ImageGalleryDialog from './ImageGalleryDialog';
import { resolveImageUrl } from '../../Utils/imageUrl';
import localization from '../../Modules/Localization/LocalizationComponent';

import type { AgencyImage } from '../../Modules/Home/types/home.types';

interface ImageThumbnailStripProps {
  agencyImages?: AgencyImage[];
  eventImages?: AgencyImage[];
  maxVisible?: number;
}

/**
 * Sorts images so logos appear first, then other types.
 */
function sortImagesLogoFirst(images: AgencyImage[]): AgencyImage[] {
  return [...images].sort((a, b) => {
    if (a.type === 'Logo' && b.type !== 'Logo') return -1;
    if (a.type !== 'Logo' && b.type === 'Logo') return 1;
    return 0;
  });
}

const ImageThumbnailStrip: React.FC<ImageThumbnailStripProps> = ({
  agencyImages = [],
  eventImages = [],
  maxVisible = 3,
}) => {
  const allImages = useMemo(
    () => sortImagesLogoFirst([...agencyImages, ...eventImages]),
    [agencyImages, eventImages],
  );

  if (allImages.length === 0) return null;

  const visible = allImages.slice(0, maxVisible);
  const remaining = allImages.length - maxVisible;

  return (
    <ImageGalleryDialog
      agencyImages={agencyImages}
      eventImages={eventImages}
      trigger={
        <Button
          variant="ghost"
          className="flex h-auto items-center gap-2 p-2 hover:bg-gray-50 border border-gray-200 rounded-md"
          data-testid="image-thumbnail-strip"
        >
          <div className="flex -space-x-2">
            {visible.map((image) => (
              <div
                key={image.id}
                className="h-8 w-8 shrink-0 overflow-hidden rounded border-2 border-white bg-gray-100"
              >
                <img
                  src={resolveImageUrl(image.src)}
                  alt={image.caption || image.type}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Camera className="h-3 w-3" />
            {remaining > 0
              ? localization.formatString(localization.label_more_photos, remaining)
              : localization.button_view_photos}
          </span>
        </Button>
      }
    />
  );
};

export default ImageThumbnailStrip;
