import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { PROJECT_APPROVAL_STATUSES, PROJECT_STATUS } from '@/constants/project'
import { users } from './user'

export const projectStatusEnum = pgEnum('project_status', PROJECT_STATUS)
export const projectApprovalStatusEnum = pgEnum(
  'project_approval_status',
  PROJECT_APPROVAL_STATUSES
)

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  creatorId: uuid('creator_id')
    .notNull()
    .references(() => users.id),
  tags: text('tags').array().default([]),
  needsMentors: boolean('needs_mentors').default(true),
  needsDevs: boolean('needs_devs').default(true),
  maxParticipants: integer('max_participants').notNull(),
  status: projectStatusEnum('project_status').default('active'),
  approvalStatus: projectApprovalStatusEnum('approval_status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
