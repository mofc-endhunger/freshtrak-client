import * as React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import { preformattedEventData, mockFamily } from "../../../Testing";
import RegistrationConfirmComponent from "../RegistrationConfirmComponent";
import { Event, RegistrationFormData } from "../types/registration.types";

jest.mock("axios");

// Type definitions for test data
interface TestState {
	event: { event: Event };
	user: { user: RegistrationFormData };
}

interface LocationState {
	state: {
		user: RegistrationFormData;
		eventTimeStamp: Record<string, any>;
	};
}

const initialState: TestState = {
	event: { event: { ...preformattedEventData, acceptWalkin: true } as Event },
	user: { user: mockFamily },
};

const mockStore = (configureStore as any)([]);
const store = mockStore(initialState);

// Mock canvas context for QR code rendering
window.HTMLCanvasElement.prototype.getContext = function (contextId: string) {
	if (contextId === "2d") {
		return {} as CanvasRenderingContext2D;
	}
	return null;
} as any;

describe("RegistrationConfirmComponent", () => {
	it("should render without errors", () => {
		expect(() => {
			render(
				<Provider store={store}>
					<MemoryRouter>
						<RegistrationConfirmComponent
							location={
								{
									state: {
										user: mockFamily,
										eventTimeStamp: {},
									},
								} as LocationState
							}
						/>
					</MemoryRouter>
				</Provider>
			);
		}).not.toThrow();
	});

	it("should load without errors with empty event", () => {
		const emptyStore = mockStore({
			event: { event: {} as Event },
			user: { user: mockFamily },
		});
		const user_mock_data: LocationState = {
			state: { user: mockFamily, eventTimeStamp: {} },
		};

		expect(() => {
			render(
				<Provider store={emptyStore}>
					<MemoryRouter>
						<RegistrationConfirmComponent
							location={user_mock_data}
						/>
					</MemoryRouter>
				</Provider>
			);
		}).not.toThrow();
	});

	it("should show the event data and user data", () => {
		const user_mock_data: LocationState = {
			state: { user: mockFamily, eventTimeStamp: {} },
		};
		const { identification_code } = mockFamily;
		const testStore = mockStore({
			event: {
				event: {
					...preformattedEventData,
					acceptWalkin: true,
				} as Event,
			},
			user: { user: mockFamily },
		});

		const { getAllByText } = render(
			<Provider store={testStore}>
				<MemoryRouter>
					<RegistrationConfirmComponent location={user_mock_data} />
				</MemoryRouter>
			</Provider>
		);

		// Verify the identification code is displayed (appears in multiple places)
		const identificationCodes = getAllByText(identification_code);
		expect(identificationCodes.length).toBeGreaterThan(0);
	});
});
