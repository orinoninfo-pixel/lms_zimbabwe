import { Paynow } from "paynow"

export interface PreparedCheckout {
  provider: "paynow"
  status: "pending"
  reference: string
  description: string
  amount: number
  currency: "USD"
  requiresPayment: boolean
  message: string
  redirectUrl: string | null
  pollUrl: string | null
  configured: boolean
  success: boolean
}

export async function preparePaynowCheckout({
  reference,
  description,
  amount,
  customerEmail,
  returnUrl,
  resultUrl,
}: {
  reference: string
  description: string
  amount: number
  customerEmail?: string
  returnUrl?: string
  resultUrl?: string
}): Promise<PreparedCheckout> {
  const integrationId = process.env.PAYNOW_INTEGRATION_ID?.trim()
  const integrationKey = process.env.PAYNOW_INTEGRATION_KEY?.trim()

  if (!integrationId || !integrationKey) {
    return {
      provider: "paynow",
      status: "pending",
      reference,
      description,
      amount,
      currency: "USD",
      requiresPayment: true,
      message: "Paynow credentials are not configured yet. Checkout could not be started.",
      redirectUrl: null,
      pollUrl: null,
      configured: false,
      success: false,
    }
  }

  try {
    const paynow = new Paynow(integrationId, integrationKey)
    paynow.resultUrl = resultUrl ?? process.env.PAYNOW_RESULT_URL ?? ""
    paynow.returnUrl = returnUrl ?? process.env.PAYNOW_RETURN_URL ?? ""

    const payment = paynow.createPayment(reference, customerEmail)
    payment.add(description, amount)

    const response = await paynow.send(payment)
    if (response?.success) {
      return {
        provider: "paynow",
        status: "pending",
        reference,
        description,
        amount,
        currency: "USD",
        requiresPayment: true,
        message: "Paynow checkout is ready. You will be redirected to complete the payment.",
        redirectUrl: response.redirectUrl ?? null,
        pollUrl: response.pollUrl ?? null,
        configured: true,
        success: true,
      }
    }

    return {
      provider: "paynow",
      status: "pending",
      reference,
      description,
      amount,
      currency: "USD",
      requiresPayment: true,
      message: response?.error ?? "Paynow checkout could not be started.",
      redirectUrl: null,
      pollUrl: null,
      configured: true,
      success: false,
    }
  } catch (error) {
    return {
      provider: "paynow",
      status: "pending",
      reference,
      description,
      amount,
      currency: "USD",
      requiresPayment: true,
      message: error instanceof Error ? error.message : "Paynow checkout failed.",
      redirectUrl: null,
      pollUrl: null,
      configured: true,
      success: false,
    }
  }
}
