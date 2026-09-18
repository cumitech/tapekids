import { ensureDb } from "@/database/db-sequelize.config";
import { isAppLocale } from "@/lib/locale";
import { eventService } from "@/services/events/event.service";
import { LandingPage } from "@/views/landing/landing.page";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  await ensureDb();
  const events = await eventService.listPublished(
    isAppLocale(lang) ? lang : undefined
  );
  return <LandingPage events={events} />;
}
