import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "menu_config" ADD COLUMN "title" varchar;
  ALTER TABLE "_menu_config_v" ADD COLUMN "version_title" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "menu_config" DROP COLUMN "title";
  ALTER TABLE "_menu_config_v" DROP COLUMN "version_title";`)
}
