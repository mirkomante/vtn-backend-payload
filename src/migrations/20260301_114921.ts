import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_menu_config_standard_items_active_days" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum_menu_config_special_items_active_days" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum__menu_config_v_version_standard_items_active_days" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TYPE "public"."enum__menu_config_v_version_special_items_active_days" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
  CREATE TABLE "menu_config_standard_items_active_days" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_menu_config_standard_items_active_days",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "menu_config_special_items_active_days" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_menu_config_special_items_active_days",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_menu_config_v_version_standard_items_active_days" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__menu_config_v_version_standard_items_active_days",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_menu_config_v_version_special_items_active_days" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__menu_config_v_version_special_items_active_days",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "menu_config_standard_items_active_days" ADD CONSTRAINT "menu_config_standard_items_active_days_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."menu_config_standard_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menu_config_special_items_active_days" ADD CONSTRAINT "menu_config_special_items_active_days_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."menu_config_special_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_menu_config_v_version_standard_items_active_days" ADD CONSTRAINT "_menu_config_v_version_standard_items_active_days_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_menu_config_v_version_standard_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_menu_config_v_version_special_items_active_days" ADD CONSTRAINT "_menu_config_v_version_special_items_active_days_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_menu_config_v_version_special_items"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "menu_config_standard_items_active_days_order_idx" ON "menu_config_standard_items_active_days" USING btree ("order");
  CREATE INDEX "menu_config_standard_items_active_days_parent_idx" ON "menu_config_standard_items_active_days" USING btree ("parent_id");
  CREATE INDEX "menu_config_special_items_active_days_order_idx" ON "menu_config_special_items_active_days" USING btree ("order");
  CREATE INDEX "menu_config_special_items_active_days_parent_idx" ON "menu_config_special_items_active_days" USING btree ("parent_id");
  CREATE INDEX "_menu_config_v_version_standard_items_active_days_order_idx" ON "_menu_config_v_version_standard_items_active_days" USING btree ("order");
  CREATE INDEX "_menu_config_v_version_standard_items_active_days_parent_idx" ON "_menu_config_v_version_standard_items_active_days" USING btree ("parent_id");
  CREATE INDEX "_menu_config_v_version_special_items_active_days_order_idx" ON "_menu_config_v_version_special_items_active_days" USING btree ("order");
  CREATE INDEX "_menu_config_v_version_special_items_active_days_parent_idx" ON "_menu_config_v_version_special_items_active_days" USING btree ("parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "menu_config_standard_items_active_days" CASCADE;
  DROP TABLE "menu_config_special_items_active_days" CASCADE;
  DROP TABLE "_menu_config_v_version_standard_items_active_days" CASCADE;
  DROP TABLE "_menu_config_v_version_special_items_active_days" CASCADE;
  DROP TYPE "public"."enum_menu_config_standard_items_active_days";
  DROP TYPE "public"."enum_menu_config_special_items_active_days";
  DROP TYPE "public"."enum__menu_config_v_version_standard_items_active_days";
  DROP TYPE "public"."enum__menu_config_v_version_special_items_active_days";`)
}
