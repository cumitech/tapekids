type Translate = (key: string) => string;

export function directoryHeroStats(
  translate: Translate,
  counts: { people: number; lists: number; events: number }
) {
  return [
    {
      label: translate("people.titles.list"),
      shortLabel: translate("dashboard.statPeople"),
      value: counts.people,
    },
    {
      label: translate("mailingLists.titles.list"),
      shortLabel: translate("dashboard.statLists"),
      value: counts.lists,
    },
    {
      label: translate("events.titles.list"),
      shortLabel: translate("dashboard.statEvents"),
      value: counts.events,
    },
  ];
}
