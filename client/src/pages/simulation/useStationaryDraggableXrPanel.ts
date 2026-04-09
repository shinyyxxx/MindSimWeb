import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { MutableRefObject, RefObject } from 'react'

export type StationaryXrPanelLayout = {
  forward: number
  right: number
  yDown: number
}

/**
 * Places an XR UI group in world space (position is fixed until dragged) and allows
 * moving it by squeezing the grip while pointing at the panel. While presenting,
 * the group rotation follows the camera so the panel stays facing the user.
 */
export function useStationaryDraggableXrPanel({
  groupRef,
  gl,
  camera,
  layout,
  panelWorldAnchorRef,
}: {
  groupRef: RefObject<THREE.Group | null>
  gl: THREE.WebGLRenderer
  camera: THREE.Camera
  layout: StationaryXrPanelLayout
  panelWorldAnchorRef?: MutableRefObject<THREE.Vector3>
}): void {
  const initializedRef = useRef(false)
  const draggingRef = useRef(false)
  const dragControllerRef = useRef<THREE.Object3D | null>(null)
  const hitOffsetRef = useRef(new THREE.Vector3())
  const dragDistanceRef = useRef(0)
  const tempVec = useRef(new THREE.Vector3())
  const tempOrigin = useRef(new THREE.Vector3())
  const tempDirection = useRef(new THREE.Vector3())
  const tempRayPoint = useRef(new THREE.Vector3())
  const forwardRef = useRef(new THREE.Vector3())
  const rightRef = useRef(new THREE.Vector3())

  const placePanelInFrontOfUser = () => {
    const group = groupRef.current
    if (!group) return
    const forward = forwardRef.current
    const right = rightRef.current
    camera.getWorldDirection(forward)
    right.set(1, 0, 0).applyQuaternion(camera.quaternion)
    tempVec.current.copy(camera.position)
    tempVec.current.add(forward.multiplyScalar(layout.forward))
    tempVec.current.add(right.multiplyScalar(layout.right))
    tempVec.current.y -= layout.yDown
    group.position.copy(tempVec.current)
    group.quaternion.copy(camera.quaternion)
    initializedRef.current = true
  }

  useEffect(() => {
    const controllers = [gl.xr.getController(0), gl.xr.getController(1)]
    const rc = new THREE.Raycaster()
    const origin = new THREE.Vector3()
    const dir = new THREE.Vector3()

    const tryStartDrag = (controller: THREE.Object3D) => {
      const group = groupRef.current
      if (!group || !gl.xr.isPresenting) return
      origin.setFromMatrixPosition(controller.matrixWorld)
      dir.set(0, 0, -1).transformDirection(controller.matrixWorld)
      rc.set(origin, dir)
      const hits = rc.intersectObject(group, true)
      if (!hits.length) return
      const hit = hits[0]
      draggingRef.current = true
      dragControllerRef.current = controller
      dragDistanceRef.current = Math.max(0.25, hit.distance)
      hitOffsetRef.current.copy(group.position).sub(hit.point)
    }

    const onDragStartByIndex = (index: 0 | 1) => {
      const controller = controllers[index]
      if (!controller) return
      tryStartDrag(controller)
    }

    const onDragEndByIndex = (index: 0 | 1) => {
      const controller = controllers[index]
      if (controller && dragControllerRef.current === controller) {
        draggingRef.current = false
        dragControllerRef.current = null
      }
    }

    const onSqueezeStart0 = (() => onDragStartByIndex(0)) as unknown as (event: { data: XRInputSource }) => void
    const onSqueezeEnd0 = (() => onDragEndByIndex(0)) as unknown as (event: { data: XRInputSource }) => void
    const onSqueezeStart1 = (() => onDragStartByIndex(1)) as unknown as (event: { data: XRInputSource }) => void
    const onSqueezeEnd1 = (() => onDragEndByIndex(1)) as unknown as (event: { data: XRInputSource }) => void

    const onSessionStart = () => {
      initializedRef.current = false
      // Camera pose is valid on the next frame after entering XR.
      requestAnimationFrame(() => {
        if (!gl.xr.isPresenting || initializedRef.current) return
        placePanelInFrontOfUser()
      })
    }

    const onSessionEnd = () => {
      initializedRef.current = false
      draggingRef.current = false
      dragControllerRef.current = null
    }

    if (gl.xr.isPresenting && !initializedRef.current) {
      placePanelInFrontOfUser()
    }

    gl.xr.addEventListener('sessionstart', onSessionStart)
    gl.xr.addEventListener('sessionend', onSessionEnd)

    controllers[0].addEventListener('squeezestart', onSqueezeStart0)
    controllers[0].addEventListener('squeezeend', onSqueezeEnd0)
    controllers[1].addEventListener('squeezestart', onSqueezeStart1)
    controllers[1].addEventListener('squeezeend', onSqueezeEnd1)

    return () => {
      gl.xr.removeEventListener('sessionstart', onSessionStart)
      gl.xr.removeEventListener('sessionend', onSessionEnd)
      controllers[0].removeEventListener('squeezestart', onSqueezeStart0)
      controllers[0].removeEventListener('squeezeend', onSqueezeEnd0)
      controllers[1].removeEventListener('squeezestart', onSqueezeStart1)
      controllers[1].removeEventListener('squeezeend', onSqueezeEnd1)
    }
  }, [camera, gl, groupRef, layout.forward, layout.right, layout.yDown])

  useFrame(() => {
    const group = groupRef.current
    if (!group) return

    if (draggingRef.current && dragControllerRef.current) {
      const controller = dragControllerRef.current
      tempOrigin.current.setFromMatrixPosition(controller.matrixWorld)
      tempDirection.current.set(0, 0, -1).transformDirection(controller.matrixWorld)
      tempRayPoint.current.copy(tempOrigin.current).addScaledVector(tempDirection.current, dragDistanceRef.current)
      group.position.copy(tempRayPoint.current).add(hitOffsetRef.current)
    }

    if (gl.xr.isPresenting && initializedRef.current) {
      group.quaternion.copy(camera.quaternion)
    }

    if (panelWorldAnchorRef) {
      group.getWorldPosition(panelWorldAnchorRef.current)
    }
  })
}
