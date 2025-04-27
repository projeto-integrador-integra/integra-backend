import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Heading,
  Section,
  Button,
} from '@react-email/components'

interface WelcomeEmailProps {
  name: string
}

const WelcomeEmail = ({ name = 'Teste' }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Bem-vindo(a) ao Integra! Vamos começar?</Preview>
      <Body style={{ backgroundColor: '#f9f9f9', padding: '20px' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px' }}>
          <Heading style={{ marginBottom: '20px' }}>Bem-vindo(a), {name}!</Heading>
          <Text style={{ marginBottom: '20px' }}>
            Estamos felizes por ter você no Integra. Agora você pode explorar novas oportunidades,
            conectar-se com mentores e fazer seu projeto acontecer.
          </Text>
          <Section style={{ textAlign: 'center', marginTop: '30px' }}>
            <Button
              href="https://integra.charmbyte.dev/login"
              style={{ padding: '12px 24px', fontSize: '16px' }}
            >
              Começar agora
            </Button>
          </Section>
          <Text style={{ fontSize: '12px', color: '#888', marginTop: '40px' }}>
            Você recebeu este e-mail porque se cadastrou no Integra.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeEmail
