import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
export function XRStatusBridge({ onRendererReady, onPresentingChange, }: {
    onRendererReady?: (gl: THREE.WebGLRenderer) => void;
    onPresentingChange?: (presenting: boolean) => void;
}) {
    const { gl, camera } = useThree();
    const lastPresentingRef = useRef<boolean | null>(null);
    useEffect(() => {
        gl.xr.enabled = true;
        onRendererReady?.(gl);
    }, [gl, onRendererReady]);
    useFrame(() => {
        const presenting = gl.xr.isPresenting;
        if (lastPresentingRef.current !== presenting) {
            lastPresentingRef.current = presenting;
            onPresentingChange?.(presenting);
            if (!presenting) {
                const syncViewport = () => {
                    const canvas = gl.domElement;
                    const width = Math.max(1, canvas.clientWidth || window.innerWidth || 1);
                    const height = Math.max(1, canvas.clientHeight || window.innerHeight || 1);
                    gl.setSize(width, height, false);
                    if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
                        const perspective = camera as THREE.PerspectiveCamera;
                        perspective.aspect = width / height;
                        perspective.updateProjectionMatrix();
                    }
                };
                syncViewport();
                requestAnimationFrame(syncViewport);
                window.setTimeout(syncViewport, 120);
            }
        }
    });
    return null;
}
export function XRClearMode({ isArMode }: {
    isArMode: boolean;
}) {
    const { gl } = useThree();
    useEffect(() => {
        if (isArMode) {
            gl.setClearColor(0x000000, 0);
            return;
        }
        gl.setClearColor(0x000000, 1);
    }, [gl, isArMode]);
    return null;
}
export function XRControllers() {
    const { gl, scene } = useThree();
    useEffect(() => {
        const modelFactory = new XRControllerModelFactory();
        const detach: Array<() => void> = [];
        for (let index = 0; index < 2; index += 1) {
            const controller = gl.xr.getController(index);
            scene.add(controller);
            const rayGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, -1),
            ]);
            const rayMaterial = new THREE.LineBasicMaterial({
                color: 0x7dd3fc,
                transparent: true,
                opacity: 0.9,
            });
            const ray = new THREE.Line(rayGeometry, rayMaterial);
            ray.name = `xr-controller-ray-${index}`;
            ray.scale.z = 1.6;
            ray.visible = true;
            ray.renderOrder = 999;
            (ray.material as THREE.LineBasicMaterial).depthTest = false;
            controller.add(ray);
            const onConnected = (event: {
                data: XRInputSource;
            }) => {
                ray.visible = event.data.targetRayMode !== 'gaze';
            };
            const onDisconnected = () => {
                ray.visible = false;
            };
            controller.addEventListener('connected', onConnected);
            controller.addEventListener('disconnected', onDisconnected);
            const controllerGrip = gl.xr.getControllerGrip(index);
            const controllerModel = modelFactory.createControllerModel(controllerGrip);
            controllerGrip.add(controllerModel);
            scene.add(controllerGrip);
            const tipGeometry = new THREE.SphereGeometry(0.01, 12, 12);
            const tipMaterial = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
            const tip = new THREE.Mesh(tipGeometry, tipMaterial);
            tip.position.set(0, 0, -0.06);
            tip.renderOrder = 999;
            controller.add(tip);
            detach.push(() => {
                controller.removeEventListener('connected', onConnected);
                controller.removeEventListener('disconnected', onDisconnected);
                controller.remove(ray);
                controller.remove(tip);
                scene.remove(controller);
                controllerGrip.remove(controllerModel);
                scene.remove(controllerGrip);
                rayGeometry.dispose();
                rayMaterial.dispose();
                tipGeometry.dispose();
                tipMaterial.dispose();
            });
        }
        return () => {
            detach.forEach((fn) => fn());
        };
    }, [gl, scene]);
    return null;
}
export function XRExitByGrip({ enabled, holdMs = 5000, }: {
    enabled: boolean;
    holdMs?: number;
}) {
    const { gl } = useThree();
    const exitingRef = useRef(false);
    const holdStartAtRef = useRef<number | null>(null);
    useFrame(() => {
        if (!enabled || !gl.xr.isPresenting) {
            holdStartAtRef.current = null;
            exitingRef.current = false;
            return;
        }
        if (exitingRef.current)
            return;
        const session = gl.xr.getSession();
        if (!session) {
            holdStartAtRef.current = null;
            return;
        }
        let xPressed = false;
        for (const inputSource of session.inputSources) {
            if (inputSource.handedness !== 'left')
                continue;
            const gamepad = (inputSource as {
                gamepad?: Gamepad;
            }).gamepad;
            if (!gamepad || !gamepad.buttons?.length)
                continue;
            xPressed = Boolean(gamepad.buttons[4]?.pressed ||
                gamepad.buttons[5]?.pressed ||
                gamepad.buttons[3]?.pressed);
            if (xPressed)
                break;
        }
        if (!xPressed) {
            holdStartAtRef.current = null;
            return;
        }
        const now = performance.now();
        if (holdStartAtRef.current === null) {
            holdStartAtRef.current = now;
            return;
        }
        if (now - holdStartAtRef.current < holdMs)
            return;
        holdStartAtRef.current = null;
        exitingRef.current = true;
        gl.xr.getSession()?.end()
            .catch((error) => {
            console.error('Failed to end XR session via X-button hold', error);
        })
            .finally(() => {
            exitingRef.current = false;
        });
    });
    return null;
}
export function XRMovement({ enabled, moveSpeed = 1.8, sprintMultiplier = 1.8, turnSpeed = 1.8, initialOffset = [0, 0, 0], }: {
    enabled: boolean;
    moveSpeed?: number;
    sprintMultiplier?: number;
    turnSpeed?: number;
    initialOffset?: [
        number,
        number,
        number
    ];
}) {
    const { gl, camera } = useThree();
    const keysRef = useRef<Record<string, boolean>>({});
    const baseReferenceSpaceRef = useRef<XRReferenceSpace | null>(null);
    const locomotionOffsetRef = useRef(new THREE.Vector3());
    const yawRef = useRef(0);
    const forwardRef = useRef(new THREE.Vector3());
    const rightRef = useRef(new THREE.Vector3());
    const moveRef = useRef(new THREE.Vector3());
    const orientationRef = useRef(new THREE.Quaternion());
    const inverseOrientationRef = useRef(new THREE.Quaternion());
    const inversePositionRef = useRef(new THREE.Vector3());
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            keysRef.current[event.code] = true;
        };
        const onKeyUp = (event: KeyboardEvent) => {
            keysRef.current[event.code] = false;
        };
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, []);
    useFrame((_state, delta) => {
        if (!enabled || !gl.xr.isPresenting) {
            baseReferenceSpaceRef.current = null;
            locomotionOffsetRef.current.set(0, 0, 0);
            yawRef.current = 0;
            return;
        }
        if (!baseReferenceSpaceRef.current) {
            baseReferenceSpaceRef.current = gl.xr.getReferenceSpace();
            locomotionOffsetRef.current.set(initialOffset[0], initialOffset[1], initialOffset[2]);
            yawRef.current = 0;
        }
        const baseReferenceSpace = baseReferenceSpaceRef.current;
        if (!baseReferenceSpace)
            return;
        const keys = keysRef.current;
        let strafe = 0;
        let forward = 0;
        let turn = 0;
        const session = gl.xr.getSession();
        if (session) {
            for (const inputSource of session.inputSources) {
                const gamepad = (inputSource as {
                    gamepad?: Gamepad;
                }).gamepad;
                if (!gamepad || gamepad.axes.length < 2)
                    continue;
                const pairs: [
                    number,
                    number
                ][] = [[2, 3], [0, 1]];
                let bestPair: [
                    number,
                    number
                ] = [0, 1];
                let bestMagnitude = -1;
                for (const pair of pairs) {
                    const ax = gamepad.axes[pair[0]] ?? 0;
                    const ay = gamepad.axes[pair[1]] ?? 0;
                    const magnitude = Math.hypot(ax, ay);
                    if (magnitude > bestMagnitude) {
                        bestMagnitude = magnitude;
                        bestPair = pair;
                    }
                }
                const axisX = gamepad.axes[bestPair[0]] ?? 0;
                const axisY = gamepad.axes[bestPair[1]] ?? 0;
                if (Math.hypot(axisX, axisY) < 0.12)
                    continue;
                if (inputSource.handedness === 'left') {
                    strafe += axisX;
                    forward += -axisY;
                }
                else if (inputSource.handedness === 'right') {
                    turn += axisX;
                }
            }
        }
        if (Math.abs(turn) > 0.12) {
            yawRef.current -= turn * turnSpeed * delta;
        }
        let hasMovement = false;
        if (Math.abs(strafe) >= 0.001 || Math.abs(forward) >= 0.001) {
            hasMovement = true;
            forwardRef.current.set(0, 0, -1).applyAxisAngle(THREE.Object3D.DEFAULT_UP, yawRef.current);
            rightRef.current.set(1, 0, 0).applyAxisAngle(THREE.Object3D.DEFAULT_UP, yawRef.current);
            moveRef.current.set(0, 0, 0);
            moveRef.current.addScaledVector(rightRef.current, strafe);
            moveRef.current.addScaledVector(forwardRef.current, forward);
            const moveLen = moveRef.current.length();
            if (moveLen >= 1e-6) {
                moveRef.current.multiplyScalar(1 / moveLen);
                const speedMultiplier = keys.ShiftLeft || keys.ShiftRight ? sprintMultiplier : 1;
                const frameSpeed = moveSpeed * speedMultiplier * delta;
                locomotionOffsetRef.current.addScaledVector(moveRef.current, frameSpeed);
            }
        }
        const shouldUpdateReferenceSpace = hasMovement || Math.abs(turn) > 0.12 || locomotionOffsetRef.current.lengthSq() > 1e-8;
        if (!shouldUpdateReferenceSpace)
            return;
        const offset = locomotionOffsetRef.current;
        orientationRef.current.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, yawRef.current);
        inverseOrientationRef.current.copy(orientationRef.current).invert();
        inversePositionRef.current.copy(offset).applyQuaternion(inverseOrientationRef.current).multiplyScalar(-1);
        const referenceSpace = baseReferenceSpace.getOffsetReferenceSpace(new XRRigidTransform({ x: inversePositionRef.current.x, y: inversePositionRef.current.y, z: inversePositionRef.current.z }, {
            x: inverseOrientationRef.current.x,
            y: inverseOrientationRef.current.y,
            z: inverseOrientationRef.current.z,
            w: inverseOrientationRef.current.w,
        }));
        gl.xr.setReferenceSpace(referenceSpace);
    });
    return null;
}
