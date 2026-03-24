'use client'
import { useState, useEffect } from 'react'

export interface AIInsights {
  summary: string
  trend: 'up' | 'down' | 'stable'
  score: number
  actions: { priority: 'high' | 'medium' | 'low'; icon: string; text: string }[]
  alerts: { type: string; icon: string; text: string }[]
  highlight: string
}

const CACHE_KEY = (orgId: string) => `coriva_insights_${orgId}_${new Date().toISOString().split('T')[0]}`
const CACHE_TTL = 15 * 60 * 1000 // 15 minutos

export function useAIInsights(orgId: string | undefined, businessType: string) {
  const [insights, setInsights] = useState<AIInsights | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!orgId) return

    // Intentar desde caché primero
    try {
      const cached = sessionStorage.getItem(CACHE_KEY(orgId))
      if (cached) {
        const { data, ts } = JSON.parse(cached)
        if (Date.now() - ts < CACHE_TTL) {
          setInsights(data)
          return
        }
      }
    } catch {}

    const fetch_ = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/ai/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orgId, businessType }),
        })
        if (!res.ok) {
          // Si OpenAI no está configurado, fallar silenciosamente
          setLoading(false)
          return
        }
        const { insights: data } = await res.json()
        if (!data) { setLoading(false); return }
        setInsights(data)
        sessionStorage.setItem(CACHE_KEY(orgId), JSON.stringify({ data, ts: Date.now() }))
      } catch {
        // Fallar silenciosamente — insights son opcionales
      } finally {
        setLoading(false)
      }
    }

    fetch_()
  }, [orgId, businessType])

  const refresh = () => {
    if (!orgId) return
    try { sessionStorage.removeItem(CACHE_KEY(orgId)) } catch {}
    setInsights(null)
    setLoading(true)
    fetch('/api/ai/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId, businessType }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (!json?.insights) return
        setInsights(json.insights)
        sessionStorage.setItem(CACHE_KEY(orgId), JSON.stringify({ data: json.insights, ts: Date.now() }))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  return { insights, loading, error, refresh }
}
