import * as XLSX from "xlsx";

export type ExcelCell = string | number | boolean | Date | null | undefined;

export type ExcelSheetColumn = {
  header: string;
  width?: number;
};

export type ExcelSheet = {
  name: string;
  columns: ExcelSheetColumn[];
  rows: ExcelCell[][];
};

function sheetName(name: string) {
  const cleaned = name.replace(/[:\\/?*[\]]/g, " ").trim();
  return (cleaned || "Sheet1").slice(0, 31);
}

function applyDateFormats(sheet: XLSX.WorkSheet) {
  const ref = sheet["!ref"];
  if (!ref) {
    return;
  }
  const range = XLSX.utils.decode_range(ref);
  for (let row = range.s.r + 1; row <= range.e.r; row += 1) {
    for (let col = range.s.c; col <= range.e.c; col += 1) {
      const cell = sheet[XLSX.utils.encode_cell({ r: row, c: col })];
      if (cell && cell.t === "d" && cell.v instanceof Date) {
        const hasTime =
          cell.v.getHours() !== 0 ||
          cell.v.getMinutes() !== 0 ||
          cell.v.getSeconds() !== 0;
        cell.z = hasTime ? "dd/mm/yyyy hh:mm:ss" : "dd/mm/yyyy";
      }
    }
  }
}

function buildWorksheet(sheet: ExcelSheet): XLSX.WorkSheet {
  const header = sheet.columns.map((column) => column.header);
  const aoa = [
    header,
    ...sheet.rows.map((row) =>
      row.map((cell) => (cell === null || cell === undefined ? "" : cell))
    ),
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(aoa, { cellDates: true });
  worksheet["!cols"] = sheet.columns.map((column) => ({
    wch: column.width ?? 18,
  }));
  const lastCol = XLSX.utils.encode_col(Math.max(0, sheet.columns.length - 1));
  const lastRow = Math.max(1, sheet.rows.length + 1);
  worksheet["!autofilter"] = { ref: `A1:${lastCol}${lastRow}` };
  worksheet["!freeze"] = {
    xSplit: 0,
    ySplit: 1,
    topLeftCell: "A2",
    activePane: "bottomLeft",
    state: "frozen",
  };
  worksheet["!views"] = [{ state: "frozen", ySplit: 1, topLeftCell: "A2" }];
  applyDateFormats(worksheet);
  return worksheet;
}

export function workbookBuffer(sheets: ExcelSheet[]): Buffer {
  const workbook = XLSX.utils.book_new();
  for (const sheet of sheets) {
    XLSX.utils.book_append_sheet(
      workbook,
      buildWorksheet(sheet),
      sheetName(sheet.name)
    );
  }
  const raw = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "buffer",
    cellDates: true,
  });
  return Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
}

export function reportFileName(slug: string, at = new Date()) {
  const day = at.toISOString().slice(0, 10);
  return `${slug}-${day}.xlsx`;
}
