type CreateCheckoutInput = {
  donationId: string;
  itemName: string;
  amountCents: number;
  donorName?: string | null;
};

type CheckoutResult = {
  checkoutUrl: string;
  orderNsu: string;
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

/** InfiniteTag sem o $ inicial */
export function infinitepayHandle() {
  return (process.env.INFINITEPAY_HANDLE || "").trim().replace(/^\$/, "");
}

export function isInfinitePayConfigured(): boolean {
  return Boolean(infinitepayHandle());
}

function formatAmountLabel(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Cria um link de checkout InfinitePay por doação, com o valor informado.
 * Sem handle: retorna URL de demo local.
 */
export async function createInfinitePayCheckout(
  input: CreateCheckoutInput
): Promise<CheckoutResult> {
  if (!isInfinitePayConfigured()) {
    return {
      checkoutUrl: `${siteUrl()}/api/checkout/demo?donationId=${input.donationId}`,
      orderNsu: input.donationId,
      demo: true,
    };
  }

  const handle = infinitepayHandle();
  const amountCents = Math.round(input.amountCents);
  const redirect = `${siteUrl()}/obrigado?donationId=${input.donationId}`;
  const description =
    `Casamento · ${input.itemName} (${formatAmountLabel(amountCents)})`.slice(
      0,
      120
    );

  const payload: Record<string, unknown> = {
    handle,
    order_nsu: input.donationId,
    redirect_url: redirect,
    items: [
      {
        quantity: 1,
        price: amountCents,
        description,
      },
    ],
  };

  if (isPublicUrl(siteUrl())) {
    payload.webhook_url = `${siteUrl()}/api/webhooks/infinitepay`;
  }

  if (input.donorName?.trim()) {
    payload.customer = {
      name: input.donorName.trim().slice(0, 120),
    };
  }

  const response = await fetch("https://api.checkout.infinitepay.io/links", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  let data: {
    url?: string;
    checkout_url?: string;
    link?: string;
    message?: string;
    error?: string;
  } = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { message: raw };
  }

  const checkoutUrl = data.url || data.checkout_url || data.link;

  if (!response.ok || !checkoutUrl) {
    console.error("InfinitePay checkout error:", response.status, raw, {
      handle,
      amountCents,
    });

    if (response.status === 422) {
      throw new Error(
        "InfinitePay recusou o link (422). Confira se INFINITEPAY_HANDLE é a InfiniteTag correta (ex.: eduardo-ferreira-qzg, sem $) e se o Checkout Integrado está habilitado no app."
      );
    }

    throw new Error(
      `Falha ao criar checkout InfinitePay (${response.status})${
        data.message || data.error ? `: ${data.message || data.error}` : ""
      }`
    );
  }

  return {
    checkoutUrl,
    orderNsu: input.donationId,
    demo: false,
  };
}

/** Confirma pagamento na API (redirect / fallback do webhook). */
export async function checkInfinitePayPayment(params: {
  orderNsu: string;
  transactionNsu: string;
  slug: string;
}): Promise<{ paid: boolean; amount?: number }> {
  const handle = infinitepayHandle();
  if (!handle) return { paid: false };

  const response = await fetch(
    "https://api.checkout.infinitepay.io/payment_check",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        handle,
        order_nsu: params.orderNsu,
        transaction_nsu: params.transactionNsu,
        slug: params.slug,
      }),
    }
  );

  const data = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    paid?: boolean;
    amount?: number;
  };

  return {
    paid: Boolean(data.success && data.paid),
    amount: typeof data.amount === "number" ? data.amount : undefined,
  };
}
