// Send a "new submission" email to the team.
//
// Notify target priority:
//   1. `contact-info` SiteSetting's `email` (admin edits this in the dashboard,
//      so the address can change without a redeploy)
//   2. `MAIL_NOTIFY_TO` env var (fallback when the setting hasn't been seeded)
//   3. Nothing — we log and move on rather than throw, because the submitter
//      should still see "Thank you" even if the mailer is misconfigured.
//
// The email body lists the submitter's values with their labels in the
// locale they used, mirroring what the admin will see in the dashboard.

import { sendEmail } from './email'

type SubmissionValueLine = { label: string, value: string }

export type SubmissionEmailContext = {
  formTitle: string
  formSlug: string
  locale: 'en' | 'ar' | string
  values: SubmissionValueLine[]
  dashboardUrl: string
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const renderSubmissionEmail = (ctx: SubmissionEmailContext): string => {
  const rows = ctx.values.map(v => `
    <tr>
      <td style="padding:8px 12px 8px 0;color:#466079;font-weight:600;font-size:13px;vertical-align:top;white-space:nowrap;">
        ${escapeHtml(v.label)}
      </td>
      <td style="padding:8px 0;color:#0F2741;font-size:14px;white-space:pre-wrap;">
        ${escapeHtml(v.value || '—')}
      </td>
    </tr>
  `).join('')

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 640px; margin: 0 auto; padding: 24px;">
      <p style="margin:0 0 6px 0; color:#3D8AC5; font-size:12px; font-weight:700; letter-spacing:.1em; text-transform:uppercase;">
        Maan · New submission
      </p>
      <h2 style="margin:0 0 4px 0; color:#0F2741; font-size:20px;">
        ${escapeHtml(ctx.formTitle)}
      </h2>
      <p style="margin:0 0 20px 0; color:#466079; font-size:13px;">
        Locale: ${escapeHtml(ctx.locale.toUpperCase())} · /forms/${escapeHtml(ctx.formSlug)}
      </p>
      <table style="border-collapse: collapse; width: 100%;">
        ${rows}
      </table>
      <p style="margin: 24px 0 0 0; font-size: 13px;">
        <a href="${escapeHtml(ctx.dashboardUrl)}" style="color:#3D8AC5; text-decoration: underline;">
          Open in dashboard →
        </a>
      </p>
    </div>
  `
}

const lookupNotifyEmail = async (): Promise<string | undefined> => {
  // Read the contact-info SiteSetting directly — same shape the dashboard
  // editor saves. Either locale row works (the email is locale-agnostic).
  try {
    const row = await prisma.siteSetting.findFirst({
      where: { key: 'contact-info' }
    })
    const value = (row?.value ?? null) as { email?: string } | null
    const email = value?.email?.trim()
    if (email) return email
  } catch {
    // fall through to env
  }
  const envFallback = process.env.MAIL_NOTIFY_TO?.trim()
  return envFallback || undefined
}

export const sendSubmissionNotification = async (ctx: SubmissionEmailContext) => {
  const to = await lookupNotifyEmail()
  if (!to) {
    console.warn('[notify] No MAIL_NOTIFY_TO and no contact-info.email — skipping submission email.')
    return
  }
  try {
    await sendEmail({
      to,
      subject: `Maan · New submission: ${ctx.formTitle}`,
      html: renderSubmissionEmail(ctx),
      text: ctx.values.map(v => `${v.label}: ${v.value || '-'}`).join('\n')
    })
  } catch (err) {
    // Email is best-effort — never let a mailer error fail the submission.
    console.error('[notify] Submission email failed:', err)
  }
}
