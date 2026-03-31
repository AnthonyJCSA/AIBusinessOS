import QRCode from 'qrcode'

export interface ProductQRData {
  id: string
  sku: string
  name: string
  price: number
}

/**
 * Genera un código QR para un producto
 * @param product Datos del producto
 * @returns Promise con la imagen del QR en base64
 */
export async function generateProductQR(product: ProductQRData): Promise<string> {
  try {
    // Crear JSON con datos del producto
    const qrData = JSON.stringify({
      type: 'product',
      id: product.id,
      sku: product.sku,
      name: product.name,
      price: product.price,
    })

    // Generar QR code
    const qrImage = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })

    return qrImage
  } catch (error) {
    console.error('Error generando QR:', error)
    throw new Error('No se pudo generar el código QR')
  }
}

/**
 * Decodifica datos de un QR escaneado
 * @param qrData String del QR escaneado
 * @returns Datos del producto o null si es inválido
 */
export function decodeProductQR(qrData: string): ProductQRData | null {
  try {
    const data = JSON.parse(qrData)
    if (data.type === 'product' && data.id && data.sku) {
      return {
        id: data.id,
        sku: data.sku,
        name: data.name,
        price: data.price,
      }
    }
    return null
  } catch (error) {
    return null
  }
}

/**
 * Descarga el código QR como imagen
 * @param qrImage Base64 del QR
 * @param filename Nombre del archivo
 */
export function downloadQR(qrImage: string, filename: string) {
  const link = document.createElement('a')
  link.href = qrImage
  link.download = `${filename}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
