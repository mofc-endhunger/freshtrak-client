import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '../ui/carousel';
import { Badge } from '../ui/badge';
import { resolveImageUrl } from '../../Utils/imageUrl';
import localization from '../../Modules/Localization/LocalizationComponent';

import type { AgencyImage } from '../../Modules/Home/types/home.types';

interface ImageGalleryDialogProps {
  agencyImages?: AgencyImage[];
  eventImages?: AgencyImage[];
  trigger: React.ReactNode;
}

const ImageCarousel: React.FC<{ images: AgencyImage[] }> = ({ images }) => {
  const [current, setCurrent] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const activeImage = images[current];

  return (
    <div className="flex flex-col gap-3">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {images.map((image) => (
            <CarouselItem key={image.id}>
              <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={resolveImageUrl(image.src)}
                  alt={image.caption || image.type}
                  className="h-full w-full object-contain"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-1" />
            <CarouselNext className="right-1" />
          </>
        )}
      </Carousel>

      {activeImage && (
        <div className="flex items-center gap-2 px-1">
          <Badge variant="secondary" className="text-xs text-white">
            {activeImage.type}
          </Badge>
          {activeImage.caption && (
            <span className="text-sm text-muted-foreground">{activeImage.caption}</span>
          )}
        </div>
      )}

      {images.length > 1 && (
        <p className="text-center text-xs text-muted-foreground">
          {current + 1} / {images.length}
        </p>
      )}
    </div>
  );
};

const ImageGalleryDialog: React.FC<ImageGalleryDialogProps> = ({
  agencyImages = [],
  eventImages = [],
  trigger,
}) => {
  const hasAgency = agencyImages.length > 0;
  const hasEvent = eventImages.length > 0;

  if (!hasAgency && !hasEvent) return null;

  const showTabs = hasAgency && hasEvent;

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-white" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{localization.button_view_photos}</DialogTitle>
        </DialogHeader>

        {showTabs ? (
          <Tabs defaultValue="agency">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="agency">{localization.label_location_photos}</TabsTrigger>
              <TabsTrigger value="event">{localization.label_event_instructions}</TabsTrigger>
            </TabsList>
            <TabsContent value="agency" className="mt-4">
              <ImageCarousel images={agencyImages} />
            </TabsContent>
            <TabsContent value="event" className="mt-4">
              <ImageCarousel images={eventImages} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="mt-2">
            <ImageCarousel images={hasAgency ? agencyImages : eventImages} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageGalleryDialog;
