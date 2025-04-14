import { faker } from '@faker-js/faker'
import { NewUser } from '@/models/schema/user'

export function fakeUser(): NewUser {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: 'admin',
    description: faker.lorem.sentence(),
    sub: faker.string.uuid(),
  }
}
