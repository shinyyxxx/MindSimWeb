import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { InspectSelection } from '../types/InspectSelection';
import { useStationaryDraggableXrPanel } from '../pages/simulation/useStationaryDraggableXrPanel';
type XRProfileAction = 'back';
type XRProfilePanelProps = {
    profile: InspectSelection;
    attrs: Array<{
        key: string;
        value: string;
    }>;
    onBack: () => void;
    panelWorldAnchorRef?: React.MutableRefObject<THREE.Vector3>;
};
export function XRProfilePanel({ profile, attrs, onBack, panelWorldAnchorRef, }: XRProfilePanelProps) {
    const { gl, camera } = useThree();
    const groupRef = useRef<THREE.Group | null>(null);
    const backButtonRef = useRef<THREE.Mesh | null>(null);
    const [hoveredAction, setHoveredAction] = useState<XRProfileAction | null>(null);
    const hoveredActionRef = useRef<XRProfileAction | null>(null);
    const resolveActionForHit = useCallback((hitObject: THREE.Object3D): XRProfileAction | null => {
        const targets: Array<{
            ref: React.RefObject<THREE.Mesh | null>;
            action: XRProfileAction;
        }> = [
            { ref: backButtonRef, action: 'back' },
        ];
        for (const target of targets) {
            const mesh = target.ref.current;
            if (!mesh)
                continue;
            let node: THREE.Object3D | null = hitObject;
            while (node) {
                if (node === mesh)
                    return target.action;
                node = node.parent;
            }
        }
        return null;
    }, []);
    const runAction = useCallback((action: XRProfileAction) => {
        if (action === 'back')
            onBack();
    }, [onBack]);
    useEffect(() => {
        const xrRaycaster = new THREE.Raycaster();
        const rayOrigin = new THREE.Vector3();
        const rayDirection = new THREE.Vector3();
        const controllers = [gl.xr.getController(0), gl.xr.getController(1)];
        const clickTargets = [
            backButtonRef.current,
        ].filter(Boolean) as THREE.Object3D[];
        const handleXrSelect = (event: Event) => {
            if (!gl.xr.isPresenting)
                return;
            if (!clickTargets.length)
                return;
            const controller = event.target as unknown as THREE.Object3D;
            rayOrigin.setFromMatrixPosition(controller.matrixWorld);
            rayDirection.set(0, 0, -1).transformDirection(controller.matrixWorld);
            xrRaycaster.set(rayOrigin, rayDirection);
            const hits = xrRaycaster.intersectObjects(clickTargets, true);
            if (!hits.length)
                return;
            const action = resolveActionForHit(hits[0].object);
            if (action)
                runAction(action);
        };
        controllers.forEach((controller) => {
            controller.addEventListener('selectstart', handleXrSelect as unknown as (event: {
                data: XRInputSource;
            }) => void);
        });
        return () => {
            controllers.forEach((controller) => {
                controller.removeEventListener('selectstart', handleXrSelect as unknown as (event: {
                    data: XRInputSource;
                }) => void);
            });
        };
    }, [gl, resolveActionForHit, runAction]);
    useStationaryDraggableXrPanel({
        groupRef,
        gl,
        camera,
        layout: { forward: 1.18, right: 0.38, yDown: 0.04 },
        panelWorldAnchorRef,
    });
    useFrame(() => {
        let nextHovered: XRProfileAction | null = null;
        if (gl.xr.isPresenting && backButtonRef.current) {
            const xrRaycaster = new THREE.Raycaster();
            const rayOrigin = new THREE.Vector3();
            const rayDirection = new THREE.Vector3();
            const controllers = [gl.xr.getController(0), gl.xr.getController(1)];
            const hoverTargets = [backButtonRef.current];
            for (const controller of controllers) {
                rayOrigin.setFromMatrixPosition(controller.matrixWorld);
                rayDirection.set(0, 0, -1).transformDirection(controller.matrixWorld);
                xrRaycaster.set(rayOrigin, rayDirection);
                const hits = xrRaycaster.intersectObjects(hoverTargets, true);
                if (!hits.length)
                    continue;
                nextHovered = resolveActionForHit(hits[0].object);
                if (nextHovered)
                    break;
            }
        }
        if (hoveredActionRef.current !== nextHovered) {
            hoveredActionRef.current = nextHovered;
            setHoveredAction(nextHovered);
        }
    });
    const truncate = (value: string, max = 56) => (value.length > max ? `${value.slice(0, max - 1)}...` : value);
    const detailText = truncate(profile.detail || 'No detail provided.', 90);
    const modelPathText = truncate(profile.modelPath || 'None', 48);
    return (<group ref={groupRef}>
      <mesh>
        <planeGeometry args={[1.62, 1.2]}/>
        <meshBasicMaterial color={0xf3f4f6} transparent opacity={0.98} side={THREE.DoubleSide}/>
      </mesh>

      <mesh position={[0, 0.44, 0.001]}>
        <planeGeometry args={[1.52, 0.22]}/>
        <meshBasicMaterial color={0xf9fafb}/>
      </mesh>
      <mesh position={[0, 0.33, 0.002]}>
        <planeGeometry args={[1.5, 0.005]}/>
        <meshBasicMaterial color={0xe2e8f0}/>
      </mesh>

      <mesh position={[-0.39, 0.03, 0.002]}>
        <planeGeometry args={[0.62, 0.8]}/>
        <meshBasicMaterial color={0xdbeafe}/>
      </mesh>
      <mesh position={[-0.39, 0.03, 0.003]}>
        <planeGeometry args={[0.6, 0.78]}/>
        <meshBasicMaterial color={0xeaf3ff}/>
      </mesh>
      <Text position={[-0.39, -0.02, 0.006]} anchorX="center" anchorY="middle" fontSize={0.03} color="#64748b">
        3D model preview (desktop panel feature)
      </Text>

      <mesh position={[0.39, 0.03, 0.002]}>
        <planeGeometry args={[0.78, 0.8]}/>
        <meshBasicMaterial color={0xf8fafc}/>
      </mesh>

      <Text position={[-0.72, 0.47, 0.004]} anchorX="left" anchorY="middle" fontSize={0.024} color="#64748b">
        Mental Detail
      </Text>
      <Text position={[-0.72, 0.40, 0.004]} anchorX="left" anchorY="middle" fontSize={0.076} color="#0f172a">
        {profile.name}
      </Text>
      <Text position={[-0.72, 0.33, 0.004]} anchorX="left" anchorY="middle" fontSize={0.039} color="#475569">
        {profile.type || 'mental'}
      </Text>

      <Text position={[0.04, 0.16, 0.006]} anchorX="left" anchorY="middle" fontSize={0.052} color="#0f172a">
        {`Name: ${profile.name}`}
      </Text>
      <Text position={[0.04, 0.09, 0.006]} anchorX="left" anchorY="middle" fontSize={0.052} color="#0f172a">
        {`Type: ${profile.type || 'mental'}`}
      </Text>
      <Text position={[0.04, 0.02, 0.006]} anchorX="left" anchorY="middle" fontSize={0.052} color="#0f172a">
        Detail:
      </Text>
      <Text position={[0.04, -0.03, 0.006]} anchorX="left" anchorY="top" fontSize={0.036} maxWidth={0.68} lineHeight={1.15} color="#1f2937">
        {detailText}
      </Text>
      <Text position={[0.04, -0.15, 0.006]} anchorX="left" anchorY="middle" fontSize={0.045} color="#0f172a">
        {`Model path: ${modelPathText}`}
      </Text>
      {profile.labelNumber && (<Text position={[0.04, -0.22, 0.006]} anchorX="left" anchorY="middle" fontSize={0.045} color="#0f172a">
          {`Label #: ${profile.labelNumber}`}
        </Text>)}
      <Text position={[0.04, -0.27, 0.006]} anchorX="left" anchorY="middle" fontSize={0.04} color="#0f172a">
        Attributes:
      </Text>
      <mesh position={[0.25, -0.33, 0.005]}>
        <planeGeometry args={[0.34, 0.09]}/>
        <meshBasicMaterial color={attrs.length ? 0xe0f2fe : 0xe5e7eb}/>
      </mesh>
      <Text position={[0.25, -0.33, 0.007]} anchorX="center" anchorY="middle" fontSize={0.028} color={attrs.length ? '#0f172a' : '#4b5563'}>
        {attrs.length ? `${attrs[0].key}: ${attrs[0].value || '—'}` : 'No attributes yet.'}
      </Text>
      {attrs.length > 1 && (<Text position={[0.04, -0.39, 0.006]} anchorX="left" anchorY="middle" fontSize={0.028} color="#334155">
          {`+${attrs.length - 1} more`}
        </Text>)}

      <mesh position={[0.26, -0.47, 0.004]}>
        <planeGeometry args={[0.28, 0.14]}/>
        <meshBasicMaterial color={0xf1f5f9}/>
      </mesh>

      <mesh ref={backButtonRef} position={[0.26, -0.47, 0.004]} onPointerDown={() => runAction('back')} onPointerOver={() => setHoveredAction('back')} onPointerOut={() => setHoveredAction(null)}>
        <planeGeometry args={[0.24, 0.1]}/>
        <meshBasicMaterial color={hoveredAction === 'back' ? 0x475569 : 0x64748b}/>
      </mesh>
      <Text position={[0.26, -0.47, 0.006]} anchorX="center" anchorY="middle" fontSize={0.035} color="#f8fafc">
        Back
      </Text>

      
    </group>);
}
export default XRProfilePanel;
