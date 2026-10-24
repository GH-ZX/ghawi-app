import type { PaymentSpec, ProviderSpec } from "./spec";

/**
 * Two complete specs: the starting points for "New provider" / "New payment"
 * in the library, and the examples in the README. Tests check they validate.
 */
export const EXAMPLE_PROVIDER: ProviderSpec = {
  kind: "provider",
  id: "example-store",
  name: "Example Store API",
  version: 1,
  base_url: "https://api.example-store.com/v1",
  auth: { type: "header", name: "Authorization", format: "Bearer {token}" },
  endpoints: {
    balance: { method: "GET", path: "/me/balance", map: { amount: "$.data.balance", currency: "$.data.currency" } },
    products: {
      method: "GET",
      path: "/products",
      query: { page_size: "200" },
      list: "$.data",
      map: {
        id: "$.id",
        name: "$.title",
        price: "$.price",
        stock: "$.stock",
        description: "$.description",
        image: "$.image_url",
        min_qty: "$.min",
        max_qty: "$.max",
      },
    },
    order: {
      method: "POST",
      path: "/orders",
      body: { product_id: "{product_id}", quantity: "{quantity}", reference: "{reference}", email: "{email}" },
      map: { order_id: "$.data.id", status: "$.data.status", items: "$.data.items" },
    },
    status: { method: "GET", path: "/orders/{order_id}", map: { status: "$.data.status", items: "$.data.items" } },
  },
  status_map: { delivered: ["completed", "delivered"], pending: ["pending", "processing"], failed: ["failed", "cancelled", "refunded"] },
  price_currency: "USD",
  requires: [{ key: "email", label_en: "Account email", label_ar: "بريد الحساب" }],
};

export const EXAMPLE_PAYMENT: PaymentSpec = {
  kind: "payment",
  id: "example-pay",
  name: "Example Crypto Invoices",
  version: 1,
  base_url: "https://api.example-pay.com",
  auth: { type: "header", name: "X-Api-Key", format: "{token}" },
  create: {
    method: "POST",
    path: "/v1/invoices",
    body: {
      amount: "{amount}",
      currency: "{currency}",
      order_id: "{reference}",
      callback_url: "{webhook_url}",
      success_url: "{return_url}",
    },
    map: {
      id: "$.result.uuid",
      pay_url: "$.result.url",
      address: "$.result.address",
      pay_amount: "$.result.payer_amount",
      pay_currency: "$.result.payer_currency",
      expires_at: "$.result.expired_at",
    },
  },
  status: { method: "GET", path: "/v1/invoices/{id}", map: { status: "$.result.status", paid_amount: "$.result.paid_amount" } },
  status_map: { paid: ["paid", "paid_over"], pending: ["check", "process", "confirm_check"], expired: ["cancel", "expired"], failed: ["fail", "system_fail", "wrong_amount"] },
  webhook: {
    signature: { type: "hmac-sha256", header: "X-Signature", encoding: "hex" },
    map: { id: "$.uuid", status: "$.status" },
  },
};
