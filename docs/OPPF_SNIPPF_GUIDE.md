# Reporte OPPF/SNIPPF — DIGEMID

## 📋 Descripción

Sistema de generación automática de reportes de precios de medicamentos para el **Observatorio Peruano de Productos Farmacéuticos (OPPF)** y el **Sistema Nacional de Información de Precios de Productos Farmacéuticos (SNIPPF)** de DIGEMID.

## 📜 Base Legal

- **D.S. N° 014-2011-SA**: Reglamento de Establecimientos Farmacéuticos
- **R.M. N° 040-2010/MINSA**: Aprobación del SNIPPF
- **Directiva Administrativa N° 176-MINSA/DIGEMID V.01**: Procedimientos de reporte

## 🎯 Obligación

Todos los establecimientos farmacéuticos (farmacias y boticas) que comercializan medicamentos están **obligados** a reportar mensualmente sus precios al SNIPPF.

## 📊 Formato del Reporte

El archivo Excel generado contiene 4 columnas:

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| `CodEstab` | Código del establecimiento DIGEMID | `12345678` |
| `CodProd` | Código del producto DIGEMID | `MED-001234` |
| `Precio1` | Precio de empaque completo | `25.50` |
| `Precio2` | Precio unitario (si permite fraccionamiento) | `2.50` o `null` |

## 🚀 Configuración Inicial

### 1. Configurar Código de Establecimiento

1. Ir a **Configuración** → **Datos del Negocio**
2. Buscar el campo **"Código DIGEMID"**
3. Ingresar el código de establecimiento asignado por DIGEMID
4. Guardar cambios

### 2. Asignar Códigos DIGEMID a Productos

Para cada producto farmacéutico:

1. Ir a **Inventario** → Seleccionar producto → **Editar**
2. Completar los siguientes campos:
   - **Código DIGEMID**: Código del producto en el registro DIGEMID
   - **Precio Unitario**: Solo si el producto permite fraccionamiento
   - **Permite Fraccionamiento**: Marcar checkbox si aplica
3. Guardar cambios

## 📥 Generar Reporte

1. Ir a **Reportes** → Tab **"OPPF/SNIPPF"**
2. Seleccionar **mes** y **año** del reporte
3. Hacer clic en **"Descargar Excel"**
4. El archivo se descargará automáticamente con el nombre: `OPPF_YYYY_MM.xlsx`

## 📤 Subir a DIGEMID

1. Ingresar al portal: **opm-digemid.minsa.gob.pe**
2. Login con el **RUC del establecimiento** como usuario
3. Navegar a la sección de carga de reportes
4. Subir el archivo Excel generado
5. Confirmar la carga

## ⚠️ Validaciones

El sistema valida automáticamente:

- ✅ Tipo de negocio debe ser **"Farmacia"** o **"Botica"**
- ✅ Código de establecimiento DIGEMID configurado
- ✅ Solo productos con código DIGEMID asignado
- ✅ Solo productos con stock disponible (stock > 0)
- ✅ Solo productos activos

## 📊 Estadísticas

El módulo muestra:

- **Total Productos**: Todos los productos en inventario
- **Con Código DIGEMID**: Productos con código asignado
- **En Stock**: Productos con stock disponible
- **Reportables**: Productos que cumplen todos los criterios

## 🔧 Implementación Técnica

### Migración SQL

```sql
-- database/migrations/012_oppf_snippf.sql
ALTER TABLE corivacore_products
ADD COLUMN digemid_code VARCHAR(50),
ADD COLUMN unit_price DECIMAL(10,2),
ADD COLUMN allows_fractionation BOOLEAN DEFAULT false;

ALTER TABLE corivacore_organizations
ADD COLUMN digemid_establishment_code VARCHAR(50);
```

### RPC Supabase

```sql
CREATE FUNCTION generate_oppf_report(p_org_id UUID, p_month INTEGER, p_year INTEGER)
RETURNS TABLE (cod_estab VARCHAR, cod_prod VARCHAR, precio_1 DECIMAL, precio_2 DECIMAL)
```

### API Endpoint

- **GET** `/api/reports/oppf?orgId=xxx&month=4&year=2024`
  - Genera y descarga archivo Excel
- **POST** `/api/reports/oppf/stats`
  - Obtiene estadísticas sin generar archivo

### Servicio

```typescript
// src/lib/services/oppf.service.ts
export const oppfService = {
  generateOPPFReport,
  validateOPPFConfiguration,
  getOPPFStats
}
```

### Componente UI

```typescript
// src/modules/reports/components/OPPFReport.tsx
<OPPFReport orgId={orgId} />
```

## 📅 Frecuencia

El reporte debe generarse y subirse **mensualmente** a DIGEMID.

## 🆘 Soporte

Para consultas sobre el reporte OPPF/SNIPPF:

- **Email**: soporte@corivape.com
- **WhatsApp**: +51 913 916 967
- **DIGEMID**: https://www.digemid.minsa.gob.pe

## 📚 Referencias

- [Portal OPPF DIGEMID](https://opm-digemid.minsa.gob.pe)
- [Directiva Administrativa N° 176](https://www.digemid.minsa.gob.pe)
- [D.S. N° 014-2011-SA](https://www.gob.pe/institucion/minsa/normas-legales/244116-014-2011-sa)
