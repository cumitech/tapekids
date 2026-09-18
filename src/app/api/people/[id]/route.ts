import { NextResponse } from "next/server";

import { jsonOk } from "@/lib/api/http";
import { readJsonBody, staffRoute } from "@/lib/api/route-handler";
import { personService } from "@/services/people/person.service";

export const runtime = "nodejs";

export const GET = staffRoute<{ id: string }>(async ({ params }) => {
  return NextResponse.json(await personService.getById(params.id));
});

export const PATCH = staffRoute<{ id: string }>(async ({ request, params }) => {
  const person = await personService.update(params.id, await readJsonBody(request));
  return NextResponse.json(person);
});

export const DELETE = staffRoute<{ id: string }>(async ({ params }) => {
  await personService.delete(params.id);
  return jsonOk(null, "Person deleted");
});
