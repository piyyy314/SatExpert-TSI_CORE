import { Satellite } from '../types';

/**
 * Checks if two satellite objects differ significantly in orbital parameters or status.
 * Prevents redundant object allocations and component re-renders.
 */
export function hasMeaningfulOrbitalDrift(a: Satellite, b: Satellite): boolean {
  if (a.id !== b.id || a.status !== b.status || a.name !== b.name || a.orbitalSlot !== b.orbitalSlot) {
    return true;
  }
  // Orbital parameters tolerance thresholds
  const apogeeThreshold = 1.0; // 1 km
  const perigeeThreshold = 1.0; // 1 km
  const velocityThreshold = 0.01; // 0.01 km/s
  const longitudeThreshold = 0.005; // 0.005 degrees

  const apogeeDrift = Math.abs((a.apogee || 0) - (b.apogee || 0));
  const perigeeDrift = Math.abs((a.perigee || 0) - (b.perigee || 0));
  const velocityDrift = Math.abs((a.velocity || 0) - (b.velocity || 0));
  const longitudeDrift = Math.abs((a.longitude || 0) - (b.longitude || 0));

  return (
    apogeeDrift >= apogeeThreshold ||
    perigeeDrift >= perigeeThreshold ||
    velocityDrift >= velocityThreshold ||
    longitudeDrift >= longitudeThreshold
  );
}

/**
 * Calculates a smooth, bounded simulated orbital jitter for a satellite constellation.
 */
export function calculateSimulatedOrbitalDrift(prevSats: Satellite[]): Satellite[] {
  let anyChanged = false;
  const nextSats = prevSats.map(sat => {
    const apogeeDiff = (Math.random() - 0.5) * 3.5;
    const perigeeDiff = (Math.random() - 0.5) * 3.5;
    const velocityDiff = (Math.random() - 0.5) * 0.004;
    const longitudeDiff = (Math.random() - 0.5) * 0.002;

    const nextApogee = Math.max(30000, Math.min(41000, Math.round(((sat.apogee || 35786) + apogeeDiff) * 10) / 10));
    const nextPerigee = Math.max(30000, Math.min(41000, Math.round(((sat.perigee || 35786) + perigeeDiff) * 10) / 10));
    const nextVelocity = Math.max(1.5, Math.min(6.5, Math.round(((sat.velocity || 3.07) + velocityDiff) * 1000) / 1000));
    const nextLongitude = Math.max(-180, Math.min(180, Math.round((sat.longitude + longitudeDiff) * 10000) / 10000));

    // Only create a new object if there is a measurable difference
    if (
      Math.abs(nextApogee - (sat.apogee || 0)) > 0.05 ||
      Math.abs(nextPerigee - (sat.perigee || 0)) > 0.05 ||
      Math.abs(nextVelocity - (sat.velocity || 0)) > 0.0005 ||
      Math.abs(nextLongitude - sat.longitude) > 0.0001
    ) {
      anyChanged = true;
      return {
        ...sat,
        apogee: nextApogee,
        perigee: nextPerigee,
        velocity: nextVelocity,
        longitude: nextLongitude,
      };
    }

    return sat;
  });

  return anyChanged ? nextSats : prevSats;
}

/**
 * Debounce helper for function execution with cleanup.
 */
export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): {
  (...args: Parameters<T>): void;
  cancel: () => void;
} {
  let timeout: NodeJS.Timeout | number | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };

  debounced.cancel = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}
