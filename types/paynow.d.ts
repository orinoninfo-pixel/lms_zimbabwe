declare module "paynow" {
  export class Paynow {
    constructor(integrationId: string, integrationKey: string)
    resultUrl: string
    returnUrl: string
    createPayment(reference: string, email?: string): Payment
    send(payment: Payment): Promise<PaynowResponse>
  }

  export interface Payment {
    add(name: string, amount: number): void
  }

  export interface PaynowResponse {
    success: boolean
    redirectUrl?: string
    pollUrl?: string
    error?: string
    instructions?: string
  }
}
