import {
  Column,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Body,
  Heading,
} from '@react-email/components'

interface GroupFormedEmailProps {
  name: string
  projectName: string
  projectUrl: string
}

const GroupFormedEmail = ({
  name = 'Teste',
  projectName = 'Nome do Projeto',
  projectUrl = 'https://integra.charmbyte.dev',
}: GroupFormedEmailProps) => {
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
      <Preview>
        Olá {name}, o grupo do projeto {projectName} está completo. Visite o site para conhecer os
        demais integrantes e começar a trabalhar juntos.
      </Preview>
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
            Grupo completo, {name}!
          </Heading>

          <Text style={{ marginBottom: '20px' }}>
            O grupo do seu projeto <strong>{projectName}</strong> foi formado com sucesso. Agora
            você pode acessar o painel, conhecer os integrantes e dar início à colaboração.
          </Text>

          <Section style={{ textAlign: 'center', marginTop: '30px' }}>
            <Link
              href={projectUrl}
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
              Acessar projeto
            </Link>
          </Section>

          <Text style={{ fontSize: '12px', color: '#888', marginTop: '40px' }}>
            Caso tenha dúvidas ou precise de ajuda, estamos por aqui para apoiar você.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default GroupFormedEmail

GroupFormedEmail.requiredProps = ['name']
GroupFormedEmail.requiredProps = ['projectName']
GroupFormedEmail.requiredProps = ['projectUrl']
