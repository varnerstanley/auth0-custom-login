import { useErrors } from "@auth0/auth0-acul-react/passkey-enrollment";
import { CustomOptions, ErrorItem } from "@auth0/auth0-acul-react/types";

import { WebAuthPlatform } from "@/assets/icons";
import { ULThemeButton } from "@/components/ULThemeButton";
import ULThemeAlert, { ULThemeAlertTitle } from "@/components/ULThemeError";
import ULThemeTitle from "@/components/ULThemeTitle";
import { extractTokenValue } from "@/utils/helpers/tokenUtils";

import { usePasskeyEnrollmentManager } from "../hooks/usePasskeyEnrollmentManager";

/**
 * Passkey Enrollment — focused, "embedded" hand-off.
 *
 * Leads with the platform-authenticator icon and a single primary action.
 * The button is auto-focused so it takes one tap (or Enter) to reach the
 * biometric prompt — the one user gesture WebAuthn requires. Everything is
 * styled from the tenant's ULTheme tokens, so it stays on-brand.
 */
function Details() {
  const { continuePasskeyEnrollment, texts, locales } =
    usePasskeyEnrollmentManager();

  // Use Locales as fallback to SDK texts
  const titleText = texts?.title || locales.heading.title;
  const subtitleText = locales.heading.subtitle;
  const buttonText =
    texts?.createButtonText || locales.details.createPasskeyText;

  // Icon color from the theme token (falls back to the icon's own default).
  const iconColor = extractTokenValue("--ul-theme-color-icons");

  const { errors, hasError, dismiss } = useErrors();

  // Get general errors (not field-specific)
  const generalErrors: ErrorItem[] = errors
    .byType("auth0")
    .filter((err) => !err.field);

  /**
   * Triggers the WebAuthn credential creation (biometric prompt).
   *
   * @param data - (Optional) Form custom data
   */
  const onCreateClick = async (data?: CustomOptions) => {
    continuePasskeyEnrollment(data);
  };

  return (
    <div className="flex flex-col items-center text-center">
      {/* Hero: the platform-authenticator (passkey) glyph */}
      <WebAuthPlatform
        color={iconColor}
        width={56}
        height={56}
        aria-hidden="true"
        className="mt-2 mb-6"
      />

      <ULThemeTitle className="mb-2">{titleText}</ULThemeTitle>

      <p
        className="mb-8"
        style={{ color: "var(--ul-theme-color-body-text)", opacity: 0.7 }}
      >
        {subtitleText}
      </p>

      {/* Display general errors */}
      {hasError && generalErrors.length > 0 && (
        <div className="w-full space-y-3 mb-4">
          {generalErrors.map((error) => (
            <ULThemeAlert
              key={error.id}
              variant="destructive"
              onDismiss={() => dismiss(error.id)}
            >
              <ULThemeAlertTitle>
                {error.message || locales.errors.errorOccurred}
              </ULThemeAlertTitle>
            </ULThemeAlert>
          ))}
        </div>
      )}

      {/* Primary action — auto-focused so it's one tap / Enter to biometrics */}
      <ULThemeButton
        autoFocus
        className="w-full"
        onClick={() => onCreateClick({ key: "passkey" })}
      >
        {buttonText}
      </ULThemeButton>
    </div>
  );
}

export default Details;
