// @ts-nocheck — imports use destination paths; errors here resolve after copying
//
// ALTERNATIVE DESIGN — Inline pill toggle instead of OR-section buttons
//
// The current design toggles phone/email via "Continue with Email" /
// "Use phone number instead" buttons in AlternativeLogins.tsx. This file
// replaces that with a pill toggle at the top of the form, managing
// identifierMode state internally instead of receiving it as a prop.
//
// To adopt:
//   1. Copy to src/screens/signup-id/components/SignupIdForm.tsx
//      (remove the // @ts-nocheck line after copying)
//   2. Copy SignupIdScreenWithToggle.tsx → src/screens/signup-id/index.tsx
//   3. Copy AlternativeLoginsWithToggle.tsx → src/screens/signup-id/components/AlternativeLogins.tsx

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import {
  useErrors,
  useSignupIdentifiers,
  useUsernameValidation,
} from "@auth0/auth0-acul-react/signup-id";
import type {
  ErrorItem,
  IdentifierType,
  SignupOptions,
  UsernameValidationResult,
} from "@auth0/auth0-acul-react/types";

import Captcha from "@/components/Captcha/index";
import { ULThemeFloatingLabelField } from "@/components/form/ULThemeFloatingLabelField";
import { ULThemeFormMessage } from "@/components/form/ULThemeFormMessage";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { ULThemeButton } from "@/components/ULThemeButton";
import ULThemeCountryCodePicker from "@/components/ULThemeCountryCodePicker";
import { ULThemeAlert, ULThemeAlertTitle } from "@/components/ULThemeError";
import { useCaptcha } from "@/hooks/useCaptcha";
import { transformAuth0CountryCode } from "@/utils/helpers/countryUtils";
import { getIndividualIdentifierDetails } from "@/utils/helpers/identifierUtils";
import { createUsernameValidator } from "@/utils/validations";

import { useSignupIdManager } from "../hooks/useSignupIdManager";

type IdentifierMode = "phone" | "email";

