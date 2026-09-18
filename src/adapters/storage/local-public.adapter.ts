import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { PUBLIC_UPLOAD_ROOT } from "@/constants/uploads";

export class LocalPublicStorageAdapter {
  constructor(private readonly folder: string) {}

  async save(filename: string, contents: Buffer): Promise<string> {
    const directory = path.join(
      process.cwd(),
      "public",
      PUBLIC_UPLOAD_ROOT,
      this.folder
    );
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), contents);
    return `/${PUBLIC_UPLOAD_ROOT}/${this.folder}/${filename}`;
  }
}
