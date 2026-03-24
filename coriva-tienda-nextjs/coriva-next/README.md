# Coriva Core — Tienda Virtual
## Next.js 14 + TypeScript + Supabase + Tailwind

---

## Estructura de archivos

```
├── supabase/
│   └── migrations/
│       └── 001_store_schema.sql     ← Ejecutar en Supabase SQL Editor
│
├── types/
│   └── store.ts                     ← Tipos TypeScript
│
├── lib/
│   ├── supabase/
│   │   ├── server.ts                ← Cliente Supabase (server-side)
│   │   └── store.ts                 ← Queries a Supabase
│   └── whatsapp.ts                  ← Builder de mensajes WA
│
├── hooks/
│   └── useCart.ts                   ← Estado del carrito (Zustand)
│
├── components/store/
│   ├── StoreClient.tsx              ← Wrapper client principal
│   ├── StoreHeader.tsx              ← Navbar
│   ├── StoreBanner.tsx              ← Hero banner
│   ├── StoreSidebar.tsx             ← Sidebar con categorías
│   ├── ProductGrid.tsx              ← Grid con filtros y búsqueda
│   ├── ProductCard.tsx              ← Tarjeta de producto
│   ├── CartPanel.tsx                ← Panel lateral del carrito
│   ├── ProductModal.tsx             ← Modal de detalle
│   └── StoreFooter.tsx             ← Footer
│
└── app/tienda/[slug]/
    ├── page.tsx                     ← Server Component (SSG/ISR)
    └── not-found.tsx                ← 404
```

---

## Setup paso a paso

### 1. Instalar dependencias

```bash
npm install @supabase/ssr @supabase/supabase-js zustand
```

### 2. Variables de entorno

Crea `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### 3. Ejecutar migración en Supabase

1. Ve a **Supabase Dashboard → SQL Editor**
2. Copia y ejecuta el contenido de `supabase/migrations/001_store_schema.sql`
3. Esto crea las tablas `stores`, `store_categories`, `products` con RLS habilitado
4. También inserta los datos de ejemplo de Coriva

### 4. Copiar archivos al proyecto

```
src/
├── types/store.ts
├── lib/supabase/server.ts
├── lib/supabase/store.ts
├── lib/whatsapp.ts
├── hooks/useCart.ts
├── components/store/*.tsx
└── app/tienda/[slug]/page.tsx
               └── not-found.tsx
```

### 5. Configurar Tailwind (si usas fuente personalizada)

En `tailwind.config.ts` agrega si quieres la fuente Instrument Serif:

```ts
theme: {
  extend: {
    fontFamily: {
      serif: ['Instrument Serif', 'Georgia', 'serif'],
    },
  },
},
```

Y en `app/layout.tsx`:

```tsx
import { Instrument_Serif, Geist } from 'next/font/google'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
})

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})
```

### 6. Scrollbar utilities (opcional)

Instala `tailwind-scrollbar-hide` para ocultar scrollbars en móvil:

```bash
npm install tailwind-scrollbar-hide
```

En `tailwind.config.ts`:
```ts
plugins: [require('tailwind-scrollbar-hide')],
```

---

## Uso

### Acceder a una tienda

```
/tienda/coriva        ← tienda con slug "coriva"
/tienda/mi-bodega     ← tienda con slug "mi-bodega"
```

### Crear una tienda nueva desde el sistema

En tu panel de Coriva Core, cuando un negocio activa la tienda virtual,
insertar en Supabase:

```sql
INSERT INTO stores (slug, name, whatsapp, currency, logo_emoji)
VALUES ('nombre-bodega', 'Nombre del Negocio', '51999999999', 'S/', '🛒');
```

### Agregar productos desde el sistema

Los productos se sincronizan desde la tabla `products` de Supabase.
Si tu sistema ya usa Supabase, simplemente apunta las queries a
las mismas tablas o crea una vista que mapee tus columnas existentes.

---

## Personalización

### Cambiar número de WhatsApp
En Supabase: `UPDATE stores SET whatsapp = '51999999999' WHERE slug = 'tu-slug';`

### Cambiar colores (Tailwind)
Los colores principales están en los componentes como clases Tailwind.
El verde WhatsApp es `green-500` / `green-600`.
El fondo de la tienda es `#F7F6F3` (en `app/tienda/[slug]/page.tsx`).

### Agregar emoji de producto
Actualiza la columna `emoji` en la tabla `products`.

### Deshabilitar una tienda
`UPDATE stores SET active = FALSE WHERE slug = 'tu-slug';`

---

## Flujo de compra completo

```
Cliente visita /tienda/mi-negocio
        ↓
Ve catálogo con productos reales desde Supabase
        ↓
Hace clic en un producto → Modal con detalle
        ↓
Puede:
  A) "Pedir por WhatsApp" directo (1 producto)
  B) "Agregar al pedido" → carrito lateral
        ↓
En el carrito:
  "Enviar pedido por WhatsApp" → mensaje completo con todos los items y total
        ↓
WhatsApp se abre con el mensaje pre-armado
        ↓
El dueño recibe y confirma por WhatsApp
```
