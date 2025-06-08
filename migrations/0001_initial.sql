-- Initial migration for CyberDefense Simulator
-- Create all tables with proper indexes and constraints

-- Sessions table for authentication
CREATE TABLE IF NOT EXISTS "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" ("expire");

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar UNIQUE NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"password_hash" varchar,
	"profile_image_url" varchar,
	"xp" integer DEFAULT 0 NOT NULL,
	"streak" integer DEFAULT 0 NOT NULL,
	"last_activity" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Refresh tokens table for JWT authentication
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"token" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "IDX_refresh_tokens_user_id" ON "refresh_tokens" ("user_id");
CREATE INDEX IF NOT EXISTS "IDX_refresh_tokens_token" ON "refresh_tokens" ("token");

-- Domains table
CREATE TABLE IF NOT EXISTS "domains" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"exam_percentage" integer NOT NULL,
	"color" text NOT NULL,
	"icon" text NOT NULL
);

-- Scenarios table
CREATE TABLE IF NOT EXISTS "scenarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"domain_id" integer NOT NULL,
	"difficulty" text NOT NULL,
	"estimated_time" integer NOT NULL,
	"xp_reward" integer NOT NULL,
	"content" jsonb NOT NULL
);

-- User progress table
CREATE TABLE IF NOT EXISTS "user_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"domain_id" integer NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"questions_completed" integer DEFAULT 0 NOT NULL,
	"questions_correct" integer DEFAULT 0 NOT NULL,
	"time_spent" integer DEFAULT 0 NOT NULL,
	UNIQUE("user_id", "domain_id")
);

-- User scenarios table
CREATE TABLE IF NOT EXISTS "user_scenarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"scenario_id" integer NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"score" integer,
	"attempts" integer DEFAULT 0 NOT NULL,
	"time_spent" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp,
	UNIQUE("user_id", "scenario_id")
);

-- Achievements table
CREATE TABLE IF NOT EXISTS "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"xp_reward" integer NOT NULL,
	"criteria" jsonb NOT NULL
);

-- User achievements table
CREATE TABLE IF NOT EXISTS "user_achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"achievement_id" integer NOT NULL,
	"earned_at" timestamp DEFAULT now() NOT NULL,
	UNIQUE("user_id", "achievement_id")
);

-- Add foreign key constraints
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "domains"("id") ON DELETE CASCADE;
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "domains"("id") ON DELETE CASCADE;
ALTER TABLE "user_scenarios" ADD CONSTRAINT "user_scenarios_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "user_scenarios" ADD CONSTRAINT "user_scenarios_scenario_id_scenarios_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "scenarios"("id") ON DELETE CASCADE;
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "IDX_user_progress_user_id" ON "user_progress" ("user_id");
CREATE INDEX IF NOT EXISTS "IDX_user_progress_domain_id" ON "user_progress" ("domain_id");
CREATE INDEX IF NOT EXISTS "IDX_user_scenarios_user_id" ON "user_scenarios" ("user_id");
CREATE INDEX IF NOT EXISTS "IDX_user_scenarios_scenario_id" ON "user_scenarios" ("scenario_id");
CREATE INDEX IF NOT EXISTS "IDX_user_achievements_user_id" ON "user_achievements" ("user_id");
CREATE INDEX IF NOT EXISTS "IDX_user_achievements_achievement_id" ON "user_achievements" ("achievement_id");
CREATE INDEX IF NOT EXISTS "IDX_users_email" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "IDX_users_last_activity" ON "users" ("last_activity");
CREATE INDEX IF NOT EXISTS "IDX_scenarios_domain_id" ON "scenarios" ("domain_id");
CREATE INDEX IF NOT EXISTS "IDX_scenarios_difficulty" ON "scenarios" ("difficulty");
CREATE INDEX IF NOT EXISTS "IDX_scenarios_type" ON "scenarios" ("type");
