# 🚀 Guía de Implementación MVP Multi-Tenant

## ✅ Archivos Creados

### 1. Base de Datos
- `database/corivacore-mvp-schema.sql` - Schema completo con prefijo corivacore_

### 2. Tipos
- `src/types/database.types.ts` - Tipos TypeScript para Supabase

### 3. Servicios
- `src/lib/services/product.service.ts` - CRUD productos
- `src/lib/services/sale.service.ts` - Registro de ventas
- `src/lib/services/cash.service.ts` - Movimientos de caja
- `src/lib/services/customer.service.ts` - Gestión clientes
- `src/lib/services/sync.service.ts` - Sincronización localStorage ↔ Supabase
- `src/lib/services/index.ts` - Exportaciones

### 4. Hooks
- `src/hooks/useSupabaseData.ts` - Hooks React para consumir data

## 📋 Pasos de Implementación

### Paso 1: Crear Tablas en Supabase (5 min)

1. Ir a Supabase Dashboard
2. SQL Editor > New Query
3. Copiar y pegar `database/corivacore-mvp-schema.sql`
4. Ejecutar
5. Verificar que se crearon 5 tablas:
   - corivacore_products
   - corivacore_customers
   - corivacore_sales
   - corivacore_sale_items
   - corivacore_cash_movements

### Paso 2: Agregar Función de Stock (SQL adicional)

```sql
-- Función para decrementar stock
CREATE OR REPLACE FUNCTION decrement_product_stock(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE corivacore_products
  SET stock = stock - p_quantity
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;
```

### Paso 3: Integrar en Dashboard (Ejemplo)

```typescript
// En tu componente de dashboard
import { useEffect } from 'react'
import { useSync } from '@/hooks/useSupabaseData'

export default function Dashboard() {
  const orgId = 'tu-org-id' // Obtener del contexto/auth
  const { initialize, syncing, syncStatus } = useSync(orgId)

  useEffect(() => {
    // Inicializar al cargar
    initialize()
  }, [orgId])

  if (syncing) {
    return <div>Sincronizando datos...</div>
  }

  return (
    <div>
      {/* Tu UI actual */}
    </div>
  )
}
```

### Paso 4: Migrar Productos (Automático)

```typescript
// El syncService automáticamente:
// 1. Verifica si org tiene productos en Supabase
// 2. Si no tiene, migra desde localStorage
// 3. Actualiza localStorage con data de Supabase
```

### Paso 5: Registrar Ventas

```typescript
import { saleService, cashService } from '@/lib/services'

async function processSale(orgId: string, cart: CartItem[]) {
  try {
    // 1. Crear venta
    const sale = await saleService.create(orgId, {
      customerName: 'Cliente',
      receiptType: 'BOLETA',
      paymentMethod: 'EFECTIVO',
      subtotal: 100,
      tax: 18,
      total: 118,
      items: cart
    })

    // 2. Registrar en caja
    await cashService.registerSale(orgId, sale.id, sale.total)

    // 3. Actualizar localStorage (cache)
    const sales = await saleService.getAll(orgId)
    localStorage.setItem('coriva_sales', JSON.stringify(sales))

    return sale
  } catch (error) {
    console.error('Error processing sale:', error)
    throw error
  }
}
```

## 🔄 Flujo de Datos

### Lectura (Híbrido)
```
1. Leer de localStorage (rápido)
2. Si no existe, leer de Supabase
3. Actualizar localStorage
```

### Escritura (Supabase First)
```
1. Escribir en Supabase
2. Actualizar localStorage
3. UI se actualiza
```

## 🧪 Testing

### Test 1: Migración de Productos
```typescript
import { syncService } from '@/lib/services'

// Ejecutar una vez por org
await syncService.syncProducts('org-id-123')
```

### Test 2: Crear Venta
```typescript
import { saleService } from '@/lib/services'

const sale = await saleService.create('org-id-123', {
  customerName: 'Test',
  receiptType: 'BOLETA',
  paymentMethod: 'EFECTIVO',
  subtotal: 100,
  tax: 18,
  total: 118,
  items: [
    {
      id: 'prod-1',
      code: 'P001',
      name: 'Producto Test',
      quantity: 2,
      price: 50
    }
  ]
})

console.log('Venta creada:', sale)
```

### Test 3: Verificar Stock
```sql
-- En Supabase SQL Editor
SELECT * FROM corivacore_products WHERE org_id = 'tu-org-id';
```

## 🔧 Configuración de Supabase Client

Verificar que `src/lib/supabase.ts` tenga:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
```

## 📊 Monitoreo

### Ver Ventas en Tiempo Real
```sql
SELECT 
  s.sale_number,
  s.total,
  s.created_at,
  COUNT(si.id) as items_count
FROM corivacore_sales s
LEFT JOIN corivacore_sale_items si ON si.sale_id = s.id
WHERE s.org_id = 'tu-org-id'
GROUP BY s.id
ORDER BY s.created_at DESC
LIMIT 10;
```

### Ver Stock Actual
```sql
SELECT 
  name,
  stock,
  min_stock,
  CASE 
    WHEN stock <= min_stock THEN 'BAJO'
    ELSE 'OK'
  END as status
FROM corivacore_products
WHERE org_id = 'tu-org-id'
ORDER BY stock ASC;
```

## 🚨 Troubleshooting

### Error: "relation does not exist"
- Verificar que ejecutaste el SQL en Supabase
- Verificar prefijo `corivacore_` en nombres de tablas

### Error: "RLS policy violation"
- Las políticas están en modo permisivo (true)
- Ajustar según tu sistema de auth

### Productos no se migran
- Verificar que localStorage tenga 'coriva_products'
- Ejecutar manualmente: `syncService.syncProducts(orgId)`

## 📈 Próximos Pasos

1. ✅ Ejecutar SQL en Supabase
2. ✅ Integrar syncService en login/dashboard
3. ✅ Probar migración de productos
4. ✅ Probar registro de venta
5. ✅ Verificar stock se actualiza
6. ✅ Monitorear en Supabase Dashboard

## 🎯 Resultado Esperado

- Productos migrados de localStorage a Supabase
- Ventas guardadas en Supabase con items
- Stock actualizado automáticamente
- Caja registra movimientos
- App funciona igual pero con persistencia real

---

**Tiempo estimado:** 30 minutos
**Complejidad:** Media
**Impacto:** Alto (MVP vendible)
