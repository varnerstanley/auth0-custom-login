import { MFAEmailIcon } from "@/assets/icons/MFAEmailIcon";
import { MFAPhoneIcon } from "@/assets/icons/MFAPhoneIcon";
import ULThemeSocialProviderButton from "@/components/ULThemeSocialProviderButton";
import type { SocialConnection } from "@/utils/helpers/socialUtils";
import { getSocialProviderDetails } from "@/utils/helpers/socialUtils";

import { useSignupIdManager } from "../hooks/useSignupIdManager";
import type { IdentifierMode } from "../index";

interface AlternativeLoginsProps {
  identifierMode: IdentifierMode;
  onModeChange: (mode: IdentifierMode) => void;
  hasEmail: boolean;
}

const AlternativeLogins = ({
  identifierMode,
  onModeChange,
  hasEmail,
}: AlternativeLoginsProps) => {
  const { alternateConnections, handleFederatedSignup, locales } =
    useSignupIdManager();

  const handleConnectionSignup = (connection: SocialConnection) => {
    handleFederatedSignup({
      connection: connection.name,
      ...(connection.metadata || {}),
    });
  };

  const hasSocialConnections = alternateConnections && alternateConnections.length > 0;

  if (!hasSocialConnections && !hasEmail) {
    return null;
  }

  return (
    <div className="space-y-3 mt-2">
      {/* Email option — shown as a social-style button when phone is the active identifier */}
      {hasEmail && identifierMode === "phone" && (
        <ULThemeSocialProviderButton
          displayName="Email"
          buttonText={`${locales.social.continueWith} Email`}
          iconComponent={<MFAEmailIcon />}
          onClick={() => onModeChange("email")}
        />
      )}

      {hasSocialConnections &&
        alternateConnections.map((connection: SocialConnection) => {
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

      {/* Back to phone — shown when the user has switched to email mode */}
      {hasEmail && identifierMode === "email" && (
        <ULThemeSocialProviderButton
          displayName="Phone"
          buttonText="Use phone number instead"
          iconComponent={<MFAPhoneIcon />}
          onClick={() => onModeChange("phone")}
        />
      )}
    </div>
  );
};

export default AlternativeLogins;
