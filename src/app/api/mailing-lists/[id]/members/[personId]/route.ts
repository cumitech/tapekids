import { jsonOk } from "@/lib/api/http";
import { adminRoute } from "@/lib/api/route-handler";
import { mailingListService } from "@/services/mailing-lists/mailing-list.service";

export const runtime = "nodejs";

export const DELETE = adminRoute<{ id: string; personId: string }>(
  async ({ params }) => {
    await mailingListService.removeMember(params.id, params.personId);
    return jsonOk(null, "Member removed");
  }
);
