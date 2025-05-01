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
import { FakeProjectParticipantRepository } from '@/repositories/fake-project-participant.repository'

const participantRepository = new FakeProjectParticipantRepository()
const userRepository = new FakeUserRepository()
const userService = new UserService(userRepository)
const projectRepository = new FakeProjectRepository()
const projectService = new ProjectService(projectRepository, participantRepository, userRepository)
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

  it('should create a project', async () => {
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

  it('should return all projects', async () => {
    const res = createMockResponse()
    const project = Project.fromObject(createFakeProjectInfo())
    await projectRepository.create(project)

    const req = { user: admin } as unknown as Request

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

  it('should return project by id', async () => {
    const res = createMockResponse()
    const project = Project.fromObject(createFakeProjectInfo())
    await projectRepository.create(project)

    const req = {
      params: { id: project.id },
      user: admin,
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

  it('should allow a user to apply to a project', async () => {
    const res = createMockResponse()
    const project = Project.fromObject(createFakeProjectInfo())
    await projectRepository.create(project)

    const req = {
      params: { id: project.id },
      user: dev,
    } as unknown as Request

    await controller.applyToProject(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: project.id,
        members: expect.arrayContaining([
          expect.objectContaining({
            id: expectUuid(),
            name: expect.any(String),
          }),
        ]),
      })
    )
  })

  it('should return projects of the logged user', async () => {
    const res = createMockResponse()
    const project = Project.fromObject(createFakeProjectInfo(), [dev])
    await projectRepository.create(project)

    const req = { user: dev } as unknown as Request

    await controller.getUserProjects(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        projects: expect.arrayContaining([
          expect.objectContaining({
            id: expectUuid(),
          }),
        ]),
      })
    )
  })

  it('should allow user to submit feedback', async () => {
    const res = createMockResponse()
    const project = Project.fromObject(createFakeProjectInfo(), [dev])
    await projectRepository.create(project)

    const req = {
      params: { id: project.id },
      user: dev,
    } as unknown as Request

    await controller.submitFeedback(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expectUuid(),
        projectId: project.id,
        user: expect.objectContaining({ id: expectUuid() }),
      })
    )
  })

  it('should return feedbacks from project', async () => {
    const res = createMockResponse()
    const project = Project.fromObject(createFakeProjectInfo(), [dev])
    await projectRepository.create(project)

    const req = {
      params: { id: project.id },
      user: dev,
    } as unknown as Request

    await controller.getProjectFeedbacks(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        feedbacks: expect.arrayContaining([
          expect.objectContaining({
            id: expectUuid(),
            user: expect.objectContaining({ id: expectUuid() }),
          }),
        ]),
      })
    )
  })
})

describe('ProjectController - Role-Based Listing', () => {
  it('should list all projects for admin', async () => {
    const res = createMockResponse()
    projectRepository.clear()
    await projectRepository.create(Project.fromObject(createFakeProjectInfo()))
    await projectRepository.create(Project.fromObject(createFakeProjectInfo()))

    const req = { user: admin, query: { page: '1', limit: '10' } } as unknown as Request

    await controller.listProjects(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ total: 2 }))
  })

  it('should list only own projects for company', async () => {
    const res = createMockResponse()
    projectRepository.clear()
    await projectRepository.create(Project.fromObject(createFakeProjectInfo()))
    await projectRepository.create(
      Project.fromObject(createFakeProjectInfo({ creatorId: company.id }))
    )

    const req = { user: company, query: { page: '1', limit: '10' } } as unknown as Request

    await controller.listProjects(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ total: 1 }))
  })

  it('should list only approved projects for dev', async () => {
    const res = createMockResponse()
    projectRepository.clear()
    await projectRepository.create(Project.fromObject(createFakeProjectInfo()))
    await projectRepository.create(
      Project.fromObject(createFakeProjectInfo({ approvalStatus: 'approved', status: 'active' }))
    )

    const req = { user: dev, query: { page: '1', limit: '10' } } as unknown as Request

    await controller.listProjects(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ total: 1 }))
  })
})
