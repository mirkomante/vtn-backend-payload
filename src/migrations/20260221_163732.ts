import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_generali_schedule_weekly_hours_start" AS ENUM('00:00', '00:15', '00:30', '00:45', '01:00', '01:15', '01:30', '01:45', '02:00', '02:15', '02:30', '02:45', '03:00', '03:15', '03:30', '03:45', '04:00', '04:15', '04:30', '04:45', '05:00', '05:15', '05:30', '05:45', '06:00', '06:15', '06:30', '06:45', '07:00', '07:15', '07:30', '07:45', '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45', '22:00', '22:15', '22:30', '22:45', '23:00', '23:15', '23:30', '23:45');
  CREATE TYPE "public"."enum_generali_schedule_weekly_hours_end" AS ENUM('00:00', '00:15', '00:30', '00:45', '01:00', '01:15', '01:30', '01:45', '02:00', '02:15', '02:30', '02:45', '03:00', '03:15', '03:30', '03:45', '04:00', '04:15', '04:30', '04:45', '05:00', '05:15', '05:30', '05:45', '06:00', '06:15', '06:30', '06:45', '07:00', '07:15', '07:30', '07:45', '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45', '22:00', '22:15', '22:30', '22:45', '23:00', '23:15', '23:30', '23:45');
  CREATE TYPE "public"."enum_generali_exceptions_varied_hours_start" AS ENUM('00:00', '00:15', '00:30', '00:45', '01:00', '01:15', '01:30', '01:45', '02:00', '02:15', '02:30', '02:45', '03:00', '03:15', '03:30', '03:45', '04:00', '04:15', '04:30', '04:45', '05:00', '05:15', '05:30', '05:45', '06:00', '06:15', '06:30', '06:45', '07:00', '07:15', '07:30', '07:45', '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45', '22:00', '22:15', '22:30', '22:45', '23:00', '23:15', '23:30', '23:45');
  CREATE TYPE "public"."enum_generali_exceptions_varied_hours_end" AS ENUM('00:00', '00:15', '00:30', '00:45', '01:00', '01:15', '01:30', '01:45', '02:00', '02:15', '02:30', '02:45', '03:00', '03:15', '03:30', '03:45', '04:00', '04:15', '04:30', '04:45', '05:00', '05:15', '05:30', '05:45', '06:00', '06:15', '06:30', '06:45', '07:00', '07:15', '07:30', '07:45', '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45', '22:00', '22:15', '22:30', '22:45', '23:00', '23:15', '23:30', '23:45');
  CREATE TYPE "public"."enum_generali_lunch_slot_start" AS ENUM('00:00', '00:15', '00:30', '00:45', '01:00', '01:15', '01:30', '01:45', '02:00', '02:15', '02:30', '02:45', '03:00', '03:15', '03:30', '03:45', '04:00', '04:15', '04:30', '04:45', '05:00', '05:15', '05:30', '05:45', '06:00', '06:15', '06:30', '06:45', '07:00', '07:15', '07:30', '07:45', '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45', '22:00', '22:15', '22:30', '22:45', '23:00', '23:15', '23:30', '23:45');
  CREATE TYPE "public"."enum_generali_lunch_slot_end" AS ENUM('00:00', '00:15', '00:30', '00:45', '01:00', '01:15', '01:30', '01:45', '02:00', '02:15', '02:30', '02:45', '03:00', '03:15', '03:30', '03:45', '04:00', '04:15', '04:30', '04:45', '05:00', '05:15', '05:30', '05:45', '06:00', '06:15', '06:30', '06:45', '07:00', '07:15', '07:30', '07:45', '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45', '22:00', '22:15', '22:30', '22:45', '23:00', '23:15', '23:30', '23:45');
  CREATE TYPE "public"."enum_generali_dinner_slot_start" AS ENUM('00:00', '00:15', '00:30', '00:45', '01:00', '01:15', '01:30', '01:45', '02:00', '02:15', '02:30', '02:45', '03:00', '03:15', '03:30', '03:45', '04:00', '04:15', '04:30', '04:45', '05:00', '05:15', '05:30', '05:45', '06:00', '06:15', '06:30', '06:45', '07:00', '07:15', '07:30', '07:45', '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45', '22:00', '22:15', '22:30', '22:45', '23:00', '23:15', '23:30', '23:45');
  CREATE TYPE "public"."enum_generali_dinner_slot_end" AS ENUM('00:00', '00:15', '00:30', '00:45', '01:00', '01:15', '01:30', '01:45', '02:00', '02:15', '02:30', '02:45', '03:00', '03:15', '03:30', '03:45', '04:00', '04:15', '04:30', '04:45', '05:00', '05:15', '05:30', '05:45', '06:00', '06:15', '06:30', '06:45', '07:00', '07:15', '07:30', '07:45', '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45', '22:00', '22:15', '22:30', '22:45', '23:00', '23:15', '23:30', '23:45');
  CREATE TYPE "public"."enum_menu_config_standard_items_source_collection" AS ENUM('piatti', 'vini', 'birre', 'liquori', 'cocktail', 'bevande', 'servizi-accessori', 'menu-fisso');
  CREATE TYPE "public"."enum_menu_config_standard_items_filter_mode" AS ENUM('all', 'include', 'exclude');
  CREATE TYPE "public"."enum_menu_config_standard_items_visibility" AS ENUM('always', 'lunch_only', 'dinner_only');
  CREATE TYPE "public"."enum_menu_config_special_items_source_collection" AS ENUM('piatti', 'vini', 'birre', 'liquori', 'cocktail', 'bevande', 'servizi-accessori', 'menu-fisso');
  CREATE TYPE "public"."enum_menu_config_special_items_filter_mode" AS ENUM('all', 'include', 'exclude');
  CREATE TYPE "public"."enum_menu_config_special_items_visibility" AS ENUM('always', 'lunch_only', 'dinner_only');
  CREATE TABLE "menu_config_standard_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"source_collection" "enum_menu_config_standard_items_source_collection" NOT NULL,
  	"filter_mode" "enum_menu_config_standard_items_filter_mode" DEFAULT 'all' NOT NULL,
  	"visibility" "enum_menu_config_standard_items_visibility" DEFAULT 'always' NOT NULL
  );
  
  CREATE TABLE "menu_config_special_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"source_collection" "enum_menu_config_special_items_source_collection",
  	"filter_mode" "enum_menu_config_special_items_filter_mode" DEFAULT 'all',
  	"visibility" "enum_menu_config_special_items_visibility" DEFAULT 'always'
  );
  
  CREATE TABLE "menu_config" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"is_active" boolean DEFAULT false,
  	"active_range_start" timestamp(3) with time zone,
  	"active_range_end" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "menu_config_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categoria_piatti_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_generali_fk";
  
  DROP INDEX IF EXISTS "generali_updated_at_idx";
  DROP INDEX IF EXISTS "generali_created_at_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_generali_id_idx";
  ALTER TABLE "generali_schedule_weekly_hours" ALTER COLUMN "start" SET DATA TYPE "public"."enum_generali_schedule_weekly_hours_start" USING "start"::"public"."enum_generali_schedule_weekly_hours_start";
  ALTER TABLE "generali_schedule_weekly_hours" ALTER COLUMN "end" SET DATA TYPE "public"."enum_generali_schedule_weekly_hours_end" USING "end"::"public"."enum_generali_schedule_weekly_hours_end";
  ALTER TABLE "generali_exceptions_varied_hours" ALTER COLUMN "start" SET DATA TYPE "public"."enum_generali_exceptions_varied_hours_start" USING "start"::"public"."enum_generali_exceptions_varied_hours_start";
  ALTER TABLE "generali_exceptions_varied_hours" ALTER COLUMN "end" SET DATA TYPE "public"."enum_generali_exceptions_varied_hours_end" USING "end"::"public"."enum_generali_exceptions_varied_hours_end";
  ALTER TABLE "generali" ALTER COLUMN "lunch_slot_start" SET DATA TYPE "public"."enum_generali_lunch_slot_start" USING "lunch_slot_start"::"public"."enum_generali_lunch_slot_start";
  ALTER TABLE "generali" ALTER COLUMN "lunch_slot_start" DROP DEFAULT;
  ALTER TABLE "generali" ALTER COLUMN "lunch_slot_end" SET DATA TYPE "public"."enum_generali_lunch_slot_end" USING "lunch_slot_end"::"public"."enum_generali_lunch_slot_end";
  ALTER TABLE "generali" ALTER COLUMN "lunch_slot_end" DROP DEFAULT;
  ALTER TABLE "generali" ALTER COLUMN "dinner_slot_start" SET DATA TYPE "public"."enum_generali_dinner_slot_start" USING "dinner_slot_start"::"public"."enum_generali_dinner_slot_start";
  ALTER TABLE "generali" ALTER COLUMN "dinner_slot_start" DROP DEFAULT;
  ALTER TABLE "generali" ALTER COLUMN "dinner_slot_end" SET DATA TYPE "public"."enum_generali_dinner_slot_end" USING "dinner_slot_end"::"public"."enum_generali_dinner_slot_end";
  ALTER TABLE "generali" ALTER COLUMN "dinner_slot_end" DROP DEFAULT;
  ALTER TABLE "generali" ALTER COLUMN "updated_at" DROP DEFAULT;
  ALTER TABLE "generali" ALTER COLUMN "updated_at" DROP NOT NULL;
  ALTER TABLE "generali" ALTER COLUMN "created_at" DROP DEFAULT;
  ALTER TABLE "generali" ALTER COLUMN "created_at" DROP NOT NULL;
  ALTER TABLE "menu_config_standard_items" ADD CONSTRAINT "menu_config_standard_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."menu_config"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menu_config_special_items" ADD CONSTRAINT "menu_config_special_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."menu_config"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menu_config_rels" ADD CONSTRAINT "menu_config_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."menu_config"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menu_config_rels" ADD CONSTRAINT "menu_config_rels_categoria_piatti_fk" FOREIGN KEY ("categoria_piatti_id") REFERENCES "public"."categoria_piatti"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "menu_config_standard_items_order_idx" ON "menu_config_standard_items" USING btree ("_order");
  CREATE INDEX "menu_config_standard_items_parent_id_idx" ON "menu_config_standard_items" USING btree ("_parent_id");
  CREATE INDEX "menu_config_special_items_order_idx" ON "menu_config_special_items" USING btree ("_order");
  CREATE INDEX "menu_config_special_items_parent_id_idx" ON "menu_config_special_items" USING btree ("_parent_id");
  CREATE INDEX "menu_config_rels_order_idx" ON "menu_config_rels" USING btree ("order");
  CREATE INDEX "menu_config_rels_parent_idx" ON "menu_config_rels" USING btree ("parent_id");
  CREATE INDEX "menu_config_rels_path_idx" ON "menu_config_rels" USING btree ("path");
  CREATE INDEX "menu_config_rels_categoria_piatti_id_idx" ON "menu_config_rels" USING btree ("categoria_piatti_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "generali_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "menu_config_standard_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "menu_config_special_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "menu_config" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "menu_config_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "menu_config_standard_items" CASCADE;
  DROP TABLE "menu_config_special_items" CASCADE;
  DROP TABLE "menu_config" CASCADE;
  DROP TABLE "menu_config_rels" CASCADE;
  ALTER TABLE "generali_schedule_weekly_hours" ALTER COLUMN "start" SET DATA TYPE varchar;
  ALTER TABLE "generali_schedule_weekly_hours" ALTER COLUMN "end" SET DATA TYPE varchar;
  ALTER TABLE "generali_exceptions_varied_hours" ALTER COLUMN "start" SET DATA TYPE varchar;
  ALTER TABLE "generali_exceptions_varied_hours" ALTER COLUMN "end" SET DATA TYPE varchar;
  ALTER TABLE "generali" ALTER COLUMN "lunch_slot_start" SET DATA TYPE varchar;
  ALTER TABLE "generali" ALTER COLUMN "lunch_slot_start" SET DEFAULT '12:00';
  ALTER TABLE "generali" ALTER COLUMN "lunch_slot_end" SET DATA TYPE varchar;
  ALTER TABLE "generali" ALTER COLUMN "lunch_slot_end" SET DEFAULT '15:00';
  ALTER TABLE "generali" ALTER COLUMN "dinner_slot_start" SET DATA TYPE varchar;
  ALTER TABLE "generali" ALTER COLUMN "dinner_slot_start" SET DEFAULT '19:00';
  ALTER TABLE "generali" ALTER COLUMN "dinner_slot_end" SET DATA TYPE varchar;
  ALTER TABLE "generali" ALTER COLUMN "dinner_slot_end" SET DEFAULT '23:00';
  ALTER TABLE "generali" ALTER COLUMN "updated_at" SET DEFAULT now();
  ALTER TABLE "generali" ALTER COLUMN "updated_at" SET NOT NULL;
  ALTER TABLE "generali" ALTER COLUMN "created_at" SET DEFAULT now();
  ALTER TABLE "generali" ALTER COLUMN "created_at" SET NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "generali_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_generali_fk" FOREIGN KEY ("generali_id") REFERENCES "public"."generali"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_generali_id_idx" ON "payload_locked_documents_rels" USING btree ("generali_id");
  CREATE INDEX "generali_updated_at_idx" ON "generali" USING btree ("updated_at");
  CREATE INDEX "generali_created_at_idx" ON "generali" USING btree ("created_at");
  DROP TYPE "public"."enum_generali_schedule_weekly_hours_start";
  DROP TYPE "public"."enum_generali_schedule_weekly_hours_end";
  DROP TYPE "public"."enum_generali_exceptions_varied_hours_start";
  DROP TYPE "public"."enum_generali_exceptions_varied_hours_end";
  DROP TYPE "public"."enum_generali_lunch_slot_start";
  DROP TYPE "public"."enum_generali_lunch_slot_end";
  DROP TYPE "public"."enum_generali_dinner_slot_start";
  DROP TYPE "public"."enum_generali_dinner_slot_end";
  DROP TYPE "public"."enum_menu_config_standard_items_source_collection";
  DROP TYPE "public"."enum_menu_config_standard_items_filter_mode";
  DROP TYPE "public"."enum_menu_config_standard_items_visibility";
  DROP TYPE "public"."enum_menu_config_special_items_source_collection";
  DROP TYPE "public"."enum_menu_config_special_items_filter_mode";
  DROP TYPE "public"."enum_menu_config_special_items_visibility";`)
}
