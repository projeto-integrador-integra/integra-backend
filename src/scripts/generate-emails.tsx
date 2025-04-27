import { render } from '@react-email/render'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve } from 'path'

import WelcomeEmail from '@/emails/WelcomeEmail'

async function main() {
  const outputDir = resolve(__dirname, '../emails/templates')
  const outputPath = resolve(outputDir, 'welcome.html')

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  const html = await render(<WelcomeEmail name="{{name}}" />)
  writeFileSync(outputPath, html)

  console.log('✅ Welcome email template gerado:', outputPath)
}

main().catch((err) => {
  console.error('Erro ao gerar templates:', err)
  process.exit(1)
})
