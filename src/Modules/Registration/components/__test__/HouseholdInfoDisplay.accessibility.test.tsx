import React from "react";
import { render, screen } from "@testing-library/react";
import HouseholdInfoDisplay from "../HouseholdInfoDisplay";
import { UsersMeResponse } from "../../../Households/types/api.types";

// Mock household data
const mockHouseholdData: UsersMeResponse = {
	id: 1,
	number: 1,
	name: "Test Family",
	identification_code: "TEST001",
	added_by: 1,
	last_updated_by: 1,
	deleted_by: null,
	deleted_on: null,
	members: [],
	updated_at: "2023-01-01T00:00:00Z",
	address_line_1: "123 Test Street",
	address_line_2: "Apt 4B",
	city: "Test City",
	state: "TS",
	zip_code: "12345",
	phone: "555-123-4567",
	email: "test@example.com",
	counts: {
		adults: 2,
		children: 1,
		seniors: 0,
		total: 3,
	},
};

const defaultProps = {
	householdData: mockHouseholdData,
	className: "",
};

describe("HouseholdInfoDisplay Accessibility", () => {
	describe("ARIA Attributes and Roles", () => {
		it("should have proper region role and ARIA attributes", () => {
			render(<HouseholdInfoDisplay {...defaultProps} />);

			const regions = screen.getAllByRole("region");
			const mainRegion = regions[0]; // The main container
			expect(mainRegion).toBeInTheDocument();
			expect(mainRegion).toHaveAttribute(
				"aria-labelledby",
				"household-info-heading"
			);
		});

		it("should have proper heading hierarchy", () => {
			render(<HouseholdInfoDisplay {...defaultProps} />);

			// Main heading (hidden)
			const mainHeading = screen.getByText(
				"Household Information Summary"
			);
			expect(mainHeading).toHaveClass("sr-only");
			expect(mainHeading).toHaveAttribute("id", "household-info-heading");

			// Household name heading
			const householdNameHeading = screen.getByText("Test Family");
			expect(householdNameHeading.tagName).toBe("H3");
			expect(householdNameHeading).toHaveAttribute(
				"id",
				"household-name-heading"
			);

			// Section headings
			const addressHeading = screen.getByText("Address");
			const membersHeading = screen.getByText("Household Members");
			const contactHeading = screen.getByText("Contact Information");

			expect(addressHeading.tagName).toBe("H4");
			expect(membersHeading.tagName).toBe("H4");
			expect(contactHeading.tagName).toBe("H4");
		});

		it("should have proper section elements with ARIA labels", () => {
			render(<HouseholdInfoDisplay {...defaultProps} />);

			const addressSection = screen
				.getByText("Address")
				.closest("section");
			const membersSection = screen
				.getByText("Household Members")
				.closest("section");
			const contactSection = screen
				.getByText("Contact Information")
				.closest("section");

			expect(addressSection).toHaveAttribute(
				"aria-labelledby",
				"address-heading"
			);
			expect(membersSection).toHaveAttribute(
				"aria-labelledby",
				"members-heading"
			);
			expect(contactSection).toHaveAttribute(
				"aria-labelledby",
				"contact-heading"
			);
		});
	});

	describe("Content Accessibility", () => {
		it("should have proper aria-describedby attributes for content", () => {
			render(<HouseholdInfoDisplay {...defaultProps} />);

			const addressText = screen.getByText(/123 Test Street/);
			const membersText = screen.getByText(/2 adults, 1 child/);
			const contactText = screen.getByText(/Phone: 555-123-4567/);

			expect(addressText).toHaveAttribute(
				"aria-describedby",
				"address-heading"
			);
			expect(membersText).toHaveAttribute(
				"aria-describedby",
				"members-heading"
			);
			expect(contactText).toHaveAttribute(
				"aria-describedby",
				"contact-heading"
			);
		});

		it("should have proper aria-label for member count", () => {
			render(<HouseholdInfoDisplay {...defaultProps} />);

			const totalMembers = screen.getByText(/Total: 3 members/);
			expect(totalMembers).toHaveAttribute(
				"aria-label",
				"Total household members: 3"
			);
		});

		it("should handle singular member count correctly", () => {
			const singleMemberData = {
				...mockHouseholdData,
				counts: { adults: 1, children: 0, seniors: 0, total: 1 },
			};

			render(<HouseholdInfoDisplay householdData={singleMemberData} />);

			const totalMembers = screen.getByText(/Total: 1 member/);
			expect(totalMembers).toHaveAttribute(
				"aria-label",
				"Total household members: 1"
			);
		});
	});

	describe("Missing Data Handling", () => {
		it("should handle missing household name gracefully", () => {
			const dataWithoutName = { ...mockHouseholdData, name: "" };
			render(<HouseholdInfoDisplay householdData={dataWithoutName} />);

			// Should not render household name section
			expect(screen.queryByText("Test Family")).not.toBeInTheDocument();

			// Should still render other sections
			expect(screen.getByText("Address")).toBeInTheDocument();
			expect(screen.getByText("Household Members")).toBeInTheDocument();
		});

		it("should handle missing address information", () => {
			const dataWithoutAddress = {
				...mockHouseholdData,
				address_line_1: null,
				address_line_2: null,
				city: null,
				state: null,
				zip_code: null,
			};

			render(<HouseholdInfoDisplay householdData={dataWithoutAddress} />);

			const addressText = screen.getByText("No address provided");
			expect(addressText).toBeInTheDocument();
		});

		it("should handle missing contact information", () => {
			const dataWithoutContact = {
				...mockHouseholdData,
				phone: null,
				email: null,
			};

			render(<HouseholdInfoDisplay householdData={dataWithoutContact} />);

			const contactText = screen.getByText("No contact information");
			expect(contactText).toBeInTheDocument();
		});

		it("should handle missing member counts", () => {
			const dataWithoutMembers = {
				...mockHouseholdData,
				counts: { adults: 0, children: 0, seniors: 0, total: 0 },
			};

			render(<HouseholdInfoDisplay householdData={dataWithoutMembers} />);

			const membersText = screen.getByText("No members");
			expect(membersText).toBeInTheDocument();
		});
	});

	describe("Screen Reader Support", () => {
		it("should provide meaningful content structure for screen readers", () => {
			render(<HouseholdInfoDisplay {...defaultProps} />);

			// Check that all sections are properly labeled
			expect(
				screen.getByText("Household Information Summary")
			).toBeInTheDocument();
			expect(screen.getByText("Address")).toBeInTheDocument();
			expect(screen.getByText("Household Members")).toBeInTheDocument();
			expect(screen.getByText("Contact Information")).toBeInTheDocument();
		});

		it("should provide proper content descriptions", () => {
			render(<HouseholdInfoDisplay {...defaultProps} />);

			// Check that content is properly associated with headings
			const addressText = screen.getByText(/123 Test Street/);
			const addressHeading = screen.getByText("Address");

			expect(addressText).toHaveAttribute(
				"aria-describedby",
				"address-heading"
			);
			expect(addressHeading).toHaveAttribute("id", "address-heading");
		});
	});

	describe("Semantic HTML Structure", () => {
		it("should use proper semantic elements", () => {
			render(<HouseholdInfoDisplay {...defaultProps} />);

			// Check for proper section elements (main region + 3 sections)
			const regions = screen.getAllByRole("region");
			expect(regions).toHaveLength(4); // Main region + 3 sections

			// Check for proper heading elements
			const headings = screen.getAllByRole("heading");
			expect(headings).toHaveLength(5); // h2 (sr-only) + h2 + h3 + h4 + h4 + h4
		});

		it("should have proper heading levels", () => {
			render(<HouseholdInfoDisplay {...defaultProps} />);

			const h2Heading = screen.getByRole("heading", { level: 2 });
			const h3Heading = screen.getByRole("heading", { level: 3 });
			const h4Headings = screen.getAllByRole("heading", { level: 4 });

			expect(h2Heading).toHaveTextContent(
				"Household Information Summary"
			);
			expect(h3Heading).toHaveTextContent("Test Family");
			expect(h4Headings).toHaveLength(3);
		});
	});

	describe("Data Formatting Accessibility", () => {
		it("should format member counts in a readable way", () => {
			render(<HouseholdInfoDisplay {...defaultProps} />);

			const membersText = screen.getByText("2 adults, 1 child");
			expect(membersText).toBeInTheDocument();
		});

		it("should handle plural forms correctly", () => {
			const pluralData = {
				...mockHouseholdData,
				counts: { adults: 2, children: 3, seniors: 2, total: 7 },
			};

			render(<HouseholdInfoDisplay householdData={pluralData} />);

			const membersText = screen.getByText(
				"2 adults, 3 children, 2 seniors"
			);
			expect(membersText).toBeInTheDocument();
		});

		it("should format address information clearly", () => {
			render(<HouseholdInfoDisplay {...defaultProps} />);

			const addressText = screen.getByText(
				"123 Test Street, Apt 4B, Test City, TS, 12345"
			);
			expect(addressText).toBeInTheDocument();
		});

		it("should format contact information clearly", () => {
			render(<HouseholdInfoDisplay {...defaultProps} />);

			const contactText = screen.getByText(
				"Phone: 555-123-4567 • Email: test@example.com"
			);
			expect(contactText).toBeInTheDocument();
		});
	});

	describe("Color Contrast and Visual Accessibility", () => {
		it("should have sufficient color contrast for headings", () => {
			render(<HouseholdInfoDisplay {...defaultProps} />);

			const addressHeading = screen.getByText("Address");
			const membersHeading = screen.getByText("Household Members");
			const contactHeading = screen.getByText("Contact Information");

			expect(addressHeading).toHaveClass("text-gray-700");
			expect(membersHeading).toHaveClass("text-gray-700");
			expect(contactHeading).toHaveClass("text-gray-700");
		});

		it("should have sufficient color contrast for content text", () => {
			render(<HouseholdInfoDisplay {...defaultProps} />);

			const addressText = screen.getByText(/123 Test Street/);
			const membersText = screen.getByText(/2 adults, 1 child/);
			const contactText = screen.getByText(/Phone: 555-123-4567/);

			expect(addressText).toHaveClass("text-gray-600");
			expect(membersText).toHaveClass("text-gray-600");
			expect(contactText).toHaveClass("text-gray-600");
		});
	});
});
