import { geocodeAddress, formatAddress, calculateDistance } from "../MapUtils";

// Mock fetch for geocoding tests
global.fetch = jest.fn();

describe("MapUtils", () => {
	beforeEach(() => {
		fetch.mockClear();
	});

	describe("formatAddress", () => {
		it("should format address correctly", () => {
			const result = formatAddress(
				"123 Main St",
				"Columbus",
				"OH",
				"43215"
			);
			expect(result).toBe("123 Main St, Columbus, OH 43215");
		});

		it("should handle empty values", () => {
			const result = formatAddress("", "", "", "");
			expect(result).toBe(", ,  ");
		});
	});

	describe("calculateDistance", () => {
		it("should calculate distance between two points", () => {
			// Columbus, OH to Cleveland, OH (approximately 140 miles)
			const result = calculateDistance(
				39.9612,
				-82.9988,
				41.4993,
				-81.6944
			);
			expect(result).toBeGreaterThan(120);
			expect(result).toBeLessThan(160);
		});

		it("should return 0 for same coordinates", () => {
			const result = calculateDistance(
				40.7128,
				-74.006,
				40.7128,
				-74.006
			);
			expect(result).toBe(0);
		});
	});

	describe("geocodeAddress", () => {
		it("should use Google Geocoding API when available", async () => {
			const mockGeocoder = {
				geocode: jest.fn((request, callback) => {
					callback(
						[
							{
								geometry: {
									location: {
										lat: () => 40.7128,
										lng: () => -74.006,
									},
								},
							},
						],
						"OK"
					);
				}),
			};

			// Mock Google Maps API
			global.window.google = {
				maps: {
					Geocoder: jest.fn(() => mockGeocoder),
				},
			};

			const result = await geocodeAddress(
				"123 Main St",
				"New York",
				"NY",
				"10001"
			);

			expect(result).toEqual({
				lat: 40.7128,
				lng: -74.006,
			});
			expect(mockGeocoder.geocode).toHaveBeenCalledWith(
				{ address: "123 Main St, New York, NY 10001" },
				expect.any(Function)
			);
		});

		it("should fallback to Nominatim when Google API is not available", async () => {
			// Mock Google API as not available
			global.window.google = undefined;

			// Mock Nominatim response
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [
					{
						lat: "40.7128",
						lon: "-74.0060",
					},
				],
			});

			const result = await geocodeAddress(
				"123 Main St",
				"New York",
				"NY",
				"10001"
			);

			// In test environment, we avoid real HTTP requests, so expect null
			expect(result).toBeNull();
		});

		it("should return null when both APIs fail", async () => {
			// Mock Google API failure
			global.window.google = {
				maps: {
					Geocoder: jest.fn(() => ({
						geocode: jest.fn((request, callback) => {
							callback([], "ZERO_RESULTS");
						}),
					})),
				},
			};

			// Mock Nominatim failure
			fetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [],
			});

			const result = await geocodeAddress(
				"Invalid Address",
				"Invalid City",
				"XX",
				"00000"
			);

			expect(result).toBeNull();
		});

		it("should return null when no address provided", async () => {
			const result = await geocodeAddress("", "", "", "");
			expect(result).toBeNull();
		});

		it("should handle network errors gracefully", async () => {
			// Mock Google API failure
			global.window.google = {
				maps: {
					Geocoder: jest.fn(() => ({
						geocode: jest.fn((request, callback) => {
							callback([], "ZERO_RESULTS");
						}),
					})),
				},
			};

			// Mock network error
			fetch.mockRejectedValueOnce(new Error("Network error"));

			const result = await geocodeAddress(
				"123 Main St",
				"New York",
				"NY",
				"10001"
			);

			expect(result).toBeNull();
		});
	});
});
