export const IS_DEV = import.meta.env.DEV;

export type TNetworks = 'DAN' | 'DMN' | 'FPN' | 'LN' | 'SMN' | 'VAN' | 'VN';

export const NETWORKS: Record<
  TNetworks,
  { name: string; mesh?: THREE.Mesh; color: number; position: number[] }
> = {
  DAN: {
    name: 'Dorsal Attention',
    color: 0x19c246,
    position: [-75, 155, -184],
  },
  DMN: {
    name: 'Default Mode',
    color: 0xdb0007,
    position: [160, 128, 179],
  },
  FPN: {
    name: 'Frontoparietal',
    color: 0xc97a02,
    position: [-146, 108, 229],
  },
  LN: {
    name: 'Limbic',
    color: 0xecff19,
    position: [0, -100, 250],
  },
  SMN: {
    name: 'Sensorimotor',
    color: 0x33ddff,
    position: [-219, 168, 100],
  },
  VAN: {
    name: 'Ventral Attention',
    color: 0xff2b95,
    position: [-117, 182, 124],
  },
  VN: {
    name: 'Visual',
    color: 0x8502a6,
    position: [0, -45, -250],
  },
};

export enum ClipDirection {
  TOP = 'TOP',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  FRONT = 'FRONT',
}
