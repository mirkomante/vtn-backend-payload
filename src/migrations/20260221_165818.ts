import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // DROP NOT NULL (idempotente — se già nullable non fa nulla)
  await db.execute(sql.raw(`
    DO $$ BEGIN
      ALTER TABLE "menu_config_standard_items" ALTER COLUMN "filter_mode" DROP NOT NULL;
    EXCEPTION WHEN others THEN NULL;
    END $$;
  `))

  // ADD COLUMN IF NOT EXISTS
  for (const col of [
    'tipologie_vino_id',
    'tipologie_birra_id',
    'tipologie_liquore_id',
    'tipologie_cocktail_id',
    'tipologie_bevanda_id',
    'categoria_menu_fisso_id',
  ]) {
    await db.execute(sql.raw(`
      DO $$ BEGIN
        ALTER TABLE "menu_config_rels" ADD COLUMN "${col}" integer;
      EXCEPTION WHEN duplicate_column THEN NULL;
      END $$;
    `))
  }

  // Foreign keys (idempotenti)
  for (const [constraint, col, refTable] of [
    ['menu_config_rels_tipologie_vino_fk',        'tipologie_vino_id',       'tipologie_vino'],
    ['menu_config_rels_tipologie_birra_fk',        'tipologie_birra_id',      'tipologie_birra'],
    ['menu_config_rels_tipologie_liquore_fk',      'tipologie_liquore_id',    'tipologie_liquore'],
    ['menu_config_rels_tipologie_cocktail_fk',     'tipologie_cocktail_id',   'tipologie_cocktail'],
    ['menu_config_rels_tipologie_bevanda_fk',      'tipologie_bevanda_id',    'tipologie_bevanda'],
    ['menu_config_rels_categoria_menu_fisso_fk',   'categoria_menu_fisso_id', 'categoria_menu_fisso'],
  ] as [string, string, string][]) {
    await db.execute(sql.raw(`
      DO $$ BEGIN
        ALTER TABLE "menu_config_rels" ADD CONSTRAINT "${constraint}"
          FOREIGN KEY ("${col}") REFERENCES "public"."${refTable}"("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `))
  }

  // Indici (IF NOT EXISTS)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "menu_config_rels_tipologie_vino_id_idx" ON "menu_config_rels" USING btree ("tipologie_vino_id")`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "menu_config_rels_tipologie_birra_id_idx" ON "menu_config_rels" USING btree ("tipologie_birra_id")`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "menu_config_rels_tipologie_liquore_id_idx" ON "menu_config_rels" USING btree ("tipologie_liquore_id")`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "menu_config_rels_tipologie_cocktail_id_idx" ON "menu_config_rels" USING btree ("tipologie_cocktail_id")`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "menu_config_rels_tipologie_bevanda_id_idx" ON "menu_config_rels" USING btree ("tipologie_bevanda_id")`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "menu_config_rels_categoria_menu_fisso_id_idx" ON "menu_config_rels" USING btree ("categoria_menu_fisso_id")`)
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
