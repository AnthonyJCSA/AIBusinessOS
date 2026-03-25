# Ejemplos de Requests y Responses

## 1. POST /api/invoices — Emitir comprobante

### Request — Boleta con DNI
```json
POST /api/invoices
Content-Type: application/json

{
  "saleId": "a1b2c3d4-0000-0000-0000-000000000001",
  "orgId":  "f9e8d7c6-0000-0000-0000-000000000002",
  "clientDocType":   "DNI",
  "clientDocNumber": "12345678",
  "clientName":      "JUAN PEREZ GARCIA",
  "clientAddress":   "",
  "clientEmail":     "juan@email.com"
}
```

### Request — Factura con RUC
```json
{
  "saleId": "a1b2c3d4-0000-0000-0000-000000000001",
  "orgId":  "f9e8d7c6-0000-0000-0000-000000000002",
  "clientDocType":   "RUC",
  "clientDocNumber": "20123456789",
  "clientName":      "EMPRESA SAC",
  "clientAddress":   "AV. LIMA 123, MIRAFLORES",
  "clientEmail":     "contabilidad@empresa.com"
}
```

### Request — Nota de crédito (anulación de boleta)
```json
{
  "saleId": "a1b2c3d4-0000-0000-0000-000000000001",
  "orgId":  "f9e8d7c6-0000-0000-0000-000000000002",
  "clientDocType":   "DNI",
  "clientDocNumber": "12345678",
  "clientName":      "JUAN PEREZ GARCIA",
  "modifiesType":    "BOLETA",
  "modifiesSeries":  "B001",
  "modifiesNumber":  42,
  "creditNoteType":  1
}
```

### Response — 201 Created (éxito)
```json
{
  "invoice": {
    "id":             "uuid-del-comprobante",
    "invoice_number": "B001-00000042",
    "status":         "ACEPTADA",
    "sunat_status":   "ACEPTADA",
    "pdf_url":        "https://nubefact.com/cpe/pdf/...",
    "xml_url":        "https://nubefact.com/cpe/xml/...",
    "total":          118.00
  },
  "nubefact": {
    "success":          true,
    "accepted":         true,
    "invoiceNumber":    "B001-00000042",
    "pdfUrl":           "https://nubefact.com/cpe/pdf/...",
    "xmlUrl":           "https://nubefact.com/cpe/xml/...",
    "cdrUrl":           "https://nubefact.com/cpe/cdr/...",
    "hash":             "abc123...",
    "sunatCode":        "0",
    "sunatDescription": "La Boleta numero B001-00000042 ha sido aceptada"
  }
}
```

### Response — 422 Conflict (ya emitido)
```json
{
  "error": "Esta venta ya tiene un comprobante emitido",
  "code":  "CONFLICT"
}
```

### Response — 400 Validation Error
```json
{
  "error": "clientDocNumber para RUC debe tener 11 dígitos",
  "code":  "VALIDATION_ERROR"
}
```

### Response — 502 Integration Error (Nubefact rechazó)
```json
{
  "error": "El número de RUC del emisor no está registrado en SUNAT",
  "code":  "INTEGRATION_ERROR"
}
```

---

## 2. GET /api/dni/:numero — Buscar por DNI

### Request
```
GET /api/dni/12345678
```

### Response — 200 OK
```json
{
  "dni":             "12345678",
  "nombres":         "JUAN CARLOS",
  "apellidoPaterno": "PEREZ",
  "apellidoMaterno": "GARCIA",
  "nombreCompleto":  "JUAN CARLOS PEREZ GARCIA"
}
```

### Response — 404 Not Found
```json
{
  "error": "Documento no encontrado en el padrón",
  "code":  "NOT_FOUND"
}
```

### Response — 400 Validation Error
```json
{
  "error": "El DNI debe tener exactamente 8 dígitos numéricos",
  "code":  "INVALID_FORMAT"
}
```

### Response — 503 Timeout
```json
{
  "error": "Tiempo de espera agotado al consultar Perú API",
  "code":  "TIMEOUT"
}
```

---

## 3. GET /api/ruc/:numero — Buscar por RUC

### Request
```
GET /api/ruc/20123456789
```

### Response — 200 OK
```json
{
  "ruc":         "20123456789",
  "razonSocial": "EMPRESA PERUANA SAC",
  "direccion":   "AV. JAVIER PRADO ESTE 123 LIMA - LIMA - SAN ISIDRO",
  "estado":      "ACTIVO",
  "condicion":   "HABIDO",
  "departamento": "LIMA",
  "provincia":    "LIMA",
  "distrito":     "SAN ISIDRO"
}
```

### Response — 400 Validation Error (RUC inválido)
```json
{
  "error": "RUC inválido: debe comenzar con 10 o 20",
  "code":  "INVALID_FORMAT"
}
```

---

## 4. GET /api/invoices/:id — Consultar comprobante

### Request
```
GET /api/invoices/uuid-del-comprobante
```

### Response — 200 OK
```json
{
  "id":             "uuid-del-comprobante",
  "invoice_number": "F001-00000015",
  "status":         "ACEPTADA",
  "sunat_status":   "ACEPTADA",
  "pdf_url":        "https://nubefact.com/cpe/pdf/...",
  "xml_url":        "https://nubefact.com/cpe/xml/...",
  "total":          590.00
}
```

---

## 5. Variables de entorno requeridas

```env
# Nubefact — server-side ONLY (sin NEXT_PUBLIC_)
NUBEFACT_API_URL=https://api.nubefact.com/api/v1/20123456789
NUBEFACT_TOKEN=tu_token_nubefact_aqui

# Perú API — server-side ONLY (sin NEXT_PUBLIC_)
# Whitelist la IP de salida de Vercel en el dashboard de Perú API
PERUAPI_BASE_URL=https://peruapi.com/api
PERUAPI_KEY=tu_api_key_peruapi_aqui
PERUAPI_ALLOWED_IP=38.253.149.54
```

## 6. Payload Nubefact generado internamente (para debug)

```json
{
  "operacion": "generar_comprobante",
  "tipo_de_comprobante": 2,
  "serie": "B001",
  "numero": 42,
  "sunat_transaction": 1,
  "cliente_tipo_de_documento": 1,
  "cliente_numero_de_documento": "12345678",
  "cliente_denominacion": "JUAN PEREZ GARCIA",
  "cliente_direccion": "",
  "cliente_email": "juan@email.com",
  "fecha_de_emision": "15-01-2025",
  "moneda": 1,
  "porcentaje_de_igv": 18,
  "descuento_global": 0,
  "total_descuento": 0,
  "total_anticipo": 0,
  "total_gravada": 100.00,
  "total_inafecta": 0,
  "total_exonerada": 0,
  "total_igv": 18.00,
  "total_gratuita": 0,
  "total_otros_cargos": 0,
  "total": 118.00,
  "enviar_automaticamente_a_la_sunat": true,
  "enviar_automaticamente_al_cliente": true,
  "items": [
    {
      "unidad_de_medida": "NIU",
      "codigo": "PROD001",
      "descripcion": "Producto de ejemplo",
      "cantidad": 2,
      "valor_unitario": 50.00,
      "precio_unitario": 59.00,
      "descuento": 0,
      "subtotal": 100.00,
      "tipo_de_igv": 1,
      "igv": 18.00,
      "total": 118.00,
      "anticipo_regularizacion": false
    }
  ]
}
```
