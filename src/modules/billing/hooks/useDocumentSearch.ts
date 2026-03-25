'use client'
import { useState } from 'react'
import { DniResult, RucResult } from '@/lib/integrations/peruapi/peruapi.types'

type SearchState<T> = {
  data: T | null
  loading: boolean
  error: string | null
}

export function useDniSearch() {
  const [state, setState] = useState<SearchState<DniResult>>({ data: null, loading: false, error: null })

  async function search(dni: string) {
    if (!/^\d{8}$/.test(dni)) {
      setState(s => ({ ...s, error: 'DNI debe tener 8 dígitos' }))
      return null
    }
    setState({ data: null, loading: true, error: null })
    try {
      const res = await fetch(`/api/dni/${dni}`)
      const json = await res.json()
      if (!res.ok) {
        setState({ data: null, loading: false, error: json.error ?? 'Error al buscar DNI' })
        return null
      }
      setState({ data: json, loading: false, error: null })
      return json as DniResult
    } catch {
      setState({ data: null, loading: false, error: 'Error de conexión' })
      return null
    }
  }

  function reset() { setState({ data: null, loading: false, error: null }) }

  return { ...state, search, reset }
}

export function useRucSearch() {
  const [state, setState] = useState<SearchState<RucResult>>({ data: null, loading: false, error: null })

  async function search(ruc: string) {
    if (!/^\d{11}$/.test(ruc)) {
      setState(s => ({ ...s, error: 'RUC debe tener 11 dígitos' }))
      return null
    }
    setState({ data: null, loading: true, error: null })
    try {
      const res = await fetch(`/api/ruc/${ruc}`)
      const json = await res.json()
      if (!res.ok) {
        setState({ data: null, loading: false, error: json.error ?? 'Error al buscar RUC' })
        return null
      }
      setState({ data: json, loading: false, error: null })
      return json as RucResult
    } catch {
      setState({ data: null, loading: false, error: 'Error de conexión' })
      return null
    }
  }

  function reset() { setState({ data: null, loading: false, error: null }) }

  return { ...state, search, reset }
}
