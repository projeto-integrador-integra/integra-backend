import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['admin', 'mentor', 'dev'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  sub: text('sub').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  description: text('description'),
  role: userRoleEnum('role').notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
