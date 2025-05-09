import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'

interface WelcomeEmailProps {
  name: string
}

const WelcomeEmail = ({ name = 'Teste' }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Preview>Bem-vindo(a) ao Integra! Vamos começar?</Preview>
      <Body
        style={{ backgroundColor: '#f9f9f9', padding: '20px', fontFamily: 'Inter, sans-serif' }}
      >
        <Section bgcolor="#E2E8F0" cellPadding="24">
          <Row>
            <Column align="center">
              <div style={{ display: 'inline-block', textAlign: 'center' }}>
                <Img
                  src="https://integra.charmbyte.dev/logo.svg"
                  width="25"
                  alt="Logo"
                  style={{
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    marginRight: '2px',
                    marginBottom: '12px',
                  }}
                />
                <Text
                  style={{
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    fontWeight: 'bold',
                    fontSize: '24px',
                    margin: 0,
                  }}
                >
                  INTEGRA
                </Text>
              </div>
            </Column>
          </Row>
        </Section>
        <Container style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px' }}>
          <Heading style={{ marginBottom: '20px', fontSize: '18px' }}>
            Bem-vindo(a), {name}!
          </Heading>
          <Text style={{ marginBottom: '20px' }}>
            Estamos felizes por ter você no Integra. Agora você pode explorar novas oportunidades,
            conectar-se com mentores e fazer seu projeto acontecer.
          </Text>
          <Section style={{ textAlign: 'center', marginTop: '30px' }}>
            <Link
              href="https://integra.charmbyte.dev/login"
              target="_blank"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#2B6CB0',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '4px',
              }}
            >
              Começar agora
            </Link>
          </Section>
          <Text style={{ fontSize: '12px', color: '#888', marginTop: '60px' }}>
            Você recebeu este e-mail porque se cadastrou no Integra.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeEmail
WelcomeEmail.requiredProps = ['name']
