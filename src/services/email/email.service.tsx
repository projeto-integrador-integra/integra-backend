import { render } from '@react-email/render'
import { Resend } from 'resend'

import WelcomeEmail from '@/emails/WelcomeEmail'

export interface EmailService {
  sendEmail: (input: { to: string; subject: string; html: string }) => Promise<void>
  sendWelcomeEmail: (input: { to: string; name: string }) => Promise<void>
}

export class ResendEmailService implements EmailService {
  private resend: Resend

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey)
  }

  async sendEmail({
    to,
    subject,
    html,
    text,
  }: {
    to: string
    subject: string
    html: string
    text?: string
  }) {
    await this.resend.emails.send({
      from: 'Integra <contato@charmbyte.dev>',
      to,
      subject,
      html,
      text,
    })
  }

  async sendWelcomeEmail({ to, name }: { to: string; name: string }) {
    const firstName = name.trim().split(' ')[0] || 'Usuário'
    const formattedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()

    const emailHtml = await render(<WelcomeEmail name={formattedName} />)
    await this.sendEmail({
      to,
      subject: `Bem-vindo(a) ao Integra! ${formattedName}`,
      html: emailHtml,
      text: `Olá ${formattedName}, seja bem-vindo(a) ao Integra! Acesse: https://integra.charmbyte.dev/login`,
    })
  }
}
