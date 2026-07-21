export const motion = {
  instant: 80,
  fast: 120,
  base: 200,
  slow: 350,
  reveal: 500,
  easeStandard: [0.4, 0, 0.2, 1] as const,
  easeOut: [0, 0, 0.2, 1] as const,
};

export function motionDuration(milliseconds: number, reduced: boolean) {
  return reduced ? 0.01 : milliseconds / 1000;
}
