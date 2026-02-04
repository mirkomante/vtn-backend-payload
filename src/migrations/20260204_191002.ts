import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_piatti_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__piatti_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_servizi_accessori_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__servizi_accessori_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_menu_fisso_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__menu_fisso_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_vini_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__vini_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_birre_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__birre_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_liquori_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__liquori_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_cocktail_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__cocktail_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_bevande_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__bevande_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_allergeni_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__allergeni_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_categoria_menu_fisso_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__categoria_menu_fisso_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_categoria_piatti_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__categoria_piatti_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_tipologie_vino_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__tipologie_vino_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_tipologie_birra_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__tipologie_birra_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_tipologie_liquore_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__tipologie_liquore_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_tipologie_cocktail_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__tipologie_cocktail_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_tipologie_bevanda_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__tipologie_bevanda_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_nazioni_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__nazioni_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_regioni_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__regioni_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_zone_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__zone_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'user');
  CREATE TABLE "media" (
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
  
  CREATE TABLE "piatti" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar,
  	"descrizione" varchar,
  	"prezzo" numeric,
  	"in_lista" boolean DEFAULT true,
  	"gluten_free" boolean DEFAULT false,
  	"no_uovo" boolean DEFAULT false,
  	"no_latticini" boolean DEFAULT false,
  	"vegan" boolean DEFAULT false,
  	"solo_menu_fissi" boolean DEFAULT false,
  	"categoria_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_piatti_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "piatti_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"allergeni_id" integer
  );
  
  CREATE TABLE "_piatti_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nome" varchar,
  	"version_descrizione" varchar,
  	"version_prezzo" numeric,
  	"version_in_lista" boolean DEFAULT true,
  	"version_gluten_free" boolean DEFAULT false,
  	"version_no_uovo" boolean DEFAULT false,
  	"version_no_latticini" boolean DEFAULT false,
  	"version_vegan" boolean DEFAULT false,
  	"version_solo_menu_fissi" boolean DEFAULT false,
  	"version_categoria_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__piatti_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_piatti_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"allergeni_id" integer
  );
  
  CREATE TABLE "servizi_accessori" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar,
  	"descrizione" varchar,
  	"prezzo" numeric,
  	"in_lista" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_servizi_accessori_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_servizi_accessori_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nome" varchar,
  	"version_descrizione" varchar,
  	"version_prezzo" numeric,
  	"version_in_lista" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__servizi_accessori_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "menu_fisso" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar,
  	"descrizione" varchar,
  	"prezzo" numeric,
  	"in_lista" boolean DEFAULT true,
  	"categoria_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_menu_fisso_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "menu_fisso_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"piatti_id" integer,
  	"servizi_accessori_id" integer
  );
  
  CREATE TABLE "_menu_fisso_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nome" varchar,
  	"version_descrizione" varchar,
  	"version_prezzo" numeric,
  	"version_in_lista" boolean DEFAULT true,
  	"version_categoria_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__menu_fisso_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_menu_fisso_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"piatti_id" integer,
  	"servizi_accessori_id" integer
  );
  
  CREATE TABLE "vini" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar,
  	"descrizione" varchar,
  	"cantina" varchar,
  	"grado" varchar,
  	"certificazione" varchar,
  	"anno" varchar,
  	"capacita" varchar,
  	"prezzo_calice" numeric,
  	"prezzo" numeric,
  	"in_lista" boolean DEFAULT true,
  	"nazione_id" integer,
  	"regione_id" integer,
  	"zona_id" integer,
  	"tipologia_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_vini_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_vini_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nome" varchar,
  	"version_descrizione" varchar,
  	"version_cantina" varchar,
  	"version_grado" varchar,
  	"version_certificazione" varchar,
  	"version_anno" varchar,
  	"version_capacita" varchar,
  	"version_prezzo_calice" numeric,
  	"version_prezzo" numeric,
  	"version_in_lista" boolean DEFAULT true,
  	"version_nazione_id" integer,
  	"version_regione_id" integer,
  	"version_zona_id" integer,
  	"version_tipologia_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__vini_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "birre" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar,
  	"descrizione" varchar,
  	"grado" varchar,
  	"capacita" varchar,
  	"prezzo" numeric,
  	"in_lista" boolean DEFAULT true,
  	"nazione_id" integer,
  	"tipologia_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_birre_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_birre_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nome" varchar,
  	"version_descrizione" varchar,
  	"version_grado" varchar,
  	"version_capacita" varchar,
  	"version_prezzo" numeric,
  	"version_in_lista" boolean DEFAULT true,
  	"version_nazione_id" integer,
  	"version_tipologia_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__birre_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "liquori" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar,
  	"descrizione" varchar,
  	"grado" varchar,
  	"invecchiamento" varchar,
  	"capacita" varchar,
  	"prezzo" numeric,
  	"in_lista" boolean DEFAULT true,
  	"nazione_id" integer,
  	"tipologia_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_liquori_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_liquori_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nome" varchar,
  	"version_descrizione" varchar,
  	"version_grado" varchar,
  	"version_invecchiamento" varchar,
  	"version_capacita" varchar,
  	"version_prezzo" numeric,
  	"version_in_lista" boolean DEFAULT true,
  	"version_nazione_id" integer,
  	"version_tipologia_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__liquori_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "cocktail" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar,
  	"descrizione" varchar,
  	"prezzo" numeric,
  	"in_lista" boolean DEFAULT true,
  	"nazione_id" integer,
  	"tipologia_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_cocktail_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_cocktail_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nome" varchar,
  	"version_descrizione" varchar,
  	"version_prezzo" numeric,
  	"version_in_lista" boolean DEFAULT true,
  	"version_nazione_id" integer,
  	"version_tipologia_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__cocktail_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "bevande" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar,
  	"descrizione" varchar,
  	"prezzo" numeric,
  	"in_lista" boolean DEFAULT true,
  	"nazione_id" integer,
  	"tipologia_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_bevande_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_bevande_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nome" varchar,
  	"version_descrizione" varchar,
  	"version_prezzo" numeric,
  	"version_in_lista" boolean DEFAULT true,
  	"version_nazione_id" integer,
  	"version_tipologia_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__bevande_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "allergeni" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar,
  	"descrizione" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_allergeni_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_allergeni_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nome" varchar,
  	"version_descrizione" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__allergeni_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "categoria_menu_fisso" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar,
  	"descrizione" varchar,
  	"in_lista" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_categoria_menu_fisso_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_categoria_menu_fisso_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nome" varchar,
  	"version_descrizione" varchar,
  	"version_in_lista" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__categoria_menu_fisso_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "categoria_piatti" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar,
  	"descrizione" varchar,
  	"in_lista" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_categoria_piatti_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_categoria_piatti_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nome" varchar,
  	"version_descrizione" varchar,
  	"version_in_lista" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__categoria_piatti_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "tipologie_vino" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar,
  	"descrizione" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_tipologie_vino_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_tipologie_vino_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nome" varchar,
  	"version_descrizione" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__tipologie_vino_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "tipologie_birra" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar,
  	"descrizione" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_tipologie_birra_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_tipologie_birra_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nome" varchar,
  	"version_descrizione" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__tipologie_birra_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "tipologie_liquore" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar,
  	"descrizione" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_tipologie_liquore_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_tipologie_liquore_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nome" varchar,
  	"version_descrizione" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__tipologie_liquore_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "tipologie_cocktail" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar,
  	"descrizione" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_tipologie_cocktail_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_tipologie_cocktail_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nome" varchar,
  	"version_descrizione" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__tipologie_cocktail_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "tipologie_bevanda" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar,
  	"descrizione" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_tipologie_bevanda_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_tipologie_bevanda_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nome" varchar,
  	"version_descrizione" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__tipologie_bevanda_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "nazioni" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar,
  	"sigla" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_nazioni_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_nazioni_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nome" varchar,
  	"version_sigla" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__nazioni_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "regioni" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar,
  	"nazione_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_regioni_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_regioni_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nome" varchar,
  	"version_nazione_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__regioni_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "zone" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar,
  	"regione_id" integer,
  	"nazione_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_zone_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_zone_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nome" varchar,
  	"version_regione_id" integer,
  	"version_nazione_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__zone_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"sub" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"piatti_id" integer,
  	"servizi_accessori_id" integer,
  	"menu_fisso_id" integer,
  	"vini_id" integer,
  	"birre_id" integer,
  	"liquori_id" integer,
  	"cocktail_id" integer,
  	"bevande_id" integer,
  	"allergeni_id" integer,
  	"categoria_menu_fisso_id" integer,
  	"categoria_piatti_id" integer,
  	"tipologie_vino_id" integer,
  	"tipologie_birra_id" integer,
  	"tipologie_liquore_id" integer,
  	"tipologie_cocktail_id" integer,
  	"tipologie_bevanda_id" integer,
  	"nazioni_id" integer,
  	"regioni_id" integer,
  	"zone_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "piatti" ADD CONSTRAINT "piatti_categoria_id_categoria_piatti_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categoria_piatti"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "piatti_rels" ADD CONSTRAINT "piatti_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."piatti"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "piatti_rels" ADD CONSTRAINT "piatti_rels_allergeni_fk" FOREIGN KEY ("allergeni_id") REFERENCES "public"."allergeni"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_piatti_v" ADD CONSTRAINT "_piatti_v_parent_id_piatti_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."piatti"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_piatti_v" ADD CONSTRAINT "_piatti_v_version_categoria_id_categoria_piatti_id_fk" FOREIGN KEY ("version_categoria_id") REFERENCES "public"."categoria_piatti"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_piatti_v_rels" ADD CONSTRAINT "_piatti_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_piatti_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_piatti_v_rels" ADD CONSTRAINT "_piatti_v_rels_allergeni_fk" FOREIGN KEY ("allergeni_id") REFERENCES "public"."allergeni"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_servizi_accessori_v" ADD CONSTRAINT "_servizi_accessori_v_parent_id_servizi_accessori_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."servizi_accessori"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "menu_fisso" ADD CONSTRAINT "menu_fisso_categoria_id_categoria_menu_fisso_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categoria_menu_fisso"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "menu_fisso_rels" ADD CONSTRAINT "menu_fisso_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."menu_fisso"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menu_fisso_rels" ADD CONSTRAINT "menu_fisso_rels_piatti_fk" FOREIGN KEY ("piatti_id") REFERENCES "public"."piatti"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menu_fisso_rels" ADD CONSTRAINT "menu_fisso_rels_servizi_accessori_fk" FOREIGN KEY ("servizi_accessori_id") REFERENCES "public"."servizi_accessori"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_menu_fisso_v" ADD CONSTRAINT "_menu_fisso_v_parent_id_menu_fisso_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."menu_fisso"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_menu_fisso_v" ADD CONSTRAINT "_menu_fisso_v_version_categoria_id_categoria_menu_fisso_id_fk" FOREIGN KEY ("version_categoria_id") REFERENCES "public"."categoria_menu_fisso"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_menu_fisso_v_rels" ADD CONSTRAINT "_menu_fisso_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_menu_fisso_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_menu_fisso_v_rels" ADD CONSTRAINT "_menu_fisso_v_rels_piatti_fk" FOREIGN KEY ("piatti_id") REFERENCES "public"."piatti"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_menu_fisso_v_rels" ADD CONSTRAINT "_menu_fisso_v_rels_servizi_accessori_fk" FOREIGN KEY ("servizi_accessori_id") REFERENCES "public"."servizi_accessori"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vini" ADD CONSTRAINT "vini_nazione_id_nazioni_id_fk" FOREIGN KEY ("nazione_id") REFERENCES "public"."nazioni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vini" ADD CONSTRAINT "vini_regione_id_regioni_id_fk" FOREIGN KEY ("regione_id") REFERENCES "public"."regioni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vini" ADD CONSTRAINT "vini_zona_id_zone_id_fk" FOREIGN KEY ("zona_id") REFERENCES "public"."zone"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vini" ADD CONSTRAINT "vini_tipologia_id_tipologie_vino_id_fk" FOREIGN KEY ("tipologia_id") REFERENCES "public"."tipologie_vino"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_vini_v" ADD CONSTRAINT "_vini_v_parent_id_vini_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."vini"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_vini_v" ADD CONSTRAINT "_vini_v_version_nazione_id_nazioni_id_fk" FOREIGN KEY ("version_nazione_id") REFERENCES "public"."nazioni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_vini_v" ADD CONSTRAINT "_vini_v_version_regione_id_regioni_id_fk" FOREIGN KEY ("version_regione_id") REFERENCES "public"."regioni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_vini_v" ADD CONSTRAINT "_vini_v_version_zona_id_zone_id_fk" FOREIGN KEY ("version_zona_id") REFERENCES "public"."zone"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_vini_v" ADD CONSTRAINT "_vini_v_version_tipologia_id_tipologie_vino_id_fk" FOREIGN KEY ("version_tipologia_id") REFERENCES "public"."tipologie_vino"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "birre" ADD CONSTRAINT "birre_nazione_id_nazioni_id_fk" FOREIGN KEY ("nazione_id") REFERENCES "public"."nazioni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "birre" ADD CONSTRAINT "birre_tipologia_id_tipologie_birra_id_fk" FOREIGN KEY ("tipologia_id") REFERENCES "public"."tipologie_birra"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_birre_v" ADD CONSTRAINT "_birre_v_parent_id_birre_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."birre"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_birre_v" ADD CONSTRAINT "_birre_v_version_nazione_id_nazioni_id_fk" FOREIGN KEY ("version_nazione_id") REFERENCES "public"."nazioni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_birre_v" ADD CONSTRAINT "_birre_v_version_tipologia_id_tipologie_birra_id_fk" FOREIGN KEY ("version_tipologia_id") REFERENCES "public"."tipologie_birra"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "liquori" ADD CONSTRAINT "liquori_nazione_id_nazioni_id_fk" FOREIGN KEY ("nazione_id") REFERENCES "public"."nazioni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "liquori" ADD CONSTRAINT "liquori_tipologia_id_tipologie_liquore_id_fk" FOREIGN KEY ("tipologia_id") REFERENCES "public"."tipologie_liquore"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_liquori_v" ADD CONSTRAINT "_liquori_v_parent_id_liquori_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."liquori"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_liquori_v" ADD CONSTRAINT "_liquori_v_version_nazione_id_nazioni_id_fk" FOREIGN KEY ("version_nazione_id") REFERENCES "public"."nazioni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_liquori_v" ADD CONSTRAINT "_liquori_v_version_tipologia_id_tipologie_liquore_id_fk" FOREIGN KEY ("version_tipologia_id") REFERENCES "public"."tipologie_liquore"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cocktail" ADD CONSTRAINT "cocktail_nazione_id_nazioni_id_fk" FOREIGN KEY ("nazione_id") REFERENCES "public"."nazioni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cocktail" ADD CONSTRAINT "cocktail_tipologia_id_tipologie_cocktail_id_fk" FOREIGN KEY ("tipologia_id") REFERENCES "public"."tipologie_cocktail"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cocktail_v" ADD CONSTRAINT "_cocktail_v_parent_id_cocktail_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."cocktail"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cocktail_v" ADD CONSTRAINT "_cocktail_v_version_nazione_id_nazioni_id_fk" FOREIGN KEY ("version_nazione_id") REFERENCES "public"."nazioni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cocktail_v" ADD CONSTRAINT "_cocktail_v_version_tipologia_id_tipologie_cocktail_id_fk" FOREIGN KEY ("version_tipologia_id") REFERENCES "public"."tipologie_cocktail"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bevande" ADD CONSTRAINT "bevande_nazione_id_nazioni_id_fk" FOREIGN KEY ("nazione_id") REFERENCES "public"."nazioni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bevande" ADD CONSTRAINT "bevande_tipologia_id_tipologie_bevanda_id_fk" FOREIGN KEY ("tipologia_id") REFERENCES "public"."tipologie_bevanda"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_bevande_v" ADD CONSTRAINT "_bevande_v_parent_id_bevande_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."bevande"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_bevande_v" ADD CONSTRAINT "_bevande_v_version_nazione_id_nazioni_id_fk" FOREIGN KEY ("version_nazione_id") REFERENCES "public"."nazioni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_bevande_v" ADD CONSTRAINT "_bevande_v_version_tipologia_id_tipologie_bevanda_id_fk" FOREIGN KEY ("version_tipologia_id") REFERENCES "public"."tipologie_bevanda"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_allergeni_v" ADD CONSTRAINT "_allergeni_v_parent_id_allergeni_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."allergeni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categoria_menu_fisso_v" ADD CONSTRAINT "_categoria_menu_fisso_v_parent_id_categoria_menu_fisso_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categoria_menu_fisso"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categoria_piatti_v" ADD CONSTRAINT "_categoria_piatti_v_parent_id_categoria_piatti_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categoria_piatti"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tipologie_vino_v" ADD CONSTRAINT "_tipologie_vino_v_parent_id_tipologie_vino_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tipologie_vino"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tipologie_birra_v" ADD CONSTRAINT "_tipologie_birra_v_parent_id_tipologie_birra_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tipologie_birra"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tipologie_liquore_v" ADD CONSTRAINT "_tipologie_liquore_v_parent_id_tipologie_liquore_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tipologie_liquore"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tipologie_cocktail_v" ADD CONSTRAINT "_tipologie_cocktail_v_parent_id_tipologie_cocktail_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tipologie_cocktail"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tipologie_bevanda_v" ADD CONSTRAINT "_tipologie_bevanda_v_parent_id_tipologie_bevanda_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tipologie_bevanda"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_nazioni_v" ADD CONSTRAINT "_nazioni_v_parent_id_nazioni_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."nazioni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "regioni" ADD CONSTRAINT "regioni_nazione_id_nazioni_id_fk" FOREIGN KEY ("nazione_id") REFERENCES "public"."nazioni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_regioni_v" ADD CONSTRAINT "_regioni_v_parent_id_regioni_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."regioni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_regioni_v" ADD CONSTRAINT "_regioni_v_version_nazione_id_nazioni_id_fk" FOREIGN KEY ("version_nazione_id") REFERENCES "public"."nazioni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "zone" ADD CONSTRAINT "zone_regione_id_regioni_id_fk" FOREIGN KEY ("regione_id") REFERENCES "public"."regioni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "zone" ADD CONSTRAINT "zone_nazione_id_nazioni_id_fk" FOREIGN KEY ("nazione_id") REFERENCES "public"."nazioni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_zone_v" ADD CONSTRAINT "_zone_v_parent_id_zone_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."zone"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_zone_v" ADD CONSTRAINT "_zone_v_version_regione_id_regioni_id_fk" FOREIGN KEY ("version_regione_id") REFERENCES "public"."regioni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_zone_v" ADD CONSTRAINT "_zone_v_version_nazione_id_nazioni_id_fk" FOREIGN KEY ("version_nazione_id") REFERENCES "public"."nazioni"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_piatti_fk" FOREIGN KEY ("piatti_id") REFERENCES "public"."piatti"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_servizi_accessori_fk" FOREIGN KEY ("servizi_accessori_id") REFERENCES "public"."servizi_accessori"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_menu_fisso_fk" FOREIGN KEY ("menu_fisso_id") REFERENCES "public"."menu_fisso"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_vini_fk" FOREIGN KEY ("vini_id") REFERENCES "public"."vini"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_birre_fk" FOREIGN KEY ("birre_id") REFERENCES "public"."birre"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_liquori_fk" FOREIGN KEY ("liquori_id") REFERENCES "public"."liquori"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cocktail_fk" FOREIGN KEY ("cocktail_id") REFERENCES "public"."cocktail"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bevande_fk" FOREIGN KEY ("bevande_id") REFERENCES "public"."bevande"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_allergeni_fk" FOREIGN KEY ("allergeni_id") REFERENCES "public"."allergeni"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categoria_menu_fisso_fk" FOREIGN KEY ("categoria_menu_fisso_id") REFERENCES "public"."categoria_menu_fisso"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categoria_piatti_fk" FOREIGN KEY ("categoria_piatti_id") REFERENCES "public"."categoria_piatti"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tipologie_vino_fk" FOREIGN KEY ("tipologie_vino_id") REFERENCES "public"."tipologie_vino"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tipologie_birra_fk" FOREIGN KEY ("tipologie_birra_id") REFERENCES "public"."tipologie_birra"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tipologie_liquore_fk" FOREIGN KEY ("tipologie_liquore_id") REFERENCES "public"."tipologie_liquore"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tipologie_cocktail_fk" FOREIGN KEY ("tipologie_cocktail_id") REFERENCES "public"."tipologie_cocktail"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tipologie_bevanda_fk" FOREIGN KEY ("tipologie_bevanda_id") REFERENCES "public"."tipologie_bevanda"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_nazioni_fk" FOREIGN KEY ("nazioni_id") REFERENCES "public"."nazioni"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_regioni_fk" FOREIGN KEY ("regioni_id") REFERENCES "public"."regioni"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_zone_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."zone"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "piatti_nome_idx" ON "piatti" USING btree ("nome");
  CREATE INDEX "piatti_categoria_idx" ON "piatti" USING btree ("categoria_id");
  CREATE INDEX "piatti_updated_at_idx" ON "piatti" USING btree ("updated_at");
  CREATE INDEX "piatti_created_at_idx" ON "piatti" USING btree ("created_at");
  CREATE INDEX "piatti__status_idx" ON "piatti" USING btree ("_status");
  CREATE INDEX "piatti_rels_order_idx" ON "piatti_rels" USING btree ("order");
  CREATE INDEX "piatti_rels_parent_idx" ON "piatti_rels" USING btree ("parent_id");
  CREATE INDEX "piatti_rels_path_idx" ON "piatti_rels" USING btree ("path");
  CREATE INDEX "piatti_rels_allergeni_id_idx" ON "piatti_rels" USING btree ("allergeni_id");
  CREATE INDEX "_piatti_v_parent_idx" ON "_piatti_v" USING btree ("parent_id");
  CREATE INDEX "_piatti_v_version_version_nome_idx" ON "_piatti_v" USING btree ("version_nome");
  CREATE INDEX "_piatti_v_version_version_categoria_idx" ON "_piatti_v" USING btree ("version_categoria_id");
  CREATE INDEX "_piatti_v_version_version_updated_at_idx" ON "_piatti_v" USING btree ("version_updated_at");
  CREATE INDEX "_piatti_v_version_version_created_at_idx" ON "_piatti_v" USING btree ("version_created_at");
  CREATE INDEX "_piatti_v_version_version__status_idx" ON "_piatti_v" USING btree ("version__status");
  CREATE INDEX "_piatti_v_created_at_idx" ON "_piatti_v" USING btree ("created_at");
  CREATE INDEX "_piatti_v_updated_at_idx" ON "_piatti_v" USING btree ("updated_at");
  CREATE INDEX "_piatti_v_latest_idx" ON "_piatti_v" USING btree ("latest");
  CREATE INDEX "_piatti_v_rels_order_idx" ON "_piatti_v_rels" USING btree ("order");
  CREATE INDEX "_piatti_v_rels_parent_idx" ON "_piatti_v_rels" USING btree ("parent_id");
  CREATE INDEX "_piatti_v_rels_path_idx" ON "_piatti_v_rels" USING btree ("path");
  CREATE INDEX "_piatti_v_rels_allergeni_id_idx" ON "_piatti_v_rels" USING btree ("allergeni_id");
  CREATE UNIQUE INDEX "servizi_accessori_nome_idx" ON "servizi_accessori" USING btree ("nome");
  CREATE INDEX "servizi_accessori_updated_at_idx" ON "servizi_accessori" USING btree ("updated_at");
  CREATE INDEX "servizi_accessori_created_at_idx" ON "servizi_accessori" USING btree ("created_at");
  CREATE INDEX "servizi_accessori__status_idx" ON "servizi_accessori" USING btree ("_status");
  CREATE INDEX "_servizi_accessori_v_parent_idx" ON "_servizi_accessori_v" USING btree ("parent_id");
  CREATE INDEX "_servizi_accessori_v_version_version_nome_idx" ON "_servizi_accessori_v" USING btree ("version_nome");
  CREATE INDEX "_servizi_accessori_v_version_version_updated_at_idx" ON "_servizi_accessori_v" USING btree ("version_updated_at");
  CREATE INDEX "_servizi_accessori_v_version_version_created_at_idx" ON "_servizi_accessori_v" USING btree ("version_created_at");
  CREATE INDEX "_servizi_accessori_v_version_version__status_idx" ON "_servizi_accessori_v" USING btree ("version__status");
  CREATE INDEX "_servizi_accessori_v_created_at_idx" ON "_servizi_accessori_v" USING btree ("created_at");
  CREATE INDEX "_servizi_accessori_v_updated_at_idx" ON "_servizi_accessori_v" USING btree ("updated_at");
  CREATE INDEX "_servizi_accessori_v_latest_idx" ON "_servizi_accessori_v" USING btree ("latest");
  CREATE UNIQUE INDEX "menu_fisso_nome_idx" ON "menu_fisso" USING btree ("nome");
  CREATE INDEX "menu_fisso_categoria_idx" ON "menu_fisso" USING btree ("categoria_id");
  CREATE INDEX "menu_fisso_updated_at_idx" ON "menu_fisso" USING btree ("updated_at");
  CREATE INDEX "menu_fisso_created_at_idx" ON "menu_fisso" USING btree ("created_at");
  CREATE INDEX "menu_fisso__status_idx" ON "menu_fisso" USING btree ("_status");
  CREATE INDEX "menu_fisso_rels_order_idx" ON "menu_fisso_rels" USING btree ("order");
  CREATE INDEX "menu_fisso_rels_parent_idx" ON "menu_fisso_rels" USING btree ("parent_id");
  CREATE INDEX "menu_fisso_rels_path_idx" ON "menu_fisso_rels" USING btree ("path");
  CREATE INDEX "menu_fisso_rels_piatti_id_idx" ON "menu_fisso_rels" USING btree ("piatti_id");
  CREATE INDEX "menu_fisso_rels_servizi_accessori_id_idx" ON "menu_fisso_rels" USING btree ("servizi_accessori_id");
  CREATE INDEX "_menu_fisso_v_parent_idx" ON "_menu_fisso_v" USING btree ("parent_id");
  CREATE INDEX "_menu_fisso_v_version_version_nome_idx" ON "_menu_fisso_v" USING btree ("version_nome");
  CREATE INDEX "_menu_fisso_v_version_version_categoria_idx" ON "_menu_fisso_v" USING btree ("version_categoria_id");
  CREATE INDEX "_menu_fisso_v_version_version_updated_at_idx" ON "_menu_fisso_v" USING btree ("version_updated_at");
  CREATE INDEX "_menu_fisso_v_version_version_created_at_idx" ON "_menu_fisso_v" USING btree ("version_created_at");
  CREATE INDEX "_menu_fisso_v_version_version__status_idx" ON "_menu_fisso_v" USING btree ("version__status");
  CREATE INDEX "_menu_fisso_v_created_at_idx" ON "_menu_fisso_v" USING btree ("created_at");
  CREATE INDEX "_menu_fisso_v_updated_at_idx" ON "_menu_fisso_v" USING btree ("updated_at");
  CREATE INDEX "_menu_fisso_v_latest_idx" ON "_menu_fisso_v" USING btree ("latest");
  CREATE INDEX "_menu_fisso_v_rels_order_idx" ON "_menu_fisso_v_rels" USING btree ("order");
  CREATE INDEX "_menu_fisso_v_rels_parent_idx" ON "_menu_fisso_v_rels" USING btree ("parent_id");
  CREATE INDEX "_menu_fisso_v_rels_path_idx" ON "_menu_fisso_v_rels" USING btree ("path");
  CREATE INDEX "_menu_fisso_v_rels_piatti_id_idx" ON "_menu_fisso_v_rels" USING btree ("piatti_id");
  CREATE INDEX "_menu_fisso_v_rels_servizi_accessori_id_idx" ON "_menu_fisso_v_rels" USING btree ("servizi_accessori_id");
  CREATE UNIQUE INDEX "vini_nome_idx" ON "vini" USING btree ("nome");
  CREATE INDEX "vini_nazione_idx" ON "vini" USING btree ("nazione_id");
  CREATE INDEX "vini_regione_idx" ON "vini" USING btree ("regione_id");
  CREATE INDEX "vini_zona_idx" ON "vini" USING btree ("zona_id");
  CREATE INDEX "vini_tipologia_idx" ON "vini" USING btree ("tipologia_id");
  CREATE INDEX "vini_updated_at_idx" ON "vini" USING btree ("updated_at");
  CREATE INDEX "vini_created_at_idx" ON "vini" USING btree ("created_at");
  CREATE INDEX "vini__status_idx" ON "vini" USING btree ("_status");
  CREATE INDEX "_vini_v_parent_idx" ON "_vini_v" USING btree ("parent_id");
  CREATE INDEX "_vini_v_version_version_nome_idx" ON "_vini_v" USING btree ("version_nome");
  CREATE INDEX "_vini_v_version_version_nazione_idx" ON "_vini_v" USING btree ("version_nazione_id");
  CREATE INDEX "_vini_v_version_version_regione_idx" ON "_vini_v" USING btree ("version_regione_id");
  CREATE INDEX "_vini_v_version_version_zona_idx" ON "_vini_v" USING btree ("version_zona_id");
  CREATE INDEX "_vini_v_version_version_tipologia_idx" ON "_vini_v" USING btree ("version_tipologia_id");
  CREATE INDEX "_vini_v_version_version_updated_at_idx" ON "_vini_v" USING btree ("version_updated_at");
  CREATE INDEX "_vini_v_version_version_created_at_idx" ON "_vini_v" USING btree ("version_created_at");
  CREATE INDEX "_vini_v_version_version__status_idx" ON "_vini_v" USING btree ("version__status");
  CREATE INDEX "_vini_v_created_at_idx" ON "_vini_v" USING btree ("created_at");
  CREATE INDEX "_vini_v_updated_at_idx" ON "_vini_v" USING btree ("updated_at");
  CREATE INDEX "_vini_v_latest_idx" ON "_vini_v" USING btree ("latest");
  CREATE UNIQUE INDEX "birre_nome_idx" ON "birre" USING btree ("nome");
  CREATE INDEX "birre_nazione_idx" ON "birre" USING btree ("nazione_id");
  CREATE INDEX "birre_tipologia_idx" ON "birre" USING btree ("tipologia_id");
  CREATE INDEX "birre_updated_at_idx" ON "birre" USING btree ("updated_at");
  CREATE INDEX "birre_created_at_idx" ON "birre" USING btree ("created_at");
  CREATE INDEX "birre__status_idx" ON "birre" USING btree ("_status");
  CREATE INDEX "_birre_v_parent_idx" ON "_birre_v" USING btree ("parent_id");
  CREATE INDEX "_birre_v_version_version_nome_idx" ON "_birre_v" USING btree ("version_nome");
  CREATE INDEX "_birre_v_version_version_nazione_idx" ON "_birre_v" USING btree ("version_nazione_id");
  CREATE INDEX "_birre_v_version_version_tipologia_idx" ON "_birre_v" USING btree ("version_tipologia_id");
  CREATE INDEX "_birre_v_version_version_updated_at_idx" ON "_birre_v" USING btree ("version_updated_at");
  CREATE INDEX "_birre_v_version_version_created_at_idx" ON "_birre_v" USING btree ("version_created_at");
  CREATE INDEX "_birre_v_version_version__status_idx" ON "_birre_v" USING btree ("version__status");
  CREATE INDEX "_birre_v_created_at_idx" ON "_birre_v" USING btree ("created_at");
  CREATE INDEX "_birre_v_updated_at_idx" ON "_birre_v" USING btree ("updated_at");
  CREATE INDEX "_birre_v_latest_idx" ON "_birre_v" USING btree ("latest");
  CREATE UNIQUE INDEX "liquori_nome_idx" ON "liquori" USING btree ("nome");
  CREATE INDEX "liquori_nazione_idx" ON "liquori" USING btree ("nazione_id");
  CREATE INDEX "liquori_tipologia_idx" ON "liquori" USING btree ("tipologia_id");
  CREATE INDEX "liquori_updated_at_idx" ON "liquori" USING btree ("updated_at");
  CREATE INDEX "liquori_created_at_idx" ON "liquori" USING btree ("created_at");
  CREATE INDEX "liquori__status_idx" ON "liquori" USING btree ("_status");
  CREATE INDEX "_liquori_v_parent_idx" ON "_liquori_v" USING btree ("parent_id");
  CREATE INDEX "_liquori_v_version_version_nome_idx" ON "_liquori_v" USING btree ("version_nome");
  CREATE INDEX "_liquori_v_version_version_nazione_idx" ON "_liquori_v" USING btree ("version_nazione_id");
  CREATE INDEX "_liquori_v_version_version_tipologia_idx" ON "_liquori_v" USING btree ("version_tipologia_id");
  CREATE INDEX "_liquori_v_version_version_updated_at_idx" ON "_liquori_v" USING btree ("version_updated_at");
  CREATE INDEX "_liquori_v_version_version_created_at_idx" ON "_liquori_v" USING btree ("version_created_at");
  CREATE INDEX "_liquori_v_version_version__status_idx" ON "_liquori_v" USING btree ("version__status");
  CREATE INDEX "_liquori_v_created_at_idx" ON "_liquori_v" USING btree ("created_at");
  CREATE INDEX "_liquori_v_updated_at_idx" ON "_liquori_v" USING btree ("updated_at");
  CREATE INDEX "_liquori_v_latest_idx" ON "_liquori_v" USING btree ("latest");
  CREATE UNIQUE INDEX "cocktail_nome_idx" ON "cocktail" USING btree ("nome");
  CREATE INDEX "cocktail_nazione_idx" ON "cocktail" USING btree ("nazione_id");
  CREATE INDEX "cocktail_tipologia_idx" ON "cocktail" USING btree ("tipologia_id");
  CREATE INDEX "cocktail_updated_at_idx" ON "cocktail" USING btree ("updated_at");
  CREATE INDEX "cocktail_created_at_idx" ON "cocktail" USING btree ("created_at");
  CREATE INDEX "cocktail__status_idx" ON "cocktail" USING btree ("_status");
  CREATE INDEX "_cocktail_v_parent_idx" ON "_cocktail_v" USING btree ("parent_id");
  CREATE INDEX "_cocktail_v_version_version_nome_idx" ON "_cocktail_v" USING btree ("version_nome");
  CREATE INDEX "_cocktail_v_version_version_nazione_idx" ON "_cocktail_v" USING btree ("version_nazione_id");
  CREATE INDEX "_cocktail_v_version_version_tipologia_idx" ON "_cocktail_v" USING btree ("version_tipologia_id");
  CREATE INDEX "_cocktail_v_version_version_updated_at_idx" ON "_cocktail_v" USING btree ("version_updated_at");
  CREATE INDEX "_cocktail_v_version_version_created_at_idx" ON "_cocktail_v" USING btree ("version_created_at");
  CREATE INDEX "_cocktail_v_version_version__status_idx" ON "_cocktail_v" USING btree ("version__status");
  CREATE INDEX "_cocktail_v_created_at_idx" ON "_cocktail_v" USING btree ("created_at");
  CREATE INDEX "_cocktail_v_updated_at_idx" ON "_cocktail_v" USING btree ("updated_at");
  CREATE INDEX "_cocktail_v_latest_idx" ON "_cocktail_v" USING btree ("latest");
  CREATE UNIQUE INDEX "bevande_nome_idx" ON "bevande" USING btree ("nome");
  CREATE INDEX "bevande_nazione_idx" ON "bevande" USING btree ("nazione_id");
  CREATE INDEX "bevande_tipologia_idx" ON "bevande" USING btree ("tipologia_id");
  CREATE INDEX "bevande_updated_at_idx" ON "bevande" USING btree ("updated_at");
  CREATE INDEX "bevande_created_at_idx" ON "bevande" USING btree ("created_at");
  CREATE INDEX "bevande__status_idx" ON "bevande" USING btree ("_status");
  CREATE INDEX "_bevande_v_parent_idx" ON "_bevande_v" USING btree ("parent_id");
  CREATE INDEX "_bevande_v_version_version_nome_idx" ON "_bevande_v" USING btree ("version_nome");
  CREATE INDEX "_bevande_v_version_version_nazione_idx" ON "_bevande_v" USING btree ("version_nazione_id");
  CREATE INDEX "_bevande_v_version_version_tipologia_idx" ON "_bevande_v" USING btree ("version_tipologia_id");
  CREATE INDEX "_bevande_v_version_version_updated_at_idx" ON "_bevande_v" USING btree ("version_updated_at");
  CREATE INDEX "_bevande_v_version_version_created_at_idx" ON "_bevande_v" USING btree ("version_created_at");
  CREATE INDEX "_bevande_v_version_version__status_idx" ON "_bevande_v" USING btree ("version__status");
  CREATE INDEX "_bevande_v_created_at_idx" ON "_bevande_v" USING btree ("created_at");
  CREATE INDEX "_bevande_v_updated_at_idx" ON "_bevande_v" USING btree ("updated_at");
  CREATE INDEX "_bevande_v_latest_idx" ON "_bevande_v" USING btree ("latest");
  CREATE UNIQUE INDEX "allergeni_nome_idx" ON "allergeni" USING btree ("nome");
  CREATE INDEX "allergeni_updated_at_idx" ON "allergeni" USING btree ("updated_at");
  CREATE INDEX "allergeni_created_at_idx" ON "allergeni" USING btree ("created_at");
  CREATE INDEX "allergeni__status_idx" ON "allergeni" USING btree ("_status");
  CREATE INDEX "_allergeni_v_parent_idx" ON "_allergeni_v" USING btree ("parent_id");
  CREATE INDEX "_allergeni_v_version_version_nome_idx" ON "_allergeni_v" USING btree ("version_nome");
  CREATE INDEX "_allergeni_v_version_version_updated_at_idx" ON "_allergeni_v" USING btree ("version_updated_at");
  CREATE INDEX "_allergeni_v_version_version_created_at_idx" ON "_allergeni_v" USING btree ("version_created_at");
  CREATE INDEX "_allergeni_v_version_version__status_idx" ON "_allergeni_v" USING btree ("version__status");
  CREATE INDEX "_allergeni_v_created_at_idx" ON "_allergeni_v" USING btree ("created_at");
  CREATE INDEX "_allergeni_v_updated_at_idx" ON "_allergeni_v" USING btree ("updated_at");
  CREATE INDEX "_allergeni_v_latest_idx" ON "_allergeni_v" USING btree ("latest");
  CREATE UNIQUE INDEX "categoria_menu_fisso_nome_idx" ON "categoria_menu_fisso" USING btree ("nome");
  CREATE INDEX "categoria_menu_fisso_updated_at_idx" ON "categoria_menu_fisso" USING btree ("updated_at");
  CREATE INDEX "categoria_menu_fisso_created_at_idx" ON "categoria_menu_fisso" USING btree ("created_at");
  CREATE INDEX "categoria_menu_fisso__status_idx" ON "categoria_menu_fisso" USING btree ("_status");
  CREATE INDEX "_categoria_menu_fisso_v_parent_idx" ON "_categoria_menu_fisso_v" USING btree ("parent_id");
  CREATE INDEX "_categoria_menu_fisso_v_version_version_nome_idx" ON "_categoria_menu_fisso_v" USING btree ("version_nome");
  CREATE INDEX "_categoria_menu_fisso_v_version_version_updated_at_idx" ON "_categoria_menu_fisso_v" USING btree ("version_updated_at");
  CREATE INDEX "_categoria_menu_fisso_v_version_version_created_at_idx" ON "_categoria_menu_fisso_v" USING btree ("version_created_at");
  CREATE INDEX "_categoria_menu_fisso_v_version_version__status_idx" ON "_categoria_menu_fisso_v" USING btree ("version__status");
  CREATE INDEX "_categoria_menu_fisso_v_created_at_idx" ON "_categoria_menu_fisso_v" USING btree ("created_at");
  CREATE INDEX "_categoria_menu_fisso_v_updated_at_idx" ON "_categoria_menu_fisso_v" USING btree ("updated_at");
  CREATE INDEX "_categoria_menu_fisso_v_latest_idx" ON "_categoria_menu_fisso_v" USING btree ("latest");
  CREATE UNIQUE INDEX "categoria_piatti_nome_idx" ON "categoria_piatti" USING btree ("nome");
  CREATE INDEX "categoria_piatti_updated_at_idx" ON "categoria_piatti" USING btree ("updated_at");
  CREATE INDEX "categoria_piatti_created_at_idx" ON "categoria_piatti" USING btree ("created_at");
  CREATE INDEX "categoria_piatti__status_idx" ON "categoria_piatti" USING btree ("_status");
  CREATE INDEX "_categoria_piatti_v_parent_idx" ON "_categoria_piatti_v" USING btree ("parent_id");
  CREATE INDEX "_categoria_piatti_v_version_version_nome_idx" ON "_categoria_piatti_v" USING btree ("version_nome");
  CREATE INDEX "_categoria_piatti_v_version_version_updated_at_idx" ON "_categoria_piatti_v" USING btree ("version_updated_at");
  CREATE INDEX "_categoria_piatti_v_version_version_created_at_idx" ON "_categoria_piatti_v" USING btree ("version_created_at");
  CREATE INDEX "_categoria_piatti_v_version_version__status_idx" ON "_categoria_piatti_v" USING btree ("version__status");
  CREATE INDEX "_categoria_piatti_v_created_at_idx" ON "_categoria_piatti_v" USING btree ("created_at");
  CREATE INDEX "_categoria_piatti_v_updated_at_idx" ON "_categoria_piatti_v" USING btree ("updated_at");
  CREATE INDEX "_categoria_piatti_v_latest_idx" ON "_categoria_piatti_v" USING btree ("latest");
  CREATE UNIQUE INDEX "tipologie_vino_nome_idx" ON "tipologie_vino" USING btree ("nome");
  CREATE INDEX "tipologie_vino_updated_at_idx" ON "tipologie_vino" USING btree ("updated_at");
  CREATE INDEX "tipologie_vino_created_at_idx" ON "tipologie_vino" USING btree ("created_at");
  CREATE INDEX "tipologie_vino__status_idx" ON "tipologie_vino" USING btree ("_status");
  CREATE INDEX "_tipologie_vino_v_parent_idx" ON "_tipologie_vino_v" USING btree ("parent_id");
  CREATE INDEX "_tipologie_vino_v_version_version_nome_idx" ON "_tipologie_vino_v" USING btree ("version_nome");
  CREATE INDEX "_tipologie_vino_v_version_version_updated_at_idx" ON "_tipologie_vino_v" USING btree ("version_updated_at");
  CREATE INDEX "_tipologie_vino_v_version_version_created_at_idx" ON "_tipologie_vino_v" USING btree ("version_created_at");
  CREATE INDEX "_tipologie_vino_v_version_version__status_idx" ON "_tipologie_vino_v" USING btree ("version__status");
  CREATE INDEX "_tipologie_vino_v_created_at_idx" ON "_tipologie_vino_v" USING btree ("created_at");
  CREATE INDEX "_tipologie_vino_v_updated_at_idx" ON "_tipologie_vino_v" USING btree ("updated_at");
  CREATE INDEX "_tipologie_vino_v_latest_idx" ON "_tipologie_vino_v" USING btree ("latest");
  CREATE UNIQUE INDEX "tipologie_birra_nome_idx" ON "tipologie_birra" USING btree ("nome");
  CREATE INDEX "tipologie_birra_updated_at_idx" ON "tipologie_birra" USING btree ("updated_at");
  CREATE INDEX "tipologie_birra_created_at_idx" ON "tipologie_birra" USING btree ("created_at");
  CREATE INDEX "tipologie_birra__status_idx" ON "tipologie_birra" USING btree ("_status");
  CREATE INDEX "_tipologie_birra_v_parent_idx" ON "_tipologie_birra_v" USING btree ("parent_id");
  CREATE INDEX "_tipologie_birra_v_version_version_nome_idx" ON "_tipologie_birra_v" USING btree ("version_nome");
  CREATE INDEX "_tipologie_birra_v_version_version_updated_at_idx" ON "_tipologie_birra_v" USING btree ("version_updated_at");
  CREATE INDEX "_tipologie_birra_v_version_version_created_at_idx" ON "_tipologie_birra_v" USING btree ("version_created_at");
  CREATE INDEX "_tipologie_birra_v_version_version__status_idx" ON "_tipologie_birra_v" USING btree ("version__status");
  CREATE INDEX "_tipologie_birra_v_created_at_idx" ON "_tipologie_birra_v" USING btree ("created_at");
  CREATE INDEX "_tipologie_birra_v_updated_at_idx" ON "_tipologie_birra_v" USING btree ("updated_at");
  CREATE INDEX "_tipologie_birra_v_latest_idx" ON "_tipologie_birra_v" USING btree ("latest");
  CREATE UNIQUE INDEX "tipologie_liquore_nome_idx" ON "tipologie_liquore" USING btree ("nome");
  CREATE INDEX "tipologie_liquore_updated_at_idx" ON "tipologie_liquore" USING btree ("updated_at");
  CREATE INDEX "tipologie_liquore_created_at_idx" ON "tipologie_liquore" USING btree ("created_at");
  CREATE INDEX "tipologie_liquore__status_idx" ON "tipologie_liquore" USING btree ("_status");
  CREATE INDEX "_tipologie_liquore_v_parent_idx" ON "_tipologie_liquore_v" USING btree ("parent_id");
  CREATE INDEX "_tipologie_liquore_v_version_version_nome_idx" ON "_tipologie_liquore_v" USING btree ("version_nome");
  CREATE INDEX "_tipologie_liquore_v_version_version_updated_at_idx" ON "_tipologie_liquore_v" USING btree ("version_updated_at");
  CREATE INDEX "_tipologie_liquore_v_version_version_created_at_idx" ON "_tipologie_liquore_v" USING btree ("version_created_at");
  CREATE INDEX "_tipologie_liquore_v_version_version__status_idx" ON "_tipologie_liquore_v" USING btree ("version__status");
  CREATE INDEX "_tipologie_liquore_v_created_at_idx" ON "_tipologie_liquore_v" USING btree ("created_at");
  CREATE INDEX "_tipologie_liquore_v_updated_at_idx" ON "_tipologie_liquore_v" USING btree ("updated_at");
  CREATE INDEX "_tipologie_liquore_v_latest_idx" ON "_tipologie_liquore_v" USING btree ("latest");
  CREATE UNIQUE INDEX "tipologie_cocktail_nome_idx" ON "tipologie_cocktail" USING btree ("nome");
  CREATE INDEX "tipologie_cocktail_updated_at_idx" ON "tipologie_cocktail" USING btree ("updated_at");
  CREATE INDEX "tipologie_cocktail_created_at_idx" ON "tipologie_cocktail" USING btree ("created_at");
  CREATE INDEX "tipologie_cocktail__status_idx" ON "tipologie_cocktail" USING btree ("_status");
  CREATE INDEX "_tipologie_cocktail_v_parent_idx" ON "_tipologie_cocktail_v" USING btree ("parent_id");
  CREATE INDEX "_tipologie_cocktail_v_version_version_nome_idx" ON "_tipologie_cocktail_v" USING btree ("version_nome");
  CREATE INDEX "_tipologie_cocktail_v_version_version_updated_at_idx" ON "_tipologie_cocktail_v" USING btree ("version_updated_at");
  CREATE INDEX "_tipologie_cocktail_v_version_version_created_at_idx" ON "_tipologie_cocktail_v" USING btree ("version_created_at");
  CREATE INDEX "_tipologie_cocktail_v_version_version__status_idx" ON "_tipologie_cocktail_v" USING btree ("version__status");
  CREATE INDEX "_tipologie_cocktail_v_created_at_idx" ON "_tipologie_cocktail_v" USING btree ("created_at");
  CREATE INDEX "_tipologie_cocktail_v_updated_at_idx" ON "_tipologie_cocktail_v" USING btree ("updated_at");
  CREATE INDEX "_tipologie_cocktail_v_latest_idx" ON "_tipologie_cocktail_v" USING btree ("latest");
  CREATE UNIQUE INDEX "tipologie_bevanda_nome_idx" ON "tipologie_bevanda" USING btree ("nome");
  CREATE INDEX "tipologie_bevanda_updated_at_idx" ON "tipologie_bevanda" USING btree ("updated_at");
  CREATE INDEX "tipologie_bevanda_created_at_idx" ON "tipologie_bevanda" USING btree ("created_at");
  CREATE INDEX "tipologie_bevanda__status_idx" ON "tipologie_bevanda" USING btree ("_status");
  CREATE INDEX "_tipologie_bevanda_v_parent_idx" ON "_tipologie_bevanda_v" USING btree ("parent_id");
  CREATE INDEX "_tipologie_bevanda_v_version_version_nome_idx" ON "_tipologie_bevanda_v" USING btree ("version_nome");
  CREATE INDEX "_tipologie_bevanda_v_version_version_updated_at_idx" ON "_tipologie_bevanda_v" USING btree ("version_updated_at");
  CREATE INDEX "_tipologie_bevanda_v_version_version_created_at_idx" ON "_tipologie_bevanda_v" USING btree ("version_created_at");
  CREATE INDEX "_tipologie_bevanda_v_version_version__status_idx" ON "_tipologie_bevanda_v" USING btree ("version__status");
  CREATE INDEX "_tipologie_bevanda_v_created_at_idx" ON "_tipologie_bevanda_v" USING btree ("created_at");
  CREATE INDEX "_tipologie_bevanda_v_updated_at_idx" ON "_tipologie_bevanda_v" USING btree ("updated_at");
  CREATE INDEX "_tipologie_bevanda_v_latest_idx" ON "_tipologie_bevanda_v" USING btree ("latest");
  CREATE UNIQUE INDEX "nazioni_nome_idx" ON "nazioni" USING btree ("nome");
  CREATE UNIQUE INDEX "nazioni_sigla_idx" ON "nazioni" USING btree ("sigla");
  CREATE INDEX "nazioni_updated_at_idx" ON "nazioni" USING btree ("updated_at");
  CREATE INDEX "nazioni_created_at_idx" ON "nazioni" USING btree ("created_at");
  CREATE INDEX "nazioni__status_idx" ON "nazioni" USING btree ("_status");
  CREATE INDEX "_nazioni_v_parent_idx" ON "_nazioni_v" USING btree ("parent_id");
  CREATE INDEX "_nazioni_v_version_version_nome_idx" ON "_nazioni_v" USING btree ("version_nome");
  CREATE INDEX "_nazioni_v_version_version_sigla_idx" ON "_nazioni_v" USING btree ("version_sigla");
  CREATE INDEX "_nazioni_v_version_version_updated_at_idx" ON "_nazioni_v" USING btree ("version_updated_at");
  CREATE INDEX "_nazioni_v_version_version_created_at_idx" ON "_nazioni_v" USING btree ("version_created_at");
  CREATE INDEX "_nazioni_v_version_version__status_idx" ON "_nazioni_v" USING btree ("version__status");
  CREATE INDEX "_nazioni_v_created_at_idx" ON "_nazioni_v" USING btree ("created_at");
  CREATE INDEX "_nazioni_v_updated_at_idx" ON "_nazioni_v" USING btree ("updated_at");
  CREATE INDEX "_nazioni_v_latest_idx" ON "_nazioni_v" USING btree ("latest");
  CREATE INDEX "regioni_nome_idx" ON "regioni" USING btree ("nome");
  CREATE INDEX "regioni_nazione_idx" ON "regioni" USING btree ("nazione_id");
  CREATE INDEX "regioni_updated_at_idx" ON "regioni" USING btree ("updated_at");
  CREATE INDEX "regioni_created_at_idx" ON "regioni" USING btree ("created_at");
  CREATE INDEX "regioni__status_idx" ON "regioni" USING btree ("_status");
  CREATE INDEX "_regioni_v_parent_idx" ON "_regioni_v" USING btree ("parent_id");
  CREATE INDEX "_regioni_v_version_version_nome_idx" ON "_regioni_v" USING btree ("version_nome");
  CREATE INDEX "_regioni_v_version_version_nazione_idx" ON "_regioni_v" USING btree ("version_nazione_id");
  CREATE INDEX "_regioni_v_version_version_updated_at_idx" ON "_regioni_v" USING btree ("version_updated_at");
  CREATE INDEX "_regioni_v_version_version_created_at_idx" ON "_regioni_v" USING btree ("version_created_at");
  CREATE INDEX "_regioni_v_version_version__status_idx" ON "_regioni_v" USING btree ("version__status");
  CREATE INDEX "_regioni_v_created_at_idx" ON "_regioni_v" USING btree ("created_at");
  CREATE INDEX "_regioni_v_updated_at_idx" ON "_regioni_v" USING btree ("updated_at");
  CREATE INDEX "_regioni_v_latest_idx" ON "_regioni_v" USING btree ("latest");
  CREATE INDEX "zone_nome_idx" ON "zone" USING btree ("nome");
  CREATE INDEX "zone_regione_idx" ON "zone" USING btree ("regione_id");
  CREATE INDEX "zone_nazione_idx" ON "zone" USING btree ("nazione_id");
  CREATE INDEX "zone_updated_at_idx" ON "zone" USING btree ("updated_at");
  CREATE INDEX "zone_created_at_idx" ON "zone" USING btree ("created_at");
  CREATE INDEX "zone__status_idx" ON "zone" USING btree ("_status");
  CREATE INDEX "_zone_v_parent_idx" ON "_zone_v" USING btree ("parent_id");
  CREATE INDEX "_zone_v_version_version_nome_idx" ON "_zone_v" USING btree ("version_nome");
  CREATE INDEX "_zone_v_version_version_regione_idx" ON "_zone_v" USING btree ("version_regione_id");
  CREATE INDEX "_zone_v_version_version_nazione_idx" ON "_zone_v" USING btree ("version_nazione_id");
  CREATE INDEX "_zone_v_version_version_updated_at_idx" ON "_zone_v" USING btree ("version_updated_at");
  CREATE INDEX "_zone_v_version_version_created_at_idx" ON "_zone_v" USING btree ("version_created_at");
  CREATE INDEX "_zone_v_version_version__status_idx" ON "_zone_v" USING btree ("version__status");
  CREATE INDEX "_zone_v_created_at_idx" ON "_zone_v" USING btree ("created_at");
  CREATE INDEX "_zone_v_updated_at_idx" ON "_zone_v" USING btree ("updated_at");
  CREATE INDEX "_zone_v_latest_idx" ON "_zone_v" USING btree ("latest");
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE UNIQUE INDEX "users_sub_idx" ON "users" USING btree ("sub");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_piatti_id_idx" ON "payload_locked_documents_rels" USING btree ("piatti_id");
  CREATE INDEX "payload_locked_documents_rels_servizi_accessori_id_idx" ON "payload_locked_documents_rels" USING btree ("servizi_accessori_id");
  CREATE INDEX "payload_locked_documents_rels_menu_fisso_id_idx" ON "payload_locked_documents_rels" USING btree ("menu_fisso_id");
  CREATE INDEX "payload_locked_documents_rels_vini_id_idx" ON "payload_locked_documents_rels" USING btree ("vini_id");
  CREATE INDEX "payload_locked_documents_rels_birre_id_idx" ON "payload_locked_documents_rels" USING btree ("birre_id");
  CREATE INDEX "payload_locked_documents_rels_liquori_id_idx" ON "payload_locked_documents_rels" USING btree ("liquori_id");
  CREATE INDEX "payload_locked_documents_rels_cocktail_id_idx" ON "payload_locked_documents_rels" USING btree ("cocktail_id");
  CREATE INDEX "payload_locked_documents_rels_bevande_id_idx" ON "payload_locked_documents_rels" USING btree ("bevande_id");
  CREATE INDEX "payload_locked_documents_rels_allergeni_id_idx" ON "payload_locked_documents_rels" USING btree ("allergeni_id");
  CREATE INDEX "payload_locked_documents_rels_categoria_menu_fisso_id_idx" ON "payload_locked_documents_rels" USING btree ("categoria_menu_fisso_id");
  CREATE INDEX "payload_locked_documents_rels_categoria_piatti_id_idx" ON "payload_locked_documents_rels" USING btree ("categoria_piatti_id");
  CREATE INDEX "payload_locked_documents_rels_tipologie_vino_id_idx" ON "payload_locked_documents_rels" USING btree ("tipologie_vino_id");
  CREATE INDEX "payload_locked_documents_rels_tipologie_birra_id_idx" ON "payload_locked_documents_rels" USING btree ("tipologie_birra_id");
  CREATE INDEX "payload_locked_documents_rels_tipologie_liquore_id_idx" ON "payload_locked_documents_rels" USING btree ("tipologie_liquore_id");
  CREATE INDEX "payload_locked_documents_rels_tipologie_cocktail_id_idx" ON "payload_locked_documents_rels" USING btree ("tipologie_cocktail_id");
  CREATE INDEX "payload_locked_documents_rels_tipologie_bevanda_id_idx" ON "payload_locked_documents_rels" USING btree ("tipologie_bevanda_id");
  CREATE INDEX "payload_locked_documents_rels_nazioni_id_idx" ON "payload_locked_documents_rels" USING btree ("nazioni_id");
  CREATE INDEX "payload_locked_documents_rels_regioni_id_idx" ON "payload_locked_documents_rels" USING btree ("regioni_id");
  CREATE INDEX "payload_locked_documents_rels_zone_id_idx" ON "payload_locked_documents_rels" USING btree ("zone_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "media" CASCADE;
  DROP TABLE "piatti" CASCADE;
  DROP TABLE "piatti_rels" CASCADE;
  DROP TABLE "_piatti_v" CASCADE;
  DROP TABLE "_piatti_v_rels" CASCADE;
  DROP TABLE "servizi_accessori" CASCADE;
  DROP TABLE "_servizi_accessori_v" CASCADE;
  DROP TABLE "menu_fisso" CASCADE;
  DROP TABLE "menu_fisso_rels" CASCADE;
  DROP TABLE "_menu_fisso_v" CASCADE;
  DROP TABLE "_menu_fisso_v_rels" CASCADE;
  DROP TABLE "vini" CASCADE;
  DROP TABLE "_vini_v" CASCADE;
  DROP TABLE "birre" CASCADE;
  DROP TABLE "_birre_v" CASCADE;
  DROP TABLE "liquori" CASCADE;
  DROP TABLE "_liquori_v" CASCADE;
  DROP TABLE "cocktail" CASCADE;
  DROP TABLE "_cocktail_v" CASCADE;
  DROP TABLE "bevande" CASCADE;
  DROP TABLE "_bevande_v" CASCADE;
  DROP TABLE "allergeni" CASCADE;
  DROP TABLE "_allergeni_v" CASCADE;
  DROP TABLE "categoria_menu_fisso" CASCADE;
  DROP TABLE "_categoria_menu_fisso_v" CASCADE;
  DROP TABLE "categoria_piatti" CASCADE;
  DROP TABLE "_categoria_piatti_v" CASCADE;
  DROP TABLE "tipologie_vino" CASCADE;
  DROP TABLE "_tipologie_vino_v" CASCADE;
  DROP TABLE "tipologie_birra" CASCADE;
  DROP TABLE "_tipologie_birra_v" CASCADE;
  DROP TABLE "tipologie_liquore" CASCADE;
  DROP TABLE "_tipologie_liquore_v" CASCADE;
  DROP TABLE "tipologie_cocktail" CASCADE;
  DROP TABLE "_tipologie_cocktail_v" CASCADE;
  DROP TABLE "tipologie_bevanda" CASCADE;
  DROP TABLE "_tipologie_bevanda_v" CASCADE;
  DROP TABLE "nazioni" CASCADE;
  DROP TABLE "_nazioni_v" CASCADE;
  DROP TABLE "regioni" CASCADE;
  DROP TABLE "_regioni_v" CASCADE;
  DROP TABLE "zone" CASCADE;
  DROP TABLE "_zone_v" CASCADE;
  DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_piatti_status";
  DROP TYPE "public"."enum__piatti_v_version_status";
  DROP TYPE "public"."enum_servizi_accessori_status";
  DROP TYPE "public"."enum__servizi_accessori_v_version_status";
  DROP TYPE "public"."enum_menu_fisso_status";
  DROP TYPE "public"."enum__menu_fisso_v_version_status";
  DROP TYPE "public"."enum_vini_status";
  DROP TYPE "public"."enum__vini_v_version_status";
  DROP TYPE "public"."enum_birre_status";
  DROP TYPE "public"."enum__birre_v_version_status";
  DROP TYPE "public"."enum_liquori_status";
  DROP TYPE "public"."enum__liquori_v_version_status";
  DROP TYPE "public"."enum_cocktail_status";
  DROP TYPE "public"."enum__cocktail_v_version_status";
  DROP TYPE "public"."enum_bevande_status";
  DROP TYPE "public"."enum__bevande_v_version_status";
  DROP TYPE "public"."enum_allergeni_status";
  DROP TYPE "public"."enum__allergeni_v_version_status";
  DROP TYPE "public"."enum_categoria_menu_fisso_status";
  DROP TYPE "public"."enum__categoria_menu_fisso_v_version_status";
  DROP TYPE "public"."enum_categoria_piatti_status";
  DROP TYPE "public"."enum__categoria_piatti_v_version_status";
  DROP TYPE "public"."enum_tipologie_vino_status";
  DROP TYPE "public"."enum__tipologie_vino_v_version_status";
  DROP TYPE "public"."enum_tipologie_birra_status";
  DROP TYPE "public"."enum__tipologie_birra_v_version_status";
  DROP TYPE "public"."enum_tipologie_liquore_status";
  DROP TYPE "public"."enum__tipologie_liquore_v_version_status";
  DROP TYPE "public"."enum_tipologie_cocktail_status";
  DROP TYPE "public"."enum__tipologie_cocktail_v_version_status";
  DROP TYPE "public"."enum_tipologie_bevanda_status";
  DROP TYPE "public"."enum__tipologie_bevanda_v_version_status";
  DROP TYPE "public"."enum_nazioni_status";
  DROP TYPE "public"."enum__nazioni_v_version_status";
  DROP TYPE "public"."enum_regioni_status";
  DROP TYPE "public"."enum__regioni_v_version_status";
  DROP TYPE "public"."enum_zone_status";
  DROP TYPE "public"."enum__zone_v_version_status";
  DROP TYPE "public"."enum_users_roles";`)
}
