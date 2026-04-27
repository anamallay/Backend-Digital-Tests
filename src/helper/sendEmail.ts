import nodemailer from 'nodemailer'
import { dev } from '../config'
import { EmailDataType } from '../types/authsTypes'

const mailtrapConfigured = Boolean(dev.app.mailtrapUser && dev.app.mailtrapPass)

const transporter = mailtrapConfigured
  ? nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: dev.app.mailtrapUser,
        pass: dev.app.mailtrapPass,
      },
    })
  : null

let placeholderWarned = false

export const handleSendEmail = async (emailData: EmailDataType) => {
  if (!transporter) {
    if (!placeholderWarned) {
      console.warn(
        '[sendEmail] MAILTRAP_USER/MAILTRAP_PASS not set — emails will be skipped. ' +
          'Set them in .env to enable transactional email.'
      )
      placeholderWarned = true
    }
    return
  }

  const mailOptions = {
    from: dev.app.mailFrom,
    to: emailData.email,
    subject: emailData.subject,
    html: emailData.html,
  }

  await transporter.sendMail(mailOptions)
}
