import ULThemeLogo from "@/components/ULThemeLogo";

import { usePasskeyEnrollmentManager } from "../hooks/usePasskeyEnrollmentManager";

function Header() {
  const { texts, locales } = usePasskeyEnrollmentManager();

  // Use Locales as fallback to SDK texts
  const logoAltText = texts?.logoAltText || locales.heading.logoAltText;

  return <ULThemeLogo altText={logoAltText}></ULThemeLogo>;
}

export default Header;
