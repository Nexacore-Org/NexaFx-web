import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isLocale(requested) ? requested : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    // Nigerian users are the primary audience; a fixed zone keeps relative
    // dates stable regardless of where the server runs.
    timeZone: "Africa/Lagos",
  };
});