function SignupIdForm() {
  const {
    transaction,
    handleSignup,
    handlePickCountryCode,
    isCaptchaAvailable,
    texts,
    captcha,
    locales,
    prefilledEmail,
    prefilledPhone,
  } = useSignupIdManager();

  const { errors, hasError, dismiss } = useErrors();

  const enabledIdentifiers = useSignupIdentifiers();
  const hasPhone = enabledIdentifiers?.some((id) => id.type === "phone") ?? false;
  const hasEmail = enabledIdentifiers?.some((id) => id.type === "email") ?? false;

  const [identifierMode, setIdentifierMode] = useState<IdentifierMode>(
    hasPhone ? "phone" : "email"
  );

  const form = useForm<SignupOptions>({
    defaultValues: {
      email: prefilledEmail,
      username: "",
      phone: prefilledPhone,
      captcha: "",
    },
    reValidateMode: "onBlur",
  });

  const {
    formState: { isSubmitting },
    watch,
  } = form;

  const userNameValue = watch("username");
  const {
    isValid: isUsernameValid,
    errors: userNameErrors,
  }: UsernameValidationResult = useUsernameValidation(userNameValue || "");

  const requiredIdentifiers = useMemo(
    () =>
      (enabledIdentifiers || [])
        .filter((identifier) => identifier.required)
        .map((identifier) => identifier.type),
    [enabledIdentifiers]
  );

  const optionalIdentifiers = useMemo(
    () =>
      (enabledIdentifiers || [])
        .filter((identifier) => !identifier.required)
        .map((identifier) => identifier.type),
    [enabledIdentifiers]
  );

  const buttonText = texts?.buttonText || locales.form.button;
  const captchaLabel = texts?.captchaCodePlaceholder
    ? `${texts.captchaCodePlaceholder}*`
    : `${locales.form.fields.captcha.label}*`;

  const { captchaConfig, captchaProps } = useCaptcha(
    captcha || undefined,
    captchaLabel
  );

  const generalErrors: ErrorItem[] = errors
    .byType("auth0")
    .filter((err) => !err.field);

  const captchaSDKError = errors.byField("captcha")[0]?.message;

  const onSubmit = async (data: SignupOptions) => {
    await handleSignup(data);
  };

  const hasAutoSubmitted = useRef(false);
  useEffect(() => {
    const hasPrefilledData = !!(prefilledEmail || prefilledPhone);
    if (hasPrefilledData && !isCaptchaAvailable && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      form.handleSubmit(onSubmit)();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderIdentifierField = (
    identifierType: IdentifierType,
    isRequired: boolean
  ) => {
    const { label, type, autoComplete } = getIndividualIdentifierDetails(
      identifierType,
      isRequired,
      texts
    );

    const sdkError = errors.byField(identifierType)[0]?.message;

    return (
      <FormField
        key={identifierType}
        control={form.control}
        name={identifierType}
        rules={{
          required: isRequired ? locales.form.fields.common.required : false,
          ...(identifierType === "username" && {
            validate: createUsernameValidator(
              isUsernameValid,
              userNameErrors,
              isRequired,
              locales.form.fields.common.required
            ),
          }),
        }}
        render={({ field, fieldState }) => (
          <FormItem>
            <ULThemeFloatingLabelField
              {...field}
              label={label}
              type={type}
              autoComplete={autoComplete}
              error={!!fieldState.error || !!sdkError}
            />
            <ULThemeFormMessage
              sdkError={sdkError}
              hasFormError={!!fieldState.error}
            />
          </FormItem>
        )}
      />
    );
  };

  const renderFields = (identifiers: IdentifierType[], isRequired: boolean) =>
    identifiers.map((identifierType) => {
      if (identifierType === "phone") {
        const phoneCountryCode = transformAuth0CountryCode(
          transaction?.countryCode,
          transaction?.countryPrefix
        );

        return (
          <div
            key={`${isRequired ? "required" : "optional"}-phone-container`}
            className="space-y-2"
          >
            <ULThemeCountryCodePicker
              selectedCountry={phoneCountryCode}
              onClick={handlePickCountryCode}
              fullWidth
              placeholder={locales.form.fields.countryCode.placeholder}
            />
            {renderIdentifierField(identifierType, isRequired)}
          </div>
        );
      }
      return renderIdentifierField(identifierType, isRequired);
    });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {hasError && generalErrors.length > 0 && (
          <div className="space-y-3 mb-4">
            {generalErrors.map((error) => (
              <ULThemeAlert
                key={error.id}
                variant="destructive"
                onDismiss={() => dismiss(error.id)}
              >
                <ULThemeAlertTitle>{error.message}</ULThemeAlertTitle>
              </ULThemeAlert>
            ))}
          </div>
        )}

        {/* Pill toggle — only shown when both phone and email are available */}
        {hasPhone && hasEmail && (
          <div className="mb-4">
            <div className="grid grid-cols-2 rounded-md border border-input bg-background p-1">
              <button
                type="button"
                onClick={() => setIdentifierMode("phone")}
                className={[
                  "h-10 rounded-md text-sm font-medium transition",
                  identifierMode === "phone"
                    ? "bg-muted text-foreground shadow-sm"
                    : "bg-transparent text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                Phone
              </button>
              <button
                type="button"
                onClick={() => setIdentifierMode("email")}
                className={[
                  "h-10 rounded-md text-sm font-medium transition",
                  identifierMode === "email"
                    ? "bg-muted text-foreground shadow-sm"
                    : "bg-transparent text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                Email
              </button>
            </div>
          </div>
        )}

        {identifierMode === "phone"
          ? renderFields(requiredIdentifiers.filter((id) => id !== "email"), true)
          : renderFields(requiredIdentifiers.includes("email") ? ["email"] : [], requiredIdentifiers.includes("email"))}
        {identifierMode === "phone"
          ? renderFields(optionalIdentifiers.filter((id) => id !== "email"), false)
          : renderFields(!requiredIdentifiers.includes("email") ? ["email"] : [], false)}

        {isCaptchaAvailable && captchaConfig && (
          <Captcha
            control={form.control}
            name="captcha"
            captcha={captchaConfig}
            {...captchaProps}
            sdkError={captchaSDKError}
            rules={{
              required: locales.form.fields.captcha.required,
            }}
          />
        )}

        <ULThemeButton type="submit" className="w-full" disabled={isSubmitting}>
          {buttonText}
        </ULThemeButton>
      </form>
    </Form>
  );
}

export default SignupIdForm;
