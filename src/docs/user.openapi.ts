import { registry } from '@/config/openapi'
import { UserCreationSchema } from '@/models/dto/user/create.dto'
import { ListUsersQuerySchema } from '@/models/dto/user/list.dto'
import { UserUpdateSchema } from '@/models/dto/user/update.dto'
import { UserSchema } from '@/models/dto/user/user.dto'
import { z } from 'zod'

export function registerUserDocs() {
  registry.register('User', UserSchema)
  registry.register('UserCreation', UserCreationSchema)
  registry.register('UserUpdate', UserUpdateSchema)
  registry.register('ListUsersQuery', ListUsersQuerySchema)

  registry.registerPath({
    method: 'post',
    path: '/users',
    description: 'Cria um novo usuário no sistema',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/UserUpdate',
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
              $ref: '#/components/schemas/UserCreation',
            },
          },
        },
      },
      400: { description: 'Erro de validação nos dados enviados' },
      409: { description: 'Usuário com esse e-mail já existe' },
    },
  })

  registry.registerPath({
    method: 'get',
    path: '/users/{id}',
    description: 'Buscar dados completos de um usuário',
    request: {
      params: z.object({
        id: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: 'Dados completos do usuário',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/User',
            },
          },
        },
      },
      404: {
        description: 'Usuário não encontrado',
      },
    },
  })

  registry.registerPath({
    method: 'get',
    path: '/users',
    description: 'Lista todos os usuários com filtros e paginação (apenas admin).',
    request: {
      query: ListUsersQuerySchema,
    },
    responses: {
      200: {
        description: 'Lista paginada de usuários',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                users: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/User' },
                },
                total: { type: 'number' },
                page: { type: 'number' },
                limit: { type: 'number' },
              },
            },
          },
        },
      },
      403: {
        description: 'Acesso negado para usuários não-admin',
      },
    },
  })

  registry.registerPath({
    method: 'patch',
    path: '/users/{id}',
    description: 'Atualiza dados de um usuário (admin)',
    request: {
      params: z.object({
        id: z.string().uuid(),
      }),
      body: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UserUpdate',
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Usuário atualizado com sucesso',
      },
      404: {
        description: 'Usuário não encontrado',
      },
      403: {
        description: 'Acesso negado',
      },
    },
  })

  registry.registerPath({
    method: 'get',
    path: '/users/me',
    description: 'Obtém os dados do próprio usuário autenticado.',
    responses: {
      200: {
        description: 'Dados completos do usuário autenticado',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/User',
            },
          },
        },
      },
      401: {
        description: 'Usuário não autenticado',
      },
    },
  })
}
