import { Request } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Project } from '@/models/domain/project'
import { FakeProjectRepository } from '@/repositories/fake-project.repository'
import { FakeUserRepository } from '@/repositories/fake-user.repository'
import { ProjectService } from '@/services/project.service'
import { UserService } from '@/services/user.service'
import { createFakeProjectInfo, createFakeUser, expectUuid } from '@/testes/helper'
import { createMockResponse } from '@/testes/response'
import { makeProjectController } from './project.controller'

const projectRepository = new FakeProjectRepository()
const projectService = new ProjectService(projectRepository)
const userRepository = new FakeUserRepository()
const userService = new UserService(userRepository)
const controller = makeProjectController(projectService, userService)

const admin = createFakeUser('admin')
const company = createFakeUser('company')
const dev = createFakeUser('dev')
const mentor = createFakeUser('mentor')

userRepository.create(admin)
userRepository.create(company)
userRepository.create(dev)
userRepository.create(mentor)

describe('ProjectController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    projectRepository.clear()
  })

  it('should create a project (POST /projects)', async () => {
    const res = createMockResponse()
    const projectData = createFakeProjectInfo()

    const req = {
      user: { email: admin.email, sub: admin.sub },
      body: { ...projectData, status: 'active' },
    } as unknown as Request

    await controller.createProject(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expectUuid(),
        name: projectData.name,
        description: projectData.description,
        creatorId: expectUuid(),
        tags: projectData.tags,
        needsMentors: true,
        needsDevs: true,
        maxParticipants: projectData.maxParticipants,
        status: 'active',
        approvalStatus: 'pending',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        members: [],
      })
    )
  })

  it('should list projects (GET /projects)', async () => {
    const res = createMockResponse()
    const project = Project.fromObject(createFakeProjectInfo())
    await projectRepository.create(project)

    const req = { user: { email: admin.email, sub: admin.sub } } as unknown as Request

    await controller.listProjects(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        projects: expect.arrayContaining([
          expect.objectContaining({
            id: expectUuid(),
            name: expect.any(String),
            description: expect.any(String),
            creatorId: expectUuid(),
            tags: expect.arrayContaining([expect.any(String)]),
            maxParticipants: expect.any(Number),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          }),
        ]),
        page: expect.any(Number),
        limit: expect.any(Number),
        total: expect.any(Number),
      })
    )
  })

  it('should get project by id (GET /projects/:id)', async () => {
    const res = createMockResponse()
    const project = Project.fromObject(createFakeProjectInfo())
    await projectRepository.create(project)

    const req = {
      params: { id: project.id },
      user: { email: admin.email, sub: admin.sub },
    } as unknown as Request

    await controller.getProjectById(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expectUuid(),
        name: expect.any(String),
        description: expect.any(String),
        creatorId: expectUuid(),
        tags: expect.arrayContaining([expect.any(String)]),
        maxParticipants: expect.any(Number),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    )
  })

  it('should apply to project (POST /projects/:id/apply)', async () => {
    const res = createMockResponse()
    const project = Project.fromObject(createFakeProjectInfo())
    await projectRepository.create(project)

    const req = {
      params: { id: project.id },
      user: { email: dev.email, sub: dev.sub },
    } as unknown as Request

    await controller.applyToProject(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: project.id,
        name: expect.any(String),
        description: expect.any(String),
        creatorId: expectUuid(),
        tags: expect.arrayContaining([expect.any(String)]),
        maxParticipants: expect.any(Number),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        members: expect.arrayContaining([
          expect.objectContaining({
            id: expectUuid(),
            name: expect.any(String),
            sub: expectUuid(),
            role: expect.any(String),
            description: expect.any(String),
            email: expect.any(String),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            approvalStatus: expect.any(String),
          }),
        ]),
      })
    )
  })

  it('should list user projects (GET /projects/mine)', async () => {
    const res = createMockResponse()
    const project = Project.fromObject(createFakeProjectInfo(), [dev])
    await projectRepository.create(project)

    const req = {
      user: { email: dev.email, sub: dev.sub },
    } as unknown as Request

    await controller.getUserProjects(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        projects: expect.arrayContaining([
          expect.objectContaining({
            id: expectUuid(),
            name: expect.any(String),
            description: expect.any(String),
            creatorId: expectUuid(),
            tags: expect.arrayContaining([expect.any(String)]),
            maxParticipants: expect.any(Number),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            members: expect.arrayContaining([
              expect.objectContaining({
                id: expectUuid(),
                name: expect.any(String),
                sub: expectUuid(),
                role: expect.any(String),
                description: expect.any(String),
                email: expect.any(String),
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
                approvalStatus: expect.any(String),
              }),
            ]),
          }),
        ]),
      })
    )
  })

  it('should submit feedback (POST /projects/:id/feedback)', async () => {
    const res = createMockResponse()
    const project = Project.fromObject(createFakeProjectInfo(), [dev])
    await projectRepository.create(project)

    const req = {
      params: { id: project.id },
      user: { email: dev.email, sub: dev.sub },
    } as unknown as Request

    await controller.submitFeedback(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expectUuid(),
        projectId: project.id,
        user: expect.objectContaining({
          id: expectUuid(),
          name: expect.any(String),
        }),
        comment: expect.any(String),
        rating: expect.any(Number),
      })
    )
  })

  it('should get project feedbacks (GET /projects/:id/feedbacks)', async () => {
    const res = createMockResponse()
    const project = Project.fromObject(createFakeProjectInfo(), [dev])
    await projectRepository.create(project)

    const req = {
      params: { id: project.id },
      user: { email: dev.email, sub: dev.sub },
    } as unknown as Request

    await controller.getProjectFeedbacks(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        feedbacks: expect.arrayContaining([
          expect.objectContaining({
            id: expectUuid(),
            user: expect.objectContaining({
              id: expectUuid(),
              name: expect.any(String),
            }),
          }),
        ]),
      })
    )
  })
})
