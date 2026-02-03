// Sistema di mappatura ID vecchi → nuovi per mantenere le relazioni

export class IDMapper {
  private map: Map<string, number>

  constructor() {
    this.map = new Map()
  }

  /**
   * Salva la mappatura da vecchio ID a nuovo ID
   * @param collection Nome della collection
   * @param oldId ID del backend vecchio (può essere string UUID o number)
   * @param newId ID generato da Payload (sempre number)
   */
  set(collection: string, oldId: number | string, newId: number): void {
    const key = `${collection}:${oldId}`
    this.map.set(key, newId)
  }

  /**
   * Recupera il nuovo ID dato il vecchio
   * @param collection Nome della collection
   * @param oldId ID del backend vecchio
   * @returns Nuovo ID Payload (number) o undefined se non trovato
   */
  get(collection: string, oldId: number | string): number | undefined {
    const key = `${collection}:${oldId}`
    return this.map.get(key)
  }

  /**
   * Verifica se esiste una mappatura
   */
  has(collection: string, oldId: number | string): boolean {
    const key = `${collection}:${oldId}`
    return this.map.has(key)
  }

  /**
   * Ottiene tutte le mappature per una collection
   */
  getByCollection(collection: string): Map<string, number> {
    const result = new Map<string, number>()
    const prefix = `${collection}:`

    for (const [key, value] of this.map.entries()) {
      if (key.startsWith(prefix)) {
        const oldId = key.substring(prefix.length)
        result.set(oldId, value)
      }
    }

    return result
  }

  /**
   * Restituisce il numero totale di mappature
   */
  size(): number {
    return this.map.size
  }

  /**
   * Pulisce tutte le mappature
   */
  clear(): void {
    this.map.clear()
  }

  /**
   * Restituisce statistiche sulle mappature
   */
  getStats(): Record<string, number> {
    const stats: Record<string, number> = {}

    for (const key of this.map.keys()) {
      const collection = key.split(':')[0]
      stats[collection] = (stats[collection] || 0) + 1
    }

    return stats
  }
}
