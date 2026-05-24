// SMTP sender for transactional email (password reset, etc.).
//
// Configured via MAIL_* env vars (see .env.example). Currently routed through
// ImprovMX's SMTP relay since maan.center's MX is hosted there for forwarding —
// reusing the same provider for outbound keeps DNS/auth (SPF/DKIM) consistent.
//
// Singleton transporter via globalThis so Nuxt HMR in dev doesn't leak
// connections on every save (same pattern as the Prisma client).

import nodemailer from 'nodemailer'
import type { Transporter, SendMailOptions } from 'nodemailer'

const globalForMail = globalThis as unknown as {
  mail: Transporter | undefined
}

const port = Number(process.env.MAIL_PORT ?? 587)

export const mailer = globalForMail.mail ?? nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port,
  // `secure: true` is TLS-from-the-start (port 465 default). For 587 the
  // transport upgrades via STARTTLS; nodemailer handles that when secure=false.
  // We respect the MAIL_SECURE flag as configured per provider.
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  }
})

if (process.env.NODE_ENV !== 'production') {
  globalForMail.mail = mailer
}

const FROM = process.env.MAIL_FROM ?? 'no-reply@localhost'

export const sendEmail = async (msg: Omit<SendMailOptions, 'from'> & { from?: string }) => {
  return mailer.sendMail({
    from: msg.from ?? FROM,
    ...msg
  })
}
