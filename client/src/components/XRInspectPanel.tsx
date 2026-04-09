import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { InspectSelection } from '../types/InspectSelection';
import { useStationaryDraggableXrPanel, type StationaryXrPanelLayout, } from '../pages/simulation/useStationaryDraggableXrPanel';
type XRInspectAction = 'detail' | 'back' | 'profile' | 'close' | 'voice' | 'how';
const XR_MENU = {
    cardRim: 0x4d7ab8,
    headerMuted: '#93c5fd',
    title: '#f8fafc',
    body: '#dbeafe',
    bodyDim: '#bfdbfe',
    optionBg: 0x3b82f6,
    optionBgOpacity: 0.16,
    optionBgHoverOpacity: 0.28,
    closeBg: 0x1e293b,
    closeBgHover: 0x334155,
    detailInner: 0xf8fafc,
} as const;
function createRoundedShapeGeometry(width: number, height: number, radius: number): THREE.ShapeGeometry {
    const hw = width * 0.5;
    const hh = height * 0.5;
    const r = Math.min(radius, hw, hh);
    const shape = new THREE.Shape();
    shape.moveTo(-hw + r, hh);
    shape.lineTo(hw - r, hh);
    shape.quadraticCurveTo(hw, hh, hw, hh - r);
    shape.lineTo(hw, -hh + r);
    shape.quadraticCurveTo(hw, -hh, hw - r, -hh);
    shape.lineTo(-hw + r, -hh);
    shape.quadraticCurveTo(-hw, -hh, -hw, -hh + r);
    shape.lineTo(-hw, hh - r);
    shape.quadraticCurveTo(-hw, hh, -hw + r, hh);
    return new THREE.ShapeGeometry(shape);
}
function createCardGradientTexture(): THREE.CanvasTexture {
    const W = 256;
    const H = 200;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        const t = new THREE.CanvasTexture(canvas);
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
    }
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, 'rgb(42, 58, 102)');
    g.addColorStop(0.5, 'rgb(28, 48, 90)');
    g.addColorStop(1, 'rgb(22, 52, 108)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
}
type OptionMenuIconKind = 'detail' | 'voice' | 'how';
function drawOptionMenuIcon(ctx: CanvasRenderingContext2D, size: number, kind: OptionMenuIconKind): void {
    const pad = 6;
    const w = size - pad * 2;
    const rad = 16;
    const rr = (ctx as CanvasRenderingContext2D & {
        roundRect?: (...a: number[]) => void;
    }).roundRect;
    ctx.fillStyle = 'rgb(24, 72, 108)';
    ctx.fillRect(0, 0, size, size);
    ctx.beginPath();
    if (typeof rr === 'function') {
        rr.call(ctx, pad, pad, w, w, rad);
    }
    else {
        ctx.rect(pad, pad, w, w);
    }
    const gr = ctx.createLinearGradient(0, 0, size, size);
    gr.addColorStop(0, 'rgb(52, 130, 226)');
    gr.addColorStop(1, 'rgb(22, 163, 118)');
    ctx.fillStyle = gr;
    ctx.fill();
    ctx.strokeStyle = 'rgb(120, 170, 230)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    const cx = size / 2;
    const cy = size / 2;
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.96)';
    ctx.fillStyle = 'rgba(248, 250, 252, 0.96)';
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (kind === 'detail') {
        ctx.beginPath();
        ctx.arc(cx - 5, cy - 5, 13, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 5, cy + 5);
        ctx.lineTo(cx + 19, cy + 19);
        ctx.stroke();
    }
    else if (kind === 'voice') {
        ctx.beginPath();
        ctx.moveTo(cx - 18, cy - 9);
        ctx.lineTo(cx - 10, cy - 9);
        ctx.lineTo(cx - 4, cy - 17);
        ctx.lineTo(cx - 4, cy + 17);
        ctx.lineTo(cx - 10, cy + 9);
        ctx.lineTo(cx - 18, cy + 9);
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.arc(cx - 1, cy, 11, -0.45, 0.45);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx - 1, cy, 18, -0.42, 0.42);
        ctx.stroke();
    }
    else {
        ctx.font = '700 54px system-ui, Segoe UI, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', cx, cy + 3);
    }
}
function createOptionMenuIconTexture(kind: OptionMenuIconKind): THREE.CanvasTexture {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        const t = new THREE.CanvasTexture(canvas);
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
    }
    drawOptionMenuIcon(ctx, size, kind);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
}
type XRInspectPanelProps = {
    selection: InspectSelection;
    inspectOpen: boolean;
    onViewDetail: (selection: InspectSelection) => void;
    onBack: () => void;
    onShowProfile: (selection: InspectSelection) => void;
    onVoice?: (selection: InspectSelection) => void;
    onClose: () => void;
    voiceLoading?: boolean;
    panelWorldAnchorRef?: React.MutableRefObject<THREE.Vector3>;
    stationaryLayout?: Partial<StationaryXrPanelLayout>;
    contentScale?: number;
};
export function XRInspectPanel({ selection, inspectOpen, onViewDetail, onBack, onShowProfile, onVoice, onClose, panelWorldAnchorRef, stationaryLayout, contentScale = 1, voiceLoading = false, }: XRInspectPanelProps) {
    const { gl, camera } = useThree();
    const layout: StationaryXrPanelLayout = {
        forward: stationaryLayout?.forward ?? 1.18,
        right: stationaryLayout?.right ?? 0.38,
        yDown: stationaryLayout?.yDown ?? 0.04,
    };
    const groupRef = useRef<THREE.Group | null>(null);
    const panelRef = useRef<THREE.Mesh | null>(null);
    const detailButtonRef = useRef<THREE.Mesh | null>(null);
    const voiceButtonRef = useRef<THREE.Mesh | null>(null);
    const howButtonRef = useRef<THREE.Mesh | null>(null);
    const backButtonRef = useRef<THREE.Mesh | null>(null);
    const profileButtonRef = useRef<THREE.Mesh | null>(null);
    const closeButtonRef = useRef<THREE.Mesh | null>(null);
    const [hoveredAction, setHoveredAction] = useState<XRInspectAction | null>(null);
    const hoveredActionRef = useRef<XRInspectAction | null>(null);
    const resolveActionForHit = useCallback((hitObject: THREE.Object3D): XRInspectAction | null => {
        const targets: Array<{
            ref: React.RefObject<THREE.Mesh | null>;
            action: XRInspectAction;
        }> = [
            { ref: detailButtonRef, action: 'detail' },
            { ref: voiceButtonRef, action: 'voice' },
            { ref: howButtonRef, action: 'how' },
            { ref: backButtonRef, action: 'back' },
            { ref: profileButtonRef, action: 'profile' },
            { ref: closeButtonRef, action: 'close' },
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
    const runAction = useCallback((action: XRInspectAction) => {
        if (action === 'detail') {
            if (!inspectOpen)
                onViewDetail(selection);
            return;
        }
        if (action === 'back') {
            if (inspectOpen)
                onBack();
            return;
        }
        if (action === 'profile') {
            onShowProfile(selection);
            return;
        }
        if (action === 'voice') {
            if (voiceLoading)
                return;
            onVoice?.(selection);
            return;
        }
        if (action === 'how') {
            return;
        }
        onClose();
    }, [inspectOpen, onBack, onClose, onShowProfile, onViewDetail, onVoice, selection, voiceLoading]);
    useEffect(() => {
        const xrRaycaster = new THREE.Raycaster();
        const rayOrigin = new THREE.Vector3();
        const rayDirection = new THREE.Vector3();
        const controllers = [gl.xr.getController(0), gl.xr.getController(1)];
        const clickTargets = [
            detailButtonRef.current,
            voiceButtonRef.current,
            howButtonRef.current,
            backButtonRef.current,
            profileButtonRef.current,
            closeButtonRef.current,
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
        layout,
        panelWorldAnchorRef,
    });
    useFrame(() => {
        let nextHovered: XRInspectAction | null = null;
        if (gl.xr.isPresenting) {
            const xrRaycaster = new THREE.Raycaster();
            const rayOrigin = new THREE.Vector3();
            const rayDirection = new THREE.Vector3();
            const controllers = [gl.xr.getController(0), gl.xr.getController(1)];
            const hoverTargets = [
                detailButtonRef.current,
                voiceButtonRef.current,
                howButtonRef.current,
                backButtonRef.current,
                profileButtonRef.current,
                closeButtonRef.current,
            ].filter(Boolean) as THREE.Object3D[];
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
    const optH = 0.114;
    const optW = 0.72;
    const iconS = 0.052;
    const cardW = 0.8;
    const cardHOptions = 0.72;
    const cardHDetail = 0.86;
    const rimPad = 0.04;
    const rimGeo = useMemo(() => createRoundedShapeGeometry(cardW + rimPad * 2, (inspectOpen ? cardHDetail : cardHOptions) + rimPad * 2, 0.07), [inspectOpen]);
    const rowGeo = useMemo(() => createRoundedShapeGeometry(optW, optH, 0.038), []);
    const closeGeo = useMemo(() => createRoundedShapeGeometry(0.088, 0.078, 0.02), []);
    const iconGeo = useMemo(() => createRoundedShapeGeometry(iconS, iconS, 0.014), []);
    const detailInnerGeo = useMemo(() => createRoundedShapeGeometry(0.68, 0.38, 0.028), []);
    const backGeo = useMemo(() => createRoundedShapeGeometry(0.24, 0.082, 0.02), []);
    const profileGeo = useMemo(() => createRoundedShapeGeometry(0.3, 0.082, 0.02), []);
    const cardGeo = useMemo(() => createRoundedShapeGeometry(cardW, inspectOpen ? cardHDetail : cardHOptions, 0.072), [inspectOpen]);
    const cardTex = useMemo(() => createCardGradientTexture(), []);
    const iconTexDetail = useMemo(() => createOptionMenuIconTexture('detail'), []);
    const iconTexVoice = useMemo(() => createOptionMenuIconTexture('voice'), []);
    const iconTexHow = useMemo(() => createOptionMenuIconTexture('how'), []);
    useEffect(() => {
        return () => {
            cardGeo.dispose();
        };
    }, [cardGeo]);
    useEffect(() => {
        return () => {
            cardTex.dispose();
            iconTexDetail.dispose();
            iconTexVoice.dispose();
            iconTexHow.dispose();
        };
    }, [cardTex, iconTexDetail, iconTexVoice, iconTexHow]);
    const optionRowMaterial = (action: XRInspectAction, disabled: boolean): THREE.MeshBasicMaterialParameters => {
        const hover = hoveredAction === action && !disabled;
        return {
            color: XR_MENU.optionBg,
            transparent: true,
            opacity: disabled ? 0.08 : hover ? XR_MENU.optionBgHoverOpacity : XR_MENU.optionBgOpacity,
            depthWrite: false,
        };
    };
    return (<group ref={groupRef}>
      <group scale={contentScale}>
        
        <mesh position={[0, 0, -0.003]} geometry={rimGeo}>
          <meshBasicMaterial color={XR_MENU.cardRim} transparent opacity={0.32} depthWrite={false} side={THREE.DoubleSide}/>
        </mesh>

        <mesh ref={panelRef} geometry={cardGeo}>
          <meshBasicMaterial map={cardTex} color={0xffffff} side={THREE.DoubleSide} toneMapped={false}/>
        </mesh>

        {!inspectOpen && (<>
            <Text position={[-0.36, 0.268, 0.004]} anchorX="left" anchorY="middle" fontSize={0.0155} letterSpacing={0.06} color={XR_MENU.bodyDim}>
              MENTAL SPHERE
            </Text>
            <Text position={[-0.36, 0.198, 0.004]} anchorX="left" anchorY="middle" fontSize={0.048} color={XR_MENU.title}>
              {selection.name}
            </Text>

            <mesh ref={closeButtonRef} position={[0.33, 0.238, 0.006]} geometry={closeGeo}>
              <meshBasicMaterial color={hoveredAction === 'close' ? XR_MENU.closeBgHover : XR_MENU.closeBg} transparent opacity={0.92} depthWrite={false} side={THREE.DoubleSide}/>
            </mesh>
            <Text position={[0.33, 0.238, 0.008]} anchorX="center" anchorY="middle" fontSize={0.032} color="#e5e7eb">
              ✕
            </Text>

            
            <mesh ref={detailButtonRef} position={[0, 0.078, 0.005]} geometry={rowGeo}>
              <meshBasicMaterial {...optionRowMaterial('detail', false)} side={THREE.DoubleSide}/>
            </mesh>
            <mesh position={[-0.296, 0.078, 0.008]} geometry={iconGeo}>
              <meshBasicMaterial map={iconTexDetail} transparent opacity={1} depthWrite={false} side={THREE.DoubleSide} toneMapped={false}/>
            </mesh>
            <Text position={[-0.19, 0.09, 0.008]} anchorX="left" anchorY="middle" fontSize={0.03} maxWidth={0.48} color={XR_MENU.title}>
              View Detail
            </Text>
            <Text position={[-0.19, 0.056, 0.008]} anchorX="left" anchorY="middle" fontSize={0.02} maxWidth={0.48} lineHeight={1.2} color={XR_MENU.body}>
              Inspect this sphere closely
            </Text>

            
            <mesh ref={voiceButtonRef} position={[0, -0.057, 0.005]} geometry={rowGeo}>
              <meshBasicMaterial {...optionRowMaterial('voice', voiceLoading)} side={THREE.DoubleSide}/>
            </mesh>
            <mesh position={[-0.296, -0.057, 0.008]} geometry={iconGeo}>
              <meshBasicMaterial map={iconTexVoice} transparent opacity={voiceLoading ? 0.38 : 1} depthWrite={false} side={THREE.DoubleSide} toneMapped={false}/>
            </mesh>
            <Text position={[-0.19, -0.045, 0.008]} anchorX="left" anchorY="middle" fontSize={0.03} maxWidth={0.48} color={voiceLoading ? '#94a3b8' : XR_MENU.title}>
              Voice
            </Text>
            <Text position={[-0.19, -0.077, 0.008]} anchorX="left" anchorY="middle" fontSize={0.02} maxWidth={0.48} lineHeight={1.2} color={XR_MENU.body}>
              {voiceLoading ? 'Generating audio…' : 'Hear a narrated explanation'}
            </Text>

            
            <mesh ref={howButtonRef} position={[0, -0.192, 0.005]} geometry={rowGeo}>
              <meshBasicMaterial {...optionRowMaterial('how', false)} side={THREE.DoubleSide}/>
            </mesh>
            <mesh position={[-0.296, -0.192, 0.008]} geometry={iconGeo}>
              <meshBasicMaterial map={iconTexHow} transparent opacity={1} depthWrite={false} side={THREE.DoubleSide} toneMapped={false}/>
            </mesh>
            <Text position={[-0.19, -0.18, 0.008]} anchorX="left" anchorY="middle" fontSize={0.03} maxWidth={0.48} color={XR_MENU.title}>
              How it works?
            </Text>
            <Text position={[-0.19, -0.212, 0.008]} anchorX="left" anchorY="middle" fontSize={0.02} maxWidth={0.48} lineHeight={1.2} color={XR_MENU.body}>
              Learn the mechanics in-game
            </Text>
          </>)}

        {inspectOpen && (<>
            <Text position={[-0.36, 0.352, 0.004]} anchorX="left" anchorY="middle" fontSize={0.016} color={XR_MENU.bodyDim}>
              DETAIL
            </Text>
            <Text position={[-0.36, 0.288, 0.004]} anchorX="left" anchorY="middle" fontSize={0.04} color={XR_MENU.title}>
              {selection.name}
            </Text>

            <mesh position={[0, -0.028, 0.005]} geometry={detailInnerGeo}>
              <meshBasicMaterial color={XR_MENU.detailInner} transparent opacity={0.94} depthWrite={false} side={THREE.DoubleSide}/>
            </mesh>
            <Text position={[-0.32, 0.162, 0.007]} anchorX="left" anchorY="top" fontSize={0.026} maxWidth={0.58} lineHeight={1.28} color="#1e293b">
              {selection.detail || 'No detail provided.'}
            </Text>
            <Text position={[-0.32, -0.182, 0.007]} anchorX="left" anchorY="middle" fontSize={0.022} color="#64748b">
              Type: {selection.type || 'mental'}
            </Text>

            <mesh ref={backButtonRef} position={[-0.13, -0.352, 0.006]} geometry={backGeo}>
              <meshBasicMaterial color={hoveredAction === 'back' ? XR_MENU.closeBgHover : XR_MENU.closeBg} transparent opacity={0.95} depthWrite={false} side={THREE.DoubleSide}/>
            </mesh>
            <Text position={[-0.13, -0.352, 0.008]} anchorX="center" anchorY="middle" fontSize={0.026} color="#f1f5f9">
              Back
            </Text>

            <mesh ref={profileButtonRef} position={[0.15, -0.352, 0.006]} geometry={profileGeo}>
              <meshBasicMaterial color={hoveredAction === 'profile' ? 0x0284c7 : 0x0ea5e9} transparent opacity={0.95} depthWrite={false} side={THREE.DoubleSide}/>
            </mesh>
            <Text position={[0.15, -0.352, 0.008]} anchorX="center" anchorY="middle" fontSize={0.026} color="#f8fafc">
              More detail
            </Text>
          </>)}
      </group>
    </group>);
}
export default XRInspectPanel;
