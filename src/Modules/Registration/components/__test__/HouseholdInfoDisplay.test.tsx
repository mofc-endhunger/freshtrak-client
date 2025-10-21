import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import HouseholdInfoDisplay from "../HouseholdInfoDisplay";
import { UsersMeResponse } from "../../../Households/types/api.types";

describe("HouseholdInfoDisplay", () => {
	const mockHouseholdData: UsersMeResponse = {
		id: 1,
		number: 1,
		name: "Smith Family",
		identification_code: "ABC123",
		added_by: 1,
		last_updated_by: 1,
		deleted_by: null,
		deleted_on: null,
		members: [],
		updated_at: "2024-01-01T00:00:00Z",
		counts: {
			adults: 2,
			children: 1,
			seniors: 1,
			total: 4,
		},
		address_line_1: "123 Main St",
		address_line_2: "Apt 4B",
		city: "Anytown",
		state: "CA",
		zip_code: "12345",
		phone: "555-1234",
		email: "smith@example.com",
	};

	describe("Rendering", () => {
		it("renders household information correctly", () => {
			render(<HouseholdInfoDisplay householdData={mockHouseholdData} />);

			expect(
				screen.getByTestId("household-info-display")
			).toBeInTheDocument();
			expect(screen.getByTestId("household-name")).toHaveTextContent(
				"Smith Family"
			);
			expect(screen.getByTestId("household-address")).toHaveTextContent(
				"123 Main St, Apt 4B, Anytown, CA, 12345"
			);
			expect(screen.getByTestId("household-members")).toHaveTextContent(
				"2 adults, 1 child, 1 senior"
			);
		});

		it("renders without household name when name is empty", () => {
			const dataWithoutName = { ...mockHouseholdData, name: "" };
			render(<HouseholdInfoDisplay householdData={dataWithoutName} />);

			expect(
				screen.queryByTestId("household-name")
			).not.toBeInTheDocument();
		});

		it("applies custom className", () => {
			const { container } = render(
				<HouseholdInfoDisplay
					householdData={mockHouseholdData}
					className="custom-class"
				/>
			);

			expect(container.firstChild).toHaveClass("custom-class");
		});
	});

	describe("Address Formatting", () => {
		it("formats complete address correctly", () => {
			render(<HouseholdInfoDisplay householdData={mockHouseholdData} />);

			expect(screen.getByTestId("household-address")).toHaveTextContent(
				"123 Main St, Apt 4B, Anytown, CA, 12345"
			);
		});

		it("handles missing address_line_2", () => {
			const dataWithoutLine2 = {
				...mockHouseholdData,
				address_line_2: null,
			};
			render(<HouseholdInfoDisplay householdData={dataWithoutLine2} />);

			expect(screen.getByTestId("household-address")).toHaveTextContent(
				"123 Main St, Anytown, CA, 12345"
			);
		});

		it('shows "No address provided" when all address fields are missing', () => {
			const dataWithoutAddress = {
				...mockHouseholdData,
				address_line_1: null,
				address_line_2: null,
				city: null,
				state: null,
				zip_code: null,
			};
			render(<HouseholdInfoDisplay householdData={dataWithoutAddress} />);

			expect(screen.getByTestId("household-address")).toHaveTextContent(
				"No address provided"
			);
		});
	});

	describe("Member Count Formatting", () => {
		it("formats member counts correctly", () => {
			render(<HouseholdInfoDisplay householdData={mockHouseholdData} />);

			expect(screen.getByTestId("household-members")).toHaveTextContent(
				"2 adults, 1 child, 1 senior"
			);
			expect(screen.getByText("Total: 4 members")).toBeInTheDocument();
		});

		it("handles singular member counts", () => {
			const dataWithSingularCounts = {
				...mockHouseholdData,
				counts: { adults: 1, children: 1, seniors: 1, total: 3 },
			};
			render(
				<HouseholdInfoDisplay householdData={dataWithSingularCounts} />
			);

			expect(screen.getByTestId("household-members")).toHaveTextContent(
				"1 adult, 1 child, 1 senior"
			);
			expect(screen.getByText("Total: 3 members")).toBeInTheDocument();
		});

		it("handles zero member counts", () => {
			const dataWithZeroCounts = {
				...mockHouseholdData,
				counts: { adults: 0, children: 0, seniors: 0, total: 0 },
			};
			render(<HouseholdInfoDisplay householdData={dataWithZeroCounts} />);

			expect(screen.getByTestId("household-members")).toHaveTextContent(
				"No members"
			);
			expect(screen.getByText("Total: 0 members")).toBeInTheDocument();
		});

		it("handles only adults", () => {
			const dataWithOnlyAdults = {
				...mockHouseholdData,
				counts: { adults: 3, children: 0, seniors: 0, total: 3 },
			};
			render(<HouseholdInfoDisplay householdData={dataWithOnlyAdults} />);

			expect(screen.getByTestId("household-members")).toHaveTextContent(
				"3 adults"
			);
		});
	});

	describe("Contact Information Formatting", () => {
		it("formats complete contact information", () => {
			render(<HouseholdInfoDisplay householdData={mockHouseholdData} />);

			expect(screen.getByTestId("household-contact")).toHaveTextContent(
				"Phone: 555-1234 • Email: smith@example.com"
			);
		});

		it("handles only phone number", () => {
			const dataWithOnlyPhone = { ...mockHouseholdData, email: null };
			render(<HouseholdInfoDisplay householdData={dataWithOnlyPhone} />);

			expect(screen.getByTestId("household-contact")).toHaveTextContent(
				"Phone: 555-1234"
			);
		});

		it("handles only email", () => {
			const dataWithOnlyEmail = { ...mockHouseholdData, phone: null };
			render(<HouseholdInfoDisplay householdData={dataWithOnlyEmail} />);

			expect(screen.getByTestId("household-contact")).toHaveTextContent(
				"Email: smith@example.com"
			);
		});

		it('shows "No contact information" when both are missing', () => {
			const dataWithoutContact = {
				...mockHouseholdData,
				phone: null,
				email: null,
			};
			render(<HouseholdInfoDisplay householdData={dataWithoutContact} />);

			expect(screen.getByTestId("household-contact")).toHaveTextContent(
				"No contact information"
			);
		});
	});

	describe("Accessibility", () => {
		it("has proper semantic structure", () => {
			render(<HouseholdInfoDisplay householdData={mockHouseholdData} />);

			expect(
				screen.getByRole("heading", { level: 3 })
			).toBeInTheDocument();
			expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(
				3
			);
		});

		it("has proper test IDs for testing", () => {
			render(<HouseholdInfoDisplay householdData={mockHouseholdData} />);

			expect(
				screen.getByTestId("household-info-display")
			).toBeInTheDocument();
			expect(screen.getByTestId("household-name")).toBeInTheDocument();
			expect(screen.getByTestId("household-address")).toBeInTheDocument();
			expect(screen.getByTestId("household-members")).toBeInTheDocument();
			expect(screen.getByTestId("household-contact")).toBeInTheDocument();
		});
	});
});
