"use client";

import { Loader2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shared/ui/table";
import type { PersonCategory } from "@/constants/person";
import { useCategoryPeoplePreview } from "@/hooks/people/use-people-list.hook";

export function CategoryPeoplePreview({
  category,
  count,
}: {
  category: PersonCategory;
  count: number;
}) {
  const preview = useCategoryPeoplePreview(category, count);

  if (preview.error) {
    return <p className="text-sm text-destructive">{preview.error}</p>;
  }
  if (!preview.people) {
    return <Loader2 className="size-5 animate-spin text-primary" />;
  }
  if (preview.people.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {preview.translate("people.summary.previewEmpty")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-36">
              {preview.translate("people.fields.yfId")}
            </TableHead>
            <TableHead className="w-[34%]">
              {preview.translate("people.fields.fullName")}
            </TableHead>
            <TableHead>{preview.translate("people.fields.email")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {preview.people.map((person) => (
            <TableRow key={person.id}>
              <TableCell className="whitespace-nowrap tabular-nums text-muted-foreground">
                {person.yfId || "—"}
              </TableCell>
              <TableCell className="whitespace-nowrap font-medium">
                {person.fullName || "—"}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {person.email || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {count > preview.people.length ? (
        <p className="text-sm text-muted-foreground">
          {preview.translate("people.summary.previewMore", {
            shown: preview.people.length,
            count,
          })}
        </p>
      ) : null}
    </div>
  );
}
