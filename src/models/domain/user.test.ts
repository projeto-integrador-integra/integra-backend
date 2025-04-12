import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'
import { UserCreationSchema } from './user'

describe('UserCreationSchema', () => {
  it('valida um usuário válido', () => {
    const input = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'dev',
      sub: faker.string.uuid(),
    }

    const result = UserCreationSchema.safeParse(input)
    expect(result.success).toBe(true)
  })

  it('rejeita se o e-mail for inválido', () => {
    const input = {
      name: faker.person.fullName(),
      email: 'email',
      role: 'dev',
      sub: faker.string.uuid(),
    }

    const result = UserCreationSchema.safeParse(input)
    expect(result.success).toBe(false)
  })

  it('rejeita se o role não for permitido', () => {
    const input = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'gato',
      sub: faker.string.uuid(),
    }

    const result = UserCreationSchema.safeParse(input)
    expect(result.success).toBe(false)
  })
})
