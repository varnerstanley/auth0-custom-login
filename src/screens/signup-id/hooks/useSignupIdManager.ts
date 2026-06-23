import { useSignupId } from "@auth0/auth0-acul-react/signup-id";
import { useScreen, useTransaction, useUntrustedData } from "@auth0/auth0-acul-react/signup-id";
import type {
  FederatedSignupOptions,
  ScreenMembersOnSignupId,
  SignupOptions,
  TransactionMembersOnSignupId,
} from "@auth0/auth0-acul-react/types";

import { executeSafely } from "@/utils/helpers/executeSafely";

import locales from "../locales/en.json";

export const useSignupIdManager = () => {
  const signupId = useSignupId();

  const screen: ScreenMembersOnSignupId = useScreen();
  const transaction: TransactionMembersOnSignupId = useTransaction();
  const untrustedData = useUntrustedData();
  const { alternateConnections } = transaction;

  const { isCaptchaAvailable, texts, loginLink, captcha } = screen;

  const prefilledEmail = untrustedData?.authorizationParams?.['ext-email'] ?? '';
  const prefilledPhone = untrustedData?.authorizationParams?.['ext-phone'] ?? '';

  const handleSignup = async (payload: SignupOptions): Promise<void> => {
    // Clean and prepare data like login-id pattern
    const options: SignupOptions = {};

    if (payload.email?.trim()) {
      options.email = payload.email.trim();
    }
    if (payload.phone?.trim()) {
      options.phone = payload.phone.trim();
    }
    if (payload.username?.trim()) {
      options.username = payload.username.trim();
    }
    if (screen.isCaptchaAvailable && payload.captcha?.trim()) {
      options.captcha = payload.captcha.trim();
    }

    executeSafely(`Signup with options: ${JSON.stringify(options)}`, () =>
      signupId.signup(options)
    );
  };

  const handleFederatedSignup = async (payload: FederatedSignupOptions) => {
    executeSafely(
      `Federated signup with connection: ${payload.connection}`,
      () => signupId.federatedSignup(payload)
    );
  };

  const handlePickCountryCode = async (): Promise<void> => {
    executeSafely(`Pick country code`, () => signupId.pickCountryCode());
  };

  return {
    transaction,
    signupId,
    handleSignup,
    handleFederatedSignup,
    handlePickCountryCode,
    texts,
    isCaptchaAvailable,
    loginLink,
    alternateConnections,
    captcha,
    locales,
    prefilledEmail,
    prefilledPhone,
  };
};
