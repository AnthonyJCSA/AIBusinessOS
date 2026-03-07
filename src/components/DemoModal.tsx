'use client'

import { useState } from 'react'
import { trackModalOpen, trackWhatsAppClick } from '@/lib/tracking'

interface DemoModalProps {
  isOpen: boolean
  onClose: () => void
  whatsappUrl: string
  demoUrl?: string
  source?: string
}

export default function DemoModal({ isOpen, onClose, whatsappUrl, demoUrl = '/demo', source = 'modal' }: DemoModalProps) {
  if (!isOpen) return null

  const handleWhatsAppClick = () => {
    trackWhatsAppClick(source)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💬</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Te muestro la demo en 5 minutos por WhatsApp
          </h3>
          <p className="text-gray-600">
            Gratis y sin compromiso. Te ayudo a configurarlo para tu negocio.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700">Demo personalizada para tu negocio</span>
          </div>
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700">Te ayudo a importar tus productos</span>
          </div>
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700">Resuelvo todas tus dudas en vivo</span>
          </div>
        </div>

        <div className="space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center py-4 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
          >
            💬 Hablar por WhatsApp
          </a>
          <a
            href="/registro"
            className="block w-full text-center py-2 text-sm text-gray-500 hover:text-gray-700 transition-all"
          >
            Ver demo igual (sin asesoría)
          </a>
        </div>
      </div>
    </div>
  )
}
