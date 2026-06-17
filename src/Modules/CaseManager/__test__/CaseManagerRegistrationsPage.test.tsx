import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import CaseManagerRegistrationsPage from "../CaseManagerRegistrationsPage";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  const React = jest.requireActual("react");
  const withFutureFlags = (RouterComponent: React.ComponentType<any>) => {
    const WrappedRouter = ({ future, ...props }: any) =>
      React.createElement(RouterComponent, {
        ...props,
        future: {
          v7_startTransition: true,
          v7_relativeSplatPath: true,
          ...(future || {}),
        },
      });
    return WrappedRouter;
  };

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    MemoryRouter: withFutureFlags(actual.MemoryRouter),
    BrowserRouter: withFutureFlags(actual.BrowserRouter),
  };
});

jest.mock("axios");
const mockAxios = require("axios");

jest.mock("../../../Utils/StorageService", () => ({
  StorageService: {
    isCaseManager: jest.fn(),
    getUserToken: jest.fn(),
    getItem: jest.fn(),
    isLoggedInUser: jest.fn(),
    isGuestUser: jest.fn(),
  },
}));

const { StorageService: mockStorageService } = require("../../../Utils/StorageService");

jest.mock("../../../Utils/AuthErrorHandler", () => ({
  getCognitoToken: () => require("../../../Utils/StorageService").StorageService.getUserToken(),
}));

jest.mock("../../../config", () => ({
  __esModule: true,
  default: { REGISTRATION_API: "http://test-api/" },
  config: { REGISTRATION_API: "http://test-api/" },
}));

