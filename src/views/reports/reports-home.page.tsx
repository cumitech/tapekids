"use client";

import { PortalCard } from "@/components/portal/portal-card";
import { ResourceHero } from "@/components/portal/resource-hero";
import { useReportsHomePage } from "@/hooks/reports/use-reports-home.hook";

export function ReportsHomePage() {
  const page = useReportsHomePage();

  return (
    <section className="flex flex-col gap-5 sm:gap-8">
      <ResourceHero resource="reports" title={page.title} />
      <div className="grid gap-4 sm:grid-cols-2">
        {page.cards.map((card) => {
          const Icon = card.icon;
          return (
            <PortalCard
              key={card.kind}
              href={card.href}
              tint={card.tint}
              icon={<Icon className={card.iconClassName} />}
              title={card.title}
              description={card.description}
              meta={card.meta}
            />
          );
        })}
      </div>
    </section>
  );
}
