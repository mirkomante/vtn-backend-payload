import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // ADD VALUE IF NOT EXISTS — in produzione i valori già esistono nell'ENUM
  // creato dalla migrazione 163732, quindi li saltiamo silenziosamente.
  for (const typeName of [
    'enum_menu_config_standard_items_source_collection',
    'enum_menu_config_special_items_source_collection',
  ]) {
    for (const value of ['birre', 'liquori', 'cocktail', 'bevande', 'servizi-accessori', 'menu-fisso']) {
      await db.execute(sql.raw(`ALTER TYPE "public"."${typeName}" ADD VALUE IF NOT EXISTS '${value}'`))
    }
  }

  // Crea tabelle pivot per hasMany (IF NOT EXISTS)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "menu_config_standard_items_source_collection" (
      "order" integer NOT NULL,
      "parent_id" varchar NOT NULL,
      "value" "enum_menu_config_standard_items_source_collection",
      "id" serial PRIMARY KEY NOT NULL
    )
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "menu_config_special_items_source_collection" (
      "order" integer NOT NULL,
      "parent_id" varchar NOT NULL,
      "value" "enum_menu_config_special_items_source_collection",
      "id" serial PRIMARY KEY NOT NULL
    )
  `)

  // Foreign keys (idempotenti)
  await db.execute(sql.raw(`
    DO $$ BEGIN
      ALTER TABLE "menu_config_standard_items_source_collection"
        ADD CONSTRAINT "menu_config_standard_items_source_collection_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."menu_config_standard_items"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `))

  await db.execute(sql.raw(`
    DO $$ BEGIN
      ALTER TABLE "menu_config_special_items_source_collection"
        ADD CONSTRAINT "menu_config_special_items_source_collection_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."menu_config_special_items"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `))

  // Indici (IF NOT EXISTS)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "menu_config_standard_items_source_collection_order_idx" ON "menu_config_standard_items_source_collection" USING btree ("order")`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "menu_config_standard_items_source_collection_parent_idx" ON "menu_config_standard_items_source_collection" USING btree ("parent_id")`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "menu_config_special_items_source_collection_order_idx" ON "menu_config_special_items_source_collection" USING btree ("order")`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "menu_config_special_items_source_collection_parent_idx" ON "menu_config_special_items_source_collection" USING btree ("parent_id")`)

  // Rimuovi colonna source_collection singola (IF EXISTS — in produzione non esiste mai stata)
  await db.execute(sql`ALTER TABLE "menu_config_standard_items" DROP COLUMN IF EXISTS "source_collection"`)
  await db.execute(sql`ALTER TABLE "menu_config_special_items" DROP COLUMN IF EXISTS "source_collection"`)
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
