export const SHAFT_NAMES = [
  'OVVIO Red 4A',
  'OVVIO Red 4R',
  'OVVIO Red 5R',
  'OVVIO Green 5S',
  'OVVIO Green 6S',
  'OVVIO Green 6X',
  'OVVIO Green 7X',
  'OVVIO Blue 5R',
  'OVVIO Blue 5S',
  'OVVIO Blue 6S',
  'OVVIO Blue 7X'
] as const;

export type ShaftName = typeof SHAFT_NAMES[number];

export const SHAFT_INDEX: { [key: string]: number } = {};
SHAFT_NAMES.forEach((name, index) => {
  SHAFT_INDEX[name] = index;
});

export const SWING_SPEED_MAPPING = {
  'under85': 0,
  '85-95': 1,
  '96-105': 2,
  '106-115': 3,
  'over115': 4
} as const;

export const SHOT_SHAPE_MAPPING = {
  'fade': 0,
  'draw': 1,
  'straight': 2
} as const;

export type SwingSpeed = keyof typeof SWING_SPEED_MAPPING;
export type ShotShape = keyof typeof SHOT_SHAPE_MAPPING;