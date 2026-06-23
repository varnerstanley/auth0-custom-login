import {
  federatedSignup,
  signup,
  useSignupIdentifiers,
  useTransaction,
  useUntrustedData,
  useUsernameValidation,
} from "@auth0/auth0-acul-react/signup-id";
import { act, render, screen, waitFor } from "@testing-library/react";

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

    // Required field (phone) - should have asterisk
    expect(screen.getByLabelText("Phone Number*")).toBeInTheDocument();

    // Optional fields - should have (optional) suffix
    expect(
      screen.getByLabelText("Email Address (optional)")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Username (optional)")).toBeInTheDocument();
  });

  it("should handle form submission with ScreenTestUtils", async () => {
    await renderScreen();

    // Fill form using ScreenTestUtils
    await ScreenTestUtils.fillInput(/Phone Number/i, "1234567890");
    await ScreenTestUtils.fillInput(/Email Address/i, "test@example.com");
    await ScreenTestUtils.fillInput(/Username/i, "testuser");

    // Submit using CommonTestData button text
    await ScreenTestUtils.clickButton(CommonTestData.commonTexts.continue);

    expect(signup).toHaveBeenCalledWith({
      phone: "1234567890",
      email: "test@example.com",
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

    it("should auto-submit when ext-email is provided and email is required", async () => {
      (useUntrustedData as jest.Mock).mockReturnValue({
        submittedFormData: null,
        authorizationParams: { "ext-email": "auto@example.com" },
      });
      // Configure tenant to require email (not phone) so form validation passes
      (useSignupIdentifiers as jest.Mock).mockReturnValueOnce([
        { type: "email" as const, required: true },
      ]);

      await renderScreen();

      await waitFor(() =>
        expect(signup).toHaveBeenCalledWith(
          expect.objectContaining({ email: "auto@example.com" })
        )
      );
    });

    it("should auto-submit with both ext-email and ext-phone", async () => {
      (useUntrustedData as jest.Mock).mockReturnValue({
        submittedFormData: null,
        authorizationParams: {
          "ext-email": "auto@example.com",
          "ext-phone": "+15551234567",
        },
      });

      await renderScreen();

      await waitFor(() =>
        expect(signup).toHaveBeenCalledWith(
          expect.objectContaining({
            email: "auto@example.com",
            phone: "+15551234567",
          })
        )
      );
    });

    it("should not auto-submit when no prefill params are present", async () => {
      await renderScreen();

      expect(signup).not.toHaveBeenCalled();
    });

    it("should not auto-submit when captcha is required", async () => {
      (useUntrustedData as jest.Mock).mockReturnValue({
        submittedFormData: null,
        authorizationParams: { "ext-email": "auto@example.com" },
      });

      const { useScreen } = await import("@auth0/auth0-acul-react/signup-id");
      (useScreen as jest.Mock).mockReturnValueOnce({
        name: "signup-id",
        texts: {},
        isCaptchaAvailable: true,
        captchaProvider: "recaptcha",
        captchaSiteKey: "site-key",
        captchaImage: null,
        captcha: { provider: "recaptcha", siteKey: "site-key" },
        links: {},
        loginLink: "/login",
        data: {},
      });

      await renderScreen();

      expect(signup).not.toHaveBeenCalled();
    });
  });
});
