// @ts-nocheck — imports use destination paths; errors here resolve after copying
//
// ALTERNATIVE DESIGN — AlternativeLogins without email/phone toggle buttons
//
// Use alongside SignupIdFormWithToggle.tsx and SignupIdScreenWithToggle.tsx.
// The email/phone switching moves into the form's pill toggle, so this
// component only renders social connections (Google, Apple, etc.).
//
// To adopt: copy to src/screens/signup-id/components/AlternativeLogins.tsx
// (remove the // @ts-nocheck line after copying)

import ULThemeSocialProviderButton from "@/components/ULThemeSocialProviderButton";
import type { SocialConnection } from "@/utils/helpers/socialUtils";
import { getSocialProviderDetails } from "@/utils/helpers/socialUtils";

import { useSignupIdManager } from "../hooks/useSignupIdManager";

const AlternativeLogins = () => {
  const { alternateConnections, handleFederatedSignup, locales } =
    useSignupIdManager();

  const handleConnectionSignup = (connection: SocialConnection) => {
    handleFederatedSignup({
      connection: connection.name,
      ...(connection.metadata || {}),
    });
  };

  if (!alternateConnections || alternateConnections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mt-2">
      {alternateConnections.map((connection: SocialConnection) => {
        if (!connection?.name) return null;
        const { displayName, iconComponent } = getSocialProviderDetails(connection);
        return (
          <ULThemeSocialProviderButton
            key={connection.name}
            displayName={displayName}
            buttonText={`${locales.social.continueWith} ${displayName}`}
            iconComponent={iconComponent}
            onClick={() => handleConnectionSignup(connection)}
          />
        );
      })}
    </div>
  );
};

export default AlternativeLogins;
