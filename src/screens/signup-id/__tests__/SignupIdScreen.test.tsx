import {
  federatedSignup,
  signup,
  useScreen,
  useSignupIdentifiers,
  useTransaction,
  useUntrustedData,
  useUsernameValidation,
} from "@auth0/auth0-acul-react/signup-id";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";

import { CommonTestData } from "@/test/fixtures/common-data";
import { ScreenTestUtils } from "@/test/utils/screen-test-utils";

import SignupIdScreen from "../index";

// Mock extractTokenValue to return a default value
jest.mock("@/utils/helpers/tokenUtils", () => ({
  extractTokenValue: jest.fn(() => "bottom"),
}));

describe("SignupIdScreen", () => {
  const renderScreen = async () => {
    await act(async () => {
      render(<SignupIdScreen />);
    });
    // Wait for primary action to ensure form is ready
    await screen.findByRole("button", {
      name: CommonTestData.commonTexts.continue,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the passkey hand-off flag so each test starts a fresh session.
    sessionStorage.clear();
  });

  it("should render screen with basic structure using CommonTestData", async () => {
    await renderScreen();

    expect(screen.getByText("Create Your Account")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: CommonTestData.commonTexts.continue })
    ).toBeInTheDocument();
    expect(screen.getByText(/Sign up to dev-tenant/)).toBeInTheDocument();
  });

  it("should render identifier fields with proper labels", async () => {
    await renderScreen();

    // Default mode is phone (phone is the required identifier), so the phone
    // field and the optional username show. Email lives behind the mode switch
    // in the OR section, so it is not rendered in the form here.
    expect(screen.getByLabelText("Phone Number*")).toBeInTheDocument();
    expect(screen.getByLabelText("Username (optional)")).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Email Address (optional)")
    ).not.toBeInTheDocument();
  });

  it("should handle form submission with ScreenTestUtils", async () => {
    await renderScreen();

    // Default mode is phone, so submit phone + username. Email is behind the
    // mode switch and is not part of this submission.
    await ScreenTestUtils.fillInput(/Phone Number/i, "1234567890");
    await ScreenTestUtils.fillInput(/Username/i, "testuser");

    // Submit using CommonTestData button text
    await ScreenTestUtils.clickButton(CommonTestData.commonTexts.continue);

    expect(signup).toHaveBeenCalledWith({
      phone: "1234567890",
      username: "testuser",
    });
  });

  it("should render social connections from CommonTestData", async () => {
    await renderScreen();

    const mockTransaction = (useTransaction as jest.Mock).mock.results[0]
      ?.value;

    // Check for social connections using CommonTestData
    const connections = mockTransaction?.alternateConnections || [];
    expect(connections.length).toBeGreaterThan(0);
  });

  it("should handle federated signup using ScreenTestUtils", async () => {
    await renderScreen();

    await ScreenTestUtils.clickButton(/Continue with.*Google/i);

    expect(federatedSignup).toHaveBeenCalledWith({
      connection: "google-oauth2",
    });
  });

  it("should integrate with useErrors hook for error handling", async () => {
    await renderScreen();

    // Verify component renders correctly with error handling in place
    expect(screen.getByText("Create Your Account")).toBeInTheDocument();

    // Verify form structure is intact
    expect(screen.getByText(/Select Country/i)).toBeInTheDocument();
    const phoneInput = document.querySelector('input[name="phone"]');
    expect(phoneInput).toBeInTheDocument();
  });

  it("should render footer links using CommonTestData", async () => {
    await renderScreen();

    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
    expect(
      screen.getByText(CommonTestData.commonTexts.login)
    ).toBeInTheDocument();
  });

  it("should call useSignupIdentifiers hook", async () => {
    await renderScreen();

    // Verify the hook is called to get identifier configuration
    expect(useSignupIdentifiers).toHaveBeenCalled();
  });

  it("should call useUsernameValidation when username field has value", async () => {
    await renderScreen();

    // Type in username field
    await ScreenTestUtils.fillInput(/Username/i, "testuser");

    // Verify username validation hook is called
    expect(useUsernameValidation).toHaveBeenCalled();
  });

  describe("auto-submit with prefilled ext-* params", () => {
    beforeEach(() => {
      // Reset to default (no prefill) before each test in this block so
      // mockReturnValue overrides from one test don't bleed into the next.
      (useUntrustedData as jest.Mock).mockReturnValue({
        submittedFormData: null,
        authorizationParams: null,
      });
    });

    // In the passkey hand-off the screen renders only a spinner (no form or
    // Continue button), so render directly instead of waiting for the button.
    const renderHandoff = async () => {
      await act(async () => {
        render(<SignupIdScreen />);
      });
    };

    it("should auto-submit when ext-email and ext-passkey=true are provided", async () => {
      (useUntrustedData as jest.Mock).mockReturnValue({
        submittedFormData: null,
        authorizationParams: {
          "ext-email": "auto@example.com",
          "ext-passkey": "true",
        },
      });

      await renderHandoff();

      await waitFor(() =>
        expect(signup).toHaveBeenCalledWith(
          expect.objectContaining({ email: "auto@example.com" })
        )
      );
    });

    it("renders only a spinner (not the form) during the hand-off", async () => {
      (useUntrustedData as jest.Mock).mockReturnValue({
        submittedFormData: null,
        authorizationParams: {
          "ext-email": "auto@example.com",
          "ext-passkey": "true",
        },
      });

      await renderHandoff();

      expect(screen.getByTestId("ul-theme-spinner")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", {
          name: CommonTestData.commonTexts.continue,
        })
      ).not.toBeInTheDocument();
    });

    it("should auto-submit with ext-email, ext-phone, and ext-passkey=true", async () => {
      (useUntrustedData as jest.Mock).mockReturnValue({
        submittedFormData: null,
        authorizationParams: {
          "ext-email": "auto@example.com",
          "ext-phone": "+15551234567",
          "ext-passkey": "true",
        },
      });

      await renderHandoff();

      await waitFor(() =>
        expect(signup).toHaveBeenCalledWith(
          expect.objectContaining({
            email: "auto@example.com",
            phone: "+15551234567",
          })
        )
      );
    });

    it("should auto-submit when ext-passkey is '1' (loosened flag)", async () => {
      (useUntrustedData as jest.Mock).mockReturnValue({
        submittedFormData: null,
        authorizationParams: {
          "ext-email": "auto@example.com",
          "ext-passkey": "1",
        },
      });

      await renderHandoff();

      await waitFor(() =>
        expect(signup).toHaveBeenCalledWith(
          expect.objectContaining({ email: "auto@example.com" })
        )
      );
    });

    it("does not auto-submit a second time in the same session (e.g. Back button)", async () => {
      (useUntrustedData as jest.Mock).mockReturnValue({
        submittedFormData: null,
        authorizationParams: {
          "ext-email": "auto@example.com",
          "ext-passkey": "true",
        },
      });

      // First visit → the hand-off fires and records itself for the session.
      await renderHandoff();
      await waitFor(() => expect(signup).toHaveBeenCalledTimes(1));

      // Returning to the screen in the same session (Back / reload): the flag
      // persists in sessionStorage, so we show the editable form, not a re-submit.
      cleanup();
      await renderScreen();

      expect(signup).toHaveBeenCalledTimes(1);
      expect(
        screen.getByRole("button", {
          name: CommonTestData.commonTexts.continue,
        })
      ).toBeInTheDocument();
    });

    it("should NOT auto-submit when an identifier is prefilled but ext-passkey flag is absent", async () => {
      (useUntrustedData as jest.Mock).mockReturnValue({
        submittedFormData: null,
        authorizationParams: { "ext-email": "auto@example.com" },
      });

      await renderScreen();

      expect(signup).not.toHaveBeenCalled();
    });

    it("should NOT auto-submit when ext-passkey is set but no identifier is prefilled", async () => {
      (useUntrustedData as jest.Mock).mockReturnValue({
        submittedFormData: null,
        authorizationParams: { "ext-passkey": "true" },
      });

      await renderScreen();

      expect(signup).not.toHaveBeenCalled();
    });

    it("should not auto-submit when no prefill params are present", async () => {
      await renderScreen();

      expect(signup).not.toHaveBeenCalled();
    });

    it("should not auto-submit when captcha is required", async () => {
      (useUntrustedData as jest.Mock).mockReturnValue({
        submittedFormData: null,
        authorizationParams: {
          "ext-email": "auto@example.com",
          "ext-passkey": "true",
        },
      });

      // Captcha is screen-wide state — every component that reads the screen
      // sees it. useScreen() is called by several components (index, form, etc.),
      // so use mockReturnValue (not ...Once) to cover all of them; otherwise the
      // form would fall back to the default isCaptchaAvailable: false.
      const baseScreen = (useScreen as jest.Mock)();
      (useScreen as jest.Mock).mockReturnValue({
        ...baseScreen,
        isCaptchaAvailable: true,
        captcha: { provider: "recaptcha", siteKey: "site-key" },
      });

      await renderScreen();

      expect(signup).not.toHaveBeenCalled();
    });
  });
});
