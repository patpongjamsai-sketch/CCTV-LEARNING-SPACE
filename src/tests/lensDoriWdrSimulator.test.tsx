import { describe, it, expect } from 'vitest';

describe('CCTV Lens DORI & True WDR 120dB Engineering Simulator', () => {
  // EN 62676-4 Formula: PPM = (HorizontalPixels * f) / (Distance * SensorWidth)
  const calculatePPM = (horizontalPixels: number, focalLengthMm: number, distanceM: number, sensorWidthMm: number) => {
    return (horizontalPixels * focalLengthMm) / (distanceM * sensorWidthMm);
  };

  const getDoriCategory = (ppm: number) => {
    if (ppm >= 250) return 'Identification';
    if (ppm >= 125) return 'Recognition';
    if (ppm >= 63) return 'Observation';
    if (ppm >= 25) return 'Detection';
    return 'Below_Standard';
  };

  const H_PIXELS = 2560; // 4MP
  const SENSOR_WIDTH_MM = 5.37; // 1/2.8" CMOS

  it('calculates 2.8mm ultra-wide lens DORI thresholds accurately', () => {
    const f = 2.8;

    // At 4.5m: PPM = (2560 * 2.8) / (4.5 * 5.37) ≈ 296 PPM (Identification >= 250)
    const ppmClose = calculatePPM(H_PIXELS, f, 4.5, SENSOR_WIDTH_MM);
    expect(ppmClose).toBeGreaterThanOrEqual(250);
    expect(getDoriCategory(ppmClose)).toBe('Identification');

    // At 15m: PPM = (2560 * 2.8) / (15 * 5.37) ≈ 88.9 PPM (Observation 63 - 124)
    const ppmMid = calculatePPM(H_PIXELS, f, 15, SENSOR_WIDTH_MM);
    expect(getDoriCategory(ppmMid)).toBe('Observation');

    // At 35m: PPM = (2560 * 2.8) / (35 * 5.37) ≈ 38.1 PPM (Detection 25 - 62)
    const ppmFar = calculatePPM(H_PIXELS, f, 35, SENSOR_WIDTH_MM);
    expect(getDoriCategory(ppmFar)).toBe('Detection');
  });

  it('calculates 12.0mm telephoto lens for long distance License Plate Recognition (LPR)', () => {
    const f = 12.0;

    // At 15m: PPM = (2560 * 12) / (15 * 5.37) ≈ 381.4 PPM (Identification >= 250)
    const ppmAt15m = calculatePPM(H_PIXELS, f, 15, SENSOR_WIDTH_MM);
    expect(ppmAt15m).toBeGreaterThanOrEqual(250);
    expect(getDoriCategory(ppmAt15m)).toBe('Identification');

    // At 30m: PPM = (2560 * 12) / (30 * 5.37) ≈ 190.7 PPM (Recognition >= 125)
    const ppmAt30m = calculatePPM(H_PIXELS, f, 30, SENSOR_WIDTH_MM);
    expect(getDoriCategory(ppmAt30m)).toBe('Recognition');

    // At 60m: PPM = (2560 * 12) / (60 * 5.37) ≈ 95.3 PPM (Observation >= 63)
    const ppmAt60m = calculatePPM(H_PIXELS, f, 60, SENSOR_WIDTH_MM);
    expect(getDoriCategory(ppmAt60m)).toBe('Observation');
  });

  it('validates True WDR 120dB multi-shutter dynamic range specification', () => {
    // Normal single-shutter dynamic range: 60 dB
    // True WDR multi-shutter dynamic range: 120 dB (1,000,000:1 contrast ratio)
    const standardDrDb = 60;
    const trueWdrDb = 120;

    // Ratio = 10 ^ (dB / 20)
    const standardRatio = Math.pow(10, standardDrDb / 20); // 1,000:1
    const trueWdrRatio = Math.pow(10, trueWdrDb / 20); // 1,000,000:1

    expect(standardRatio).toBe(1000);
    expect(trueWdrRatio).toBe(1000000);
    expect(trueWdrRatio / standardRatio).toBe(1000); // 1000x broader dynamic range
  });

  it('verifies field technician quiz questions and answers', () => {
    // Question 1: Checkpoint at 15m for Identification (>= 250 PPM) -> 12.0mm lens
    const targetDistance = 15;
    const lenses = [2.8, 4.0, 6.0, 12.0];
    const qualifiedLenses = lenses.filter((f) => {
      const ppm = calculatePPM(H_PIXELS, f, targetDistance, SENSOR_WIDTH_MM);
      return ppm >= 250;
    });

    // Only 12.0mm satisfies >= 250 PPM at 15m
    expect(qualifiedLenses).toEqual([12.0]);
  });
});
