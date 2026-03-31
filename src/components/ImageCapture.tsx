'use client'

import { useState, useRef } from 'react'

interface ImageCaptureProps {
  currentImage?: string | null
  onImageCapture: (imageData: string) => void
  onImageRemove: () => void
}

export default function ImageCapture({ currentImage, onImageCapture, onImageRemove }: ImageCaptureProps) {
  const [showCamera, setShowCamera] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: 640, height: 480 } 
      })
      setStream(mediaStream)
      setShowCamera(true)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Error al acceder a la cámara:', error)
      alert('No se pudo acceder a la cámara. Verifica los permisos.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setShowCamera(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        onImageCapture(imageData)
        stopCamera()
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar 5MB')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageData = event.target?.result as string
        onImageCapture(imageData)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>
        Imagen del Producto
      </label>

      {/* Imagen actual */}
      {currentImage && !showCamera && (
        <div className="relative inline-block">
          <img 
            src={currentImage} 
            alt="Producto" 
            className="w-32 h-32 object-cover rounded-lg border-2"
            style={{ borderColor: 'var(--border)' }}
          />
          <button
            type="button"
            onClick={onImageRemove}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold hover:bg-red-600"
          >
            ×
          </button>
        </div>
      )}

      {/* Cámara activa */}
      {showCamera && (
        <div className="space-y-3">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline
            className="w-full max-w-md rounded-lg border-2"
            style={{ borderColor: 'var(--border)' }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={capturePhoto}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
              style={{ background: 'var(--accent)' }}
            >
              📸 Capturar Foto
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: 'var(--surface)', color: 'var(--muted)' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      {!showCamera && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={startCamera}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            📷 Tomar Foto
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            📁 Subir Imagen
          </button>
        </div>
      )}

      {/* Input oculto para subir archivo */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Canvas oculto para captura */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
