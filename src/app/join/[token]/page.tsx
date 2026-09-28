import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { STORAGE_KEYS } from "@/constants/storage-keys";
import { localizedJoinPath } from "@/lib/events/join-path";
import { localeOrDefault } from "@/lib/locale";

export default async function JoinAliasPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const locale = localeOrDefault(
    (await cookies()).get(STORAGE_KEYS.LOCALE)?.value
  );
  redirect(localizedJoinPath(locale, token));
}
