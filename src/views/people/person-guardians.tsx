"use client";

export function PersonGuardians({
  title,
  emptyLabel,
  phoneLabel,
  rowLabel,
  formatPhone,
  guardians,
}: {
  title: string;
  emptyLabel: string;
  phoneLabel: string;
  rowLabel: (index: number) => string;
  formatPhone: (phone?: string | null) => string;
  guardians: Array<{ name?: string | null; phone?: string | null }>;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-primary dark:text-foreground">
        {title}
      </h3>
      {guardians.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <dl className="grid gap-3 rounded-lg bg-white p-4 shadow-[0_1px_4px_rgba(15,23,42,0.08)] dark:bg-card">
          {guardians.map((guardian, index) => (
            <div key={`${guardian.name}-${index}`} className="contents">
              <div className="flex flex-col gap-1">
                <dt className="text-sm text-muted-foreground">
                  {rowLabel(index + 1)}
                </dt>
                <dd>{guardian.name || "-"}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-sm text-muted-foreground">{phoneLabel}</dt>
                <dd>{formatPhone(guardian.phone)}</dd>
              </div>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
