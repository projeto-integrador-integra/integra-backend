import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'
import { UserCreationSchema } from './create.dto'

describe('UserCreationSchema', () => {
  it('valida um usuário válido', () => {
    const input = {
      name: faker.person.fullName(),
      role: 'dev',
      sub: faker.string.uuid(),
      description: faker.lorem.sentence(),
    }

    const result = UserCreationSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('rejeita se o role não for permitido', () => {
    const input = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'gato',
      sub: faker.string.uuid(),
      description: faker.lorem.sentence(),
    }

    const result = UserCreationSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it('rejeita se o description for maior que 300ch', () => {
    const input = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'dev',
      sub: faker.string.uuid(),
      description: faker.lorem.sentence(500),
    }

    const result = UserCreationSchema.safeParse(input)
    expect(result.success).toBe(false)
  })
})
