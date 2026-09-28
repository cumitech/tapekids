import { parseListQuery } from "@/data/types/pagination";
import { jsonList, jsonOk } from "@/lib/api/http";
import { readJsonBody, searchParamsOf, adminRoute } from "@/lib/api/route-handler";
import { toPaymentJson } from "@/lib/payments/public";
import { paymentService } from "@/services/payments/payment.service";

export const runtime = "nodejs";

export const GET = adminRoute(async ({ request }) => {
  const searchParams = searchParamsOf(request);
  const query = parseListQuery(searchParams);
  const eventId = searchParams.get("eventId");
  const personId = searchParams.get("personId");

  const result = eventId
    ? await paymentService.listByEvent(eventId, query)
    : personId
      ? await paymentService.listByPerson(personId, query)
      : await paymentService.list(query);

  return jsonList(result.data.map(toPaymentJson), result.total);
});

export const POST = adminRoute(async ({ request }) => {
  const result = await paymentService.initiate(await readJsonBody(request));
  return jsonOk(result, "Payment started", 201);
});
