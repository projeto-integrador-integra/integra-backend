import { integer, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { projects } from './projects'
import { users } from './user'

export const feedbacks = pgTable(
  'feedbacks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    comment: text('comment').notNull(),
    link: text('link').default(''),
    rating: integer('rating').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (t) => [unique().on(t.id), unique('unique_user_project_feedback').on(t.userId, t.projectId)]
)

export type Feedback = typeof feedbacks.$inferSelect
