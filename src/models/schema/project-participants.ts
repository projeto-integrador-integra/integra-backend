import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core'
import { users } from './user'
import { projects } from './projects'

export const projectParticipants = pgTable('project_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id),
  joinedAt: timestamp('joined_at').defaultNow(),
})

export interface ProjectParticipant {
  id: string
  userId: string
  projectId: string
  joinedAt: Date | null
}
