// Auto-generated file

import { lazy } from "react";

const SCREEN_COMPONENTS: Record<string, React.ComponentType> = {
  "login-id": lazy(() => import("@/screens/login-id")),
  "login-password": lazy(() => import("@/screens/login-password")),
  "login-passwordless-email-code": lazy(() => import("@/screens/login-passwordless-email-code")),
  "login-passwordless-sms-otp": lazy(() => import("@/screens/login-passwordless-sms-otp")),
  "passkey-enrollment": lazy(() => import("@/screens/passkey-enrollment")),
  "passkey-enrollment-local": lazy(() => import("@/screens/passkey-enrollment-local")),
  "signup-id": lazy(() => import("@/screens/signup-id")),
  "signup-password": lazy(() => import("@/screens/signup-password"))
};

export const getScreenComponent = (
  screenName: string | undefined
): React.ComponentType | null => {
  if (!screenName) {
    return null;
  }
  return SCREEN_COMPONENTS[screenName] || null;
};
