import { chmod, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { PUBLIC_UPLOAD_ROOT } from "@/constants/uploads";
import { eventUploadDir } from "@/lib/uploads/storage-paths";

const FILE_MODE = 0o644;
const DIR_MODE = 0o755;

export class LocalPublicStorageAdapter {
  constructor(private readonly folder: string) {}

  async save(filename: string, contents: Buffer): Promise<string> {
    const directory = eventUploadDir();
    await mkdir(directory, { recursive: true, mode: DIR_MODE });
    const filePath = path.join(directory, filename);
    await writeFile(filePath, contents, { mode: FILE_MODE });
    await chmod(filePath, FILE_MODE).catch(() => undefined);
    return `/${PUBLIC_UPLOAD_ROOT}/${this.folder}/${filename}`;
  }
}
