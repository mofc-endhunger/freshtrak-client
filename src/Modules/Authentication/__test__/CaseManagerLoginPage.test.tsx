import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

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

const mockSignIn = jest.fn();
const mockSignOut = jest.fn();
jest.mock("../AuthContext", () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signOut: mockSignOut,
    isLoading: false,
  }),
}));

const mockFetchAuthSession = jest.fn();
jest.mock("aws-amplify/auth", () => ({
  fetchAuthSession: (...args: any[]) => mockFetchAuthSession(...args),
}));

jest.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => async (values: any) => ({
    values,
    errors: {},
  }),
}));

jest.mock("zod", () => {
  const stringField = () => ({
    email: () => stringField(),
    min: () => stringField(),
  });
  return {
    z: {
      object: () => ({}),
      string: stringField,
    },
  };
});

jest.mock("../../Localization/LocalizationComponent", () => ({
  __esModule: true,
  default: {
    cm_login_title: "Case Manager Sign In",
    cm_login_subtitle: "Sign in with your case manager credentials",
    cm_login_email_label: "Email",
    cm_login_password_label: "Password",
    cm_login_button: "Sign In",
    cm_login_error_generic: "Something went wrong. Please try again.",
    cm_login_unauthorized: "You are not authorized as a case manager.",
    cm_login_link: "Are you a Case Manager?",
    error_please_enter_valid_email: "Please enter a valid email",
    error_password_required: "Password is required",
    button_back: "Back",
    button_back_to_home: "Back to Home",
  },
}));

jest.mock("../../../Utils/StorageService", () => ({
  StorageService: {
    setUserRole: jest.fn(),
  },
}));

// Import after all jest.mock calls
import CaseManagerLoginPage from "../CaseManagerLoginPage";

