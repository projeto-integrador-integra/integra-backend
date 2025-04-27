import { registry } from '@/config/openapi'
import { FeedbackCreateSchema } from '@/models/dto/feedback/create.dto'
import { FeedbackSchema } from '@/models/dto/feedback/feedback.dto'
import { ProjectApplySchema } from '@/models/dto/project/apply.dto'
import { ProjectCreationSchema } from '@/models/dto/project/create.dto'
import { ProjectsListOwnQuerySchema } from '@/models/dto/project/list-own.dto'
import { ProjectsListQuerySchema } from '@/models/dto/project/list.dto'
import { ProjectSchema } from '@/models/dto/project/project.dto'
import { ProjectUpdateSchema } from '@/models/dto/project/update.dto'
import { z } from 'zod'

export function registerProjectDocs() {
  registry.register('Project', ProjectSchema)
  registry.register('ProjectCreation', ProjectCreationSchema)
  registry.register('ProjectUpdate', ProjectUpdateSchema)
  registry.register('ProjectApply', ProjectApplySchema)
  registry.register('FeedbackSchema', FeedbackSchema)
  registry.register('FeedbackCreateSchema', FeedbackCreateSchema)

  registry.registerPath({
    method: 'post',
    path: '/projects',
    tags: ['Project'],
    description: 'Cria um novo projeto para que devs iniciantes possam se candidatar.',
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ProjectCreation' },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Projeto criado com sucesso',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Project',
            },
          },
        },
      },
      400: { description: 'Erro de validação no corpo da requisição' },
      401: { description: 'Não autenticado' },
      403: { description: 'Apenas empresas podem criar projetos' },
    },
  })

  registry.registerPath({
    method: 'get',
    path: '/projects',
    tags: ['Project'],
    description: 'Lista projetos com filtros e paginação (para empresas, devs, mentores e admin).',
    request: {
      query: ProjectsListQuerySchema,
    },
    responses: {
      200: {
        description: 'Lista paginada de projetos',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                projects: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Project' },
                },
                page: { type: 'number' },
                limit: { type: 'number' },
                total: { type: 'number' },
              },
            },
          },
        },
      },
      401: { description: 'Não autenticado' },
    },
  })

  registry.registerPath({
    method: 'get',
    path: '/projects/{id}',
    tags: ['Project'],
    description: 'Retorna os detalhes completos de um projeto específico.',
    request: {
      params: z.object({ id: z.string().uuid() }),
    },
    responses: {
      200: {
        description: 'Projeto encontrado',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Project',
            },
          },
        },
      },
      404: {
        description: 'Projeto não encontrado',
      },
    },
  })

  registry.registerPath({
    method: 'patch',
    path: '/projects/{id}',
    tags: ['Project'],
    description:
      'Atualiza informações de um projeto existente. Acesso restrito à empresa criadora ou admin.',
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ProjectUpdate' },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Projeto atualizado com sucesso',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Project' },
          },
        },
      },
      403: { description: 'Acesso negado (não é criador nem admin)' },
      404: { description: 'Projeto não encontrado' },
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/projects/{id}/apply',
    tags: ['Project'],
    description: 'Candidata o usuário autenticado (dev ou mentor) ao projeto especificado.',
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: {
        required: false,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ProjectApply',
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Candidatura registrada com sucesso',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Project',
            },
          },
        },
      },
      400: {
        description: 'Você já se candidatou a este projeto',
      },
      403: {
        description: 'Usuário não autorizado (apenas devs ou mentores)',
      },
      404: {
        description: 'Projeto não encontrado',
      },
    },
  })

  registry.registerPath({
    method: 'get',
    path: '/projects/mine',
    tags: ['Project'],
    description:
      'Lista os projetos criados pela empresa autenticada, ou os projetos em que o usuário autenticado (dev ou mentor) está participando',
    request: {
      query: ProjectsListOwnQuerySchema,
    },
    responses: {
      200: {
        description: 'Projetos da empresa',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                projects: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Project' },
                },
                total: { type: 'number' },
                page: { type: 'number' },
                limit: { type: 'number' },
              },
            },
          },
        },
      },
      401: { description: 'Usuário não autenticado' },
      403: { description: 'Acesso permitido apenas para empresas' },
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/projects/{id}/feedback',
    tags: ['Project'],
    description: 'Permite que devs ou mentores participantes enviem feedback ao final do projeto.',
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/FeedbackCreateSchema',
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Feedback enviado com sucesso',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/FeedbackSchema',
            },
          },
        },
      },
      403: {
        description: 'Acesso negado (usuário não participou do projeto)',
      },
      404: {
        description: 'Projeto não encontrado',
      },
    },
  })

  registry.registerPath({
    method: 'get',
    path: '/projects/{id}/feedbacks',
    tags: ['Project'],
    description:
      'Retorna todos os feedbacks deixados por devs ou mentores para o projeto especificado.',
    request: {
      params: z.object({ id: z.string().uuid() }),
    },
    responses: {
      200: {
        description: 'Lista de feedbacks do projeto',
        content: {
          'application/json': {
            schema: z.object({
              feedbacks: z.array(FeedbackSchema),
            }),
          },
        },
      },
      404: {
        description: 'Projeto não encontrado ou sem feedbacks',
      },
    },
  })
}
