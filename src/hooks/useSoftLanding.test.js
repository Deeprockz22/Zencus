import { describe, it, expect } from 'vitest';
import { calculateSoftLanding, SOFT_LANDING_SECONDS } from './useSoftLanding';

describe('useSoftLanding Foundation (#6)', () => {
  it('returns inactive state when paused or during break', () => {
    expect(calculateSoftLanding(45, false, 'work').isSoftLanding).toBe(false);
    expect(calculateSoftLanding(45, true, 'shortBreak').isSoftLanding).toBe(false);
  });

  it('returns inactive state when more than 60 seconds remain', () => {
    const res = calculateSoftLanding(120, true, 'work');
    expect(res.isSoftLanding).toBe(false);
    expect(res.volumeFactor).toBe(1.0);
  });

  it('activates during the last 60 seconds and softly scales volume factor', () => {
    const at60 = calculateSoftLanding(60, true, 'work');
    expect(at60.isSoftLanding).toBe(true);
    expect(at60.softLandingProgress).toBe(0);
    expect(at60.volumeFactor).toBe(1.0);

    const at30 = calculateSoftLanding(30, true, 'work');
    expect(at30.isSoftLanding).toBe(true);
    expect(at30.softLandingProgress).toBe(0.5);
    expect(at30.volumeFactor).toBe(0.85);

    const at0 = calculateSoftLanding(0, true, 'work');
    expect(at0.isSoftLanding).toBe(false); // session reached zero
  });
});
