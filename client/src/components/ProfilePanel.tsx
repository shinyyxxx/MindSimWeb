import React, { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { InspectSelection } from '../types/InspectSelection'

type Marker = { key: string; value: string; position: { x: number; y: number; z: number } }

type ProfilePanelProps = {
  profile: InspectSelection
  attrs: Array<{ key: string; value: string }>
  markers: Marker[]
  attrKey: string
  attrValue: string
  onAttrKeyChange: (v: string) => void
  onAttrValueChange: (v: string) => void
  onAddAttribute: () => void
  onClose: () => void
}

function ProfileModelView({ modelPath, markers }: { modelPath: string; markers: Marker[] }) {
  const [scene, setScene] = useState<THREE.Group | null>(null)

  useEffect(() => {
    const loader = new GLTFLoader()
    let mounted = true
    loader.load(
      modelPath,
      (gltf) => {
        if (mounted) {
          // Center and normalize the model to fit the view
          const box = new THREE.Box3().setFromObject(gltf.scene)
          const center = box.getCenter(new THREE.Vector3())
          const size = box.getSize(new THREE.Vector3())
          gltf.scene.position.sub(center) // center at origin

          const maxDim = Math.max(size.x, size.y, size.z)
          const targetSize = 0.4
          const scale = maxDim > 0 ? targetSize / maxDim : 1
          gltf.scene.scale.setScalar(scale)

          setScene(gltf.scene)
        }
      },
      undefined,
      (err) => console.error('Failed to load profile model', err),
    )
    return () => {
      mounted = false
    }
  }, [modelPath])

  return (
    <Canvas camera={{ position: [0, 0.55, 0.8], fov: 45 }} style={{ width: '100%', height: '100%' }} gl={{ antialias: true }}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 3]} intensity={1.6} />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} />
      <OrbitControls enablePan={false} enableZoom enableRotate target={[0, 0, 0]} />
      {scene && <primitive object={scene} position={[0, -0.2, 0]} />}
      {markers.map((m) => (
        <mesh
          key={m.key}
          position={[m.position.x, m.position.y, m.position.z]}
          castShadow={false}
          receiveShadow={false}
        >
          <sphereGeometry args={[0.03, 24, 24]} />
          <meshStandardMaterial color="#f59e0b" emissive="#92400e" emissiveIntensity={0.35} roughness={0.3} metalness={0.1} />
        </mesh>
      ))}
    </Canvas>
  )
}

function ProfilePanel({
  profile,
  attrs,
  markers,
  attrKey,
  attrValue,
  onAttrKeyChange,
  onAttrValueChange,
  onAddAttribute,
  onClose,
}: ProfilePanelProps) {
  const isPerception = profile.type === 'perception_mental'

  return (
    <div className="profile-panel">
      <div className="profile-panel__header">
        <div>
          <div className="profile-panel__eyebrow">Mental Detail</div>
          <div className="profile-panel__title">{profile.name}</div>
          <div className="profile-panel__subtitle">{profile.type || 'mental'}</div>
        </div>
        <button className="profile-panel__close" onClick={onClose} aria-label="Close profile">
          ✕
        </button>
      </div>
      <div className="profile-panel__body">
        <div className="profile-panel__model">
          {profile.modelPath ? (
            isPerception ? (
              <ProfileModelView modelPath={profile.modelPath} markers={markers} />
            ) : (
              <model-viewer
                src={profile.modelPath}
                auto-rotate
                camera-controls
                style={{ width: '100%', height: '100%', background: 'transparent' }}
              />
            )
          ) : (
            <div className="profile-panel__placeholder">No model available</div>
          )}
        </div>
        <div className="profile-panel__attrs">
          <div className="profile-panel__attr"><strong>Name:</strong> {profile.name}</div>
          <div className="profile-panel__attr"><strong>Type:</strong> {profile.type || 'mental'}</div>
          <div className="profile-panel__attr"><strong>Detail:</strong> {profile.detail || 'No detail provided.'}</div>
          <div className="profile-panel__attr"><strong>Model path:</strong> {profile.modelPath || 'None'}</div>
          {profile.labelNumber && (
            <div className="profile-panel__attr"><strong>Label #:</strong> {profile.labelNumber}</div>
          )}
          {isPerception && (
            <>
              <div className="profile-panel__attr"><strong>Attributes:</strong></div>
              <div className="profile-panel__chips">
                {attrs.length === 0 && <span className="profile-panel__chip muted">No attributes yet.</span>}
                {attrs.map((attr) => (
                  <span key={attr.key} className="profile-panel__chip">
                    <span className="profile-panel__chip-dot" />
                    <span>{attr.key}: {attr.value || '—'}</span>
                  </span>
                ))}
              </div>
              <div className="profile-panel__form">
                <input
                  className="profile-panel__input"
                  placeholder="Key"
                  value={attrKey}
                  onChange={(e) => onAttrKeyChange(e.target.value)}
                />
                <input
                  className="profile-panel__input"
                  placeholder="Value"
                  value={attrValue}
                  onChange={(e) => onAttrValueChange(e.target.value)}
                />
                <button className="profile-panel__btn" type="button" onClick={onAddAttribute}>
                  Add
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePanel
export { ProfilePanel }


