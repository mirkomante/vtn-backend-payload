// Importatore per Categorie (Piatti e Menu Fisso)

import type { Payload } from 'payload'
import type { BackendCategoriaPiatti, BackendCategoriaMenuFisso, MigrationStats } from '../types'
import type { IDMapper } from '../mapper'

export async function importCategoriePiatti(
  backendCategorie: BackendCategoriaPiatti[],
  payload: Payload,
  idMap: IDMapper,
): Promise<MigrationStats> {
  console.log(`📦 Importazione Categorie Piatti (${backendCategorie.length})...`)

  const stats: MigrationStats = {
    collection: 'categoria-piatti',
    imported: 0,
    skipped: 0,
    errors: 0,
  }

  for (const categoria of backendCategorie) {
    try {
      const created = await payload.create({
        collection: 'categoria-piatti',
        data: {
          nome: categoria.nome,
          descrizione: categoria.descrizione || '',
          inLista: categoria.inLista !== undefined ? categoria.inLista : true,
          _status: 'published',
        },
      })

      idMap.set('categoria-piatti', categoria.id, created.id as number)
      stats.imported++
    } catch (error) {
      console.error(`   ⚠️  Errore importando categoria piatti ${categoria.nome}:`, error)
      stats.errors++
    }
  }

  console.log(`   ✅ Categorie Piatti: ${stats.imported} importate, ${stats.errors} errori`)
  return stats
}

export async function importCategorieMenuFisso(
  backendCategorie: BackendCategoriaMenuFisso[],
  payload: Payload,
  idMap: IDMapper,
): Promise<MigrationStats> {
  console.log(`📦 Importazione Categorie Menu Fisso (${backendCategorie.length})...`)

  const stats: MigrationStats = {
    collection: 'categoria-menu-fisso',
    imported: 0,
    skipped: 0,
    errors: 0,
  }

  for (const categoria of backendCategorie) {
    try {
      const created = await payload.create({
        collection: 'categoria-menu-fisso',
        data: {
          nome: categoria.nome,
          descrizione: categoria.descrizione || '',
          inLista: categoria.inLista !== undefined ? categoria.inLista : true,
          _status: 'published',
        },
      })

      idMap.set('categoria-menu-fisso', categoria.id, created.id as number)
      stats.imported++
    } catch (error) {
      console.error(`   ⚠️  Errore importando categoria menu fisso ${categoria.nome}:`, error)
      stats.errors++
    }
  }

  console.log(`   ✅ Categorie Menu Fisso: ${stats.imported} importate, ${stats.errors} errori`)
  return stats
}
