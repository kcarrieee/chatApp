import { useEffect, useRef, useState } from 'react'

export function useCamera(enabled: boolean, facing: 'user' | 'environment', attempt: number) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const request = `${enabled}-${facing}-${attempt}`
  const [result, setResult] = useState({ request: '', status: 'loading', error: '' })

  useEffect(() => {
    if (!enabled) return
    let disposed = false
    let stream: MediaStream | undefined
    const video = videoRef.current
    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('secure-context')
        const acquired = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: facing }, width: { ideal: 720 }, height: { ideal: 1280 } } })
        if (disposed) { acquired.getTracks().forEach(track => track.stop()); return }
        stream = acquired
        if (video) {
          video.srcObject = acquired
          await video.play()
        }
        if (!disposed) setResult({ request, status: 'ready', error: '' })
      } catch (reason) {
        stream?.getTracks().forEach(track => track.stop())
        if (disposed) return
        const name = reason instanceof Error ? reason.name : ''
        const error = reason instanceof Error && reason.message === 'secure-context'
          ? 'Для камеры нужен HTTPS или localhost.'
          : name === 'NotAllowedError' ? 'Разрешите камеру в настройках браузера.'
          : name === 'NotFoundError' ? 'Камера не найдена.'
          : 'Камера недоступна. Проверьте, не занята ли она.'
        setResult({ request, status: 'error', error })
      }
    }
    void start()
    return () => {
      disposed = true
      stream?.getTracks().forEach(track => track.stop())
      if (video) video.srcObject = null
    }
  }, [enabled, facing, attempt, request])
  return { videoRef, status: result.request === request ? result.status : 'loading', error: result.error }
}
