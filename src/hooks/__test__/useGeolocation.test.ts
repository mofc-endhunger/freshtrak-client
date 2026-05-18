import { act, renderHook } from '@testing-library/react';
import { useGeolocation } from '../useGeolocation';

// ----------------------------------------------------------------------------
// Helpers to build mock GeolocationPosition / GeolocationPositionError
// ----------------------------------------------------------------------------

const makeMockCoords = (
  overrides: Partial<GeolocationCoordinates> = {},
): GeolocationCoordinates => ({
  latitude: 40.7128,
  longitude: -74.006,
  accuracy: 10,
  altitude: null,
  altitudeAccuracy: null,
  heading: null,
  speed: null,
  ...overrides,
});

const makeMockPosition = (
  coordsOverrides?: Partial<GeolocationCoordinates>,
): GeolocationPosition => ({
  coords: makeMockCoords(coordsOverrides),
  timestamp: Date.now(),
});

type GeolocationErrorCode = 1 | 2 | 3;

const makeMockError = (code: GeolocationErrorCode): GeolocationPositionError => ({
  code,
  message: `GeolocationPositionError code ${code}`,
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
});

// ----------------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------------

describe('useGeolocation', () => {
  let getCurrentPositionMock: jest.Mock;

  beforeEach(() => {
    getCurrentPositionMock = jest.fn();
    Object.defineProperty(global.navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition: getCurrentPositionMock },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns status 'loading' immediately after mount when geolocation is available", () => {
    // getCurrentPosition never resolves — simulates pending state
    getCurrentPositionMock.mockImplementation(() => {});

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.status).toBe('loading');
    expect(result.current.coordinates).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("returns status 'granted' and coordinates on success", async () => {
    const mockPosition = makeMockPosition();
    getCurrentPositionMock.mockImplementation((successCb: PositionCallback) => {
      successCb(mockPosition);
    });

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {});

    expect(result.current.status).toBe('granted');
    expect(result.current.coordinates).toBe(mockPosition.coords);
    expect(result.current.error).toBeNull();
  });

  it("returns status 'denied' when error code is PERMISSION_DENIED (1)", async () => {
    const mockError = makeMockError(1);
    getCurrentPositionMock.mockImplementation((_: unknown, errorCb: PositionErrorCallback) => {
      errorCb(mockError);
    });

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {});

    expect(result.current.status).toBe('denied');
    expect(result.current.coordinates).toBeNull();
    expect(result.current.error).toBe(mockError);
  });

  it("returns status 'unavailable' when error code is POSITION_UNAVAILABLE (2)", async () => {
    const mockError = makeMockError(2);
    getCurrentPositionMock.mockImplementation((_: unknown, errorCb: PositionErrorCallback) => {
      errorCb(mockError);
    });

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {});

    expect(result.current.status).toBe('unavailable');
    expect(result.current.error).toBe(mockError);
  });

  it("returns status 'error' when error code is TIMEOUT (3)", async () => {
    const mockError = makeMockError(3);
    getCurrentPositionMock.mockImplementation((_: unknown, errorCb: PositionErrorCallback) => {
      errorCb(mockError);
    });

    const { result } = renderHook(() => useGeolocation());

    await act(async () => {});

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(mockError);
  });

  it('does not call getCurrentPosition when navigator.geolocation is unavailable', () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      configurable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useGeolocation());

    expect(getCurrentPositionMock).not.toHaveBeenCalled();
    expect(result.current.status).toBe('unavailable');
    expect(result.current.coordinates).toBeNull();
  });

  it('passes the correct PositionOptions to getCurrentPosition', () => {
    getCurrentPositionMock.mockImplementation(() => {});

    renderHook(() => useGeolocation());

    expect(getCurrentPositionMock).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({
        timeout: 8_000,
        maximumAge: 300_000,
      }),
    );
  });
});
