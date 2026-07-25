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
  return (
    process.env.APP_BASE_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://localhost:3000"
  )
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
  const fromEmail =
    process.env.EMAIL_FROM_ADDRESS?.trim() ||
    process.env.MAIL_FROM_EMAIL?.trim() ||
    process.env.SMTP_USER?.trim() ||
    DEFAULT_SUPPORT_EMAIL
  const fromName = process.env.EMAIL_FROM_NAME?.trim() || process.env.MAIL_FROM_NAME?.trim() || DEFAULT_FROM_NAME

  return `"${fromName}" <${fromEmail}>`
}

function getSupportEmail() {
  return process.env.SUPPORT_EMAIL?.trim() || DEFAULT_SUPPORT_EMAIL
}

export function buildPasswordResetUrl(token: string) {
  return `${getAppUrl()}/reset-password?token=${encodeURIComponent(token)}`
}

export async function sendPasswordResetEmail({
  toEmail,
  userName,
  resetUrl,
  expiresInMinutes,
}: {
  toEmail: string
  userName?: string | null
  resetUrl: string
  expiresInMinutes: number
}) {
  const smtpConfig = getSmtpConfig()

  if (!smtpConfig) {
    if (process.env.NODE_ENV !== "production") return

    throw new EmailNotConfiguredError("Password reset email delivery is not configured.")
  }

  const transporter = nodemailer.createTransport(smtpConfig)
  const recipientName = userName?.trim() || "there"
  const supportEmail = getSupportEmail()

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
      `This link expires in ${expiresInMinutes} minutes.`,
      "",
      "If the button does not work, copy and paste this URL into your browser:",
      resetUrl,
      "",
      "If you did not request a password reset, you can ignore this email.",
      `Need help? Contact ${supportEmail}.`,
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:560px;margin:0 auto;padding:24px 0;">
        <p style="margin:0 0 12px 0;font-size:20px;font-weight:700;">Zim Learning</p>
        <p>Hello ${escapeHtml(recipientName)},</p>
        <p>We received a request to reset your Zim Learning password.</p>
        <p style="margin:20px 0;">
          <a
            href="${escapeHtml(resetUrl)}"
            style="display:inline-block;background:#111827;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;"
          >
            Reset Password
          </a>
        </p>
        <p>This link expires in ${expiresInMinutes} minutes.</p>
        <p>If the button above does not work, use this URL:</p>
        <p><a href="${escapeHtml(resetUrl)}">${escapeHtml(resetUrl)}</a></p>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <p>Need help? Contact <a href="mailto:${escapeHtml(supportEmail)}">${escapeHtml(supportEmail)}</a>.</p>
      </div>
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
