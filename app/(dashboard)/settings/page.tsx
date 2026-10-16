import { redirect } from "next/navigation";
import { DEFAULT_SETTINGS_SECTION } from "../../../components/settings/settings-nav";

// /settings has no content of its own; every section is a real route, so
// send visitors to the default one instead of rendering an index page.
export default function SettingsIndexPage() {
  redirect(DEFAULT_SETTINGS_SECTION);
}
