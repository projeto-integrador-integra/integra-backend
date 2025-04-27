import { faker } from '@faker-js/faker'
import { randomUUID } from 'node:crypto'
import { expect } from 'vitest'

import { User } from '@/models/domain/user'

export function expectUuid() {
  return expect.stringMatching(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  )
}

export function createFakeUser(role: 'admin' | 'company' | 'dev' | 'mentor' = 'admin') {
  return User.fromObject({
    id: randomUUID(),
    email: faker.internet.email(),
    sub: randomUUID(),
    name: faker.person.fullName(),
    description: faker.lorem.sentence(),
    role,
    approvalStatus: 'approved',
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}

export function createFakeProjectInfo() {
  return {
    name: faker.lorem.words(3),
    description: faker.lorem.sentence(),
    tags: [faker.lorem.word()],
    maxParticipants: 5,
    approvalStatus: 'approved',
    creatorId: randomUUID(),
  }
}
