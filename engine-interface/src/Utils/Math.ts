/**
 * Returns the given angle in radians, converted to degrees.
 * @param radians The angle in radians.
 * @returns The angle in degrees.
 */
export function radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
}

/**
 * Returns the given angle in degrees, converted to radians.
 * @param degrees The angle in degrees.
 * @returns The angle in radians.
 */
export function degToRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
}
