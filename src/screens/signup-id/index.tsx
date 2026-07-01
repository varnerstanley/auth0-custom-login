import { useEffect, useRef } from "react";

import ULThemeCard from "@/components/ULThemeCard";
import ULThemePageLayout from "@/components/ULThemePageLayout";
import ULThemeSeparator from "@/components/ULThemeSeparator";
import ULThemeSpinner from "@/components/ULThemeSpinner";
import { extractTokenValue } from "@/utils/helpers/tokenUtils";
import { applyAuth0Theme } from "@/utils/theme/themeEngine";

import AlternativeLogins from "./components/AlternativeLogins";
import Footer from "./components/Footer";
import Header from "./components/Header";
import SignupIdForm from "./components/SignupIdForm";
import { useSignupIdManager } from "./hooks/useSignupIdManager";

// The passkey hand-off should auto-submit only the first time the user lands on
// this screen in a session. sessionStorage persists across the Auth0 page
// navigations (signup-id -> passkey-enrollment) but clears when the tab closes,
// so a returning user (Back button, reload, or a failed submit) gets the
// editable prefilled form instead of being re-submitted in a loop. Reads/writes
// are guarded so blocked storage just degrades to the previous always-submit
// behavior.
const HANDOFF_PREFIX = "passkey-handoff:";

const hasHandedOff = (key: string): boolean => {
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
};

const markHandedOff = (key: string): void => {
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    // storage unavailable — fall back to auto-submitting on each load
  }
};

function SignupIdScreen() {
  const {
    signupId,
    texts,
    alternateConnections,
    locales,
    handleSignup,
    isPasskeyFlow,
    prefilledEmail,
    prefilledPhone,
    isCaptchaAvailable,
  } = useSignupIdManager();

  document.title = texts?.pageTitle || locales.page.title;
  applyAuth0Theme(signupId);

  // Passkey hand-off: when an identifier is prefilled via ext-* params and the
  // ext-passkey flag is set, submit immediately and show only a spinner — so the
  // full signup screen never paints before Auth0 routes to passkey enrollment.
  // Only on the first visit of the session, though: if we've already handed off
  // for this identifier, show the editable prefilled form instead of looping.
  // Captcha also blocks it: the user must solve the challenge on the real form.
  const prefilledIdentifier = prefilledEmail || prefilledPhone;
  const handoffKey = prefilledIdentifier
    ? `${HANDOFF_PREFIX}${prefilledIdentifier}`
    : "";

  const shouldAutoSubmit =
    isPasskeyFlow &&
    !!prefilledIdentifier &&
    !isCaptchaAvailable &&
    !hasHandedOff(handoffKey);

  const hasAutoSubmitted = useRef(false);
  useEffect(() => {
    if (shouldAutoSubmit && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      markHandedOff(handoffKey);
      handleSignup({
        email: prefilledEmail || undefined,
        phone: prefilledPhone || undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (shouldAutoSubmit) {
    return (
      <ULThemePageLayout className="theme-universal">
        <div className="flex min-h-screen items-center justify-center">
          <ULThemeSpinner size="lg" />
        </div>
      </ULThemePageLayout>
    );
  }

  // Phone/email switching lives in the form's pill toggle, so the separator
  // only appears when there are social connections to divide from the form.
  const showSeparator = alternateConnections && alternateConnections.length > 0;

  const separatorText = texts?.separatorText || locales.page.separator;

  const socialLoginAlignment =
    extractTokenValue("--ul-theme-widget-social-buttons-layout") || "bottom";

  const renderSocialLogins = (alignment: "top" | "bottom") => (
    <>
      {alignment === "bottom" && showSeparator && (
        <ULThemeSeparator text={separatorText} />
      )}
      <AlternativeLogins />
      {alignment === "top" && showSeparator && (
        <ULThemeSeparator text={separatorText} />
      )}
    </>
  );

  return (
    // Applying UDS theme overrides using the "theme-universal" class
    <ULThemePageLayout className="theme-universal">
      <ULThemeCard className="w-full max-w-[400px] gap-0">
        <Header />
        {socialLoginAlignment === "top" && renderSocialLogins("top")}
        <SignupIdForm />
        <Footer />
        {socialLoginAlignment === "bottom" && renderSocialLogins("bottom")}
      </ULThemeCard>
    </ULThemePageLayout>
  );
}

export default SignupIdScreen;
