import { productService } from './product.service'
import { saleService } from './sale.service'
import { cashService } from './cash.service'
import { supabase } from '../supabase'
import { Product, Sale } from '@/types'

const SYNC_KEY = 'coriva_sync_status'

interface SyncStatus {
  lastSync?: string
  productsSynced: boolean
  salesSynced: boolean
}

export const syncService = {
  getSyncStatus(): SyncStatus {
    const status = localStorage.getItem(SYNC_KEY)
    return status ? JSON.parse(status) : { productsSynced: false, salesSynced: false }
  },

  setSyncStatus(status: Partial<SyncStatus>) {
    const current = this.getSyncStatus()
    const updated = { ...current, ...status, lastSync: new Date().toISOString() }
    localStorage.setItem(SYNC_KEY, JSON.stringify(updated))
  },

  async syncProducts(orgId: string): Promise<void> {
    try {
      // Verificar si Supabase está configurado
      if (!supabase) {
        console.log('⚠️ Supabase no configurado, usando solo localStorage')
        return
      }
      
      // Verificar si ya tiene productos en Supabase
      const hasProducts = await productService.hasProducts(orgId)
      
      if (!hasProducts) {
        // Obtener productos de localStorage
        const localProducts = localStorage.getItem('coriva_products')
        if (localProducts) {
          const products: Product[] = JSON.parse(localProducts)
          
          // Migrar a Supabase
          await productService.migrateFromLocalStorage(orgId, products)
          console.log(`✅ ${products.length} productos migrados a Supabase`)
        }
      }

      // Cargar productos de Supabase a localStorage (cache)
      const supabaseProducts = await productService.getAll(orgId)
      localStorage.setItem('coriva_products', JSON.stringify(supabaseProducts))
      
      this.setSyncStatus({ productsSynced: true })
    } catch (error) {
      console.error('Error syncing products:', error)
      throw error
    }
  },

  async syncSales(orgId: string): Promise<void> {
    try {
      // Obtener ventas de localStorage que no estén en Supabase
      const localSales = localStorage.getItem('coriva_sales')
      if (localSales) {
        const sales: Sale[] = JSON.parse(localSales)
        
        // Aquí podrías implementar lógica para sincronizar ventas pendientes
        // Por ahora solo marcamos como sincronizado
      }

      // Cargar ventas de Supabase a localStorage (cache)
      const supabaseSales = await saleService.getAll(orgId)
      localStorage.setItem('coriva_sales', JSON.stringify(supabaseSales))
      
      this.setSyncStatus({ salesSynced: true })
    } catch (error) {
      console.error('Error syncing sales:', error)
      throw error
    }
  },

  async fullSync(orgId: string): Promise<void> {
    console.log('🔄 Iniciando sincronización completa...')
    
    await this.syncProducts(orgId)
    await this.syncSales(orgId)
    
    console.log('✅ Sincronización completa')
  },

  async initializeOrg(orgId: string): Promise<void> {
    // Verificar si Supabase está configurado
    if (!supabase) {
      console.log('⚠️ Supabase no configurado, usando solo localStorage')
      return
    }
    
    const status = this.getSyncStatus()
    
    if (!status.productsSynced) {
      await this.syncProducts(orgId)
    }
    
    if (!status.salesSynced) {
      await this.syncSales(orgId)
    }
  }
}
