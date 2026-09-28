import * as XLSX from "xlsx";
import { ZodError } from "zod";

import { parsePersonGender, type PersonCategory } from "@/constants/person";
import { parseCreatePerson, type CreatePerson } from "@/data/dtos/person.dto";
import { repairImportedEmail } from "@/lib/email";

const HEADER_ALIASES: Record<string, string> = {
  yfid: "yfId",
  "yf id": "yfId",
  "yf id,po": "yfId",
  points: "points",
  ints: "points",
  name: "fullName",
  "full name": "fullName",
  fullname: "fullName",
  gender: "gender",
  age: "ageYears",
  address: "address",
  country: "country",
  email: "email",
  phone: "phone",
  dob: "dateOfBirth",
  "date of birth": "dateOfBirth",
  trophy: "isTrophy",
};

/** Column order from Young Foundations exports when the Points header splits on a comma. */
const POSITIONAL_KEYS = [
  "yfId",
  "points",
  "fullName",
  "gender",
  "ageYears",
  "address",
  "country",
  "email",
  "phone",
  "dateOfBirth",
  "isTrophy",
] as const;

function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function cellString(value: unknown): string {
  if (value == null) {
    return "";
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return String(value).trim();
}

function parseAgeYears(raw: unknown): number | null {
  const text = cellString(raw);
  if (!text) {
    return null;
  }
  const match = text.match(/(\d+)/);
  if (!match) {
    return null;
  }
  const age = Number(match[1]);
  return Number.isFinite(age) ? age : null;
}

function parsePoints(raw: unknown): number | null {
  const text = cellString(raw).replace(/,/g, "");
  if (!text) {
    return null;
  }
  const value = Number(text);
  return Number.isFinite(value) ? Math.round(value) : null;
}

function parseTrophy(raw: unknown): boolean {
  const text = cellString(raw).toLowerCase();
  return text === "yes" || text === "y" || text === "true" || text === "1";
}

function excelSerialToDate(serial: number): Date | null {
  if (!Number.isFinite(serial) || serial < 20000) {
    return null;
  }
  // Excel epoch (with 1900 leap-year bug) → JS Date UTC
  const utc = Math.round((serial - 25569) * 86400 * 1000);
  const date = new Date(utc);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseDob(raw: unknown): Date | null {
  if (typeof raw === "number") {
    return excelSerialToDate(raw);
  }
  const text = cellString(raw);
  if (!text) {
    return null;
  }
  if (/^\d+(\.\d+)?$/.test(text)) {
    return excelSerialToDate(Number(text));
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseEmail(raw: unknown): { email: string | null; error?: string } {
  const text = cellString(raw);
  if (!text) {
    return { email: null };
  }
  const email = repairImportedEmail(text);
  if (!email) {
    return { email: null, error: `Invalid email: ${text}` };
  }
  return { email };
}

function mapRow(
  cells: unknown[],
  category: PersonCategory
): { person?: CreatePerson; error?: string } {
  const record: Record<string, unknown> = {};
  for (let i = 0; i < POSITIONAL_KEYS.length; i += 1) {
    record[POSITIONAL_KEYS[i]] = cells[i];
  }

  const fullName = cellString(record.fullName);
  if (!fullName) {
    return { error: "Name is required." };
  }

  const email = parseEmail(record.email);
  if (email.error) {
    return { error: email.error };
  }

  try {
    return {
      person: parseCreatePerson({
        fullName,
        email: email.email,
        phone: cellString(record.phone) || null,
        dateOfBirth: parseDob(record.dateOfBirth),
        gender: parsePersonGender(record.gender),
        address: cellString(record.address) || null,
        country: cellString(record.country) || null,
        yfId: cellString(record.yfId) || null,
        points: parsePoints(record.points),
        ageYears: parseAgeYears(record.ageYears),
        isTrophy: parseTrophy(record.isTrophy),
        category,
      }),
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        error: error.issues[0]?.message ?? "This row is invalid.",
      };
    }
    return {
      error: error instanceof Error ? error.message : "This row is invalid.",
    };
  }
}

export type ParsedPeopleRow = {
  excelRow: number;
  person?: CreatePerson;
  error?: string;
};

export type ParsedPeopleSheet = {
  rows: ParsedPeopleRow[];
  skipped: number;
};

export function parsePeopleWorkbook(
  buffer: ArrayBuffer | Buffer,
  category: PersonCategory
): ParsedPeopleSheet {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { rows: [], skipped: 0 };
  }

  const matrix = XLSX.utils.sheet_to_json<(string | number | null)[]>(
    workbook.Sheets[sheetName],
    { header: 1, defval: null, raw: true }
  );

  if (matrix.length < 2) {
    return { rows: [], skipped: 0 };
  }

  const header = (matrix[0] ?? []).map(normalizeHeader);
  const usesPositional =
    header.some((cell) => cell.includes("yf")) ||
    header[0]?.includes("yf") ||
    HEADER_ALIASES[header[0] ?? ""] === "yfId";

  const rows: ParsedPeopleRow[] = [];
  let skipped = 0;

  for (let index = 1; index < matrix.length; index += 1) {
    const raw = matrix[index];
    const excelRow = index + 1;
    if (!Array.isArray(raw) || raw.every((cell) => cell == null || cell === "")) {
      skipped += 1;
      continue;
    }

    const cells = usesPositional
      ? raw
      : POSITIONAL_KEYS.map((_, column) => raw[column]);
    const mapped = mapRow(cells, category);
    if (!mapped.person) {
      skipped += 1;
      rows.push({ excelRow, error: mapped.error ?? "This row is invalid." });
      continue;
    }
    rows.push({ excelRow, person: mapped.person });
  }

  return { rows, skipped };
}
