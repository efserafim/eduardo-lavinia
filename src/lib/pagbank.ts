type CreateCheckoutInput = {
  donationId: string;
  itemName: string;
  amountCents: number;
  donorName?: string | null;
};

type CheckoutResult = {
  checkoutUrl: string;
  orderId: string;
  demo: boolean;
};

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

function isPublicUrl(url: string) {
  try {
    const host = new URL(url).hostname;
    return host !== "localhost" && host !== "127.0.0.1";
  } catch {
    return false;
  }
}

export function isPagBankConfigured(): boolean {
  return Boolean(process.env.PAGBANK_TOKEN?.trim());
}

/**
 * Cria checkout PagBank (Checkouts API).
 * Sem token: retorna URL de demo local que marca a doação como paga.
 */
export async function createPagBankCheckout(
  input: CreateCheckoutInput
): Promise<CheckoutResult> {
  if (!isPagBankConfigured()) {
    return {
      checkoutUrl: `${siteUrl()}/api/checkout/demo?donationId=${input.donationId}`,
      orderId: `demo_${input.donationId}`,
      demo: true,
    };
  }

  const token = process.env.PAGBANK_TOKEN!.trim();
  const base = (
    process.env.PAGBANK_API_URL?.trim() || "https://sandbox.api.pagseguro.com"
  ).replace(/\/$/, "");

  const redirect = `${siteUrl()}/obrigado?donationId=${input.donationId}`;
  const payload: Record<string, unknown> = {
    reference_id: input.donationId.slice(0, 64),
    customer_modifiable: true,
    items: [
      {
        reference_id: input.donationId.slice(0, 100),
        name: `Cha de Panela - ${input.itemName}`.slice(0, 100),
        quantity: 1,
        unit_amount: input.amountCents,
      },
    ],
    additional_amount: 0,
    discount_amount: 0,
    payment_methods: [
      {
        type: "CREDIT_CARD",
        brands: ["VISA", "MASTERCARD", "ELO", "AMEX"],
      },
      { type: "PIX" },
      { type: "BOLETO" },
    ],
    payment_methods_configs: [
      {
        type: "CREDIT_CARD",
        config_options: [
          { option: "INSTALLMENTS_LIMIT", value: "12" },
          { option: "INTEREST_FREE_INSTALLMENTS", value: "1" },
        ],
      },
    ],
    soft_descriptor: "ChaPanela",
    redirect_url: redirect,
    redirect_waiting_time: 10,
  };

  if (input.donorName && input.donorName.trim().includes(" ")) {
    payload.customer = {
      name: input.donorName.trim().slice(0, 120),
    };
  }

  // PagBank só notifica URLs públicas
  if (isPublicUrl(siteUrl())) {
    payload.payment_notification_urls = [
      `${siteUrl()}/api/webhooks/pagbank`,
    ];
  }

  const response = await fetch(`${base}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  let data: {
    id?: string;
    links?: Array<{ rel?: string; href?: string }>;
    error_messages?: Array<{ description?: string; error?: string }>;
    message?: string;
  } = {};

  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { message: raw };
  }

  if (!response.ok) {
    console.error("PagBank checkout error:", response.status, raw);
    const detail =
      data.error_messages?.[0]?.description ||
      data.error_messages?.[0]?.error ||
      data.message ||
      raw.slice(0, 180);

    if (response.status === 401) {
      throw new Error(
        "Token PagBank inválido (401). Copie de novo em Tokens do Sandbox e reinicie o npm run dev."
      );
    }

    throw new Error(
      `Falha ao criar checkout PagBank (${response.status})${
        detail ? `: ${detail}` : ""
      }`
    );
  }

  const link =
    data.links?.find((l) => l.rel === "PAY")?.href ||
    data.links?.find((l) => l.rel === "payment")?.href ||
    data.links?.[0]?.href;

  if (!link || !data.id) {
    console.error("PagBank response sem URL:", data);
    throw new Error("PagBank não retornou URL de pagamento.");
  }

  return {
    checkoutUrl: link,
    orderId: data.id,
    demo: false,
  };
}
