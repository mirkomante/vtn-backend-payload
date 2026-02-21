import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "menu_config_standard_items" ALTER COLUMN "filter_mode" DROP NOT NULL;
  ALTER TABLE "menu_config_rels" ADD COLUMN "tipologie_vino_id" integer;
  ALTER TABLE "menu_config_rels" ADD COLUMN "tipologie_birra_id" integer;
  ALTER TABLE "menu_config_rels" ADD COLUMN "tipologie_liquore_id" integer;
  ALTER TABLE "menu_config_rels" ADD COLUMN "tipologie_cocktail_id" integer;
  ALTER TABLE "menu_config_rels" ADD COLUMN "tipologie_bevanda_id" integer;
  ALTER TABLE "menu_config_rels" ADD COLUMN "categoria_menu_fisso_id" integer;
  ALTER TABLE "menu_config_rels" ADD CONSTRAINT "menu_config_rels_tipologie_vino_fk" FOREIGN KEY ("tipologie_vino_id") REFERENCES "public"."tipologie_vino"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menu_config_rels" ADD CONSTRAINT "menu_config_rels_tipologie_birra_fk" FOREIGN KEY ("tipologie_birra_id") REFERENCES "public"."tipologie_birra"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menu_config_rels" ADD CONSTRAINT "menu_config_rels_tipologie_liquore_fk" FOREIGN KEY ("tipologie_liquore_id") REFERENCES "public"."tipologie_liquore"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menu_config_rels" ADD CONSTRAINT "menu_config_rels_tipologie_cocktail_fk" FOREIGN KEY ("tipologie_cocktail_id") REFERENCES "public"."tipologie_cocktail"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menu_config_rels" ADD CONSTRAINT "menu_config_rels_tipologie_bevanda_fk" FOREIGN KEY ("tipologie_bevanda_id") REFERENCES "public"."tipologie_bevanda"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menu_config_rels" ADD CONSTRAINT "menu_config_rels_categoria_menu_fisso_fk" FOREIGN KEY ("categoria_menu_fisso_id") REFERENCES "public"."categoria_menu_fisso"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "menu_config_rels_tipologie_vino_id_idx" ON "menu_config_rels" USING btree ("tipologie_vino_id");
  CREATE INDEX "menu_config_rels_tipologie_birra_id_idx" ON "menu_config_rels" USING btree ("tipologie_birra_id");
  CREATE INDEX "menu_config_rels_tipologie_liquore_id_idx" ON "menu_config_rels" USING btree ("tipologie_liquore_id");
  CREATE INDEX "menu_config_rels_tipologie_cocktail_id_idx" ON "menu_config_rels" USING btree ("tipologie_cocktail_id");
  CREATE INDEX "menu_config_rels_tipologie_bevanda_id_idx" ON "menu_config_rels" USING btree ("tipologie_bevanda_id");
  CREATE INDEX "menu_config_rels_categoria_menu_fisso_id_idx" ON "menu_config_rels" USING btree ("categoria_menu_fisso_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "menu_config_rels" DROP CONSTRAINT "menu_config_rels_tipologie_vino_fk";
  
  ALTER TABLE "menu_config_rels" DROP CONSTRAINT "menu_config_rels_tipologie_birra_fk";
  
  ALTER TABLE "menu_config_rels" DROP CONSTRAINT "menu_config_rels_tipologie_liquore_fk";
  
  ALTER TABLE "menu_config_rels" DROP CONSTRAINT "menu_config_rels_tipologie_cocktail_fk";
  
  ALTER TABLE "menu_config_rels" DROP CONSTRAINT "menu_config_rels_tipologie_bevanda_fk";
  
  ALTER TABLE "menu_config_rels" DROP CONSTRAINT "menu_config_rels_categoria_menu_fisso_fk";
  
  DROP INDEX "menu_config_rels_tipologie_vino_id_idx";
  DROP INDEX "menu_config_rels_tipologie_birra_id_idx";
  DROP INDEX "menu_config_rels_tipologie_liquore_id_idx";
  DROP INDEX "menu_config_rels_tipologie_cocktail_id_idx";
  DROP INDEX "menu_config_rels_tipologie_bevanda_id_idx";
  DROP INDEX "menu_config_rels_categoria_menu_fisso_id_idx";
  ALTER TABLE "menu_config_standard_items" ALTER COLUMN "filter_mode" SET NOT NULL;
  ALTER TABLE "menu_config_rels" DROP COLUMN "tipologie_vino_id";
  ALTER TABLE "menu_config_rels" DROP COLUMN "tipologie_birra_id";
  ALTER TABLE "menu_config_rels" DROP COLUMN "tipologie_liquore_id";
  ALTER TABLE "menu_config_rels" DROP COLUMN "tipologie_cocktail_id";
  ALTER TABLE "menu_config_rels" DROP COLUMN "tipologie_bevanda_id";
  ALTER TABLE "menu_config_rels" DROP COLUMN "categoria_menu_fisso_id";`)
}
