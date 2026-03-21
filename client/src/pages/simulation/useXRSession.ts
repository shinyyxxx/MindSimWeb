import { useCallback, useEffect, useMemo, useState } from 'react'
import type * as THREE from 'three'

type XrSupport = 'checking' | 'supported' | 'unsupported' | 'not_secure' | 'no_webxr'
type XrSessionMode = 'immersive-vr' | 'immersive-ar'

type XrNavigator = Navigator & {
  xr?: {
    isSessionSupported?: (mode: XrSessionMode) => Promise<boolean>
    requestSession?: (mode: XrSessionMode, options?: XRSessionInit) => Promise<XRSession>
  }
}

export function useXRSession({
  renderer,
  overlayRoot,
}: {
  renderer: THREE.WebGLRenderer | null
  overlayRoot: HTMLDivElement | null
}) {
  const [activeXrMode, setActiveXrMode] = useState<'vr' | 'ar' | null>(null)

  const [vrSupport, setVrSupport] = useState<XrSupport>('checking')
  const [vrMessage, setVrMessage] = useState<string | null>(null)

  const [arSupport, setArSupport] = useState<XrSupport>('checking')
  const [arMessage, setArMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      // WebXR requires a secure context (https or localhost).
      if (!window.isSecureContext) {
        if (!cancelled) setVrSupport('not_secure')
        return
      }

      const xr = (navigator as unknown as { xr?: { isSessionSupported?: (mode: string) => Promise<boolean> } }).xr
      if (!xr) {
        if (!cancelled) setVrSupport('no_webxr')
        return
      }

      if (typeof xr.isSessionSupported === 'function') {
        try {
          const ok = await xr.isSessionSupported('immersive-vr')
          if (!cancelled) setVrSupport(ok ? 'supported' : 'unsupported')
        } catch {
          if (!cancelled) setVrSupport('unsupported')
        }
      } else {
        // Some browsers may not expose isSessionSupported; allow the user to try.
        if (!cancelled) setVrSupport('supported')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!window.isSecureContext) {
        if (!cancelled) setArSupport('not_secure')
        return
      }

      const xr = (navigator as unknown as { xr?: { isSessionSupported?: (mode: string) => Promise<boolean> } }).xr
      if (!xr) {
        if (!cancelled) setArSupport('no_webxr')
        return
      }

      if (typeof xr.isSessionSupported === 'function') {
        try {
          const ok = await xr.isSessionSupported('immersive-ar')
          if (!cancelled) setArSupport(ok ? 'supported' : 'unsupported')
        } catch {
          if (!cancelled) setArSupport('unsupported')
        }
      } else {
        if (!cancelled) setArSupport('supported')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const startXrSession = useCallback(async (mode: XrSessionMode) => {
    const gl = renderer
    const xrModeName: 'vr' | 'ar' = mode === 'immersive-ar' ? 'ar' : 'vr'

    if (!gl) {
      if (xrModeName === 'vr') setVrMessage('VR not ready yet (renderer still loading)')
      else setArMessage('AR not ready yet (renderer still loading)')
      return
    }

    if (!window.isSecureContext) {
      if (xrModeName === 'vr') setVrMessage('VR requires HTTPS or localhost')
      else setArMessage('AR requires HTTPS or localhost')
      return
    }

    const xr = (navigator as XrNavigator).xr
    if (!xr || typeof xr.requestSession !== 'function') {
      if (xrModeName === 'vr') setVrMessage('WebXR not supported in this browser/device')
      else setArMessage('WebXR not supported in this browser/device')
      return
    }

    if (typeof xr.isSessionSupported === 'function') {
      try {
        const supported = await xr.isSessionSupported(mode)
        if (!supported) {
          if (xrModeName === 'vr') {
            setVrSupport('unsupported')
            setVrMessage('immersive-vr is not supported (connect headset / enable WebXR)')
          } else {
            setArSupport('unsupported')
            setArMessage('immersive-ar is not supported on this device/browser')
          }
          return
        }
      } catch {
        if (xrModeName === 'vr') setVrMessage('Failed to verify VR support')
        else setArMessage('Failed to verify AR support')
        return
      }
    }

    if (gl.xr.isPresenting) {
      const sameMode = activeXrMode === xrModeName
      await gl.xr.getSession()?.end()
      if (sameMode) {
        setActiveXrMode(null)
        return
      }
    }

    try {
      const baseFeatures = mode === 'immersive-ar' ? ['local-floor'] : ['local-floor', 'bounded-floor']
      let session: XRSession
      try {
        session = await xr.requestSession(mode, {
          optionalFeatures: [...baseFeatures, 'dom-overlay'],
          domOverlay: { root: overlayRoot ?? document.body },
        } as XRSessionInit)
      } catch {
        session = await xr.requestSession(mode, {
          optionalFeatures: baseFeatures,
        })
        if (xrModeName === 'vr') {
          setVrMessage('Entered VR without DOM overlay. Use browser/headset system exit to leave session.')
        } else {
          setArMessage('Entered AR without DOM overlay. Use browser/device system exit to leave session.')
        }
      }

      session.addEventListener(
        'end',
        () => {
          setActiveXrMode(null)
        },
        { once: true }
      )

      try {
        gl.xr.setReferenceSpaceType('local-floor')
      } catch {
        gl.xr.setReferenceSpaceType('local')
      }

      await gl.xr.setSession(session)
      setActiveXrMode(xrModeName)
      if (xrModeName === 'vr') setArMessage(null)
      else setVrMessage(null)
    } catch (error) {
      console.error(`Failed to enter ${xrModeName.toUpperCase()}`, error)
      if (xrModeName === 'vr') setVrMessage('Failed to enter VR (see console)')
      else setArMessage('Failed to enter AR (see console)')
    }
  }, [activeXrMode, overlayRoot, renderer])

  const vrButtonDisabled = useMemo(() => {
    if (activeXrMode === 'vr') return false
    if (!renderer) return true
    return vrSupport !== 'supported'
  }, [activeXrMode, renderer, vrSupport])

  const vrButtonTitle = useMemo(() => {
    if (!renderer) return '3D renderer is still loading...'
    if (activeXrMode === 'vr') return 'Exit VR session'
    if (vrSupport === 'checking') return 'Checking VR support...'
    if (vrSupport === 'not_secure') return 'WebXR requires HTTPS or localhost'
    if (vrSupport === 'no_webxr') return 'WebXR not available in this browser/device'
    if (vrSupport === 'unsupported') return 'immersive-vr is not supported (no headset / not enabled)'
    return 'Enter VR'
  }, [activeXrMode, renderer, vrSupport])

  const arButtonDisabled = useMemo(() => {
    if (activeXrMode === 'ar') return false
    if (!renderer) return true
    return arSupport !== 'supported'
  }, [activeXrMode, arSupport, renderer])

  const arButtonTitle = useMemo(() => {
    if (!renderer) return '3D renderer is still loading...'
    if (activeXrMode === 'ar') return 'Exit AR session'
    if (arSupport === 'checking') return 'Checking AR support...'
    if (arSupport === 'not_secure') return 'WebXR requires HTTPS or localhost'
    if (arSupport === 'no_webxr') return 'WebXR not available in this browser/device'
    if (arSupport === 'unsupported') return 'immersive-ar is not supported on this device/browser'
    return 'Enter AR'
  }, [activeXrMode, arSupport, renderer])

  const handleToggleVr = useCallback(async () => {
    await startXrSession('immersive-vr')
  }, [startXrSession])

  const handleToggleAr = useCallback(async () => {
    await startXrSession('immersive-ar')
  }, [startXrSession])

  return {
    activeXrMode,
    vrSupport,
    arSupport,
    vrMessage,
    arMessage,
    vrButtonDisabled,
    vrButtonTitle,
    arButtonDisabled,
    arButtonTitle,
    handleToggleVr,
    handleToggleAr,
  }
}
