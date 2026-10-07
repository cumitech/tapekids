import { jsonOk } from "@/lib/api/http";
import { readJsonBody, adminRoute } from "@/lib/api/route-handler";
import { personService } from "@/services/people/person.service";

export const runtime = "nodejs";

export const POST = adminRoute<{ id: string }>(async ({ request, params }) => {
  return jsonOk(
    await personService.assignYfId(params.id, await readJsonBody(request))
  );
});
