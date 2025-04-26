import { EmailService } from './email.service'

export class FakeEmailService implements EmailService {
  async sendEmail({
    to,
    subject,
    text,
  }: {
    to: string
    subject: string
    html: string
    text?: string
  }) {
    console.log('🧪 [FAKE EMAIL] Enviando e-mail para:', to)
    console.log('Assunto:', subject)
    console.log('Texto:', text)
  }

  async sendWelcomeEmail({ to, name }: { to: string; name: string }) {
    const firstName = name.trim().split(' ')[0] || 'Usuário'
    const formattedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()

    console.log(`🧪 [FAKE EMAIL] Bem-vindo(a) ${formattedName} (${to})!`)
  }
}
