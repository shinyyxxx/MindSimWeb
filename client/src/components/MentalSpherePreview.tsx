import React, { useLayoutEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import type Mental from '../mindwebsite/classes/Mental';
import { createMentalForPreview } from '../utils/mentalPreviewFactory';
import type { CetasikaCard } from '../data/cetasikaGrid';
function MentalSphereScene({ card, accentColor }: {
    card: CetasikaCard;
    accentColor: string;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const mentalRef = useRef<Mental | null>(null);
    useLayoutEffect(() => {
        const mental = createMentalForPreview(card, accentColor);
        mentalRef.current = mental;
        const mesh = mental.getMesh();
        if (mesh && groupRef.current)
            groupRef.current.add(mesh);
        return () => {
            const g = groupRef.current;
            const m = mentalRef.current?.getMesh();
            if (m && g)
                g.remove(m);
            if (mentalRef.current?.dispose)
                mentalRef.current.dispose();
            mentalRef.current = null;
        };
    }, [card.id, accentColor]);
    return <group ref={groupRef}/>;
}
export function MentalSpherePreview({ card, accentColor, }: {
    card: CetasikaCard;
    accentColor: string;
}): React.ReactElement {
    return (<Canvas style={{ display: 'block', width: '100%', height: 100, borderRadius: 8 }} camera={{ position: [0, 0, 2.2], fov: 50 }} gl={{ antialias: true, alpha: true }} frameloop="always">
      <ambientLight intensity={0.9}/>
      <directionalLight position={[2, 2, 2]} intensity={1}/>
      <MentalSphereScene card={card} accentColor={accentColor}/>
    </Canvas>);
}
