import type { ActivityPreset } from '../types';

export const ACTIVITIES: ActivityPreset[] = [
  { id: 'rest',       label: 'Rest',       icon: '🛋️', breathingRateLPerMin: 7  },
  { id: 'walk',       label: 'Walk',       icon: '🚶', breathingRateLPerMin: 15 },
  { id: 'brisk',      label: 'Brisk',      icon: '🚶‍♂️', breathingRateLPerMin: 20 },
  { id: 'jog',        label: 'Jog',        icon: '🏃', breathingRateLPerMin: 35 },
  { id: 'run',        label: 'Run',        icon: '⚡', breathingRateLPerMin: 50 },
  { id: 'cycling',    label: 'Cycling',    icon: '🚴', breathingRateLPerMin: 40 },
];

export const DEFAULT_ACTIVITY = ACTIVITIES[1]; // Walk
