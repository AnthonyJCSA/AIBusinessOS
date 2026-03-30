/**
 * OPPF/SNIPPF Service
 * Sistema Nacional de Información de Precios de Productos Farmacéuticos
 * Base legal: D.S. N° 014-2011-SA, R.M. N° 040-2010/MINSA
 */

import { supabase } from '../supabase'

export interface OPPFReportRow {
  CodEstab: string
  CodProd: string
  Precio1: number
  Precio2: number | null
}

export interface OPPFReportParams {
  orgId: string
  month?: number
  year?: number
}

/**
 * Genera datos del reporte OPPF/SNIPPF
 * @returns Array de filas con formato DIGEMID
 */
export async function generateOPPFReport(params: OPPFReportParams): Promise<OPPFReportRow[]> {
  const { orgId, month, year } = params

  const { data, error } = await supabase.rpc('generate_oppf_report', {
    p_org_id: orgId,
    p_month: month || new Date().getMonth() + 1,
    p_year: year || new Date().getFullYear()
  })

  if (error) {
    console.error('Error generando reporte OPPF:', error)
    throw new Error(`Error al generar reporte OPPF: ${error.message}`)
  }

  if (!data || data.length === 0) {
    throw new Error('No hay productos con código DIGEMID y stock disponible para reportar')
  }

  // Mapear a formato esperado
  return data.map((row: any) => ({
    CodEstab: row.cod_estab,
    CodProd: row.cod_prod,
    Precio1: parseFloat(row.precio_1),
    Precio2: row.precio_2 ? parseFloat(row.precio_2) : null
  }))
}

/**
 * Valida que la organización tenga configuración DIGEMID
 */
export async function validateOPPFConfiguration(orgId: string): Promise<{
  valid: boolean
  message?: string
}> {
  const { data: org, error } = await supabase
    .from('corivacore_organizations')
    .select('digemid_establishment_code, business_type')
    .eq('id', orgId)
    .single()

  if (error || !org) {
    return { valid: false, message: 'No se pudo verificar la organización' }
  }

  if (!org.digemid_establishment_code) {
    return { 
      valid: false, 
      message: 'Debe configurar el código de establecimiento DIGEMID en Configuración' 
    }
  }

  if (org.business_type !== 'pharmacy') {
    return { 
      valid: false, 
      message: 'El reporte OPPF/SNIPPF solo aplica para farmacias y boticas' 
    }
  }

  return { valid: true }
}

/**
 * Obtiene estadísticas del reporte
 */
export async function getOPPFStats(orgId: string): Promise<{
  totalProducts: number
  productsWithDigemidCode: number
  productsInStock: number
  productsReportable: number
}> {
  const { data: products, error } = await supabase
    .from('corivacore_products')
    .select('id, digemid_code, stock, is_active')
    .eq('org_id', orgId)

  if (error || !products) {
    return {
      totalProducts: 0,
      productsWithDigemidCode: 0,
      productsInStock: 0,
      productsReportable: 0
    }
  }

  return {
    totalProducts: products.length,
    productsWithDigemidCode: products.filter(p => p.digemid_code).length,
    productsInStock: products.filter(p => p.stock > 0 && p.is_active).length,
    productsReportable: products.filter(p => 
      p.digemid_code && p.stock > 0 && p.is_active
    ).length
  }
}

export const oppfService = {
  generateOPPFReport,
  validateOPPFConfiguration,
  getOPPFStats
}
