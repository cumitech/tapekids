import { notFound } from "next/navigation";

import { ensureDb } from "@/database/db-sequelize.config";
import { isClientError } from "@/lib/api/app-error";
import { eventService } from "@/services/events/event.service";
import { PublicEventPage } from "@/views/events/public-event.page";

type PageParams = {
  params: Promise<{ lang: string; slug: string }>;
};

export async function generateMetadata({ params }: PageParams) {
  const { slug, lang } = await params;
  try {
    await ensureDb();
    const event = await eventService.getPublishedBySlug(slug, lang);
    return {
      title: event.title,
      description: event.summary,
    };
  } catch {
    return { title: "Event" };
  }
}

export default async function Page({ params }: PageParams) {
  const { slug, lang } = await params;
  try {
    await ensureDb();
    const event = await eventService.getPublishedBySlug(slug, lang);
    return <PublicEventPage event={event} />;
  } catch (error) {
    if (isClientError(error)) {
      notFound();
    }
    throw error;
  }
}
