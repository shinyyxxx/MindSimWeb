import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Text } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { InspectSelection } from '../types/InspectSelection'

type XRInspectAction = 'detail' | 'back' | 'profile' | 'close' | 'voice' | 'how'

type XRInspectPanelProps = {
  selection: InspectSelection
  inspectOpen: boolean
  onViewDetail: (selection: InspectSelection) => void
  onBack: () => void
  onShowProfile: (selection: InspectSelection) => void
  onClose: () => void
}

export function XRInspectPanel({
  selection,
  inspectOpen,
  onViewDetail,
  onBack,
  onShowProfile,
  onClose,
}: XRInspectPanelProps) {
  const { gl, camera } = useThree()
  const groupRef = useRef<THREE.Group | null>(null)
  const panelRef = useRef<THREE.Mesh | null>(null)
  const detailButtonRef = useRef<THREE.Mesh | null>(null)
  const voiceButtonRef = useRef<THREE.Mesh | null>(null)
  const howButtonRef = useRef<THREE.Mesh | null>(null)
  const backButtonRef = useRef<THREE.Mesh | null>(null)
  const profileButtonRef = useRef<THREE.Mesh | null>(null)
  const closeButtonRef = useRef<THREE.Mesh | null>(null)
  const [hoveredAction, setHoveredAction] = useState<XRInspectAction | null>(null)
  const hoveredActionRef = useRef<XRInspectAction | null>(null)

  const resolveActionForHit = useCallback((hitObject: THREE.Object3D): XRInspectAction | null => {
    const targets: Array<{ ref: React.RefObject<THREE.Mesh | null>; action: XRInspectAction }> = [
      { ref: detailButtonRef, action: 'detail' },
      { ref: voiceButtonRef, action: 'voice' },
      { ref: howButtonRef, action: 'how' },
      { ref: backButtonRef, action: 'back' },
      { ref: profileButtonRef, action: 'profile' },
      { ref: closeButtonRef, action: 'close' },
    ]

    for (const target of targets) {
      const mesh = target.ref.current
      if (!mesh) continue
      let node: THREE.Object3D | null = hitObject
      while (node) {
        if (node === mesh) return target.action
        node = node.parent
      }
    }
    return null
  }, [])

  const runAction = useCallback((action: XRInspectAction) => {
    if (action === 'detail') {
      if (!inspectOpen) onViewDetail(selection)
      return
    }
    if (action === 'back') {
      if (inspectOpen) onBack()
      return
    }
    if (action === 'profile') {
      onShowProfile(selection)
      return
    }
    if (action === 'voice' || action === 'how') {
      return
    }
    onClose()
  }, [inspectOpen, onBack, onClose, onShowProfile, onViewDetail, selection])

  useEffect(() => {
    const xrRaycaster = new THREE.Raycaster()
    const rayOrigin = new THREE.Vector3()
    const rayDirection = new THREE.Vector3()
    const controllers = [gl.xr.getController(0), gl.xr.getController(1)]
    const clickTargets = [
      detailButtonRef.current,
      voiceButtonRef.current,
      howButtonRef.current,
      backButtonRef.current,
      profileButtonRef.current,
      closeButtonRef.current,
    ].filter(Boolean) as THREE.Object3D[]

    const handleXrSelect = (event: Event) => {
      if (!gl.xr.isPresenting) return
      if (!clickTargets.length) return

      const controller = event.target as unknown as THREE.Object3D
      rayOrigin.setFromMatrixPosition(controller.matrixWorld)
      rayDirection.set(0, 0, -1).transformDirection(controller.matrixWorld)
      xrRaycaster.set(rayOrigin, rayDirection)

      const hits = xrRaycaster.intersectObjects(clickTargets, true)
      if (!hits.length) return
      const action = resolveActionForHit(hits[0].object)
      if (action) runAction(action)
    }

    controllers.forEach((controller) => {
      controller.addEventListener('selectstart', handleXrSelect as unknown as (event: { data: XRInputSource }) => void)
    })

    return () => {
      controllers.forEach((controller) => {
        controller.removeEventListener('selectstart', handleXrSelect as unknown as (event: { data: XRInputSource }) => void)
      })
    }
  }, [gl, resolveActionForHit, runAction])

  useFrame(() => {
    if (!groupRef.current) return
    const forward = new THREE.Vector3()
    const right = new THREE.Vector3()
    camera.getWorldDirection(forward)
    right.set(1, 0, 0).applyQuaternion(camera.quaternion)

    const targetPos = camera.position.clone()
      .add(forward.multiplyScalar(1.18))
      .add(right.multiplyScalar(0.38))
    targetPos.y -= 0.04

    groupRef.current.position.lerp(targetPos, 0.14)
    groupRef.current.quaternion.slerp(camera.quaternion, 0.14)

    let nextHovered: XRInspectAction | null = null
    if (gl.xr.isPresenting) {
      const xrRaycaster = new THREE.Raycaster()
      const rayOrigin = new THREE.Vector3()
      const rayDirection = new THREE.Vector3()
      const controllers = [gl.xr.getController(0), gl.xr.getController(1)]
      const hoverTargets = [
        detailButtonRef.current,
        voiceButtonRef.current,
        howButtonRef.current,
        backButtonRef.current,
        profileButtonRef.current,
        closeButtonRef.current,
      ].filter(Boolean) as THREE.Object3D[]

      for (const controller of controllers) {
        rayOrigin.setFromMatrixPosition(controller.matrixWorld)
        rayDirection.set(0, 0, -1).transformDirection(controller.matrixWorld)
        xrRaycaster.set(rayOrigin, rayDirection)
        const hits = xrRaycaster.intersectObjects(hoverTargets, true)
        if (!hits.length) continue
        nextHovered = resolveActionForHit(hits[0].object)
        if (nextHovered) break
      }
    }
    if (hoveredActionRef.current !== nextHovered) {
      hoveredActionRef.current = nextHovered
      setHoveredAction(nextHovered)
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={panelRef}>
        <planeGeometry args={[1.42, inspectOpen ? 0.98 : 1.02]} />
        <meshBasicMaterial color={0xf8fafc} />
      </mesh>
      <mesh position={[0, 0.4, 0.001]}>
        <planeGeometry args={[1.3, 0.04]} />
        <meshBasicMaterial color={0x67c6de} />
      </mesh>
      <mesh position={[0, 0.4, 0.002]}>
        <planeGeometry args={[0.86, 0.04]} />
        <meshBasicMaterial color={0xdf7dbb} />
      </mesh>
      <mesh position={[0.48, 0.4, 0.003]}>
        <planeGeometry args={[0.28, 0.04]} />
        <meshBasicMaterial color={0xe5c64e} />
      </mesh>

      <Text position={[-0.6, 0.29, 0.004]} anchorX="left" anchorY="middle" fontSize={0.022} color="#6b7280">
        Mental #{selection.labelNumber}
      </Text>
      <Text position={[-0.6, 0.22, 0.004]} anchorX="left" anchorY="middle" fontSize={0.072} color="#0f172a">
        {selection.name}
      </Text>

      <mesh ref={closeButtonRef} position={[0.58, 0.26, 0.004]}>
        <planeGeometry args={[0.12, 0.1]} />
        <meshBasicMaterial color={hoveredAction === 'close' ? 0xcbd5e1 : 0xe2e8f0} />
      </mesh>
      <Text position={[0.58, 0.26, 0.006]} anchorX="center" anchorY="middle" fontSize={0.034} color="#334155">
        X
      </Text>

      {!inspectOpen && (
        <>
          <mesh
            ref={detailButtonRef}
            position={[0, 0.08, 0.004]}
          >
            <planeGeometry args={[1.16, 0.2]} />
            <meshBasicMaterial color={hoveredAction === 'detail' ? 0xdbeafe : 0xffffff} />
          </mesh>
          <mesh position={[-0.49, 0.08, 0.006]}>
            <planeGeometry args={[0.1, 0.1]} />
            <meshBasicMaterial color={hoveredAction === 'detail' ? 0x0284c7 : 0x0ea5e9} />
          </mesh>
          <Text
            position={[-0.36, 0.11, 0.006]}
            anchorX="left"
            anchorY="middle"
            fontSize={0.047}
            color={hoveredAction === 'detail' ? '#0c4a6e' : '#0f172a'}
          >
            View Detail
          </Text>
          <Text position={[-0.36, 0.055, 0.006]} anchorX="left" anchorY="middle" fontSize={0.03} color="#475569">
            Inspect this sphere closely
          </Text>

          <mesh
            ref={voiceButtonRef}
            position={[0, -0.15, 0.004]}
          >
            <planeGeometry args={[1.16, 0.2]} />
            <meshBasicMaterial color={hoveredAction === 'voice' ? 0xdbeafe : 0xffffff} />
          </mesh>
          <mesh position={[-0.49, -0.15, 0.006]}>
            <planeGeometry args={[0.1, 0.1]} />
            <meshBasicMaterial color={hoveredAction === 'voice' ? 0x0284c7 : 0x0ea5e9} />
          </mesh>
          <Text
            position={[-0.36, -0.12, 0.006]}
            anchorX="left"
            anchorY="middle"
            fontSize={0.047}
            color={hoveredAction === 'voice' ? '#0c4a6e' : '#0f172a'}
          >
            Voice
          </Text>
          <Text position={[-0.36, -0.175, 0.006]} anchorX="left" anchorY="middle" fontSize={0.03} color="#475569">
            Hear a narrated explanation
          </Text>

          <mesh
            ref={howButtonRef}
            position={[0, -0.35, 0.004]}
          >
            <planeGeometry args={[1.16, 0.2]} />
            <meshBasicMaterial color={hoveredAction === 'how' ? 0xdbeafe : 0xffffff} />
          </mesh>
          <mesh position={[-0.49, -0.35, 0.006]}>
            <planeGeometry args={[0.1, 0.1]} />
            <meshBasicMaterial color={hoveredAction === 'how' ? 0x0284c7 : 0x0ea5e9} />
          </mesh>
          <Text
            position={[-0.36, -0.32, 0.006]}
            anchorX="left"
            anchorY="middle"
            fontSize={0.047}
            color={hoveredAction === 'how' ? '#0c4a6e' : '#0f172a'}
          >
            How it works?
          </Text>
          <Text position={[-0.36, -0.375, 0.006]} anchorX="left" anchorY="middle" fontSize={0.03} color="#475569">
            Learn the mechanics in-game
          </Text>
        </>
      )}

      {inspectOpen && (
        <>
          <mesh position={[0, -0.04, 0.003]}>
            <planeGeometry args={[1.16, 0.48]} />
            <meshBasicMaterial color={0xffffff} />
          </mesh>
          <Text
            position={[-0.56, 0.14, 0.004]}
            anchorX="left"
            anchorY="top"
            fontSize={0.034}
            maxWidth={1.12}
            lineHeight={1.25}
            color="#1f2937"
          >
            {selection.detail || 'No detail provided.'}
          </Text>
          <Text position={[-0.56, -0.14, 0.004]} anchorX="left" anchorY="middle" fontSize={0.03} color="#475569">
            Type: {selection.type || 'mental'}
          </Text>

          <mesh ref={backButtonRef} position={[-0.18, -0.39, 0.004]}>
            <planeGeometry args={[0.26, 0.1]} />
            <meshBasicMaterial color={hoveredAction === 'back' ? 0x475569 : 0x64748b} />
          </mesh>
          <Text position={[-0.18, -0.39, 0.006]} anchorX="center" anchorY="middle" fontSize={0.032} color="#f8fafc">
            Back
          </Text>

          <mesh ref={profileButtonRef} position={[0.18, -0.39, 0.004]}>
            <planeGeometry args={[0.34, 0.1]} />
            <meshBasicMaterial color={hoveredAction === 'profile' ? 0x0284c7 : 0x0ea5e9} />
          </mesh>
          <Text position={[0.18, -0.39, 0.006]} anchorX="center" anchorY="middle" fontSize={0.032} color="#f8fbff">
            More detail
          </Text>
        </>
      )}
    </group>
  )
}

export default XRInspectPanel
