import { NextResponse } from "next/server";

import { parseListQuery } from "@/data/types/pagination";
import { jsonList } from "@/lib/api/http";
import { readJsonBody, searchParamsOf, staffRoute } from "@/lib/api/route-handler";
import { personService } from "@/services/people/person.service";

export const runtime = "nodejs";

export const GET = staffRoute(async ({ request }) => {
  const result = await personService.list(parseListQuery(searchParamsOf(request)));
  return jsonList(result.data, result.total);
});

export const POST = staffRoute(async ({ request }) => {
  const person = await personService.create(await readJsonBody(request));
  return NextResponse.json(person, { status: 201 });
});
