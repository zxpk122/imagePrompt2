import type { Locale } from "~/config/i18n-config";
import { getDictionary } from "~/lib/get-dictionary";
import type { MarketingConfig } from "~/types";

export const getMarketingConfig = async ({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}): Promise<MarketingConfig> => {
  const dict = await getDictionary(lang);
  return {
    mainNav: [
      {
        title: "Home",
        href: `/`,
      },
      {
        title: "Image to Prompt",
        href: `/image-to-prompt`,
      },
      {
        title: "Inspiration",
        href: `/#inspiration`,
      },
      {
        title: "Tutorials",
        href: `/tutorials`,
      },
      {
        title: "Tools",
        href: `/#tools`,
      },
      {
        title: dict.marketing.main_nav_pricing,
        href: `/pricing`,
      },
    ],
  };
};
