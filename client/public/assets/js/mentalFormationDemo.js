// Three.js demo: "Mental Formations" - small spheres bouncing inside a transparent sphere.
// Loaded as an ES module from FastHTML via: <script type="module" src="/assets/js/mentalFormationDemo.js"></script>

import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const TARGET_ID = "samskara-demo";

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function reflectVelocity(vel, normal, restitution = 0.9) {
  // v' = v - (1 + e) * (v·n) * n
  const vn = vel.dot(normal);
  return vel.clone().sub(normal.clone().multiplyScalar((1 + restitution) * vn));
}

function init(container) {
  // Clean previous canvas if hot-reloaded
  container.innerHTML = "";

  const width = container.clientWidth || 600;
  const height = container.clientHeight || 300;

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 100);
  // Center the container sphere in view (prevents bottom cut-off)
  camera.position.set(0, 0.0, 2.6);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  // Lighting
  const hemi = new THREE.HemisphereLight(0xffffff, 0x334155, 0.9);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 1.1);
  dir.position.set(2, 3, 4);
  scene.add(dir);

  // Group to allow simple mouse-drag rotation
  const root = new THREE.Group();
  scene.add(root);

  // Container sphere
  const containerRadius = 0.9;
  const containerGeom = new THREE.SphereGeometry(containerRadius, 64, 64);
  // Unlit transparent container (no lighting highlights/reflections)
  const containerMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b, // amber tint
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    toneMapped: false,
  });
  const containerMesh = new THREE.Mesh(containerGeom, containerMat);
  root.add(containerMesh);

  // No wireframe outline (as requested)

  // Small spheres (mental factors)
  const ballCount = 18;
  const ballRadius = 0.06;
  const balls = [];
  const ballGeom = new THREE.SphereGeometry(ballRadius, 24, 24);

  const palette = [
    0xff6b6b, // Focus
    0x4ecdc4, // Creativity
    0x95e1d3, // Mindfulness
    0xf38181, // Resilience
    0xaa96da, // Clarity
  ];

  function randomInsideSphere(r) {
    // Rejection sampling in cube
    for (let i = 0; i < 50; i++) {
      const x = (Math.random() * 2 - 1) * r;
      const y = (Math.random() * 2 - 1) * r;
      const z = (Math.random() * 2 - 1) * r;
      if (x * x + y * y + z * z <= r * r) return new THREE.Vector3(x, y, z);
    }
    return new THREE.Vector3(0, 0, 0);
  }

  for (let i = 0; i < ballCount; i++) {
    // Shaded material (restored)
    const mat = new THREE.MeshStandardMaterial({
      color: palette[i % palette.length],
      roughness: 0.35,
      metalness: 0.05,
    });
    const mesh = new THREE.Mesh(ballGeom, mat);
    mesh.position.copy(randomInsideSphere(containerRadius - ballRadius * 1.5));
    root.add(mesh);

    const vel = new THREE.Vector3(
      (Math.random() * 2 - 1) * 0.45,
      (Math.random() * 2 - 1) * 0.45,
      (Math.random() * 2 - 1) * 0.45
    );

    balls.push({ mesh, vel });
  }

  // No rotation / no interaction on the container sphere (display-only as requested)
  // Keep the camera fixed and render the simulation.

  // Simulation
  // Zero gravity: balls drift and bounce (wall + each other)
  const damping = 1.0; // no energy loss -> keeps motion going
  const restitution = 1.0; // elastic
  const maxSpeed = 1.2;
  const minSpeed = 0.22; // keeps motion alive without being too jittery

  const tmp = new THREE.Vector3();
  const normal = new THREE.Vector3();
  let lastT = performance.now();

  function step(t) {
    const dt = Math.min((t - lastT) / 1000, 0.033);
    lastT = t;

    // Update positions
    for (const b of balls) {
      b.vel.multiplyScalar(damping);

      // clamp speed
      const sp = b.vel.length();
      if (sp > maxSpeed) b.vel.multiplyScalar(maxSpeed / sp);
      if (sp < minSpeed) {
        // reset to a minimum speed so spheres never settle
        b.vel
          .copy(tmp.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize())
          .multiplyScalar(minSpeed);
      }

      b.mesh.position.addScaledVector(b.vel, dt);

      // Collide with container sphere (inside)
      const dist = b.mesh.position.length();
      const limit = containerRadius - ballRadius;
      if (dist > limit) {
        // push back to surface
        normal.copy(b.mesh.position).normalize();
        b.mesh.position.copy(normal).multiplyScalar(limit);
        // reflect if moving outward; otherwise keep but ensure it doesn't "stick"
        const vn = b.vel.dot(normal);
        if (vn > 0) b.vel.copy(reflectVelocity(b.vel, normal, restitution));
        // small inward nudge if it's nearly tangential or stationary at the wall
        if (b.vel.dot(normal) > -0.08) b.vel.addScaledVector(normal, -0.12);
      }
    }

    // Ball-ball collisions (equal mass, near-elastic) + overlap resolution
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const a = balls[i];
        const b = balls[j];
        tmp.subVectors(b.mesh.position, a.mesh.position);
        const d = tmp.length();
        const minD = ballRadius * 2;
        if (d > 0 && d < minD) {
          const n = tmp.multiplyScalar(1 / d); // collision normal
          const push = (minD - d) * 0.5;

          // separate positions
          a.mesh.position.addScaledVector(n, -push);
          b.mesh.position.addScaledVector(n, push);

          // impulse for equal masses
          const rel = b.vel.clone().sub(a.vel);
          const reln = rel.dot(n);
          if (reln < 0) {
            const impulse = n.clone().multiplyScalar(-0.5 * (1 + restitution) * reln);
            a.vel.addScaledVector(impulse, -1);
            b.vel.addScaledVector(impulse, 1);
          }
        }
      }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  // Resize handling
  const ro = new ResizeObserver(() => {
    const w = container.clientWidth || 600;
    const h = container.clientHeight || 300;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    camera.lookAt(0, 0, 0);
    renderer.setSize(w, h);
  });
  ro.observe(container);
}

window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById(TARGET_ID);
  if (!container) return;
  init(container);
});


