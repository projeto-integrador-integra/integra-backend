import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { projects } from './projects'
import { users } from './user'

export const projectParticipants = pgTable('project_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id),
  message: text('message').default(''),
  joinedAt: timestamp('joined_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
})

export interface ProjectParticipant {
  id: string
  userId: string
  projectId: string
  message: string | null
  joinedAt: Date | null
  deletedAt?: Date | null
}
