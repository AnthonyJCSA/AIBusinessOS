import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-svh bg-[#F7F6F3] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-5 opacity-30">🏪</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tienda no encontrada</h1>
        <p className="text-stone-500 mb-6">
          Esta tienda no existe o no está disponible en este momento.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors"
        >
          ← Volver al inicio
        </Link>
      </div>
    </main>
  )
}
