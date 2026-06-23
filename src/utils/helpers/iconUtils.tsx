import type { ReactNode } from "react";

import { AppleIcon, DefaultConnectionIcon, GoogleIcon } from "@/assets/icons";

const strategyIconMap: Record<string, ReactNode> = {
  "google-oauth2": <GoogleIcon />,
  apple: <AppleIcon />,
};

export const getIcon = (strategy?: string): ReactNode => {
  if (strategy && strategyIconMap[strategy]) {
    return strategyIconMap[strategy];
  }
  return <DefaultConnectionIcon />;
};
