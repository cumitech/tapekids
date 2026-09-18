import { CAMPAY_PATHS, CAMPAY_PAYMENT_OPTIONS } from "@/constants/campay";
import { campayRequest } from "./http";
import type {
  CollectInput,
  PaymentAdapter,
  PaymentLinkInput,
  ProviderChargeResult,
} from "../types";

type CollectResponse = {
  reference?: string;
  ussd_code?: string;
  operator?: string;
  status?: string;
};

type LinkResponse = {
  reference?: string;
  link?: string;
  status?: string;
};

type StatusResponse = {
  reference?: string;
  status?: string;
  external_reference?: string;
};

export class CampayAdapter implements PaymentAdapter {
  async collect(input: CollectInput): Promise<ProviderChargeResult> {
    const data = await campayRequest<CollectResponse>("post", CAMPAY_PATHS.collect, {
      body: {
        amount: String(input.amount),
        currency: input.currency,
        from: input.from,
        description: input.description,
        external_reference: input.externalReference,
      },
    });

    if (!data.reference) {
      throw new Error("Invalid collect response from CamPay.");
    }

    return {
      reference: data.reference,
      status: data.status || "PENDING",
      ussdCode: data.ussd_code,
      operator: data.operator,
    };
  }

  async createPaymentLink(input: PaymentLinkInput): Promise<ProviderChargeResult> {
    const data = await campayRequest<LinkResponse>("post", CAMPAY_PATHS.paymentLink, {
      body: {
        amount: String(input.amount),
        currency: input.currency,
        from: input.phone,
        description: input.description,
        first_name: input.firstName ?? "",
        last_name: input.lastName ?? "",
        email: input.email ?? "",
        external_reference: input.externalReference,
        redirect_url: input.redirectUrl,
        failure_redirect_url: input.redirectUrl,
        payment_options: CAMPAY_PAYMENT_OPTIONS,
        payer_can_pay_more: "no",
      },
    });

    if (!data.reference || !data.link) {
      throw new Error("Invalid payment link response from CamPay.");
    }

    return {
      reference: data.reference,
      status: data.status || "PENDING",
      link: data.link,
    };
  }

  async getStatus(reference: string): Promise<{ status: string; reference: string }> {
    const data = await campayRequest<StatusResponse>(
      "get",
      CAMPAY_PATHS.transaction(reference)
    );
    return {
      reference: data.reference || reference,
      status: data.status || "PENDING",
    };
  }
}
