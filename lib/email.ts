import nodemailer from "nodemailer"

const DEFAULT_FROM_NAME = "Zim Learning"
const DEFAULT_SUPPORT_EMAIL = "support@zimlearning.co.zw"

export class EmailNotConfiguredError extends Error {
  constructor(message = "Email delivery is not configured.") {
    super(message)
    this.name = "EmailNotConfiguredError"
  }
}

function getAppUrl() {
  return process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000"
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim()
  const port = Number.parseInt(process.env.SMTP_PORT?.trim() || "", 10)
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS?.trim()

  if (!host || !Number.isFinite(port) || !user || !pass) {
    return null
  }

  const secure = process.env.SMTP_SECURE?.trim()
    ? process.env.SMTP_SECURE?.trim().toLowerCase() === "true"
    : port === 465

  return {
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  }
}

export function isEmailDeliveryConfigured() {
  return Boolean(getSmtpConfig())
}

function getFromAddress() {
  const fromEmail = process.env.MAIL_FROM_EMAIL?.trim() || process.env.SMTP_USER?.trim() || DEFAULT_SUPPORT_EMAIL
  const fromName = process.env.MAIL_FROM_NAME?.trim() || DEFAULT_FROM_NAME

  return `"${fromName}" <${fromEmail}>`
}

export function buildPasswordResetUrl(token: string) {
  return `${getAppUrl()}/reset-password?token=${encodeURIComponent(token)}`
}

export async function sendPasswordResetEmail({
  toEmail,
  userName,
  resetUrl,
}: {
  toEmail: string
  userName?: string | null
  resetUrl: string
}) {
  const smtpConfig = getSmtpConfig()

  if (!smtpConfig) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[auth] SMTP is not configured. Password reset link for ${toEmail}: ${resetUrl}`)
      return
    }

    throw new EmailNotConfiguredError("Password reset email delivery is not configured.")
  }

  const transporter = nodemailer.createTransport(smtpConfig)
  const recipientName = userName?.trim() || "there"

  await transporter.sendMail({
    from: getFromAddress(),
    to: toEmail,
    subject: "Reset your Zim Learning password",
    text: [
      `Hello ${recipientName},`,
      "",
      "We received a request to reset your Zim Learning password.",
      "Use the link below to choose a new password:",
      resetUrl,
      "",
      "This link expires in 1 hour.",
      "If you did not request a password reset, you can ignore this email.",
    ].join("\n"),
    html: `
      <p>Hello ${escapeHtml(recipientName)},</p>
      <p>We received a request to reset your Zim Learning password.</p>
      <p><a href="${escapeHtml(resetUrl)}">Reset your password</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request a password reset, you can ignore this email.</p>
    `,
  })
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}
