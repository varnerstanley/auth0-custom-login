// @ts-nocheck — imports use destination paths; errors here resolve after copying
//
// ALTERNATIVE DESIGN — Simplified screen index for the pill toggle design
//
// identifierMode state is removed; SignupIdForm manages it internally.
// The OR separator now only appears when there are social connections,
// since phone/email switching lives inside the form as a pill toggle.
//
// To adopt: copy to src/screens/signup-id/index.tsx
// (remove the // @ts-nocheck line after copying)
// This file assumes AlternativeLoginsWithToggle.tsx has been copied to
// src/screens/signup-id/components/AlternativeLogins.tsx and
// SignupIdFormWithToggle.tsx has been copied to
// src/screens/signup-id/components/SignupIdForm.tsx

import ULThemeCard from "@/components/ULThemeCard";
import ULThemePageLayout from "@/components/ULThemePageLayout";
import ULThemeSeparator from "@/components/ULThemeSeparator";
import { extractTokenValue } from "@/utils/helpers/tokenUtils";
import { applyAuth0Theme } from "@/utils/theme/themeEngine";

import AlternativeLogins from "./components/AlternativeLogins";
import Footer from "./components/Footer";
import Header from "./components/Header";
import SignupIdForm from "./components/SignupIdForm";
import { useSignupIdManager } from "./hooks/useSignupIdManager";

function SignupIdScreen() {
  const { signupId, texts, alternateConnections, locales } =
    useSignupIdManager();

  // Separator only appears when social connections exist.
  // Phone/email switching is inside the form, so it no longer drives the separator.
  const showSeparator = alternateConnections && alternateConnections.length > 0;

  const separatorText = texts?.separatorText || locales.page.separator;
  document.title = texts?.pageTitle || locales.page.title;

  applyAuth0Theme(signupId);

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
