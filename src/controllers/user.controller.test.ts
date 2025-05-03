import { FakeDatabase, FakeUserRepository } from '@/repositories/fake-user.repository'
import { FakeEmailService } from '@/services/email/fake-email.service'
import { UserService } from '@/services/user.service'
import { makeUserController } from './user.controller'

import { createFakeUser, expectUuid } from '@/testes/helper'
import { createMockResponse } from '@/testes/response'
import { Request } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockDB = new FakeDatabase()
const userRepository = new FakeUserRepository(mockDB)
const userService = new UserService(userRepository)
const fakeEmailService = new FakeEmailService()
const controller = makeUserController(userService, fakeEmailService)

describe('UserController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    userRepository.clean()
  })

  it('should create user (POST /users)', async () => {
    const res = createMockResponse()
    const fakeUser = createFakeUser('admin')

    const req = {
      user: { email: fakeUser.email, sub: fakeUser.sub },
      body: { name: fakeUser.name, role: fakeUser.role, description: fakeUser.description },
    } as Request

    await controller.createUser(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expectUuid(),
        name: fakeUser.name,
        role: fakeUser.role,
        email: fakeUser.email,
        description: fakeUser.description,
        approvalStatus: 'pending',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
    )
  })

  it('should list users (GET /users)', async () => {
    const res = createMockResponse()
    const fakeUser = createFakeUser('admin')
    await userRepository.create(fakeUser)

    const req = {
      user: { email: fakeUser.email, sub: fakeUser.sub },
    } as Request

    await controller.listUsers(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        users: expect.arrayContaining([
          expect.objectContaining({
            id: expectUuid(),
            name: fakeUser.name,
          }),
        ]),
      })
    )
  })

  it('should get user by id (GET /users/:id)', async () => {
    const res = createMockResponse()
    const fakeUser = createFakeUser('admin')
    await userRepository.create(fakeUser)

    const req = {
      params: { id: fakeUser.id },
      user: { email: fakeUser.email, sub: fakeUser.sub },
    } as unknown as Request

    await controller.getUserById(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expectUuid(),
        name: fakeUser.name,
      })
    )
  })

  it('should update user (PATCH /users/:id)', async () => {
    const res = createMockResponse()
    const fakeUser = createFakeUser('admin')
    await userRepository.create(fakeUser)

    const req = {
      params: { id: fakeUser.id },
      user: { email: fakeUser.email, sub: fakeUser.sub },
      body: {
        name: 'updated name',
        role: fakeUser.role,
        description: fakeUser.description,
        approvalStatus: 'approved',
      },
    } as unknown as Request

    await controller.updateUserById(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expectUuid(),
        name: 'updated name',
      })
    )
  })

  it('should get current user (GET /users/me)', async () => {
    const res = createMockResponse()
    const fakeUser = createFakeUser('admin')
    await userRepository.create(fakeUser)

    const req = {
      user: { email: fakeUser.email, sub: fakeUser.sub },
    } as unknown as Request

    await controller.getCurrentUser(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expectUuid(),
        name: fakeUser.name,
      })
    )
  })
})
