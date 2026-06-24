// ALTERNATIVE DESIGN — AlternativeLogins without email/phone toggle buttons
//
// Use this alongside SignupIdFormWithToggle.tsx and SignupIdScreenWithToggle.tsx.
// The email/phone switching is handled by the pill toggle inside the form,
// so this component only renders social provider connections (Google, Apple, etc.).
//
// To adopt: copy to src/screens/signup-id/components/AlternativeLogins.tsx
// and change ../src/ imports back to @/ aliases.

import ULThemeSocialProviderButton from "../src/components/ULThemeSocialProviderButton";
import type { SocialConnection } from "../src/utils/helpers/socialUtils";
import { getSocialProviderDetails } from "../src/utils/helpers/socialUtils";

import { useSignupIdManager } from "../src/screens/signup-id/hooks/useSignupIdManager";

// No props needed — the email/phone toggle is inside SignupIdFormWithToggle
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
