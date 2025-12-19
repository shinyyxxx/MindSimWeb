import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export function OrbitControls(props: {
  enableDamping?: boolean
  dampingFactor?: number
  enableZoom?: boolean
  enablePan?: boolean
  minDistance?: number
  maxDistance?: number
  target?: [number, number, number]
}) {
  const {
    enableDamping = true,
    dampingFactor = 0.05,
    enableZoom = true,
    enablePan = true,
    minDistance = 2,
    maxDistance = 10,
    target = [0, 0, 0]
  } = props

  const { camera, gl } = useThree()
  const controlsRef = useRef<ThreeOrbitControls | null>(null)

  useEffect(() => {
    const controls = new ThreeOrbitControls(camera, gl.domElement)
    controls.enableDamping = enableDamping
    controls.dampingFactor = dampingFactor
    controls.enableZoom = enableZoom
    controls.enablePan = enablePan
    controls.minDistance = minDistance
    controls.maxDistance = maxDistance
    controls.target.set(target[0], target[1], target[2])
    
    controlsRef.current = controls

    return () => {
      controls.dispose()
    }
  }, [camera, gl, enableDamping, dampingFactor, enableZoom, enablePan, minDistance, maxDistance, target])

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update()
    }
  })

  return null
}

