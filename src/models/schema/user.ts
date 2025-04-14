import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { USER_APPROVAL_STATUSES, USER_ROLES } from '../../constants/user'

export const userRoleEnum = pgEnum('user_role', USER_ROLES)
export const userApprovalStatusEnum = pgEnum('user_approval_status', USER_APPROVAL_STATUSES)

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  sub: text('sub').notNull().unique(),
  role: userRoleEnum('role').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  description: text('description'),
  approvalStatus: userApprovalStatusEnum('approval_status').default('pending').notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
