import { parseListQuery } from "@/data/types/pagination";
import { jsonList, jsonOk } from "@/lib/api/http";
import { readJsonBody, searchParamsOf, staffRoute } from "@/lib/api/route-handler";
import { paymentService } from "@/services/payments/payment.service";

export const runtime = "nodejs";

export const GET = staffRoute(async ({ request }) => {
  const searchParams = searchParamsOf(request);
  const query = parseListQuery(searchParams);
  const eventId = searchParams.get("eventId");
  const personId = searchParams.get("personId");

  if (eventId) {
    const result = await paymentService.listByEvent(eventId, query);
    return jsonList(result.data, result.total);
  }
  if (personId) {
    const result = await paymentService.listByPerson(personId, query);
    return jsonList(result.data, result.total);
  }

  return jsonList([], 0);
});

export const POST = staffRoute(async ({ request }) => {
  const result = await paymentService.initiate(await readJsonBody(request));
  return jsonOk(result, "Payment started", 201);
});
