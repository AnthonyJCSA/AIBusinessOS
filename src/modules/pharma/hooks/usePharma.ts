'use client'
import { useState, useEffect, useCallback } from 'react'
import { pharmaService, CreateBatchDTO } from '../services/pharma.service'
import type { DBProductBatch, ExpiringBatchRow } from '@/types/pharma.types'

// ── useBatches ────────────────────────────────────────────────────────────────

export function useBatches(orgId: string, productId: string) {
  const [batches, setBatches]   = useState<DBProductBatch[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!orgId || !productId) return
    setLoading(true)
    try {
      setBatches(await pharmaService.getBatches(orgId, productId))
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [orgId, productId])

  useEffect(() => { load() }, [load])

  async function addBatch(dto: Omit<CreateBatchDTO, 'orgId' | 'productId'>) {
    await pharmaService.createBatch({ ...dto, orgId, productId })
    await load()
  }

  return { batches, loading, error, refresh: load, addBatch }
}

// ── useExpiryAlerts ───────────────────────────────────────────────────────────

export function useExpiryAlerts(orgId: string, days = 30) {
  const [batches, setBatches]   = useState<ExpiringBatchRow[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!orgId) return
    setLoading(true)
    try {
      setBatches(await pharmaService.getExpiringBatches(orgId, days))
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [orgId, days])

  useEffect(() => { load() }, [load])

  const critical = batches.filter(b => pharmaService.classifyExpiry(b.days_left) === 'critical')
  const warning  = batches.filter(b => pharmaService.classifyExpiry(b.days_left) === 'warning')
  const expired  = batches.filter(b => pharmaService.classifyExpiry(b.days_left) === 'expired')

  return { batches, critical, warning, expired, loading, error, refresh: load }
}
