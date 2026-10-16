"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import {
  TableCell,
  TableRow,
} from "@/components/shared/ui/table";
import { CategoryToggle } from "@/views/people/category-toggle";

export function CategorySummaryRows({
  href,
  label,
  count,
  open,
  expandLabel,
  onOpen,
  onToggle,
  preview,
}: {
  href: string;
  label: string;
  count: number;
  open: boolean;
  expandLabel: string;
  onOpen: () => void;
  onToggle: () => void;
  preview: ReactNode;
}) {
  return (
    <>
      <TableRow
        className="cursor-pointer"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) {
            return;
          }
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen();
          }
        }}
      >
        <TableCell>
          <Link
            href={href}
            className="font-medium"
            onClick={(event) => event.stopPropagation()}
          >
            {label}
          </Link>
        </TableCell>
        <TableCell>{count}</TableCell>
        <TableCell>
          <CategoryToggle open={open} label={expandLabel} onToggle={onToggle} />
        </TableCell>
      </TableRow>
      {open ? (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={3} className="bg-muted/40">
            {preview}
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}
