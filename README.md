# 🧩 Integra Backend

Back-end do projeto **Integra**, criado com Node.js, Express e Drizzle ORM

## ✨ Tecnologias

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [PostgreSQL](https://www.postgresql.org/)
- [Vitest](https://vitest.dev/)
- [AWS Lambda](https://aws.amazon.com/lambda/)
- [serverless-http](https://www.npmjs.com/package/serverless-http)
- [Resend](https://resend.com/)

## 📁 Estrutura de Pastas

```txt
src/
├── app.ts                  # Cria e configura a instância do Express
├── main.ts                 # Ponto de entrada local (dev)
├── lambda.ts               # Handler para AWS Lambda
├── config/                 # Configuração
├── controllers/            # Lida com req/res
├── services/               # Lógica de negócio
├── repositories/           # Persistência
├── models/
│   ├── domain/             # Schemas de domínio (entidades/classes)
│   └── schema/             # Schemas do drizzle
├── routes/                 # Rotas e validações
├── middleware/             # Middlewares globais
├── initDependencies.ts     # Injeção de dependências
```

## 🚀 Como rodar localmente

### 1. Instale as dependências

```
npm install
```

### 2. Configure as variáveis de ambiente

```
cp .env.example .env
```

### 3. Inicie o servidor local

```
npm run start:dev
```

### 4. Aplique o schema no banco

```
npm run db:push
```

### 5. Visualizar templates localmente

```
npm run email:dev
```
