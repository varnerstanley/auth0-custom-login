import { useState } from "react";

import { useSignupIdentifiers } from "@auth0/auth0-acul-react/signup-id";

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

export type IdentifierMode = "phone" | "email";

function SignupIdScreen() {
  const { signupId, texts, alternateConnections, locales } =
    useSignupIdManager();

  const enabledIdentifiers = useSignupIdentifiers();
  const hasPhone = enabledIdentifiers?.some((id) => id.type === "phone") ?? false;
  const hasEmail = enabledIdentifiers?.some((id) => id.type === "email") ?? false;

  const [identifierMode, setIdentifierMode] = useState<IdentifierMode>(
    hasPhone ? "phone" : "email"
  );

  const showSeparator =
    (alternateConnections && alternateConnections.length > 0) ||
    (hasPhone && hasEmail);

  const separatorText = texts?.separatorText || locales.page.separator;
  document.title = texts?.pageTitle || locales.page.title;

  applyAuth0Theme(signupId);

  const socialLoginAlignment = extractTokenValue(
    "--ul-theme-widget-social-buttons-layout"
  );

  const renderSocialLogins = (alignment: "top" | "bottom") => (
    <>
      {alignment === "bottom" && showSeparator && (
        <ULThemeSeparator text={separatorText} />
      )}
      <AlternativeLogins
          identifierMode={identifierMode}
          onModeChange={setIdentifierMode}
          hasEmail={hasEmail}
        />
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
        <SignupIdForm identifierMode={identifierMode} />
        <Footer />
        {socialLoginAlignment === "bottom" && renderSocialLogins("bottom")}
      </ULThemeCard>
    </ULThemePageLayout>
  );
}

export default SignupIdScreen;
