import { jsonOk } from "@/lib/api/http";
import { staffRoute } from "@/lib/api/route-handler";
import { mailingListService } from "@/services/mailing-lists/mailing-list.service";

export const runtime = "nodejs";

export const DELETE = staffRoute<{ id: string; personId: string }>(
  async ({ params }) => {
    await mailingListService.removeMember(params.id, params.personId);
    return jsonOk(null, "Member removed");
  }
);
