import { useState, useEffect } from 'react'
import { productService, saleService, syncService } from '@/lib/services'
import { Product, Sale } from '@/types'

export function useProducts(orgId: string | null) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!orgId) return

    const loadProducts = async () => {
      try {
        setLoading(true)
        const data = await productService.getAll(orgId)
        setProducts(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [orgId])

  return { products, loading, error, refetch: () => orgId && productService.getAll(orgId) }
}

export function useSales(orgId: string | null) {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!orgId) return

    const loadSales = async () => {
      try {
        setLoading(true)
        const data = await saleService.getAll(orgId)
        setSales(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    loadSales()
  }, [orgId])

  return { sales, loading, error, refetch: () => orgId && saleService.getAll(orgId) }
}

export function useSync(orgId: string | null) {
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState(syncService.getSyncStatus())

  const sync = async () => {
    if (!orgId || syncing) return

    try {
      setSyncing(true)
      await syncService.fullSync(orgId)
      setSyncStatus(syncService.getSyncStatus())
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      setSyncing(false)
    }
  }

  const initialize = async () => {
    if (!orgId) return
    
    try {
      setSyncing(true)
      await syncService.initializeOrg(orgId)
      setSyncStatus(syncService.getSyncStatus())
    } catch (error) {
      console.error('Initialize error:', error)
    } finally {
      setSyncing(false)
    }
  }

  return { syncing, syncStatus, sync, initialize }
}
