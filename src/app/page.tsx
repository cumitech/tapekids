import { redirect } from "next/navigation";

import { DEFAULT_LOCALE } from "@/constants/locales";
import { withLocalePath } from "@/lib/locale";

export default function IndexPage() {
  redirect(withLocalePath(DEFAULT_LOCALE, "/"));
}
