import { MAX_PROJECTS_PER_USER } from '@/constants/user'
import { AppError } from '@/errors/AppErro'
import { Project } from '@/models/domain/project'
import { FakeProjectParticipantRepository } from '@/repositories/fake-project-participant.repository'
import { FakeProjectRepository } from '@/repositories/fake-project.repository'
import { FakeUserRepository } from '@/repositories/fake-user.repository'
import { ProjectService } from '@/services/project.service'
import { faker } from '@faker-js/faker'
import { randomUUID } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const userRepository = new FakeUserRepository()
const participantRepository = new FakeProjectParticipantRepository()
const projectRespository = new FakeProjectRepository()
const service = new ProjectService(projectRespository, participantRepository, userRepository)

const data = {
  name: 'Projeto Teste',
  creatorId: randomUUID(),
  description: 'Descrição do projeto',
  tags: ['tag1', 'tag2'],
  needsMentors: true,
  needsDevs: true,
  maxParticipants: 5,
}
const project = Project.fromObject(data)

describe('ProjectService.register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    projectRespository.clear()
  })

  it('cria projeto válido', async () => {
    const result = await service.register(project)

    expect(result.creatorId).toBe(data.creatorId)
    expect(result.name).toBe(data.name)
    expect(result.description).toBe(data.description)
    expect(result.tags).toEqual(data.tags)
    expect(result.needsMentors).toBe(data.needsMentors)
    expect(result.needsDevs).toBe(data.needsDevs)
    expect(result.maxParticipants).toBe(data.maxParticipants)
    expect(result.approvalStatus).toBe('pending')
  })

  it('lança erro se projeto já existe', async () => {
    await service.register(project)
    await expect(service.register(project)).rejects.toThrowError(AppError)
  })

  it('lança erro se usuário já tem 3 projetos', async () => {
    await Promise.all(
      Array.from({ length: MAX_PROJECTS_PER_USER }, () =>
        service.register(Project.fromObject({ ...data, name: faker.person.firstName() }))
      )
    )

    const project3 = Project.fromObject({ ...data, name: faker.person.firstName() })

    await expect(service.register(project3)).rejects.toThrowError(AppError)
  })
})
