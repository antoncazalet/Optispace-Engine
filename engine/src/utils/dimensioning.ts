import { configDimUnit, Configuration } from "./configuration";
/** Dimensioning in Inch. */
export const dimInch = "inch";

/** Dimensioning in Inch. */
export const dimFeetAndInch = "feetAndInch";

/** Dimensioning in Meter. */
export const dimMeter = "m";

/** Dimensioning in Centi Meter. */
export const dimCentiMeter = "cm";

/** Dimensioning in Milli Meter. */
export const dimMilliMeter = "mm";

export const decimals = 1000;

export const cmPerFoot = 30.48;
export const pixelsPerFoot = 15.0;
export const cmPerPixel = cmPerFoot * (1.0 / pixelsPerFoot);
export const pixelsPerCm = 1.0 / cmPerPixel;

export const dimensioningOptions = [dimInch, dimFeetAndInch, dimMeter, dimCentiMeter, dimMilliMeter];

/** Dimensioning functions. */
export class Dimensioning {
    static cmToPixel(cm: number, apply_scale = true): number {
        if (apply_scale) {
            return cm * pixelsPerCm * Configuration.getValue("scale");
        }
        return cm * pixelsPerCm;
    }

    static pixelToCm(pixel: number, apply_scale = true): number {
        if (apply_scale) {
            return pixel * cmPerPixel * (1.0 / Configuration.getValue("scale"));
        }
        return pixel * cmPerPixel;
    }

    static roundOff(value: number, wantedDecimals: number): number {
        return Math.round(wantedDecimals * value) / wantedDecimals;
    }

    /** Converts cm to dimensioning number.
     * @param cm Centi meter value to be converted.
     * @returns Number representation.
     */
    static cmFromMeasureRaw(measure: number): number {
        switch (Configuration.getValue(configDimUnit)) {
            case dimFeetAndInch:
                return Math.round(decimals * (measure * 30.480016459203095991)) / decimals;
            case dimInch:
                return Math.round(decimals * (measure * 2.5400013716002578512)) / decimals;
            case dimMilliMeter:
                return Math.round(decimals * (measure * 0.10000005400001014955)) / decimals;
            case dimCentiMeter:
                return measure;
            case dimMeter:
            default:
                return Math.round(decimals * 100 * measure) / decimals;
        }
    }

    /** Converts cm to dimensioning string.
     * @param cm Centi meter value to be converted.
     * @returns String representation.
     */
    static cmFromMeasure(measure: number): string {
        switch (Configuration.getValue(configDimUnit)) {
            case dimFeetAndInch:
                return (Math.round(decimals * (measure * 30.480016459203095991)) / decimals).toString() + "cm";
            case dimInch:
                return (Math.round(decimals * (measure * 2.5400013716002578512)) / decimals).toString() + "cm";
            case dimMilliMeter:
                return (Math.round(decimals * (measure * 0.10000005400001014955)) / decimals).toString() + "cm";
            case dimCentiMeter:
                return measure.toString();
            case dimMeter:
            default:
                return (Math.round(decimals * 100 * measure) / decimals).toString() + "cm";
        }
    }

    /** Converts cm to dimensioning string.
     * @param cm Centi meter value to be converted.
     * @returns String representation.
     */
    static cmToMeasureRaw(cm: number, power = 1): number {
        switch (Configuration.getValue(configDimUnit)) {
            case dimFeetAndInch: // dimFeetAndInch returns only the feet
                return cm * Math.pow(0.032808416666669996953, power);
            case dimInch:
                return Math.round(decimals * (cm * Math.pow(0.3937, power))) / decimals;
            case dimMilliMeter:
                return Math.round(decimals * (cm * Math.pow(10, power))) / decimals;
            case dimCentiMeter:
                return Math.round(decimals * cm) / decimals;
            case dimMeter:
            default:
                return Math.round(decimals * (cm * Math.pow(0.01, power))) / decimals;
        }
    }

    /** Converts cm to dimensioning string.
     * @param cm Centi meter value to be converted.
     * @returns String representation.
     */
    // TODO: Find a way to not disable eslint and have a clean code.
    /* eslint-disable no-case-declarations */
    static cmToMeasure(cm: number, power = 1): string {
        switch (Configuration.getValue(configDimUnit)) {
            case dimFeetAndInch:
                const allInFeet = cm * Math.pow(0.032808416666669996953, power);
                const floorFeet = Math.floor(allInFeet);
                const remainingFeet = allInFeet - floorFeet;
                const remainingInches = Math.round(remainingFeet * 12);
                return `${floorFeet.toString()}'${remainingInches.toString()}'`;
            case dimInch:
                const inches = Math.round(decimals * (cm * Math.pow(0.3937, power))) / decimals;
                return inches.toString() + "'";
            case dimMilliMeter:
                const mm = Math.round(decimals * (cm * Math.pow(10, power))) / decimals;
                return "" + mm.toString() + "mm";
            case dimCentiMeter:
                return "" + (Math.round(decimals * cm) / decimals).toString() + "cm";
            case dimMeter:
            default:
                const m = Math.round(decimals * (cm * Math.pow(0.01, power))) / decimals;
                return "" + m.toString() + "m";
        }
    }

    static degresToMeasure(degrees: number): string {
        switch (Configuration.getValue(configDimUnit)) {
            case dimFeetAndInch:
            case dimInch:
            case dimMilliMeter:
            case dimCentiMeter:
            case dimMeter:
            default:
                return degrees.toString() + "°";
        }
    }
    /* eslint-enable no-case-declarations */
}
