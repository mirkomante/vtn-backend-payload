import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_ordinamento_menu_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__ordinamento_menu_v_version_piatti_order_by" AS ENUM('order', 'nome', 'prezzo', 'createdAt');
  CREATE TYPE "public"."enum__ordinamento_menu_v_version_piatti_order_direction" AS ENUM('asc', 'desc');
  CREATE TYPE "public"."enum__ordinamento_menu_v_version_piatti_group_by" AS ENUM('nessuno', 'sottocategoria');
  CREATE TYPE "public"."enum__ordinamento_menu_v_version_vini_order_by" AS ENUM('order', 'nazione', 'regione', 'zona', 'nome', 'prezzo', 'anno');
  CREATE TYPE "public"."enum__ordinamento_menu_v_version_vini_order_direction" AS ENUM('asc', 'desc');
  CREATE TYPE "public"."enum__ordinamento_menu_v_version_vini_group_by" AS ENUM('nessuno', 'nazione', 'regione', 'zona', 'vitigno');
  CREATE TYPE "public"."enum__ordinamento_menu_v_version_liquori_order_by" AS ENUM('order', 'nazione', 'nome', 'prezzo');
  CREATE TYPE "public"."enum__ordinamento_menu_v_version_liquori_order_direction" AS ENUM('asc', 'desc');
  CREATE TYPE "public"."enum__ordinamento_menu_v_version_liquori_group_by" AS ENUM('nessuno', 'nazione');
  CREATE TYPE "public"."enum__ordinamento_menu_v_version_birre_order_by" AS ENUM('order', 'nome', 'prezzo');
  CREATE TYPE "public"."enum__ordinamento_menu_v_version_birre_order_direction" AS ENUM('asc', 'desc');
  CREATE TYPE "public"."enum__ordinamento_menu_v_version_birre_group_by" AS ENUM('nessuno', 'tipologia', 'nazione');
  CREATE TYPE "public"."enum__ordinamento_menu_v_version_cocktail_order_by" AS ENUM('order', 'nome', 'prezzo');
  CREATE TYPE "public"."enum__ordinamento_menu_v_version_cocktail_order_direction" AS ENUM('asc', 'desc');
  CREATE TYPE "public"."enum__ordinamento_menu_v_version_cocktail_group_by" AS ENUM('nessuno', 'tipologia');
  CREATE TYPE "public"."enum__ordinamento_menu_v_version_bevande_order_by" AS ENUM('order', 'nome', 'prezzo');
  CREATE TYPE "public"."enum__ordinamento_menu_v_version_bevande_order_direction" AS ENUM('asc', 'desc');
  CREATE TYPE "public"."enum__ordinamento_menu_v_version_bevande_group_by" AS ENUM('nessuno', 'tipologia');
  CREATE TYPE "public"."enum__ordinamento_menu_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "_ordinamento_menu_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_note_ordinamento" varchar,
  	"version_piatti_order_by" "enum__ordinamento_menu_v_version_piatti_order_by" DEFAULT 'order',
  	"version_piatti_order_direction" "enum__ordinamento_menu_v_version_piatti_order_direction" DEFAULT 'asc',
  	"version_piatti_group_by" "enum__ordinamento_menu_v_version_piatti_group_by" DEFAULT 'nessuno',
  	"version_vini_order_by" "enum__ordinamento_menu_v_version_vini_order_by" DEFAULT 'order',
  	"version_vini_order_direction" "enum__ordinamento_menu_v_version_vini_order_direction" DEFAULT 'asc',
  	"version_vini_group_by" "enum__ordinamento_menu_v_version_vini_group_by" DEFAULT 'regione',
  	"version_liquori_order_by" "enum__ordinamento_menu_v_version_liquori_order_by" DEFAULT 'order',
  	"version_liquori_order_direction" "enum__ordinamento_menu_v_version_liquori_order_direction" DEFAULT 'asc',
  	"version_liquori_group_by" "enum__ordinamento_menu_v_version_liquori_group_by" DEFAULT 'nazione',
  	"version_birre_order_by" "enum__ordinamento_menu_v_version_birre_order_by" DEFAULT 'order',
  	"version_birre_order_direction" "enum__ordinamento_menu_v_version_birre_order_direction" DEFAULT 'asc',
  	"version_birre_group_by" "enum__ordinamento_menu_v_version_birre_group_by" DEFAULT 'nessuno',
  	"version_cocktail_order_by" "enum__ordinamento_menu_v_version_cocktail_order_by" DEFAULT 'order',
  	"version_cocktail_order_direction" "enum__ordinamento_menu_v_version_cocktail_order_direction" DEFAULT 'asc',
  	"version_cocktail_group_by" "enum__ordinamento_menu_v_version_cocktail_group_by" DEFAULT 'nessuno',
  	"version_bevande_order_by" "enum__ordinamento_menu_v_version_bevande_order_by" DEFAULT 'order',
  	"version_bevande_order_direction" "enum__ordinamento_menu_v_version_bevande_order_direction" DEFAULT 'asc',
  	"version_bevande_group_by" "enum__ordinamento_menu_v_version_bevande_group_by" DEFAULT 'nessuno',
  	"version__status" "enum__ordinamento_menu_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_ordinamento_menu_v_rels" (
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
  
  ALTER TABLE "ordinamento_menu" ADD COLUMN "_status" "enum_ordinamento_menu_status" DEFAULT 'draft';
  ALTER TABLE "_ordinamento_menu_v_rels" ADD CONSTRAINT "_ordinamento_menu_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_ordinamento_menu_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ordinamento_menu_v_rels" ADD CONSTRAINT "_ordinamento_menu_v_rels_categoria_piatti_fk" FOREIGN KEY ("categoria_piatti_id") REFERENCES "public"."categoria_piatti"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ordinamento_menu_v_rels" ADD CONSTRAINT "_ordinamento_menu_v_rels_tipologie_vino_fk" FOREIGN KEY ("tipologie_vino_id") REFERENCES "public"."tipologie_vino"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ordinamento_menu_v_rels" ADD CONSTRAINT "_ordinamento_menu_v_rels_tipologie_liquore_fk" FOREIGN KEY ("tipologie_liquore_id") REFERENCES "public"."tipologie_liquore"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ordinamento_menu_v_rels" ADD CONSTRAINT "_ordinamento_menu_v_rels_tipologie_birra_fk" FOREIGN KEY ("tipologie_birra_id") REFERENCES "public"."tipologie_birra"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ordinamento_menu_v_rels" ADD CONSTRAINT "_ordinamento_menu_v_rels_tipologie_cocktail_fk" FOREIGN KEY ("tipologie_cocktail_id") REFERENCES "public"."tipologie_cocktail"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_ordinamento_menu_v_rels" ADD CONSTRAINT "_ordinamento_menu_v_rels_tipologie_bevanda_fk" FOREIGN KEY ("tipologie_bevanda_id") REFERENCES "public"."tipologie_bevanda"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_ordinamento_menu_v_version_version__status_idx" ON "_ordinamento_menu_v" USING btree ("version__status");
  CREATE INDEX "_ordinamento_menu_v_created_at_idx" ON "_ordinamento_menu_v" USING btree ("created_at");
  CREATE INDEX "_ordinamento_menu_v_updated_at_idx" ON "_ordinamento_menu_v" USING btree ("updated_at");
  CREATE INDEX "_ordinamento_menu_v_latest_idx" ON "_ordinamento_menu_v" USING btree ("latest");
  CREATE INDEX "_ordinamento_menu_v_rels_order_idx" ON "_ordinamento_menu_v_rels" USING btree ("order");
  CREATE INDEX "_ordinamento_menu_v_rels_parent_idx" ON "_ordinamento_menu_v_rels" USING btree ("parent_id");
  CREATE INDEX "_ordinamento_menu_v_rels_path_idx" ON "_ordinamento_menu_v_rels" USING btree ("path");
  CREATE INDEX "_ordinamento_menu_v_rels_categoria_piatti_id_idx" ON "_ordinamento_menu_v_rels" USING btree ("categoria_piatti_id");
  CREATE INDEX "_ordinamento_menu_v_rels_tipologie_vino_id_idx" ON "_ordinamento_menu_v_rels" USING btree ("tipologie_vino_id");
  CREATE INDEX "_ordinamento_menu_v_rels_tipologie_liquore_id_idx" ON "_ordinamento_menu_v_rels" USING btree ("tipologie_liquore_id");
  CREATE INDEX "_ordinamento_menu_v_rels_tipologie_birra_id_idx" ON "_ordinamento_menu_v_rels" USING btree ("tipologie_birra_id");
  CREATE INDEX "_ordinamento_menu_v_rels_tipologie_cocktail_id_idx" ON "_ordinamento_menu_v_rels" USING btree ("tipologie_cocktail_id");
  CREATE INDEX "_ordinamento_menu_v_rels_tipologie_bevanda_id_idx" ON "_ordinamento_menu_v_rels" USING btree ("tipologie_bevanda_id");
  CREATE INDEX "ordinamento_menu__status_idx" ON "ordinamento_menu" USING btree ("_status");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_ordinamento_menu_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_ordinamento_menu_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_ordinamento_menu_v" CASCADE;
  DROP TABLE "_ordinamento_menu_v_rels" CASCADE;
  DROP INDEX "ordinamento_menu__status_idx";
  ALTER TABLE "ordinamento_menu" DROP COLUMN "_status";
  DROP TYPE "public"."enum_ordinamento_menu_status";
  DROP TYPE "public"."enum__ordinamento_menu_v_version_piatti_order_by";
  DROP TYPE "public"."enum__ordinamento_menu_v_version_piatti_order_direction";
  DROP TYPE "public"."enum__ordinamento_menu_v_version_piatti_group_by";
  DROP TYPE "public"."enum__ordinamento_menu_v_version_vini_order_by";
  DROP TYPE "public"."enum__ordinamento_menu_v_version_vini_order_direction";
  DROP TYPE "public"."enum__ordinamento_menu_v_version_vini_group_by";
  DROP TYPE "public"."enum__ordinamento_menu_v_version_liquori_order_by";
  DROP TYPE "public"."enum__ordinamento_menu_v_version_liquori_order_direction";
  DROP TYPE "public"."enum__ordinamento_menu_v_version_liquori_group_by";
  DROP TYPE "public"."enum__ordinamento_menu_v_version_birre_order_by";
  DROP TYPE "public"."enum__ordinamento_menu_v_version_birre_order_direction";
  DROP TYPE "public"."enum__ordinamento_menu_v_version_birre_group_by";
  DROP TYPE "public"."enum__ordinamento_menu_v_version_cocktail_order_by";
  DROP TYPE "public"."enum__ordinamento_menu_v_version_cocktail_order_direction";
  DROP TYPE "public"."enum__ordinamento_menu_v_version_cocktail_group_by";
  DROP TYPE "public"."enum__ordinamento_menu_v_version_bevande_order_by";
  DROP TYPE "public"."enum__ordinamento_menu_v_version_bevande_order_direction";
  DROP TYPE "public"."enum__ordinamento_menu_v_version_bevande_group_by";
  DROP TYPE "public"."enum__ordinamento_menu_v_version_status";`)
}
