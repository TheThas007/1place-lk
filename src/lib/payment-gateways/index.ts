/**
 * 1place.lk Modular Payment Gateway Abstraction Layer
 * Supports Sri Lankan Payment Gateways (PayHere, WebXPay) and Cash on Delivery (COD)
 */

export type SupportedPaymentGateway = "payhere" | "webxpay" | "cod";

export interface PaymentInitParams {
  orderId: string;
  amount: number;
  currency: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  itemsDescription: string;
}

export interface PaymentInitResult {
  gateway: SupportedPaymentGateway;
  actionUrl?: string;
  params?: Record<string, unknown>;
  hash?: string;
  merchantId?: string;
  sandbox: boolean;
}

export interface PaymentWebhookResult {
  orderId: string;
  paymentId: string;
  status: "paid" | "pending" | "failed" | "cancelled";
  amount: number;
  currency: string;
  verified: boolean;
  message?: string;
}

export interface PaymentGatewayAdapter {
  id: SupportedPaymentGateway;
  name: string;
  isAvailable(): boolean;
  initiatePayment(params: PaymentInitParams): Promise<PaymentInitResult>;
}

/**
 * PayHere Adapter implementation
 */
export const PayHereAdapter: PaymentGatewayAdapter = {
  id: "payhere",
  name: "PayHere Sri Lanka (Cards, Genie, FriMi, EzCash, mCash)",
  isAvailable: () => Boolean(process.env.PAYHERE_MERCHANT_ID),
  async initiatePayment(params: PaymentInitParams): Promise<PaymentInitResult> {
    const isSandbox = (process.env.PAYHERE_MODE || "sandbox").toLowerCase() !== "live";
    return {
      gateway: "payhere",
      merchantId: process.env.PAYHERE_MERCHANT_ID || "1211149",
      sandbox: isSandbox,
      params: {
        orderId: params.orderId,
        amount: params.amount.toFixed(2),
        currency: params.currency,
      },
    };
  },
};

/**
 * WebXPay Adapter stub implementation (Ready for configuration when merchant credentials are provided)
 */
export const WebXPayAdapter: PaymentGatewayAdapter = {
  id: "webxpay",
  name: "WebXPay Sri Lanka (Visa, MasterCard, Amex, Sampath Vishwa)",
  isAvailable: () => Boolean(process.env.WEBXPAY_SECRET_KEY && process.env.WEBXPAY_PUBLIC_KEY),
  async initiatePayment(params: PaymentInitParams): Promise<PaymentInitResult> {
    const isSandbox = (process.env.WEBXPAY_MODE || "sandbox").toLowerCase() !== "live";
    return {
      gateway: "webxpay",
      merchantId: process.env.WEBXPAY_PUBLIC_KEY || "webxpay_sandbox",
      sandbox: isSandbox,
      params: {
        orderId: params.orderId,
        amount: params.amount,
        currency: params.currency,
      },
    };
  },
};

/**
 * COD Adapter
 */
export const CodAdapter: PaymentGatewayAdapter = {
  id: "cod",
  name: "Cash on Delivery (Islandwide Courier Collection)",
  isAvailable: () => true,
  async initiatePayment(params: PaymentInitParams): Promise<PaymentInitResult> {
    return {
      gateway: "cod",
      sandbox: false,
      params: {
        orderId: params.orderId,
        amount: params.amount,
        currency: params.currency,
      },
    };
  },
};

export const PAYMENT_GATEWAY_REGISTRY: Record<SupportedPaymentGateway, PaymentGatewayAdapter> = {
  payhere: PayHereAdapter,
  webxpay: WebXPayAdapter,
  cod: CodAdapter,
};

export function getActivePaymentGateway(): PaymentGatewayAdapter {
  const chosen = (process.env.PAYMENT_GATEWAY_PROVIDER || "payhere").toLowerCase() as SupportedPaymentGateway;
  return PAYMENT_GATEWAY_REGISTRY[chosen] || PayHereAdapter;
}
