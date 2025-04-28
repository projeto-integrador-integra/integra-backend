# ✉️ Templates de Emails

## 📂 Estrutura

```txt
src/
├── emails/
│   ├── components/              # Templates escritos em React (.tsx)
│   └── templates/               # Arquivos HTML gerados automaticamente
└── script/
    └── generate-emails.ts       # Script que transforma templates React em HTML
```

## 🚀 Como criar um novo email

1. Crie um novo arquivo em `src/emails/components/`.

   Exemplo:

   ```tsx
   // src/emails/components/WelcomeEmail.tsx
   import { Html, Head, Body, Container, Text } from '@react-email/components'

   export default function WelcomeEmail({ name }: { name: string }) {
     return (
       <Html>
         <Head />
         <Body>
           <Container>
             <Text>Olá, {name}!</Text>
             <Text>Bem-vindo(a) ao Integra!</Text>
           </Container>
         </Body>
       </Html>
     )
   }

   WelcomeEmail.requiredProps = ['name']
   ```

2. Para visualizar templates localmente, rode na raiz do projeto:

   ```bash
   npm run email:dev
   ```

   Isso irá gerar o arquivo html automaticamente em `src/emails/templates/`.

## ⚠️ Atenção

- Não edite manualmente os arquivos .html dentro de templates/.
- Sempre adicione a propriedade requiredProps no final do seu componente.
- Os placeholders são inseridos no formato {{name}}, {{email}}, {{token}}, etc.
