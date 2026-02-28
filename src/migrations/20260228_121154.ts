import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_generali_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__generali_v_version_schedule_weekly_hours_start" AS ENUM('00:00', '00:15', '00:30', '00:45', '01:00', '01:15', '01:30', '01:45', '02:00', '02:15', '02:30', '02:45', '03:00', '03:15', '03:30', '03:45', '04:00', '04:15', '04:30', '04:45', '05:00', '05:15', '05:30', '05:45', '06:00', '06:15', '06:30', '06:45', '07:00', '07:15', '07:30', '07:45', '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45', '22:00', '22:15', '22:30', '22:45', '23:00', '23:15', '23:30', '23:45');
  CREATE TYPE "public"."enum__generali_v_version_schedule_weekly_hours_end" AS ENUM('00:00', '00:15', '00:30', '00:45', '01:00', '01:15', '01:30', '01:45', '02:00', '02:15', '02:30', '02:45', '03:00', '03:15', '03:30', '03:45', '04:00', '04:15', '04:30', '04:45', '05:00', '05:15', '05:30', '05:45', '06:00', '06:15', '06:30', '06:45', '07:00', '07:15', '07:30', '07:45', '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45', '22:00', '22:15', '22:30', '22:45', '23:00', '23:15', '23:30', '23:45');
  CREATE TYPE "public"."enum__generali_v_version_schedule_weekly_day" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum__generali_v_version_exceptions_varied_hours_start" AS ENUM('00:00', '00:15', '00:30', '00:45', '01:00', '01:15', '01:30', '01:45', '02:00', '02:15', '02:30', '02:45', '03:00', '03:15', '03:30', '03:45', '04:00', '04:15', '04:30', '04:45', '05:00', '05:15', '05:30', '05:45', '06:00', '06:15', '06:30', '06:45', '07:00', '07:15', '07:30', '07:45', '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45', '22:00', '22:15', '22:30', '22:45', '23:00', '23:15', '23:30', '23:45');
  CREATE TYPE "public"."enum__generali_v_version_exceptions_varied_hours_end" AS ENUM('00:00', '00:15', '00:30', '00:45', '01:00', '01:15', '01:30', '01:45', '02:00', '02:15', '02:30', '02:45', '03:00', '03:15', '03:30', '03:45', '04:00', '04:15', '04:30', '04:45', '05:00', '05:15', '05:30', '05:45', '06:00', '06:15', '06:30', '06:45', '07:00', '07:15', '07:30', '07:45', '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45', '22:00', '22:15', '22:30', '22:45', '23:00', '23:15', '23:30', '23:45');
  CREATE TYPE "public"."enum__generali_v_version_exceptions_type" AS ENUM('chiusura-totale', 'orario-variato');
  CREATE TYPE "public"."enum__generali_v_version_lunch_slot_start" AS ENUM('00:00', '00:15', '00:30', '00:45', '01:00', '01:15', '01:30', '01:45', '02:00', '02:15', '02:30', '02:45', '03:00', '03:15', '03:30', '03:45', '04:00', '04:15', '04:30', '04:45', '05:00', '05:15', '05:30', '05:45', '06:00', '06:15', '06:30', '06:45', '07:00', '07:15', '07:30', '07:45', '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45', '22:00', '22:15', '22:30', '22:45', '23:00', '23:15', '23:30', '23:45');
  CREATE TYPE "public"."enum__generali_v_version_lunch_slot_end" AS ENUM('00:00', '00:15', '00:30', '00:45', '01:00', '01:15', '01:30', '01:45', '02:00', '02:15', '02:30', '02:45', '03:00', '03:15', '03:30', '03:45', '04:00', '04:15', '04:30', '04:45', '05:00', '05:15', '05:30', '05:45', '06:00', '06:15', '06:30', '06:45', '07:00', '07:15', '07:30', '07:45', '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45', '22:00', '22:15', '22:30', '22:45', '23:00', '23:15', '23:30', '23:45');
  CREATE TYPE "public"."enum__generali_v_version_dinner_slot_start" AS ENUM('00:00', '00:15', '00:30', '00:45', '01:00', '01:15', '01:30', '01:45', '02:00', '02:15', '02:30', '02:45', '03:00', '03:15', '03:30', '03:45', '04:00', '04:15', '04:30', '04:45', '05:00', '05:15', '05:30', '05:45', '06:00', '06:15', '06:30', '06:45', '07:00', '07:15', '07:30', '07:45', '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45', '22:00', '22:15', '22:30', '22:45', '23:00', '23:15', '23:30', '23:45');
  CREATE TYPE "public"."enum__generali_v_version_dinner_slot_end" AS ENUM('00:00', '00:15', '00:30', '00:45', '01:00', '01:15', '01:30', '01:45', '02:00', '02:15', '02:30', '02:45', '03:00', '03:15', '03:30', '03:45', '04:00', '04:15', '04:30', '04:45', '05:00', '05:15', '05:30', '05:45', '06:00', '06:15', '06:30', '06:45', '07:00', '07:15', '07:30', '07:45', '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45', '22:00', '22:15', '22:30', '22:45', '23:00', '23:15', '23:30', '23:45');
  CREATE TYPE "public"."enum__generali_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_menu_config_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__menu_config_v_version_standard_items_source_collection" AS ENUM('piatti', 'vini', 'birre', 'liquori', 'cocktail', 'bevande', 'servizi-accessori', 'menu-fisso');
  CREATE TYPE "public"."enum__menu_config_v_version_standard_items_filter_mode" AS ENUM('all', 'include', 'exclude');
  CREATE TYPE "public"."enum__menu_config_v_version_standard_items_visibility" AS ENUM('always', 'lunch_only', 'dinner_only');
  CREATE TYPE "public"."enum__menu_config_v_version_special_items_source_collection" AS ENUM('piatti', 'vini', 'birre', 'liquori', 'cocktail', 'bevande', 'servizi-accessori', 'menu-fisso');
  CREATE TYPE "public"."enum__menu_config_v_version_special_items_filter_mode" AS ENUM('all', 'include', 'exclude');
  CREATE TYPE "public"."enum__menu_config_v_version_special_items_visibility" AS ENUM('always', 'lunch_only', 'dinner_only');
  CREATE TYPE "public"."enum__menu_config_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "_generali_v_version_schedule_weekly_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"start" "enum__generali_v_version_schedule_weekly_hours_start",
  	"end" "enum__generali_v_version_schedule_weekly_hours_end",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_generali_v_version_schedule_weekly" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"day" "enum__generali_v_version_schedule_weekly_day",
  	"is_open" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_generali_v_version_exceptions_varied_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"start" "enum__generali_v_version_exceptions_varied_hours_start",
  	"end" "enum__generali_v_version_exceptions_varied_hours_end",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_generali_v_version_exceptions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone,
  	"type" "enum__generali_v_version_exceptions_type" DEFAULT 'chiusura-totale',
  	"reason" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_generali_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_lunch_slot_start" "enum__generali_v_version_lunch_slot_start",
  	"version_lunch_slot_end" "enum__generali_v_version_lunch_slot_end",
  	"version_dinner_slot_start" "enum__generali_v_version_dinner_slot_start",
  	"version_dinner_slot_end" "enum__generali_v_version_dinner_slot_end",
  	"version__status" "enum__generali_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_menu_config_v_version_standard_items_source_collection" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__menu_config_v_version_standard_items_source_collection",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_menu_config_v_version_standard_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"filter_mode" "enum__menu_config_v_version_standard_items_filter_mode" DEFAULT 'all',
  	"visibility" "enum__menu_config_v_version_standard_items_visibility" DEFAULT 'always',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_menu_config_v_version_special_items_source_collection" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__menu_config_v_version_special_items_source_collection",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_menu_config_v_version_special_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"filter_mode" "enum__menu_config_v_version_special_items_filter_mode" DEFAULT 'all',
  	"visibility" "enum__menu_config_v_version_special_items_visibility" DEFAULT 'always',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_menu_config_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_is_active" boolean DEFAULT false,
  	"version_active_range_start" timestamp(3) with time zone,
  	"version_active_range_end" timestamp(3) with time zone,
  	"version__status" "enum__menu_config_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_menu_config_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categoria_piatti_id" integer,
  	"tipologie_vino_id" integer,
  	"tipologie_birra_id" integer,
  	"tipologie_liquore_id" integer,
  	"tipologie_cocktail_id" integer,
  	"tipologie_bevanda_id" integer,
  	"categoria_menu_fisso_id" integer
  );
  
  ALTER TABLE "generali_schedule_weekly" ALTER COLUMN "day" DROP NOT NULL;
  ALTER TABLE "generali_exceptions" ALTER COLUMN "date" DROP NOT NULL;
  ALTER TABLE "generali_exceptions" ALTER COLUMN "type" DROP NOT NULL;
  ALTER TABLE "generali" ALTER COLUMN "lunch_slot_start" DROP NOT NULL;
  ALTER TABLE "generali" ALTER COLUMN "lunch_slot_end" DROP NOT NULL;
  ALTER TABLE "generali" ALTER COLUMN "dinner_slot_start" DROP NOT NULL;
  ALTER TABLE "generali" ALTER COLUMN "dinner_slot_end" DROP NOT NULL;
  ALTER TABLE "menu_config_standard_items" ALTER COLUMN "label" DROP NOT NULL;
  ALTER TABLE "menu_config_standard_items" ALTER COLUMN "visibility" DROP NOT NULL;
  ALTER TABLE "generali" ADD COLUMN "_status" "enum_generali_status" DEFAULT 'draft';
  ALTER TABLE "menu_config" ADD COLUMN "_status" "enum_menu_config_status" DEFAULT 'draft';
  ALTER TABLE "_generali_v_version_schedule_weekly_hours" ADD CONSTRAINT "_generali_v_version_schedule_weekly_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_generali_v_version_schedule_weekly"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_generali_v_version_schedule_weekly" ADD CONSTRAINT "_generali_v_version_schedule_weekly_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_generali_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_generali_v_version_exceptions_varied_hours" ADD CONSTRAINT "_generali_v_version_exceptions_varied_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_generali_v_version_exceptions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_generali_v_version_exceptions" ADD CONSTRAINT "_generali_v_version_exceptions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_generali_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_menu_config_v_version_standard_items_source_collection" ADD CONSTRAINT "_menu_config_v_version_standard_items_source_collection_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_menu_config_v_version_standard_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_menu_config_v_version_standard_items" ADD CONSTRAINT "_menu_config_v_version_standard_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_menu_config_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_menu_config_v_version_special_items_source_collection" ADD CONSTRAINT "_menu_config_v_version_special_items_source_collection_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_menu_config_v_version_special_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_menu_config_v_version_special_items" ADD CONSTRAINT "_menu_config_v_version_special_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_menu_config_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_menu_config_v_rels" ADD CONSTRAINT "_menu_config_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_menu_config_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_menu_config_v_rels" ADD CONSTRAINT "_menu_config_v_rels_categoria_piatti_fk" FOREIGN KEY ("categoria_piatti_id") REFERENCES "public"."categoria_piatti"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_menu_config_v_rels" ADD CONSTRAINT "_menu_config_v_rels_tipologie_vino_fk" FOREIGN KEY ("tipologie_vino_id") REFERENCES "public"."tipologie_vino"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_menu_config_v_rels" ADD CONSTRAINT "_menu_config_v_rels_tipologie_birra_fk" FOREIGN KEY ("tipologie_birra_id") REFERENCES "public"."tipologie_birra"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_menu_config_v_rels" ADD CONSTRAINT "_menu_config_v_rels_tipologie_liquore_fk" FOREIGN KEY ("tipologie_liquore_id") REFERENCES "public"."tipologie_liquore"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_menu_config_v_rels" ADD CONSTRAINT "_menu_config_v_rels_tipologie_cocktail_fk" FOREIGN KEY ("tipologie_cocktail_id") REFERENCES "public"."tipologie_cocktail"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_menu_config_v_rels" ADD CONSTRAINT "_menu_config_v_rels_tipologie_bevanda_fk" FOREIGN KEY ("tipologie_bevanda_id") REFERENCES "public"."tipologie_bevanda"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_menu_config_v_rels" ADD CONSTRAINT "_menu_config_v_rels_categoria_menu_fisso_fk" FOREIGN KEY ("categoria_menu_fisso_id") REFERENCES "public"."categoria_menu_fisso"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_generali_v_version_schedule_weekly_hours_order_idx" ON "_generali_v_version_schedule_weekly_hours" USING btree ("_order");
  CREATE INDEX "_generali_v_version_schedule_weekly_hours_parent_id_idx" ON "_generali_v_version_schedule_weekly_hours" USING btree ("_parent_id");
  CREATE INDEX "_generali_v_version_schedule_weekly_order_idx" ON "_generali_v_version_schedule_weekly" USING btree ("_order");
  CREATE INDEX "_generali_v_version_schedule_weekly_parent_id_idx" ON "_generali_v_version_schedule_weekly" USING btree ("_parent_id");
  CREATE INDEX "_generali_v_version_exceptions_varied_hours_order_idx" ON "_generali_v_version_exceptions_varied_hours" USING btree ("_order");
  CREATE INDEX "_generali_v_version_exceptions_varied_hours_parent_id_idx" ON "_generali_v_version_exceptions_varied_hours" USING btree ("_parent_id");
  CREATE INDEX "_generali_v_version_exceptions_order_idx" ON "_generali_v_version_exceptions" USING btree ("_order");
  CREATE INDEX "_generali_v_version_exceptions_parent_id_idx" ON "_generali_v_version_exceptions" USING btree ("_parent_id");
  CREATE INDEX "_generali_v_version_version__status_idx" ON "_generali_v" USING btree ("version__status");
  CREATE INDEX "_generali_v_created_at_idx" ON "_generali_v" USING btree ("created_at");
  CREATE INDEX "_generali_v_updated_at_idx" ON "_generali_v" USING btree ("updated_at");
  CREATE INDEX "_generali_v_latest_idx" ON "_generali_v" USING btree ("latest");
  CREATE INDEX "_menu_config_v_version_standard_items_source_collection_order_idx" ON "_menu_config_v_version_standard_items_source_collection" USING btree ("order");
  CREATE INDEX "_menu_config_v_version_standard_items_source_collection_parent_idx" ON "_menu_config_v_version_standard_items_source_collection" USING btree ("parent_id");
  CREATE INDEX "_menu_config_v_version_standard_items_order_idx" ON "_menu_config_v_version_standard_items" USING btree ("_order");
  CREATE INDEX "_menu_config_v_version_standard_items_parent_id_idx" ON "_menu_config_v_version_standard_items" USING btree ("_parent_id");
  CREATE INDEX "_menu_config_v_version_special_items_source_collection_order_idx" ON "_menu_config_v_version_special_items_source_collection" USING btree ("order");
  CREATE INDEX "_menu_config_v_version_special_items_source_collection_parent_idx" ON "_menu_config_v_version_special_items_source_collection" USING btree ("parent_id");
  CREATE INDEX "_menu_config_v_version_special_items_order_idx" ON "_menu_config_v_version_special_items" USING btree ("_order");
  CREATE INDEX "_menu_config_v_version_special_items_parent_id_idx" ON "_menu_config_v_version_special_items" USING btree ("_parent_id");
  CREATE INDEX "_menu_config_v_version_version__status_idx" ON "_menu_config_v" USING btree ("version__status");
  CREATE INDEX "_menu_config_v_created_at_idx" ON "_menu_config_v" USING btree ("created_at");
  CREATE INDEX "_menu_config_v_updated_at_idx" ON "_menu_config_v" USING btree ("updated_at");
  CREATE INDEX "_menu_config_v_latest_idx" ON "_menu_config_v" USING btree ("latest");
  CREATE INDEX "_menu_config_v_rels_order_idx" ON "_menu_config_v_rels" USING btree ("order");
  CREATE INDEX "_menu_config_v_rels_parent_idx" ON "_menu_config_v_rels" USING btree ("parent_id");
  CREATE INDEX "_menu_config_v_rels_path_idx" ON "_menu_config_v_rels" USING btree ("path");
  CREATE INDEX "_menu_config_v_rels_categoria_piatti_id_idx" ON "_menu_config_v_rels" USING btree ("categoria_piatti_id");
  CREATE INDEX "_menu_config_v_rels_tipologie_vino_id_idx" ON "_menu_config_v_rels" USING btree ("tipologie_vino_id");
  CREATE INDEX "_menu_config_v_rels_tipologie_birra_id_idx" ON "_menu_config_v_rels" USING btree ("tipologie_birra_id");
  CREATE INDEX "_menu_config_v_rels_tipologie_liquore_id_idx" ON "_menu_config_v_rels" USING btree ("tipologie_liquore_id");
  CREATE INDEX "_menu_config_v_rels_tipologie_cocktail_id_idx" ON "_menu_config_v_rels" USING btree ("tipologie_cocktail_id");
  CREATE INDEX "_menu_config_v_rels_tipologie_bevanda_id_idx" ON "_menu_config_v_rels" USING btree ("tipologie_bevanda_id");
  CREATE INDEX "_menu_config_v_rels_categoria_menu_fisso_id_idx" ON "_menu_config_v_rels" USING btree ("categoria_menu_fisso_id");
  CREATE INDEX "generali__status_idx" ON "generali" USING btree ("_status");
  CREATE INDEX "menu_config__status_idx" ON "menu_config" USING btree ("_status");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_generali_v_version_schedule_weekly_hours" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_generali_v_version_schedule_weekly" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_generali_v_version_exceptions_varied_hours" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_generali_v_version_exceptions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_generali_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_menu_config_v_version_standard_items_source_collection" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_menu_config_v_version_standard_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_menu_config_v_version_special_items_source_collection" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_menu_config_v_version_special_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_menu_config_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_menu_config_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_generali_v_version_schedule_weekly_hours" CASCADE;
  DROP TABLE "_generali_v_version_schedule_weekly" CASCADE;
  DROP TABLE "_generali_v_version_exceptions_varied_hours" CASCADE;
  DROP TABLE "_generali_v_version_exceptions" CASCADE;
  DROP TABLE "_generali_v" CASCADE;
  DROP TABLE "_menu_config_v_version_standard_items_source_collection" CASCADE;
  DROP TABLE "_menu_config_v_version_standard_items" CASCADE;
  DROP TABLE "_menu_config_v_version_special_items_source_collection" CASCADE;
  DROP TABLE "_menu_config_v_version_special_items" CASCADE;
  DROP TABLE "_menu_config_v" CASCADE;
  DROP TABLE "_menu_config_v_rels" CASCADE;
  DROP INDEX "generali__status_idx";
  DROP INDEX "menu_config__status_idx";
  ALTER TABLE "generali_schedule_weekly" ALTER COLUMN "day" SET NOT NULL;
  ALTER TABLE "generali_exceptions" ALTER COLUMN "date" SET NOT NULL;
  ALTER TABLE "generali_exceptions" ALTER COLUMN "type" SET NOT NULL;
  ALTER TABLE "generali" ALTER COLUMN "lunch_slot_start" SET NOT NULL;
  ALTER TABLE "generali" ALTER COLUMN "lunch_slot_end" SET NOT NULL;
  ALTER TABLE "generali" ALTER COLUMN "dinner_slot_start" SET NOT NULL;
  ALTER TABLE "generali" ALTER COLUMN "dinner_slot_end" SET NOT NULL;
  ALTER TABLE "menu_config_standard_items" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "menu_config_standard_items" ALTER COLUMN "visibility" SET NOT NULL;
  ALTER TABLE "generali" DROP COLUMN "_status";
  ALTER TABLE "menu_config" DROP COLUMN "_status";
  DROP TYPE "public"."enum_generali_status";
  DROP TYPE "public"."enum__generali_v_version_schedule_weekly_hours_start";
  DROP TYPE "public"."enum__generali_v_version_schedule_weekly_hours_end";
  DROP TYPE "public"."enum__generali_v_version_schedule_weekly_day";
  DROP TYPE "public"."enum__generali_v_version_exceptions_varied_hours_start";
  DROP TYPE "public"."enum__generali_v_version_exceptions_varied_hours_end";
  DROP TYPE "public"."enum__generali_v_version_exceptions_type";
  DROP TYPE "public"."enum__generali_v_version_lunch_slot_start";
  DROP TYPE "public"."enum__generali_v_version_lunch_slot_end";
  DROP TYPE "public"."enum__generali_v_version_dinner_slot_start";
  DROP TYPE "public"."enum__generali_v_version_dinner_slot_end";
  DROP TYPE "public"."enum__generali_v_version_status";
  DROP TYPE "public"."enum_menu_config_status";
  DROP TYPE "public"."enum__menu_config_v_version_standard_items_source_collection";
  DROP TYPE "public"."enum__menu_config_v_version_standard_items_filter_mode";
  DROP TYPE "public"."enum__menu_config_v_version_standard_items_visibility";
  DROP TYPE "public"."enum__menu_config_v_version_special_items_source_collection";
  DROP TYPE "public"."enum__menu_config_v_version_special_items_filter_mode";
  DROP TYPE "public"."enum__menu_config_v_version_special_items_visibility";
  DROP TYPE "public"."enum__menu_config_v_version_status";`)
}
