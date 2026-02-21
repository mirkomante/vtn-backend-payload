import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_menu_config_standard_items_source_collection" ADD VALUE 'birre';
  ALTER TYPE "public"."enum_menu_config_standard_items_source_collection" ADD VALUE 'liquori';
  ALTER TYPE "public"."enum_menu_config_standard_items_source_collection" ADD VALUE 'cocktail';
  ALTER TYPE "public"."enum_menu_config_standard_items_source_collection" ADD VALUE 'bevande';
  ALTER TYPE "public"."enum_menu_config_standard_items_source_collection" ADD VALUE 'servizi-accessori';
  ALTER TYPE "public"."enum_menu_config_standard_items_source_collection" ADD VALUE 'menu-fisso';
  ALTER TYPE "public"."enum_menu_config_special_items_source_collection" ADD VALUE 'birre';
  ALTER TYPE "public"."enum_menu_config_special_items_source_collection" ADD VALUE 'liquori';
  ALTER TYPE "public"."enum_menu_config_special_items_source_collection" ADD VALUE 'cocktail';
  ALTER TYPE "public"."enum_menu_config_special_items_source_collection" ADD VALUE 'bevande';
  ALTER TYPE "public"."enum_menu_config_special_items_source_collection" ADD VALUE 'servizi-accessori';
  ALTER TYPE "public"."enum_menu_config_special_items_source_collection" ADD VALUE 'menu-fisso';
  CREATE TABLE "menu_config_standard_items_source_collection" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_menu_config_standard_items_source_collection",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "menu_config_special_items_source_collection" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_menu_config_special_items_source_collection",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "menu_config_standard_items_source_collection" ADD CONSTRAINT "menu_config_standard_items_source_collection_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."menu_config_standard_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menu_config_special_items_source_collection" ADD CONSTRAINT "menu_config_special_items_source_collection_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."menu_config_special_items"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "menu_config_standard_items_source_collection_order_idx" ON "menu_config_standard_items_source_collection" USING btree ("order");
  CREATE INDEX "menu_config_standard_items_source_collection_parent_idx" ON "menu_config_standard_items_source_collection" USING btree ("parent_id");
  CREATE INDEX "menu_config_special_items_source_collection_order_idx" ON "menu_config_special_items_source_collection" USING btree ("order");
  CREATE INDEX "menu_config_special_items_source_collection_parent_idx" ON "menu_config_special_items_source_collection" USING btree ("parent_id");
  ALTER TABLE "menu_config_standard_items" DROP COLUMN "source_collection";
  ALTER TABLE "menu_config_special_items" DROP COLUMN "source_collection";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "menu_config_standard_items_source_collection" CASCADE;
  DROP TABLE "menu_config_special_items_source_collection" CASCADE;
  ALTER TABLE "menu_config_standard_items" ALTER COLUMN "source_collection" SET DATA TYPE text;
  DROP TYPE "public"."enum_menu_config_standard_items_source_collection";
  CREATE TYPE "public"."enum_menu_config_standard_items_source_collection" AS ENUM('piatti', 'vini');
  ALTER TABLE "menu_config_standard_items" ALTER COLUMN "source_collection" SET DATA TYPE "public"."enum_menu_config_standard_items_source_collection" USING "source_collection"::"public"."enum_menu_config_standard_items_source_collection";
  ALTER TABLE "menu_config_special_items" ALTER COLUMN "source_collection" SET DATA TYPE text;
  DROP TYPE "public"."enum_menu_config_special_items_source_collection";
  CREATE TYPE "public"."enum_menu_config_special_items_source_collection" AS ENUM('piatti', 'vini');
  ALTER TABLE "menu_config_special_items" ALTER COLUMN "source_collection" SET DATA TYPE "public"."enum_menu_config_special_items_source_collection" USING "source_collection"::"public"."enum_menu_config_special_items_source_collection";
  ALTER TABLE "menu_config_standard_items" ADD COLUMN "source_collection" "enum_menu_config_standard_items_source_collection" NOT NULL;
  ALTER TABLE "menu_config_special_items" ADD COLUMN "source_collection" "enum_menu_config_special_items_source_collection";`)
}
