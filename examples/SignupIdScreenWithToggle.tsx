// ALTERNATIVE DESIGN — Simplified screen index for use with SignupIdFormWithToggle
//
// Use this alongside SignupIdFormWithToggle.tsx and AlternativeLoginsWithToggle.tsx.
// identifierMode state is removed because SignupIdFormWithToggle manages it internally.
// The OR separator now only appears when there are social connections (Google, Apple, etc.),
// since the phone/email switch lives inside the form as a pill toggle.
//
// To adopt: copy to src/screens/signup-id/index.tsx
// and change ../src/ imports back to @/ aliases.
// Also update the component imports at the bottom to point to your copied files.

import { useSignupIdentifiers } from "@auth0/auth0-acul-react/signup-id";

import ULThemeCard from "../src/components/ULThemeCard";
import ULThemePageLayout from "../src/components/ULThemePageLayout";
import ULThemeSeparator from "../src/components/ULThemeSeparator";
import { extractTokenValue } from "../src/utils/helpers/tokenUtils";
import { applyAuth0Theme } from "../src/utils/theme/themeEngine";

// These reference the other example files — when adopting, point these at the
// components you copied into src/screens/signup-id/components/
import AlternativeLogins from "./AlternativeLoginsWithToggle";
import SignupIdForm from "./SignupIdFormWithToggle";

import Footer from "../src/screens/signup-id/components/Footer";
import Header from "../src/screens/signup-id/components/Header";
import { useSignupIdManager } from "../src/screens/signup-id/hooks/useSignupIdManager";

function SignupIdScreen() {
  const { signupId, texts, alternateConnections, locales } =
    useSignupIdManager();

  // identifierMode state removed — SignupIdFormWithToggle manages it internally

  // Separator only shows when there are social connections.
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