function buildJwt(payload: Record<string, any>): string {
  const header = btoa(JSON.stringify({ alg: "HS256" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

const renderPage = () =>
  render(
    <MemoryRouter>
      <CaseManagerLoginPage />
    </MemoryRouter>,
  );

describe("CaseManagerLoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the login form with title and subtitle", () => {
      renderPage();
      expect(screen.getByText("Case Manager Sign In")).toBeInTheDocument();
      expect(
        screen.getByText("Sign in with your case manager credentials"),
      ).toBeInTheDocument();
    });

    it("renders email and password fields", () => {
      renderPage();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });

    it("renders the sign in button", () => {
      renderPage();
      expect(
        screen.getByRole("button", { name: "Sign In" }),
      ).toBeInTheDocument();
    });

    it("renders back and home navigation buttons", () => {
      renderPage();
      expect(screen.getByText(/Back$/)).toBeInTheDocument();
      expect(screen.getByText("Back to Home")).toBeInTheDocument();
    });
  });

  describe("Form interaction", () => {
    it("allows typing into email and password fields", async () => {
      renderPage();
      const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
      const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;

      await userEvent.type(emailInput, "test@example.com");
      await userEvent.type(passwordInput, "secret");

      expect(emailInput.value).toBe("test@example.com");
      expect(passwordInput.value).toBe("secret");
    });

    it("disables submit button while submitting", async () => {
      mockSignIn.mockReturnValue(new Promise(() => {}));
      renderPage();

      await userEvent.type(screen.getByLabelText("Email"), "cm@test.com");
      await userEvent.type(screen.getByLabelText("Password"), "pass");
      fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

      await waitFor(() => {
        const button = screen.getByRole("button", { name: /Sign In/i });
        expect(button).toBeDisabled();
      });
    });
  });

  describe("Successful login", () => {
    it("navigates to home on successful case manager login", async () => {
      const token = buildJwt({ "cognito:groups": ["case_managers"] });
      mockSignIn.mockResolvedValue(undefined);
      mockFetchAuthSession.mockResolvedValue({
        tokens: { idToken: { toString: () => token } },
      });

      renderPage();
      await userEvent.type(screen.getByLabelText("Email"), "cm@test.com");
      await userEvent.type(screen.getByLabelText("Password"), "password123");
      fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/");
      });
    });

    it("sets case manager role in storage on success", async () => {
      const { StorageService } = require("../../../Utils/StorageService");
      const token = buildJwt({ "cognito:groups": ["case_managers"] });
      mockSignIn.mockResolvedValue(undefined);
      mockFetchAuthSession.mockResolvedValue({
        tokens: { idToken: { toString: () => token } },
      });

      renderPage();
      await userEvent.type(screen.getByLabelText("Email"), "cm@test.com");
      await userEvent.type(screen.getByLabelText("Password"), "password123");
      fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

      await waitFor(() => {
        expect(StorageService.setUserRole).toHaveBeenCalledWith(
          "case_manager",
        );
      });
    });
  });

  describe("Authorization failures", () => {
    it("shows unauthorized error when user not in case_managers group", async () => {
      const token = buildJwt({ "cognito:groups": ["regular_users"] });
      mockSignIn.mockResolvedValue(undefined);
      mockFetchAuthSession.mockResolvedValue({
        tokens: { idToken: { toString: () => token } },
      });

      renderPage();
      await userEvent.type(screen.getByLabelText("Email"), "user@test.com");
      await userEvent.type(screen.getByLabelText("Password"), "password123");
      fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

      await waitFor(() => {
        expect(
          screen.getByText(
            "You are not authorized as a case manager.",
          ),
        ).toBeInTheDocument();
      });
      expect(mockSignOut).toHaveBeenCalled();
    });

    it("shows generic error when no access token is returned", async () => {
      mockSignIn.mockResolvedValue(undefined);
      mockFetchAuthSession.mockResolvedValue({ tokens: {} });

      renderPage();
      await userEvent.type(screen.getByLabelText("Email"), "user@test.com");
      await userEvent.type(screen.getByLabelText("Password"), "password123");
      fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

      await waitFor(() => {
        expect(
          screen.getByText("Something went wrong. Please try again."),
        ).toBeInTheDocument();
      });
      expect(mockSignOut).toHaveBeenCalled();
    });

    it("shows error when user has no cognito groups at all", async () => {
      const token = buildJwt({});
      mockSignIn.mockResolvedValue(undefined);
      mockFetchAuthSession.mockResolvedValue({
        tokens: { idToken: { toString: () => token } },
      });

      renderPage();
      await userEvent.type(screen.getByLabelText("Email"), "user@test.com");
      await userEvent.type(screen.getByLabelText("Password"), "password123");
      fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

      await waitFor(() => {
        expect(
          screen.getByText(
            "You are not authorized as a case manager.",
          ),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Sign-in errors", () => {
    it("shows the error message from the caught exception", async () => {
      mockSignIn.mockRejectedValue(new Error("Invalid credentials"));

      renderPage();
      await userEvent.type(screen.getByLabelText("Email"), "cm@test.com");
      await userEvent.type(screen.getByLabelText("Password"), "wrong");
      fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

      await waitFor(() => {
        expect(
          screen.getByText("Invalid credentials"),
        ).toBeInTheDocument();
      });
    });

    it("falls back to generic error when exception has no message", async () => {
      mockSignIn.mockRejectedValue({});

      renderPage();
      await userEvent.type(screen.getByLabelText("Email"), "cm@test.com");
      await userEvent.type(screen.getByLabelText("Password"), "wrong");
      fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

      await waitFor(() => {
        expect(
          screen.getByText("Something went wrong. Please try again."),
        ).toBeInTheDocument();
      });
    });

    it("calls signOut during error cleanup", async () => {
      mockSignIn.mockRejectedValue(new Error("fail"));

      renderPage();
      await userEvent.type(screen.getByLabelText("Email"), "cm@test.com");
      await userEvent.type(screen.getByLabelText("Password"), "wrong");
      fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });
  });

  describe("Navigation", () => {
    it("navigates to login page when Back is clicked", async () => {
      renderPage();
      fireEvent.click(screen.getByText(/Back$/));

      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    it("navigates to home when Back to Home is clicked", async () => {
      renderPage();
      fireEvent.click(screen.getByText("Back to Home"));

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
