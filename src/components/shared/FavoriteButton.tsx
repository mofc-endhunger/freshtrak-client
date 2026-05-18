import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useAuth } from '../../Modules/Authentication/AuthContext';
import {
  addFavorite,
  removeFavorite,
  selectIsFavorited,
} from '../../Store/Favorites/favoritesSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { RENDER_URL } from '../../Utils/Urls';
import { cn } from '../../lib/utils';

interface FavoriteButtonProps {
  /** The numeric event ID from pantry-finder-api */
  eventId: number;
  /** Optional extra class names for the button wrapper */
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ eventId, className }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const isFavorited = useSelector(selectIsFavorited(eventId));
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    if (isFavorited) {
      dispatch(removeFavorite(eventId) as any);
    } else {
      dispatch(addFavorite(eventId) as any);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        data-testid="favorite-button"
        onClick={handleClick}
        className={cn(
          'flex items-center justify-center p-2.5 rounded-full transition-colors',
          'hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          className,
        )}
      >
        <Star
          data-testid={isFavorited ? 'star-filled' : 'star-outline'}
          className={cn(
            'w-5 h-5 transition-colors',
            isFavorited ? 'fill-primary text-primary' : 'fill-none text-muted-foreground',
          )}
          strokeWidth={1.5}
        />
      </button>

      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 text-gray-900">
          <DialogHeader>
            <DialogTitle className="text-center text-gray-900">
              Sign in to save favorites
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 pt-2">
              Create a free account or sign in to save events and access them anytime from your
              profile.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <Button
              variant="default"
              className="w-full"
              onClick={() => {
                setShowLoginPrompt(false);
                navigate(RENDER_URL.LOGIN_URL);
              }}
            >
              Log in
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setShowLoginPrompt(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FavoriteButton;
