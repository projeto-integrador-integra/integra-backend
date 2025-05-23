import { Resend } from 'resend'

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

interface SendEmailInput {
  to: string
  subject: string
  html: string
  text: string
}

export interface EmailService {
  sendEmail: (input: SendEmailInput) => Promise<void>
  sendWelcomeEmail: (input: { to: string; name: string }) => Promise<void>
  sendCompletedGroupEmail: (input: {
    to: string
    name: string
    projectName: string
  }) => Promise<void>
}

export class ResendEmailService implements EmailService {
  private resend: Resend
  private templates: {
    welcome: string
    groupFormed: string
  }

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey)
    this.templates = {
      welcome: this.loadTemplate('../../emails/templates/welcome.html'),
      groupFormed: this.loadTemplate('../../emails/templates/group-formed.html'),
    }
  }

  private loadTemplate(relativePath: string): string {
    try {
      const path = resolve(__dirname, relativePath)
      return readFileSync(path, 'utf-8')
    } catch (err) {
      console.error(`Erro ao carregar template: ${relativePath}`, err)
      throw new Error(`Erro interno ao carregar template de email.`)
    }
  }

  async sendEmail({ to, subject, html, text }: SendEmailInput) {
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

    const personalizedHtml = this.templates.welcome.replace('{{name}}', formattedName)

    try {
      await this.sendEmail({
        to,
        subject: `Bem-vindo(a) ao Integra! ${formattedName}`,
        html: personalizedHtml,
        text: `Olá ${formattedName}, seja bem-vindo(a) ao Integra! Acesse: https://integra.charmbyte.dev/login`,
      })
    } catch (error) {
      console.error('Erro ao enviar email de boas-vindas:', error)
      throw new Error('Erro interno ao enviar email de boas-vindas.')
    }
  }

  async sendCompletedGroupEmail({
    to,
    name,
    projectName,
  }: {
    to: string
    name: string
    projectName: string
  }) {
    const firstName = name.trim().split(' ')[0] || 'Usuário'
    const formattedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
    const projName = projectName.trim().split(' ')[0] || 'Projeto'
    const formattedProjectName = projName.charAt(0).toUpperCase() + projName.slice(1).toLowerCase()

    const personalizedHtml = this.templates.groupFormed
      .replace('{{name}}', formattedName)
      .replace('{{projectName}}', formattedProjectName)
      .replace('{{projectUrl}}', 'https://integra.charmbyte.dev/login')

    try {
      await this.sendEmail({
        to,
        subject: `Grupo ${projectName} concluído!`,
        html: personalizedHtml,
        text: `Olá ${formattedName}, o grupo ${projectName} foi concluído! Acesse: https://integra.charmbyte.dev/login`,
      })
    } catch (error) {
      console.error('Erro ao enviar email de conclusão de grupo:', error)
      throw new Error('Erro interno ao enviar email de conclusão de grupo.')
    }
  }
}
