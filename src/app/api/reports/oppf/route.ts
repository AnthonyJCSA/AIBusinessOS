/**
 * API: Reporte OPPF/SNIPPF
 * GET /api/reports/oppf?orgId=xxx&month=4&year=2024
 * Genera archivo Excel con precios de medicamentos para DIGEMID
 */

import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { oppfService } from '@/lib/services/oppf.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('orgId')
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined

    if (!orgId) {
      return NextResponse.json(
        { error: 'Parámetro orgId requerido' },
        { status: 400 }
      )
    }

    // Validar configuración
    const validation = await oppfService.validateOPPFConfiguration(orgId)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 }
      )
    }

    // Generar datos del reporte
    const reportData = await oppfService.generateOPPFReport({
      orgId,
      month,
      year
    })

    // Crear workbook Excel
    const worksheet = XLSX.utils.json_to_sheet(reportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte OPPF')

    // Generar buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    })

    // Nombre del archivo
    const currentMonth = month || new Date().getMonth() + 1
    const currentYear = year || new Date().getFullYear()
    const fileName = `OPPF_${currentYear}_${String(currentMonth).padStart(2, '0')}.xlsx`

    // Retornar archivo
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error: any) {
    console.error('Error generando reporte OPPF:', error)
    return NextResponse.json(
      { error: error.message || 'Error al generar reporte OPPF' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/reports/oppf/stats
 * Obtiene estadísticas del reporte sin generar el archivo
 */
export async function POST(request: NextRequest) {
  try {
    const { orgId } = await request.json()

    if (!orgId) {
      return NextResponse.json(
        { error: 'Parámetro orgId requerido' },
        { status: 400 }
      )
    }

    const validation = await oppfService.validateOPPFConfiguration(orgId)
    const stats = await oppfService.getOPPFStats(orgId)

    return NextResponse.json({
      valid: validation.valid,
      message: validation.message,
      stats
    })

  } catch (error: any) {
    console.error('Error obteniendo stats OPPF:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
