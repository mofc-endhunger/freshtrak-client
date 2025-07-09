import React from "react";
import { render } from "@testing-library/react";
import EventSlotsModalComponent from "../EventSlotsModalComponent";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import { mockEventSlot } from "../../../Testing";

jest.mock("axios");

const mockStore = configureStore([]);
// Suppress the moment warning. This is a consequence of using test-data-bot
// and does not show in reality
const originalWarn = console.warn.bind(console.warn);
beforeAll(() => {
	console.warn = msg =>
		!msg.toString().includes("Deprecation warning") && originalWarn(msg);
});
afterAll(() => {
	console.warn = originalWarn;
});

test("should load without errors", () => {
	const store = mockStore({ event: { event: mockEventSlot } });
	expect(() => {
		render(
			<Provider store={store}>
				<MemoryRouter>
					<EventSlotsModalComponent event={mockEventSlot} />
				</MemoryRouter>
			</Provider>
		);
	}).not.toThrowError();
});
