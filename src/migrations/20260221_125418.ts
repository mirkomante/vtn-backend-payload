import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_generali_schedule_weekly_day" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum_generali_exceptions_type" AS ENUM('chiusura-totale', 'orario-variato');
  CREATE TABLE "generali_schedule_weekly_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"start" varchar,
  	"end" varchar
  );
  
  CREATE TABLE "generali_schedule_weekly" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" "enum_generali_schedule_weekly_day" NOT NULL,
  	"is_open" boolean DEFAULT true
  );
  
  CREATE TABLE "generali_exceptions_varied_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"start" varchar,
  	"end" varchar
  );
  
  CREATE TABLE "generali_exceptions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"type" "enum_generali_exceptions_type" DEFAULT 'chiusura-totale' NOT NULL,
  	"reason" varchar
  );
  
  CREATE TABLE "generali" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"lunch_slot_start" varchar DEFAULT '12:00' NOT NULL,
  	"lunch_slot_end" varchar DEFAULT '15:00' NOT NULL,
  	"dinner_slot_start" varchar DEFAULT '19:00' NOT NULL,
  	"dinner_slot_end" varchar DEFAULT '23:00' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "generali_schedule_weekly_hours" ADD CONSTRAINT "generali_schedule_weekly_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."generali_schedule_weekly"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "generali_schedule_weekly" ADD CONSTRAINT "generali_schedule_weekly_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."generali"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "generali_exceptions_varied_hours" ADD CONSTRAINT "generali_exceptions_varied_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."generali_exceptions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "generali_exceptions" ADD CONSTRAINT "generali_exceptions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."generali"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "generali_schedule_weekly_hours_order_idx" ON "generali_schedule_weekly_hours" USING btree ("_order");
  CREATE INDEX "generali_schedule_weekly_hours_parent_id_idx" ON "generali_schedule_weekly_hours" USING btree ("_parent_id");
  CREATE INDEX "generali_schedule_weekly_order_idx" ON "generali_schedule_weekly" USING btree ("_order");
  CREATE INDEX "generali_schedule_weekly_parent_id_idx" ON "generali_schedule_weekly" USING btree ("_parent_id");
  CREATE INDEX "generali_exceptions_varied_hours_order_idx" ON "generali_exceptions_varied_hours" USING btree ("_order");
  CREATE INDEX "generali_exceptions_varied_hours_parent_id_idx" ON "generali_exceptions_varied_hours" USING btree ("_parent_id");
  CREATE INDEX "generali_exceptions_order_idx" ON "generali_exceptions" USING btree ("_order");
  CREATE INDEX "generali_exceptions_parent_id_idx" ON "generali_exceptions" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "generali_schedule_weekly_hours" CASCADE;
  DROP TABLE "generali_schedule_weekly" CASCADE;
  DROP TABLE "generali_exceptions_varied_hours" CASCADE;
  DROP TABLE "generali_exceptions" CASCADE;
  DROP TABLE "generali" CASCADE;
  DROP TYPE "public"."enum_generali_schedule_weekly_day";
  DROP TYPE "public"."enum_generali_exceptions_type";`)
}
