'use client';

import React from 'react';
import { BulletCameraRig } from './BulletCameraRig';

interface GhostCameraRigProps {
  position?: [number, number, number];
  idealPan?: number;
  idealTilt?: number;
  idealRotation?: number;
}

export const GhostCameraRig: React.FC<GhostCameraRigProps> = ({
  position = [1.2, 2.8, -0.05],
  idealPan = 18,
  idealTilt = -22,
  idealRotation = 0,
}) => {
  return (
    <group>
      <BulletCameraRig
        position={position}
        pan={idealPan}
        tilt={idealTilt}
        rotation={idealRotation}
        showFovCone={true}
        isGhost={true}
      />
    </group>
  );
};
