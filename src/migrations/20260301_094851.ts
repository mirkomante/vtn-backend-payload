import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "media_ristorante" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "media_ristorante_id" integer;
  ALTER TABLE "menu_config_standard_items" ADD COLUMN "icona_id" integer;
  ALTER TABLE "menu_config_special_items" ADD COLUMN "icona_id" integer;
  ALTER TABLE "menu_config" ADD COLUMN "logo_id" integer;
  ALTER TABLE "menu_config" ADD COLUMN "annotazione" jsonb;
  ALTER TABLE "_menu_config_v_version_standard_items" ADD COLUMN "icona_id" integer;
  ALTER TABLE "_menu_config_v_version_special_items" ADD COLUMN "icona_id" integer;
  ALTER TABLE "_menu_config_v" ADD COLUMN "version_logo_id" integer;
  ALTER TABLE "_menu_config_v" ADD COLUMN "version_annotazione" jsonb;
  CREATE INDEX "media_ristorante_updated_at_idx" ON "media_ristorante" USING btree ("updated_at");
  CREATE INDEX "media_ristorante_created_at_idx" ON "media_ristorante" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_ristorante_filename_idx" ON "media_ristorante" USING btree ("filename");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_ristorante_fk" FOREIGN KEY ("media_ristorante_id") REFERENCES "public"."media_ristorante"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menu_config_standard_items" ADD CONSTRAINT "menu_config_standard_items_icona_id_media_ristorante_id_fk" FOREIGN KEY ("icona_id") REFERENCES "public"."media_ristorante"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "menu_config_special_items" ADD CONSTRAINT "menu_config_special_items_icona_id_media_ristorante_id_fk" FOREIGN KEY ("icona_id") REFERENCES "public"."media_ristorante"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "menu_config" ADD CONSTRAINT "menu_config_logo_id_media_ristorante_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media_ristorante"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_menu_config_v_version_standard_items" ADD CONSTRAINT "_menu_config_v_version_standard_items_icona_id_media_ristorante_id_fk" FOREIGN KEY ("icona_id") REFERENCES "public"."media_ristorante"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_menu_config_v_version_special_items" ADD CONSTRAINT "_menu_config_v_version_special_items_icona_id_media_ristorante_id_fk" FOREIGN KEY ("icona_id") REFERENCES "public"."media_ristorante"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_menu_config_v" ADD CONSTRAINT "_menu_config_v_version_logo_id_media_ristorante_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media_ristorante"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_media_ristorante_id_idx" ON "payload_locked_documents_rels" USING btree ("media_ristorante_id");
  CREATE INDEX "menu_config_standard_items_icona_idx" ON "menu_config_standard_items" USING btree ("icona_id");
  CREATE INDEX "menu_config_special_items_icona_idx" ON "menu_config_special_items" USING btree ("icona_id");
  CREATE INDEX "menu_config_logo_idx" ON "menu_config" USING btree ("logo_id");
  CREATE INDEX "_menu_config_v_version_standard_items_icona_idx" ON "_menu_config_v_version_standard_items" USING btree ("icona_id");
  CREATE INDEX "_menu_config_v_version_special_items_icona_idx" ON "_menu_config_v_version_special_items" USING btree ("icona_id");
  CREATE INDEX "_menu_config_v_version_version_logo_idx" ON "_menu_config_v" USING btree ("version_logo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media_ristorante" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "media_ristorante" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_media_ristorante_fk";
  
  ALTER TABLE "menu_config_standard_items" DROP CONSTRAINT "menu_config_standard_items_icona_id_media_ristorante_id_fk";
  
  ALTER TABLE "menu_config_special_items" DROP CONSTRAINT "menu_config_special_items_icona_id_media_ristorante_id_fk";
  
  ALTER TABLE "menu_config" DROP CONSTRAINT "menu_config_logo_id_media_ristorante_id_fk";
  
  ALTER TABLE "_menu_config_v_version_standard_items" DROP CONSTRAINT "_menu_config_v_version_standard_items_icona_id_media_ristorante_id_fk";
  
  ALTER TABLE "_menu_config_v_version_special_items" DROP CONSTRAINT "_menu_config_v_version_special_items_icona_id_media_ristorante_id_fk";
  
  ALTER TABLE "_menu_config_v" DROP CONSTRAINT "_menu_config_v_version_logo_id_media_ristorante_id_fk";
  
  DROP INDEX "payload_locked_documents_rels_media_ristorante_id_idx";
  DROP INDEX "menu_config_standard_items_icona_idx";
  DROP INDEX "menu_config_special_items_icona_idx";
  DROP INDEX "menu_config_logo_idx";
  DROP INDEX "_menu_config_v_version_standard_items_icona_idx";
  DROP INDEX "_menu_config_v_version_special_items_icona_idx";
  DROP INDEX "_menu_config_v_version_version_logo_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "media_ristorante_id";
  ALTER TABLE "menu_config_standard_items" DROP COLUMN "icona_id";
  ALTER TABLE "menu_config_special_items" DROP COLUMN "icona_id";
  ALTER TABLE "menu_config" DROP COLUMN "logo_id";
  ALTER TABLE "menu_config" DROP COLUMN "annotazione";
  ALTER TABLE "_menu_config_v_version_standard_items" DROP COLUMN "icona_id";
  ALTER TABLE "_menu_config_v_version_special_items" DROP COLUMN "icona_id";
  ALTER TABLE "_menu_config_v" DROP COLUMN "version_logo_id";
  ALTER TABLE "_menu_config_v" DROP COLUMN "version_annotazione";`)
}
