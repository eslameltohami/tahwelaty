/**
 * Deliberately unconfigured integration seam for a future contracted provider.
 * Do not add credentials, endpoints, or live transaction calls to the mobile bundle.
 * The demo screens do not use this adapter and only create in-memory demo receipts.
 */
export type PaymentIntent = {
  service: string;
  beneficiaryReference: string;
  amountInEgp: number;
  idempotencyKey: string;
};

export type ProviderPaymentResult = {
  providerReference: string;
  status: "accepted" | "pending" | "failed";
};

export interface PaymentProviderAdapter {
  readonly providerName: string;
  submitPayment(intent: PaymentIntent): Promise<ProviderPaymentResult>;
}

/** Production payments remain disabled until a provider contract and Sandbox are available. */
export const LIVE_PAYMENTS_ENABLED = false;
export const LIVE_PAYMENT_PROVIDER: PaymentProviderAdapter | null = null;
