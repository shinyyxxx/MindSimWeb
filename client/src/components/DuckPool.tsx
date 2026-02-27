/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Water pool – WebGPU compute water simulation.
 * Based on three.js example "webgpu_compute_water" (water only, no ducks).
 * Runs in a container; requires WebGPU support.
 */
import React, { useEffect, useRef, useState } from 'react'

const WIDTH = 128
const BOUNDS = 6
const waterMaxHeight = 0.1

const ASSETS = {
  hdr: 'https://threejs.org/examples/textures/equirectangular/blouberg_sunrise_2_1k.hdr',
}

export type DropDropletFn = (x: number, z: number, r: number, g: number, b: number) => void

export function DuckPool({
  className,
  style,
  onDropDropletReady,
  allowUserDrops = false,
}: {
  className?: string
  style?: React.CSSProperties
  onDropDropletReady?: (dropDroplet: DropDropletFn) => void
  allowUserDrops?: boolean
}): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cancelled = false
    const cleanupRef = { current: null as (() => void) | null }
    let unmounted = false

    async function init() {
      const [
        THREE,
        { instanceIndex, uint, int, float, length, clamp, vec2, cos, vec3, vertexIndex, Fn, uniform, instancedArray, min, max, positionLocal, transformNormalToView, select, globalId },
        { Inspector },
        { SimplexNoise },
        { HDRLoader },
        { OrbitControls },
        WebGPUCapability,
      ] = await Promise.all([
        import('three/webgpu'),
        import('three/tsl'),
        import('three/addons/inspector/Inspector.js'),
        import('three/addons/math/SimplexNoise.js'),
        import('three/addons/loaders/HDRLoader.js'),
        import('three/addons/controls/OrbitControls.js'),
        import('three/addons/capabilities/WebGPU.js'),
      ])

      if (cancelled) return

      if (WebGPUCapability.default.isAvailable() === false) {
        setError('WebGPU is not supported in this browser.')
        return
      }

      const TSL = {
        instanceIndex,
        uint,
        int,
        float,
        length,
        clamp,
        vec2,
        cos,
        vec3,
        vertexIndex,
        Fn,
        uniform,
        instancedArray,
        min,
        max,
        positionLocal,
        transformNormalToView,
        select,
        globalId,
      }

      let camera: any
      let scene: any
      let sun: any
      let waterMesh: any
      let poolBorder: any
      let meshRay: any
      let computeHeightAtoB: any
      let computeHeightBtoA: any
      let pingPong = 0
      let colorPingPong = 0
      const readFromA = TSL.uniform(1)
      let controls: any

      const simplex = new SimplexNoise()

      function noise(x: number, y: number) {
        let multR = waterMaxHeight
        let mult = 0.025
        let r = 0
        for (let i = 0; i < 15; i++) {
          r += multR * simplex.noise(x * mult, y * mult)
          multR *= 0.53 + 0.025 * i
          mult *= 1.25
        }
        return r
      }

      camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 3000)
      camera.position.set(0, 2.0, 4)
      camera.lookAt(0, 0, 0)

      scene = new THREE.Scene()

      sun = new THREE.DirectionalLight(0xffffff, 4.0)
      sun.position.set(-1, 2.6, 1.4)
      scene.add(sun)

      const heightArray = new Float32Array(WIDTH * WIDTH)
      const prevHeightArray = new Float32Array(WIDTH * WIDTH)
      let p = 0
      for (let j = 0; j < WIDTH; j++) {
        for (let i = 0; i < WIDTH; i++) {
          const x = (i * 128) / WIDTH
          const y = (j * 128) / WIDTH
          const height = noise(x, y)
          heightArray[p] = height
          prevHeightArray[p] = height
          p++
        }
      }

      const heightStorageA = TSL.instancedArray(heightArray).setName('HeightA')
      const heightStorageB = TSL.instancedArray(new Float32Array(heightArray)).setName('HeightB')
      const prevHeightStorage = TSL.instancedArray(prevHeightArray).setName('PrevHeight')

      const colorSize = WIDTH * WIDTH
      const colorRArray = new Float32Array(colorSize)
      const colorGArray = new Float32Array(colorSize)
      const colorBArray = new Float32Array(colorSize)
      const colorRStorageA = TSL.instancedArray(colorRArray).setName('ColorRA')
      const colorRStorageB = TSL.instancedArray(new Float32Array(colorRArray)).setName('ColorRB')
      const colorGStorageA = TSL.instancedArray(new Float32Array(colorGArray)).setName('ColorGA')
      const colorGStorageB = TSL.instancedArray(new Float32Array(colorGArray)).setName('ColorGB')
      const colorBStorageA = TSL.instancedArray(new Float32Array(colorBArray)).setName('ColorBA')
      const colorBStorageB = TSL.instancedArray(new Float32Array(colorBArray)).setName('ColorBB')

      const readFromColorA = TSL.uniform(1)
      const dropletColors = [
        new THREE.Color(0x3b82f6),
        new THREE.Color(0xef4444),
        new THREE.Color(0x22c55e),
        new THREE.Color(0xeab308),
        new THREE.Color(0xa855f7),
        new THREE.Color(0x06b6d4),
        new THREE.Color(0xf97316),
      ]
      let dropletColorIndex = 0

      const dropletQueue: Array<{ x: number; z: number; r: number; g: number; b: number; framesRemaining: number }> = []
      const DROPLET_FRAMES = 15
      const DROP_HEIGHT = 0.7
      const DROP_FALL_DURATION_MS = 550
      let splashFramesRemaining = 0
      const splashStrength = 0.25
      const fallingDroplets: Array<{
        x: number
        z: number
        r: number
        g: number
        b: number
        mesh: THREE.Mesh
        startTime: number
      }> = []

      function dropDroplet(x: number, z: number, r: number, g: number, b: number) {
        const sphereGeom = new THREE.SphereGeometry(0.08, 16, 12)
        const sphereMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(r, g, b),
          metalness: 0.3,
          roughness: 0.2,
          transparent: true,
          opacity: 0.95,
        })
        const mesh = new THREE.Mesh(sphereGeom, sphereMat)
        mesh.position.set(x, DROP_HEIGHT, z)
        scene.add(mesh)
        fallingDroplets.push({ x, z, r, g, b, mesh, startTime: performance.now() })
      }

      const effectController = {
        mousePos: TSL.uniform(new THREE.Vector2()).setName('mousePos'),
        mouseSpeed: TSL.uniform(new THREE.Vector2()).setName('mouseSpeed'),
        mouseDeep: TSL.uniform(0.5).setName('mouseDeep'),
        mouseSize: TSL.uniform(0.12).setName('mouseSize'),
        viscosity: TSL.uniform(0.96).setName('viscosity'),
        speed: 5,
        mouseColor: TSL.uniform(new THREE.Vector3()).setName('mouseColor'),
        dropletSize: TSL.uniform(0.1).setName('dropletSize'),
        dropletStrength: TSL.uniform(1.2).setName('dropletStrength'),
        colorDiffusionRate: TSL.uniform(0.5).setName('colorDiffusionRate'),
        injectDroplet: TSL.uniform(0).setName('injectDroplet'),
        advectionStrength: TSL.uniform(0.4).setName('advectionStrength'),
      }

      const getNeighborIndicesTSL = (index: ReturnType<typeof TSL.uint>) => {
        const width = TSL.uint(WIDTH)
        const x = TSL.int(index.mod(WIDTH))
        const y = TSL.int(index.div(WIDTH))
        const leftX = TSL.max(0, x.sub(1))
        const rightX = TSL.min(x.add(1), width.sub(1))
        const bottomY = TSL.max(0, y.sub(1))
        const topY = TSL.min(y.add(1), width.sub(1))
        const westIndex = y.mul(width).add(leftX)
        const eastIndex = y.mul(width).add(rightX)
        const southIndex = bottomY.mul(width).add(x)
        const northIndex = topY.mul(width).add(x)
        const northEastIndex = topY.mul(width).add(rightX)
        const northWestIndex = topY.mul(width).add(leftX)
        const southEastIndex = bottomY.mul(width).add(rightX)
        const southWestIndex = bottomY.mul(width).add(leftX)
        return { northIndex, southIndex, eastIndex, westIndex, northEastIndex, northWestIndex, southEastIndex, southWestIndex }
      }

      const getNeighborValuesTSL = (
        index: ReturnType<typeof TSL.uint>,
        store: ReturnType<typeof heightStorageA>
      ) => {
        const { northIndex, southIndex, eastIndex, westIndex } = getNeighborIndicesTSL(index)
        return {
          north: store.element(northIndex),
          south: store.element(southIndex),
          east: store.element(eastIndex),
          west: store.element(westIndex),
        }
      }

      const createComputeColor = (
        readR: ReturnType<typeof colorRStorageA>,
        readG: ReturnType<typeof colorGStorageA>,
        readB: ReturnType<typeof colorBStorageA>,
        writeR: ReturnType<typeof colorRStorageB>,
        writeG: ReturnType<typeof colorGStorageB>,
        writeB: ReturnType<typeof colorBStorageB>
      ) =>
        TSL.Fn(() => {
          const { mouseColor, dropletSize, dropletStrength, colorDiffusionRate, injectDroplet, mousePos, advectionStrength } = effectController
          const index = TSL.instanceIndex
          const { northIndex, southIndex, eastIndex, westIndex, northEastIndex, northWestIndex, southEastIndex, southWestIndex } = getNeighborIndicesTSL(index)

          const getHeightAt = (idx: ReturnType<typeof TSL.uint>) =>
            TSL.select(readFromA, heightStorageA.element(idx), heightStorageB.element(idx))

          const diffuseChannel = (
            readStore: ReturnType<typeof colorRStorageA>,
            writeStore: ReturnType<typeof colorRStorageB>
          ) => {
            const c = readStore.element(index).toVar()
            const n = readStore.element(northIndex)
            const s = readStore.element(southIndex)
            const e = readStore.element(eastIndex)
            const w = readStore.element(westIndex)
            const ne = readStore.element(northEastIndex)
            const nw = readStore.element(northWestIndex)
            const se = readStore.element(southEastIndex)
            const sw = readStore.element(southWestIndex)

            const hN = getHeightAt(northIndex)
            const hS = getHeightAt(southIndex)
            const hE = getHeightAt(eastIndex)
            const hW = getHeightAt(westIndex)
            const velX = hE.sub(hW)
            const velY = hN.sub(hS)
            const bias = TSL.float(1.2)
            const base = TSL.float(0.2)
            const wN = TSL.clamp(
              base.sub(velY.mul(advectionStrength).mul(bias)),
              TSL.float(0.08),
              TSL.float(0.32)
            )
            const wS = TSL.clamp(
              base.add(velY.mul(advectionStrength).mul(bias)),
              TSL.float(0.08),
              TSL.float(0.32)
            )
            const wE = TSL.clamp(
              base.sub(velX.mul(advectionStrength).mul(bias)),
              TSL.float(0.08),
              TSL.float(0.32)
            )
            const wW = TSL.clamp(
              base.add(velX.mul(advectionStrength).mul(bias)),
              TSL.float(0.08),
              TSL.float(0.32)
            )

            const cardinal = n.mul(wN).add(s.mul(wS)).add(e.mul(wE)).add(w.mul(wW))
            const diagonal = ne.add(nw).add(se).add(sw).mul(0.05)
            const diffusion = cardinal.add(diagonal)
            writeStore.element(index).assign(
              c.mul(colorDiffusionRate).add(diffusion.mul(TSL.float(1.0).sub(colorDiffusionRate)))
            )
          }

          const x = TSL.float(TSL.globalId.x).mul(1 / WIDTH).mul(BOUNDS).sub(BOUNDS / 2)
          const y = TSL.float(TSL.globalId.y).mul(1 / WIDTH).mul(BOUNDS).sub(BOUNDS / 2)
          const center = mousePos
          const dist = TSL.length(TSL.vec2(x, y).sub(center))
          const rawInfluence = TSL.clamp(
            TSL.float(1.0).sub(dist.div(dropletSize)),
            TSL.float(0.0),
            TSL.float(1.0)
          )
          const influence = rawInfluence.mul(injectDroplet)

          diffuseChannel(readR, writeR)
          diffuseChannel(readG, writeG)
          diffuseChannel(readB, writeB)

          writeR.element(index).addAssign(mouseColor.x.mul(influence).mul(dropletStrength))
          writeG.element(index).addAssign(mouseColor.y.mul(influence).mul(dropletStrength))
          writeB.element(index).addAssign(mouseColor.z.mul(influence).mul(dropletStrength))
        })().compute(WIDTH * WIDTH, [16, 16])

      const computeColorAtoB = createComputeColor(
        colorRStorageA, colorGStorageA, colorBStorageA,
        colorRStorageB, colorGStorageB, colorBStorageB
      ).setName('Update Color A→B')
      const computeColorBtoA = createComputeColor(
        colorRStorageB, colorGStorageB, colorBStorageB,
        colorRStorageA, colorGStorageA, colorBStorageA
      ).setName('Update Color B→A')

      const createComputeHeight = (
        readBuffer: ReturnType<typeof heightStorageA>,
        writeBuffer: ReturnType<typeof heightStorageB>
      ) =>
        TSL.Fn(() => {
          const { viscosity, mousePos, mouseSize, mouseDeep, mouseSpeed } = effectController
          const height = readBuffer.element(TSL.instanceIndex).toVar()
          const prevHeight = prevHeightStorage.element(TSL.instanceIndex).toVar()
          const { north, south, east, west } = getNeighborValuesTSL(TSL.instanceIndex, readBuffer)
          const neighborHeight = north.add(south).add(east).add(west)
          neighborHeight.mulAssign(0.5)
          neighborHeight.subAssign(prevHeight)
          const newHeight = neighborHeight.mul(viscosity)
          const x = TSL.float(TSL.globalId.x).mul(1 / WIDTH)
          const y = TSL.float(TSL.globalId.y).mul(1 / WIDTH)
          const centerVec = TSL.vec2(0.5)
          const mousePhase = TSL.clamp(
            TSL.length(TSL.vec2(x, y).sub(centerVec).mul(BOUNDS).sub(mousePos))
              .mul(Math.PI)
              .div(mouseSize),
            0.0,
            Math.PI
          )
          newHeight.addAssign(
            TSL.cos(mousePhase).add(1.0).mul(mouseDeep).mul(mouseSpeed.length())
          )
          prevHeightStorage.element(TSL.instanceIndex).assign(height)
          writeBuffer.element(TSL.instanceIndex).assign(newHeight)
        })().compute(WIDTH * WIDTH, [16, 16])

      computeHeightAtoB = createComputeHeight(heightStorageA, heightStorageB).setName('Update Height A→B')
      computeHeightBtoA = createComputeHeight(heightStorageB, heightStorageA).setName('Update Height B→A')

      const waterGeometry = new THREE.PlaneGeometry(BOUNDS, BOUNDS, WIDTH - 1, WIDTH - 1)
      const waterMaterial = new THREE.MeshStandardNodeMaterial({
        color: 0xFFFFFF,
        metalness: 0.9,
        roughness: 0,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      })

      const getCurrentHeight = (index: ReturnType<typeof TSL.uint>) =>
        TSL.select(
          readFromA,
          heightStorageA.element(index),
          heightStorageB.element(index)
        )

      const getCurrentColor = (index: ReturnType<typeof TSL.uint>) =>
        TSL.vec3(
          TSL.select(readFromColorA, colorRStorageA.element(index), colorRStorageB.element(index)),
          TSL.select(readFromColorA, colorGStorageA.element(index), colorGStorageB.element(index)),
          TSL.select(readFromColorA, colorBStorageA.element(index), colorBStorageB.element(index))
        )

      const getCurrentNormals = (index: ReturnType<typeof TSL.uint>) => {
        const { northIndex, southIndex, eastIndex, westIndex } = getNeighborIndicesTSL(index)
        const north = getCurrentHeight(northIndex)
        const south = getCurrentHeight(southIndex)
        const east = getCurrentHeight(eastIndex)
        const west = getCurrentHeight(westIndex)
        const normalX = west.sub(east).mul(WIDTH / BOUNDS)
        const normalY = south.sub(north).mul(WIDTH / BOUNDS)
        return { normalX, normalY }
      }

      waterMaterial.normalNode = TSL.Fn(() => {
        const { normalX, normalY } = getCurrentNormals(TSL.vertexIndex)
        return TSL.transformNormalToView(
          TSL.vec3(normalX, normalY.negate(), 1.0)
        ).toVertexStage()
      })()

      waterMaterial.colorNode = TSL.Fn(() => {
        const dye = getCurrentColor(TSL.vertexIndex)
        const dyeAmount = TSL.min(TSL.float(1.0), TSL.max(dye.x, TSL.max(dye.y, dye.z)))
        const clearWater = TSL.vec3(1.0, 1.0, 1.0)
        return clearWater.mul(TSL.float(1.0).sub(dyeAmount)).add(dye.mul(dyeAmount))
      })()

      waterMaterial.positionNode = TSL.Fn(() =>
        TSL.vec3(
          TSL.positionLocal.x,
          TSL.positionLocal.y,
          getCurrentHeight(TSL.vertexIndex)
        )
      )()

      waterMesh = new THREE.Mesh(waterGeometry, waterMaterial)
      waterMesh.rotation.x = -Math.PI * 0.5
      waterMesh.matrixAutoUpdate = false
      waterMesh.updateMatrix()
      scene.add(waterMesh)

      const borderGeom = new THREE.TorusGeometry(4.2, 0.1, 12, 4)
      borderGeom.rotateX(Math.PI * 0.5)
      borderGeom.rotateY(Math.PI * 0.25)
      poolBorder = new THREE.Mesh(
        borderGeom,
        new THREE.MeshStandardMaterial({ color: 0x908877, roughness: 0.2 })
      )
      scene.add(poolBorder)

      const geometryRay = new THREE.PlaneGeometry(BOUNDS, BOUNDS, 1, 1)
      meshRay = new THREE.Mesh(
        geometryRay,
        new THREE.MeshBasicMaterial({ color: 0xffffff, visible: false })
      )
      meshRay.rotation.x = -Math.PI / 2
      meshRay.matrixAutoUpdate = false
      meshRay.updateMatrix()
      scene.add(meshRay)

      const hdrLoader = new HDRLoader().setPath(
        ASSETS.hdr.replace(/[^/]+$/, '') || 'https://threejs.org/examples/textures/equirectangular/'
      )
      const env = await hdrLoader.loadAsync(ASSETS.hdr.split('/').pop() || 'blouberg_sunrise_2_1k.hdr')
      if (cancelled) return

      env.mapping = THREE.EquirectangularReflectionMapping
      scene.environment = env
      scene.background = env
      scene.backgroundBlurriness = 0.3
      scene.environmentIntensity = 1.25

      const webgpuRenderer = new THREE.WebGPURenderer({
        antialias: true,
        requiredLimits: { maxStorageBuffersInVertexStage: 4 },
      })
      webgpuRenderer.setPixelRatio(window.devicePixelRatio)
      webgpuRenderer.setSize(container.clientWidth, container.clientHeight)
      webgpuRenderer.toneMapping = THREE.ACESFilmicToneMapping
      webgpuRenderer.toneMappingExposure = 0.5
      container.appendChild(webgpuRenderer.domElement)

      const inspector = new Inspector()
      webgpuRenderer.inspector = inspector
      container.appendChild(inspector.domElement)

      controls = new OrbitControls(camera, container)

      const mouseCoords = new THREE.Vector2()
      const raycaster = new THREE.Raycaster()
      let frame = 0
      let mouseDown = false
      let firstClick = true
      let updateOriginMouseDown = false

      function setMouseCoords(x: number, y: number) {
        mouseCoords.set(
          (x / (webgpuRenderer.domElement as HTMLCanvasElement).clientWidth) * 2 - 1,
          -((y / (webgpuRenderer.domElement as HTMLCanvasElement).clientHeight) * 2 - 1)
        )
      }

      function onPointerDown() {
        mouseDown = true
        firstClick = true
        updateOriginMouseDown = true
      }

      function onPointerUp() {
        mouseDown = false
        firstClick = false
        updateOriginMouseDown = false
        controls.enabled = true
      }

      function onPointerMove(event: PointerEvent) {
        if (event.isPrimary === false) return
        setMouseCoords(event.clientX, event.clientY)
      }

      function processFallingDroplets() {
        const now = performance.now()
        for (let i = fallingDroplets.length - 1; i >= 0; i--) {
          const d = fallingDroplets[i]
          const elapsed = now - d.startTime
          const t = Math.min(1, elapsed / DROP_FALL_DURATION_MS)
          const easeOut = 1 - (1 - t) * (1 - t)
          const y = DROP_HEIGHT * (1 - easeOut)
          d.mesh.position.y = y
          if (t >= 1) {
            dropletQueue.push({ x: d.x, z: d.z, r: d.r, g: d.g, b: d.b, framesRemaining: DROPLET_FRAMES })
            effectController.mousePos.value.set(d.x, d.z)
            effectController.mouseSpeed.value.set(0, splashStrength)
            splashFramesRemaining = 8
            scene.remove(d.mesh)
            d.mesh.geometry.dispose()
            ;(d.mesh.material as THREE.Material).dispose()
            fallingDroplets.splice(i, 1)
          }
        }
      }

      function processDropletQueue() {
        if (dropletQueue.length > 0) {
          const head = dropletQueue[0]
          effectController.mousePos.value.set(head.x, head.z)
          effectController.mouseColor.value.set(head.r, head.g, head.b)
          effectController.injectDroplet.value = 1
          head.framesRemaining -= 1
          if (head.framesRemaining <= 0) dropletQueue.shift()
        } else {
          effectController.injectDroplet.value = 0
        }
      }

      function raycast() {
        if (allowUserDrops && mouseDown && (firstClick || !controls.enabled)) {
          raycaster.setFromCamera(mouseCoords, camera)
          const intersects = raycaster.intersectObject(meshRay)
          if (intersects.length > 0) {
            const point = intersects[0].point
            if (updateOriginMouseDown) {
              effectController.mousePos.value.set(point.x, point.z)
              const color = dropletColors[dropletColorIndex % dropletColors.length]
              dropletColorIndex += 1
              effectController.mouseColor.value.set(color.r, color.g, color.b)
              updateOriginMouseDown = false
            }
            effectController.injectDroplet.value = 1
            effectController.mouseSpeed.value.set(
              point.x - effectController.mousePos.value.x,
              point.z - effectController.mousePos.value.y
            )
            effectController.mousePos.value.set(point.x, point.z)
            if (firstClick) controls.enabled = false
          } else {
            updateOriginMouseDown = true
            if (dropletQueue.length === 0) effectController.injectDroplet.value = 0
            effectController.mouseSpeed.value.set(0, 0)
          }
          firstClick = false
        } else {
          updateOriginMouseDown = true
          processDropletQueue()
          if (splashFramesRemaining > 0) {
            splashFramesRemaining -= 1
            if (splashFramesRemaining <= 0) effectController.mouseSpeed.value.set(0, 0)
          } else {
            effectController.mouseSpeed.value.set(0, 0)
          }
        }
      }

      function onResize() {
        camera.aspect = container.clientWidth / container.clientHeight
        camera.updateProjectionMatrix()
        webgpuRenderer.setSize(container.clientWidth, container.clientHeight)
      }

      window.addEventListener('resize', onResize)
      container.style.touchAction = 'none'
      container.addEventListener('pointermove', onPointerMove)
      container.addEventListener('pointerdown', onPointerDown)
      container.addEventListener('pointerup', onPointerUp)

      function render() {
        if (cancelled) return
        processFallingDroplets()
        raycast()
        frame++
        if (frame >= 7 - effectController.speed) {
          if (pingPong === 0) {
            webgpuRenderer.compute(computeHeightAtoB, [8, 8, 1])
            readFromA.value = 0
          } else {
            webgpuRenderer.compute(computeHeightBtoA, [8, 8, 1])
            readFromA.value = 1
          }
          pingPong = 1 - pingPong
          frame = 0
        }
        if (colorPingPong === 0) {
          webgpuRenderer.compute(computeColorAtoB, [8, 8, 1])
          readFromColorA.value = 0
          webgpuRenderer.compute(computeColorBtoA, [8, 8, 1])
          readFromColorA.value = 1
        } else {
          webgpuRenderer.compute(computeColorBtoA, [8, 8, 1])
          readFromColorA.value = 1
          webgpuRenderer.compute(computeColorAtoB, [8, 8, 1])
          readFromColorA.value = 0
        }
        colorPingPong = 1 - colorPingPong
        webgpuRenderer.render(scene, camera)
      }

      if (cancelled) return
      webgpuRenderer.setAnimationLoop(render)
      setReady(true)
      onDropDropletReady?.(dropDroplet)

      return () => {
        cancelled = true
        window.removeEventListener('resize', onResize)
        container.removeEventListener('pointermove', onPointerMove)
        container.removeEventListener('pointerdown', onPointerDown)
        container.removeEventListener('pointerup', onPointerUp)
        webgpuRenderer.setAnimationLoop(null)
        if (container.contains(webgpuRenderer.domElement))
          container.removeChild(webgpuRenderer.domElement)
        if (inspector.domElement && container.contains(inspector.domElement))
          container.removeChild(inspector.domElement)
        webgpuRenderer.dispose()
      }
    }

    init().then((fn) => {
      if (unmounted && typeof fn === 'function') fn()
      else cleanupRef.current = typeof fn === 'function' ? fn : null
    })
    return () => {
      unmounted = true
      cancelled = true
      cleanupRef.current?.()
      cleanupRef.current = null
    }
  }, [])

  if (error) {
    return (
      <div className={className} style={style} ref={containerRef}>
        <div style={{ padding: 16, color: '#e2e8f0', background: '#0f172a', borderRadius: 8 }}>
          {error}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 320,
        background: '#000',
        position: 'relative',
        ...style,
      }}
    >
      {!ready && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            background: '#0f172a',
          }}
        >
          Loading…
        </div>
      )}
    </div>
  )
}
