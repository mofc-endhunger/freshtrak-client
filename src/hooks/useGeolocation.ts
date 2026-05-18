import { useEffect, useRef, useState } from 'react';

export type GeolocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable' | 'error';

export interface UseGeolocationResult {
  status: GeolocationStatus;
  coordinates: GeolocationCoordinates | null;
  error: GeolocationPositionError | null;
}

const GEOLOCATION_OPTIONS: PositionOptions = {
  timeout: 8_000,
  maximumAge: 300_000,
  enableHighAccuracy: false,
};

/**
 * Requests the device's current position once on mount using the browser
 * Geolocation API.  Fires a single `getCurrentPosition` call — no retries,
 * no polling.  If the API is unavailable, status stays "unavailable".
 */
export const useGeolocation = (): UseGeolocationResult => {
  const [status, setStatus] = useState<GeolocationStatus>(() =>
    Boolean(navigator.geolocation) ? 'loading' : 'unavailable',
  );
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        if (!isMountedRef.current) return;
        setCoordinates(position.coords);
        setStatus('granted');
      },
      (positionError: GeolocationPositionError) => {
        if (!isMountedRef.current) return;
        setError(positionError);
        if (positionError.code === positionError.PERMISSION_DENIED) {
          setStatus('denied');
        } else if (positionError.code === positionError.POSITION_UNAVAILABLE) {
          setStatus('unavailable');
        } else {
          // TIMEOUT or unknown
          setStatus('error');
        }
      },
      GEOLOCATION_OPTIONS,
    );

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return { status, coordinates, error };
};

export default useGeolocation;