jest.mock("../../General/LoadingSpinner", () => {
  return function MockLoadingSpinner() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

jest.mock("../../Localization/LocalizationComponent", () => ({
  __esModule: true,
  default: {
    cm_my_registrations: "My Registrations",
    cm_my_registrations_subtitle: "People you have registered on behalf of",
    cm_badge: "Case Manager",
    cm_session_expired: "Session expired. Please sign in again.",
    cm_not_authorized: "You are not authorized to view this page.",
    cm_load_failed: "Failed to load registrations. Please try again.",
    cm_registration_count_one: "registration",
    cm_registration_count_other: "registrations",
    cm_retry: "Retry",
    cm_no_registrations: "No registrations yet",
    cm_no_registrations_desc:
      "Registrations you create on behalf of others will appear here.",
    cm_find_event: "Find an Event",
    cm_status_confirmed: "Confirmed",
    cm_status_waitlisted: "Waitlisted",
    cm_status_cancelled: "Cancelled",
    cm_status_checked_in: "Checked In",
    cm_search_placeholder: "Search by name, event, email or phone...",
    cm_no_results_found: "No results found.",
    cm_table_results: "result(s)",
    cm_table_page: "Page",
    cm_column_id: "ID",
    cm_column_event_name: "Event Name",
    cm_column_date_time: "Date & Time",
    label_name: "Name",
    label_email: "Email",
    label_phone_number: "Phone Number",
    text_of: "of",
    button_back_to_home: "Back to Home",
  },
}));

const mockRegistrations = [
  {
    id: 1,
    event_id: 100,
    household_id: 10,
    status: "confirmed",
    created_by: 5,
    event_date_id: 200,
    event_slot_id: 300,
    created_at: "2025-06-15T10:00:00Z",
    registrant_first_name: "Jane",
    registrant_last_name: "Doe",
    registrant_phone: "5135120296",
    registrant_email: "jane@example.com",
    event_name: "Summer Food Drive",
    event_date: "2025-06-20",
  },
  {
    id: 2,
    event_id: 101,
    household_id: 11,
    status: "waitlisted",
    created_by: 5,
    event_date_id: 201,
    event_slot_id: null,
    created_at: "2025-06-16T14:30:00Z",
    registrant_first_name: "John",
    registrant_last_name: "Smith",
    registrant_phone: null,
    registrant_email: "abc123@auto.local",
    event_name: "Fall Pantry",
    event_date: null,
  },
  {
    id: 3,
    event_id: 102,
    household_id: 12,
    status: "cancelled",
    created_by: 5,
    event_date_id: null,
    event_slot_id: null,
    created_at: "2025-06-17T09:00:00Z",
    registrant_first_name: null,
    registrant_last_name: null,
    registrant_phone: "1234567890",
    registrant_email: "test@example.com",
    event_name: null,
    event_date: null,
  },
];

const renderPage = () =>
  render(
    <MemoryRouter>
      <CaseManagerRegistrationsPage />
    </MemoryRouter>,
  );

describe("CaseManagerRegistrationsPage", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageService.isCaseManager.mockReturnValue(true);
    mockStorageService.getUserToken.mockReturnValue("mock-token");
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("Access control", () => {
    it("redirects to home if not a case manager", () => {
      mockStorageService.isCaseManager.mockReturnValue(false);
      renderPage();
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  describe("Loading state", () => {
    it("shows loading spinner while fetching", () => {
      mockAxios.get.mockReturnValue(new Promise(() => {}));
      renderPage();
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });
  });

  describe("Error states", () => {
    it("shows session expired error when no token", async () => {
      mockStorageService.getUserToken.mockReturnValue(null);
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText("Session expired. Please sign in again."),
        ).toBeInTheDocument();
      });
    });

    it("shows 403 unauthorized error", async () => {
      mockAxios.get.mockRejectedValue({ response: { status: 403 } });
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText(
            "You are not authorized to view this page.",
          ),
        ).toBeInTheDocument();
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to fetch CM registrations:",
        expect.objectContaining({ response: { status: 403 } })
      );
    });

    it("shows generic load failure for non-403 errors", async () => {
      mockAxios.get.mockRejectedValue({ response: { status: 500 } });
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText(
            "Failed to load registrations. Please try again.",
          ),
        ).toBeInTheDocument();
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to fetch CM registrations:",
        expect.objectContaining({ response: { status: 500 } })
      );
    });

    it("shows retry button on error and retries on click", async () => {
      mockAxios.get.mockRejectedValueOnce({ response: { status: 500 } });
      renderPage();

      await waitFor(() => {
        expect(screen.getByText("Retry")).toBeInTheDocument();
      });

      mockAxios.get.mockResolvedValueOnce({ data: [] });
      fireEvent.click(screen.getByText("Retry"));

      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenCalledTimes(2);
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to fetch CM registrations:",
        expect.objectContaining({ response: { status: 500 } })
      );
    });
  });

  describe("Empty state", () => {
    it("shows empty state when no registrations", async () => {
      mockAxios.get.mockResolvedValue({ data: [] });
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByText("No registrations yet"),
        ).toBeInTheDocument();
        expect(
          screen.getByText(
            "Registrations you create on behalf of others will appear here.",
          ),
        ).toBeInTheDocument();
      });
    });

    it("shows Find an Event button in empty state", async () => {
      mockAxios.get.mockResolvedValue({ data: [] });
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Find an Event" }),
        ).toBeInTheDocument();
      });
    });

    it("navigates to home when Find an Event is clicked", async () => {
      mockAxios.get.mockResolvedValue({ data: [] });
      renderPage();

      await waitFor(() => {
        fireEvent.click(
          screen.getByRole("button", { name: "Find an Event" }),
        );
      });
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  describe("Registrations table", () => {
    beforeEach(() => {
      mockAxios.get.mockResolvedValue({ data: mockRegistrations });
    });

    it("renders the header with title and badge", async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText("My Registrations")).toBeInTheDocument();
        expect(screen.getByText("Case Manager")).toBeInTheDocument();
      });
    });

    it("displays registration count", async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText("3 registrations")).toBeInTheDocument();
      });
    });

    it("displays singular count label for 1 registration", async () => {
      mockAxios.get.mockResolvedValue({ data: [mockRegistrations[0]] });
      renderPage();

      await waitFor(() => {
        expect(screen.getByText("1 registration")).toBeInTheDocument();
      });
    });

    it("renders registrant names in the table", async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText("Jane Doe")).toBeInTheDocument();
        expect(screen.getByText("John Smith")).toBeInTheDocument();
      });
    });

    it("shows Registration #ID as fallback when name is missing", async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText("Registration #3")).toBeInTheDocument();
      });
    });

    it("shows localized status labels", async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText("Confirmed")).toBeInTheDocument();
        expect(screen.getByText("Waitlisted")).toBeInTheDocument();
        expect(screen.getByText("Cancelled")).toBeInTheDocument();
      });
    });

    it("displays event names", async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText("Summer Food Drive")).toBeInTheDocument();
        expect(screen.getByText("Fall Pantry")).toBeInTheDocument();
      });
    });

    it("falls back to Event #ID when event_name is null", async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText("Event #102")).toBeInTheDocument();
      });
    });

    it("displays registrant emails but hides @auto.local ones", async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText("jane@example.com")).toBeInTheDocument();
        expect(screen.getByText("test@example.com")).toBeInTheDocument();
        expect(screen.queryByText("abc123@auto.local")).not.toBeInTheDocument();
      });
    });

    it("formats 10-digit phone numbers", async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText("(513) 512-0296")).toBeInTheDocument();
        expect(screen.getByText("(123) 456-7890")).toBeInTheDocument();
      });
    });

    it("renders search input", async () => {
      renderPage();

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(
            "Search by name, event, email or phone...",
          ),
        ).toBeInTheDocument();
      });
    });

    it("filters registrations by search term", async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText("Jane Doe")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        "Search by name, event, email or phone...",
      );
      await userEvent.type(searchInput, "Jane");

      await waitFor(() => {
        expect(screen.getByText("Jane Doe")).toBeInTheDocument();
        expect(screen.queryByText("John Smith")).not.toBeInTheDocument();
      });
    });

    it("shows no results message when search has no matches", async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText("Jane Doe")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        "Search by name, event, email or phone...",
      );
      await userEvent.type(searchInput, "zzzzzzz");

      await waitFor(() => {
        expect(screen.getByText("No results found.")).toBeInTheDocument();
      });
    });
  });

  describe("Navigation", () => {
    it("has a Back to Home button", async () => {
      mockAxios.get.mockResolvedValue({ data: [] });
      renderPage();

      await waitFor(() => {
        expect(screen.getByText("Back to Home")).toBeInTheDocument();
      });
    });

    it("navigates to home when Back to Home is clicked", async () => {
      mockAxios.get.mockResolvedValue({ data: [] });
      renderPage();

      await waitFor(() => {
        fireEvent.click(screen.getByText("Back to Home"));
      });
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  describe("API call", () => {
    it("calls the correct API endpoint with auth header", async () => {
      mockAxios.get.mockResolvedValue({ data: [] });
      renderPage();

      await waitFor(() => {
        expect(mockAxios.get).toHaveBeenCalledWith(
          "http://test-api/api/registrations/created-by-me",
          { headers: { Authorization: "Bearer mock-token" } },
        );
      });
    });
  });
});
