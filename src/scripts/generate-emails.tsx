import { render } from '@react-email/render'
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs'
import { basename, extname, resolve } from 'path'

async function main() {
  const componentsDir = resolve(__dirname, '../emails/components')
  const outputDir = resolve(__dirname, '../emails/templates')

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  const files = readdirSync(componentsDir).filter((file) => extname(file) === '.tsx')

  for (const file of files) {
    const nameWithoutExt = basename(file, '.tsx')

    console.log(`🔨 Gerando template para: ${nameWithoutExt}`)

    const { default: EmailComponent } = await import(`../emails/components/${nameWithoutExt}`)
    const requiredProps = EmailComponent.requiredProps ?? []
    const fakeProps = createFakeProps(requiredProps)
    const emailHtml = await render(<EmailComponent {...fakeProps} />)
    const outputPath = resolve(outputDir, `${toKebabCase(nameWithoutExt)}.html`)

    writeFileSync(outputPath, emailHtml)

    console.log(`✅ Template gerado: ${outputPath}`)
  }
}

function toKebabCase(str: string) {
  return str
    .replace('Email', '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

function createFakeProps(props: string[]): Record<string, unknown> {
  const fake: Record<string, unknown> = {}
  for (const prop of props) {
    fake[prop] = `{{${prop}}}`
  }
  return fake
}

main().catch((err) => {
  console.error('❌ Erro ao gerar templates:', err)
  process.exit(1)
})
