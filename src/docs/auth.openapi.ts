import { registry } from '@/config/openapi'
import { SignUpSchema } from '@/models/dto/auth/signup.dto'

export function registerAuthDocs() {
  registry.register('SignUp', SignUpSchema)

  registry.registerPath({
    method: 'post',
    path: '/signup',
    tags: ['Auth'],
    description: 'Cria um novo usuário',
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SignUp' },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Usuário criado com sucesso',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string' },
              },
            },
          },
        },
      },
      400: { description: 'Erro de validação no corpo da requisição' },
      401: { description: 'Erro ao fazer login.' },
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/login',
    tags: ['Auth'],
    description: 'Faz login com um usuário existente',
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SignUp' },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Usuário logado com sucesso',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string' },
              },
            },
          },
        },
      },
      400: { description: 'Erro de validação no corpo da requisição' },
      401: { description: 'Erro ao fazer login.' },
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/logout',
    tags: ['Auth'],
    description: 'Faz logout do usuário',
    responses: {
      201: {
        description: 'Usuário deslogado com sucesso',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string' },
              },
            },
          },
        },
      },
      400: { description: 'Erro de validação no corpo da requisição' },
      401: { description: 'Erro ao fazer login.' },
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/refresh',
    tags: ['Auth'],
    description: 'Atualiza os tokens de acesso',
    responses: {
      201: {
        description: 'Usuário deslogado com sucesso',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string' },
              },
            },
          },
        },
      },
      400: { description: 'Erro de validação no corpo da requisição' },
      401: { description: 'Erro ao fazer login.' },
    },
  })
}
