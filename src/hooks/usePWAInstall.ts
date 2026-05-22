"use client"
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export const usePWAInstall = () => {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if we captured the event globally already
    if ((window as any).deferredPrompt) {
      setInstallPrompt((window as any).deferredPrompt)
      setIsInstallable(true)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Listen for custom event in case layout script fired
    const customHandler = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail) {
        setInstallPrompt(customEvent.detail)
        setIsInstallable(true)
      }
    }
    window.addEventListener('pwa-prompt-available', customHandler as EventListener)

    // Listen for successful install
    const installedHandler = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setInstallPrompt(null)
      if ((window as any).deferredPrompt) {
        (window as any).deferredPrompt = null
      }
    }
    window.addEventListener('appinstalled', installedHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('pwa-prompt-available', customHandler as EventListener)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  const triggerInstall = async (): Promise<boolean> => {
    const promptToUse = installPrompt || (window as any).deferredPrompt
    if (!promptToUse) return false
    await promptToUse.prompt()
    const { outcome } = await promptToUse.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
      setIsInstallable(false)
      setInstallPrompt(null)
      if ((window as any).deferredPrompt) {
        (window as any).deferredPrompt = null
      }
      return true
    }
    return false
  }

  return { isInstallable, isInstalled, triggerInstall }
}
