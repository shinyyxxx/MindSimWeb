import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

function reflectVelocity(vel: THREE.Vector3, normal: THREE.Vector3, restitution = 1.0): THREE.Vector3 {
  // v' = v - (1 + e) * (v·n) * n
  const vn = vel.dot(normal)
  return vel.clone().sub(normal.clone().multiplyScalar((1 + restitution) * vn))
}

function randomInsideSphere(r: number): THREE.Vector3 {
  for (let i = 0; i < 50; i++) {
    const x = (Math.random() * 2 - 1) * r
    const y = (Math.random() * 2 - 1) * r
    const z = (Math.random() * 2 - 1) * r
    if (x * x + y * y + z * z <= r * r) return new THREE.Vector3(x, y, z)
  }
  return new THREE.Vector3(0, 0, 0)
}

export function SamskaraDemo(): React.ReactElement {
  const mountRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // Clean if HMR re-runs effect
    container.innerHTML = ''

    const scene = new THREE.Scene()
    scene.background = null

    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100)
    camera.position.set(0, 0, 2.6)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    container.appendChild(renderer.domElement)

    // Lights (for shaded small spheres)
    scene.add(new THREE.HemisphereLight(0xffffff, 0x334155, 0.9))
    const dir = new THREE.DirectionalLight(0xffffff, 1.1)
    dir.position.set(2, 3, 4)
    scene.add(dir)

    const root = new THREE.Group()
    scene.add(root)

    // Big container sphere (display-only tint, no wireframe)
    const containerRadius = 0.9
    const containerGeom = new THREE.SphereGeometry(containerRadius, 64, 64)
    const containerMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    })
    root.add(new THREE.Mesh(containerGeom, containerMat))

    // Small spheres
    const ballCount = 18
    const ballRadius = 0.06
    const balls: Array<{ mesh: THREE.Mesh; vel: THREE.Vector3 }> = []
    const ballGeom = new THREE.SphereGeometry(ballRadius, 24, 24)
    const palette = [0xff6b6b, 0x4ecdc4, 0x95e1d3, 0xf38181, 0xaa96da]

    for (let i = 0; i < ballCount; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: palette[i % palette.length],
        roughness: 0.35,
        metalness: 0.05,
      })
      const mesh = new THREE.Mesh(ballGeom, mat)
      mesh.position.copy(randomInsideSphere(containerRadius - ballRadius * 1.5))
      root.add(mesh)

      const vel = new THREE.Vector3(
        (Math.random() * 2 - 1) * 0.45,
        (Math.random() * 2 - 1) * 0.45,
        (Math.random() * 2 - 1) * 0.45,
      )

      balls.push({ mesh, vel })
    }

    // Simulation (zero-G, perpetual motion)
    const restitution = 1.0
    const damping = 1.0
    const maxSpeed = 1.2
    const minSpeed = 0.22
    const normal = new THREE.Vector3()
    const tmp = new THREE.Vector3()

    let raf = 0
    let lastT = performance.now()

    function step(t: number) {
      const dt = Math.min((t - lastT) / 1000, 0.033)
      lastT = t

      for (const b of balls) {
        b.vel.multiplyScalar(damping)

        const sp = b.vel.length()
        if (sp > maxSpeed) b.vel.multiplyScalar(maxSpeed / sp)
        if (sp < minSpeed) {
          b.vel
            .copy(
              tmp
                .set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
                .normalize(),
            )
            .multiplyScalar(minSpeed)
        }

        b.mesh.position.addScaledVector(b.vel, dt)

        // collide with container wall (inside)
        const dist = b.mesh.position.length()
        const limit = containerRadius - ballRadius
        if (dist > limit) {
          normal.copy(b.mesh.position).normalize()
          b.mesh.position.copy(normal).multiplyScalar(limit)

          const vn = b.vel.dot(normal)
          if (vn > 0) b.vel.copy(reflectVelocity(b.vel, normal, restitution))
          if (b.vel.dot(normal) > -0.08) b.vel.addScaledVector(normal, -0.12)
        }
      }

      // ball-ball collisions (equal mass)
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i]
          const b = balls[j]
          tmp.subVectors(b.mesh.position, a.mesh.position)
          const d = tmp.length()
          const minD = ballRadius * 2
          if (d > 0 && d < minD) {
            const n = tmp.multiplyScalar(1 / d)
            const push = (minD - d) * 0.5
            a.mesh.position.addScaledVector(n, -push)
            b.mesh.position.addScaledVector(n, push)

            const rel = b.vel.clone().sub(a.vel)
            const reln = rel.dot(n)
            if (reln < 0) {
              const impulse = n.clone().multiplyScalar(-0.5 * (1 + restitution) * reln)
              a.vel.addScaledVector(impulse, -1)
              b.vel.addScaledVector(impulse, 1)
            }
          }
        }
      }

      renderer.render(scene, camera)
      raf = requestAnimationFrame(step)
    }

    const doResize = () => {
      const w = container.clientWidth || 600
      const h = container.clientHeight || 300
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      camera.lookAt(0, 0, 0)
      renderer.setSize(w, h)
    }

    const ro = new ResizeObserver(doResize)
    ro.observe(container)
    doResize()

    raf = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.dispose()
      container.innerHTML = ''
    }
  }, [])

  return (
    <div className="skandha-3d">
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}







