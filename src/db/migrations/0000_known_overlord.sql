CREATE TABLE "resume_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resume_file_name" text NOT NULL,
	"resume_text" text NOT NULL,
	"job_description" text NOT NULL,
	"score" integer NOT NULL,
	"matched_skills" jsonb NOT NULL,
	"missing_skills" jsonb NOT NULL,
	"ats_feedback" jsonb NOT NULL,
	"improvement_suggestions" jsonb NOT NULL,
	"summary_suggestion" text NOT NULL,
	"recommendation" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
