import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_ordinamento_menu_piatti_order_by" AS ENUM('order', 'nome', 'prezzo', 'createdAt');
  CREATE TYPE "public"."enum_ordinamento_menu_piatti_order_direction" AS ENUM('asc', 'desc');
  CREATE TYPE "public"."enum_ordinamento_menu_piatti_group_by" AS ENUM('nessuno', 'sottocategoria');
  CREATE TYPE "public"."enum_ordinamento_menu_vini_order_by" AS ENUM('order', 'nazione', 'regione', 'zona', 'nome', 'prezzo', 'anno');
  CREATE TYPE "public"."enum_ordinamento_menu_vini_order_direction" AS ENUM('asc', 'desc');
  CREATE TYPE "public"."enum_ordinamento_menu_vini_group_by" AS ENUM('nessuno', 'nazione', 'regione', 'zona', 'vitigno');
  CREATE TYPE "public"."enum_ordinamento_menu_liquori_order_by" AS ENUM('order', 'nazione', 'nome', 'prezzo');
  CREATE TYPE "public"."enum_ordinamento_menu_liquori_order_direction" AS ENUM('asc', 'desc');
  CREATE TYPE "public"."enum_ordinamento_menu_liquori_group_by" AS ENUM('nessuno', 'nazione');
  CREATE TYPE "public"."enum_ordinamento_menu_birre_order_by" AS ENUM('order', 'nome', 'prezzo');
  CREATE TYPE "public"."enum_ordinamento_menu_birre_order_direction" AS ENUM('asc', 'desc');
  CREATE TYPE "public"."enum_ordinamento_menu_birre_group_by" AS ENUM('nessuno', 'tipologia', 'nazione');
  CREATE TYPE "public"."enum_ordinamento_menu_cocktail_order_by" AS ENUM('order', 'nome', 'prezzo');
  CREATE TYPE "public"."enum_ordinamento_menu_cocktail_order_direction" AS ENUM('asc', 'desc');
  CREATE TYPE "public"."enum_ordinamento_menu_cocktail_group_by" AS ENUM('nessuno', 'tipologia');
  CREATE TYPE "public"."enum_ordinamento_menu_bevande_order_by" AS ENUM('order', 'nome', 'prezzo');
  CREATE TYPE "public"."enum_ordinamento_menu_bevande_order_direction" AS ENUM('asc', 'desc');
  CREATE TYPE "public"."enum_ordinamento_menu_bevande_group_by" AS ENUM('nessuno', 'tipologia');
  CREATE TABLE "ordinamento_menu" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"piatti_order_by" "enum_ordinamento_menu_piatti_order_by" DEFAULT 'order',
  	"piatti_order_direction" "enum_ordinamento_menu_piatti_order_direction" DEFAULT 'asc',
  	"piatti_group_by" "enum_ordinamento_menu_piatti_group_by" DEFAULT 'nessuno',
  	"vini_order_by" "enum_ordinamento_menu_vini_order_by" DEFAULT 'order',
  	"vini_order_direction" "enum_ordinamento_menu_vini_order_direction" DEFAULT 'asc',
  	"vini_group_by" "enum_ordinamento_menu_vini_group_by" DEFAULT 'regione',
  	"liquori_order_by" "enum_ordinamento_menu_liquori_order_by" DEFAULT 'order',
  	"liquori_order_direction" "enum_ordinamento_menu_liquori_order_direction" DEFAULT 'asc',
  	"liquori_group_by" "enum_ordinamento_menu_liquori_group_by" DEFAULT 'nazione',
  	"birre_order_by" "enum_ordinamento_menu_birre_order_by" DEFAULT 'order',
  	"birre_order_direction" "enum_ordinamento_menu_birre_order_direction" DEFAULT 'asc',
  	"birre_group_by" "enum_ordinamento_menu_birre_group_by" DEFAULT 'nessuno',
  	"cocktail_order_by" "enum_ordinamento_menu_cocktail_order_by" DEFAULT 'order',
  	"cocktail_order_direction" "enum_ordinamento_menu_cocktail_order_direction" DEFAULT 'asc',
  	"cocktail_group_by" "enum_ordinamento_menu_cocktail_group_by" DEFAULT 'nessuno',
  	"bevande_order_by" "enum_ordinamento_menu_bevande_order_by" DEFAULT 'order',
  	"bevande_order_direction" "enum_ordinamento_menu_bevande_order_direction" DEFAULT 'asc',
  	"bevande_group_by" "enum_ordinamento_menu_bevande_group_by" DEFAULT 'nessuno',
  	"note_ordinamento" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "ordinamento_menu_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categoria_piatti_id" integer,
  	"tipologie_vino_id" integer,
  	"tipologie_liquore_id" integer,
  	"tipologie_birra_id" integer,
  	"tipologie_cocktail_id" integer,
  	"tipologie_bevanda_id" integer
  );
  
  ALTER TABLE "ordinamento_menu_rels" ADD CONSTRAINT "ordinamento_menu_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."ordinamento_menu"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ordinamento_menu_rels" ADD CONSTRAINT "ordinamento_menu_rels_categoria_piatti_fk" FOREIGN KEY ("categoria_piatti_id") REFERENCES "public"."categoria_piatti"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ordinamento_menu_rels" ADD CONSTRAINT "ordinamento_menu_rels_tipologie_vino_fk" FOREIGN KEY ("tipologie_vino_id") REFERENCES "public"."tipologie_vino"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ordinamento_menu_rels" ADD CONSTRAINT "ordinamento_menu_rels_tipologie_liquore_fk" FOREIGN KEY ("tipologie_liquore_id") REFERENCES "public"."tipologie_liquore"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ordinamento_menu_rels" ADD CONSTRAINT "ordinamento_menu_rels_tipologie_birra_fk" FOREIGN KEY ("tipologie_birra_id") REFERENCES "public"."tipologie_birra"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ordinamento_menu_rels" ADD CONSTRAINT "ordinamento_menu_rels_tipologie_cocktail_fk" FOREIGN KEY ("tipologie_cocktail_id") REFERENCES "public"."tipologie_cocktail"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ordinamento_menu_rels" ADD CONSTRAINT "ordinamento_menu_rels_tipologie_bevanda_fk" FOREIGN KEY ("tipologie_bevanda_id") REFERENCES "public"."tipologie_bevanda"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "ordinamento_menu_rels_order_idx" ON "ordinamento_menu_rels" USING btree ("order");
  CREATE INDEX "ordinamento_menu_rels_parent_idx" ON "ordinamento_menu_rels" USING btree ("parent_id");
  CREATE INDEX "ordinamento_menu_rels_path_idx" ON "ordinamento_menu_rels" USING btree ("path");
  CREATE INDEX "ordinamento_menu_rels_categoria_piatti_id_idx" ON "ordinamento_menu_rels" USING btree ("categoria_piatti_id");
  CREATE INDEX "ordinamento_menu_rels_tipologie_vino_id_idx" ON "ordinamento_menu_rels" USING btree ("tipologie_vino_id");
  CREATE INDEX "ordinamento_menu_rels_tipologie_liquore_id_idx" ON "ordinamento_menu_rels" USING btree ("tipologie_liquore_id");
  CREATE INDEX "ordinamento_menu_rels_tipologie_birra_id_idx" ON "ordinamento_menu_rels" USING btree ("tipologie_birra_id");
  CREATE INDEX "ordinamento_menu_rels_tipologie_cocktail_id_idx" ON "ordinamento_menu_rels" USING btree ("tipologie_cocktail_id");
  CREATE INDEX "ordinamento_menu_rels_tipologie_bevanda_id_idx" ON "ordinamento_menu_rels" USING btree ("tipologie_bevanda_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "ordinamento_menu" CASCADE;
  DROP TABLE "ordinamento_menu_rels" CASCADE;
  DROP TYPE "public"."enum_ordinamento_menu_piatti_order_by";
  DROP TYPE "public"."enum_ordinamento_menu_piatti_order_direction";
  DROP TYPE "public"."enum_ordinamento_menu_piatti_group_by";
  DROP TYPE "public"."enum_ordinamento_menu_vini_order_by";
  DROP TYPE "public"."enum_ordinamento_menu_vini_order_direction";
  DROP TYPE "public"."enum_ordinamento_menu_vini_group_by";
  DROP TYPE "public"."enum_ordinamento_menu_liquori_order_by";
  DROP TYPE "public"."enum_ordinamento_menu_liquori_order_direction";
  DROP TYPE "public"."enum_ordinamento_menu_liquori_group_by";
  DROP TYPE "public"."enum_ordinamento_menu_birre_order_by";
  DROP TYPE "public"."enum_ordinamento_menu_birre_order_direction";
  DROP TYPE "public"."enum_ordinamento_menu_birre_group_by";
  DROP TYPE "public"."enum_ordinamento_menu_cocktail_order_by";
  DROP TYPE "public"."enum_ordinamento_menu_cocktail_order_direction";
  DROP TYPE "public"."enum_ordinamento_menu_cocktail_group_by";
  DROP TYPE "public"."enum_ordinamento_menu_bevande_order_by";
  DROP TYPE "public"."enum_ordinamento_menu_bevande_order_direction";
  DROP TYPE "public"."enum_ordinamento_menu_bevande_group_by";`)
}
