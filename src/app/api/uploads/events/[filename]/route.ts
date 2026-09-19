import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";

import { publicRoute } from "@/lib/api/route-handler";
import {
  eventImageMime,
  resolveEventImagePath,
} from "@/lib/uploads/storage-paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = publicRoute<{ filename: string }>(
  async ({ params }) => {
    const filePath = await resolveEventImagePath(params.filename);
    if (!filePath) {
      return new NextResponse("Not found", { status: 404 });
    }

    const body = await readFile(filePath);
    return new NextResponse(body, {
      headers: {
        "Content-Type": eventImageMime(params.filename),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  },
  { db: false }
);
