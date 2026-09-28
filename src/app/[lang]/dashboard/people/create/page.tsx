import { redirect } from "next/navigation";

export default async function PeopleCreateRedirect({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  redirect(`/${lang}/dashboard/people`);
}
