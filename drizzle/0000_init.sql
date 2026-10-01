CREATE TYPE "public"."buddy_role" AS ENUM('local', 'exchange');--> statement-breakpoint
CREATE TYPE "public"."registration_status" AS ENUM('confirmed', 'waitlist', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."registration_type" AS ENUM('none', 'whatsapp', 'link', 'form');--> statement-breakpoint
CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "buddy_applicants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"role" "buddy_role" NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"institution" text DEFAULT '' NOT NULL,
	"country" text DEFAULT '' NOT NULL,
	"gender" text DEFAULT 'na' NOT NULL,
	"gender_preference" text DEFAULT 'any' NOT NULL,
	"languages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"capacity" integer DEFAULT 1 NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "buddy_matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"local_id" uuid NOT NULL,
	"exchange_id" uuid NOT NULL,
	"score" real DEFAULT 0 NOT NULL,
	"locked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "buddy_programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"registration_open" boolean DEFAULT false NOT NULL,
	"questions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "registration_status" DEFAULT 'confirmed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" jsonb DEFAULT '{"es":""}'::jsonb NOT NULL,
	"summary" jsonb DEFAULT '{"es":""}'::jsonb NOT NULL,
	"body" jsonb DEFAULT '{"es":""}'::jsonb NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"image_url" text,
	"exchange_only" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"show_in_home" boolean DEFAULT false NOT NULL,
	"home_order" integer DEFAULT 0 NOT NULL,
	"registration_type" "registration_type" DEFAULT 'none' NOT NULL,
	"registration_url" text,
	"registration_deadline" timestamp with time zone,
	"capacity" integer,
	"form_fields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" jsonb DEFAULT '{"es":""}'::jsonb NOT NULL,
	"answer" jsonb DEFAULT '{"es":""}'::jsonb NOT NULL,
	"category" jsonb DEFAULT '{"es":""}'::jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_type" text NOT NULL,
	"data" "bytea" NOT NULL,
	"width" integer,
	"height" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" jsonb DEFAULT '{"es":""}'::jsonb NOT NULL,
	"excerpt" jsonb DEFAULT '{"es":""}'::jsonb NOT NULL,
	"body" jsonb DEFAULT '{"es":""}'::jsonb NOT NULL,
	"category" jsonb DEFAULT '{"es":""}'::jsonb NOT NULL,
	"cover_url" text,
	"author_name" text DEFAULT 'Buddies ITBA' NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"admin_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"role" jsonb DEFAULT '{"es":""}'::jsonb NOT NULL,
	"career" jsonb DEFAULT '{"es":""}'::jsonb NOT NULL,
	"bio" jsonb DEFAULT '{"es":""}'::jsonb NOT NULL,
	"image_url" text,
	"linkedin_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "buddy_applicants" ADD CONSTRAINT "buddy_applicants_program_id_buddy_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."buddy_programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buddy_matches" ADD CONSTRAINT "buddy_matches_program_id_buddy_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."buddy_programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buddy_matches" ADD CONSTRAINT "buddy_matches_local_id_buddy_applicants_id_fk" FOREIGN KEY ("local_id") REFERENCES "public"."buddy_applicants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buddy_matches" ADD CONSTRAINT "buddy_matches_exchange_id_buddy_applicants_id_fk" FOREIGN KEY ("exchange_id") REFERENCES "public"."buddy_applicants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "buddy_applicants_program_email_idx" ON "buddy_applicants" USING btree ("program_id","email");--> statement-breakpoint
CREATE INDEX "buddy_applicants_program_role_idx" ON "buddy_applicants" USING btree ("program_id","role");--> statement-breakpoint
CREATE UNIQUE INDEX "buddy_matches_exchange_idx" ON "buddy_matches" USING btree ("exchange_id");--> statement-breakpoint
CREATE UNIQUE INDEX "event_registrations_event_email_idx" ON "event_registrations" USING btree ("event_id","email");--> statement-breakpoint
CREATE INDEX "events_starts_at_idx" ON "events" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "sessions_admin_idx" ON "sessions" USING btree ("admin_id");