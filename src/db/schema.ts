import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const resumeAnalyses = pgTable('resume_analyses', {
  id: uuid('id').defaultRandom().primaryKey(),

  resumeFileName: text('resume_file_name').notNull(),
  resumeText: text('resume_text').notNull(),
  jobDescription: text('job_description').notNull(),

  score: integer('score').notNull(),

  matchedSkills: jsonb('matched_skills').$type<string[]>().notNull(),
  missingSkills: jsonb('missing_skills').$type<string[]>().notNull(),
  atsFeedback: jsonb('ats_feedback').$type<string[]>().notNull(),
  improvementSuggestions: jsonb('improvement_suggestions')
    .$type<string[]>()
    .notNull(),

  summarySuggestion: text('summary_suggestion').notNull(),
  recommendation: text('recommendation').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type ResumeAnalysis = typeof resumeAnalyses.$inferSelect;
export type NewResumeAnalysis = typeof resumeAnalyses.$inferInsert;
