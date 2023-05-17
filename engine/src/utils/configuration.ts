import { dimCentiMeter } from "./dimensioning";

export const configDimUnit = "dimUnit";
export const configWallHeight = "wallHeight";
export const configWallThickness = "wallThickness";
export const scale = "scale";
export const gridSpacing = "gridSpacing";
export const debug = "debugMode";

interface Config {
    dimUnit: "inch" | "feetAndInch" | "m" | "cm" | "mm";
    wallHeight: number;
    wallThickness: number;
    scale: number;
    gridSpacing: number;
    debugMode: boolean;
}

export const config: Config = {
    debugMode: false,
    dimUnit: dimCentiMeter,
    wallHeight: 400,
    wallThickness: 20,
    scale: 1,
    gridSpacing: 50,
};
export const wallInformation = {
    exterior: false,
    interior: false,
    midline: true,
    labels: true,
    exteriorlabel: "e:",
    interiorlabel: "i:",
    midlinelabel: "m:",
};
export const cornerTolerance = 30;

export class Configuration {
    static init(): void {
        const configStored = localStorage.getItem("OPTIENGINE_CONFIG");

        if (configStored !== null) {
            const configStoredParsed = JSON.parse(configStored);
            Object.assign(config, configStoredParsed);
        }
    }
    /**
     * Set a configuration parameter.
     **/
    static setValue<T extends keyof Config>(key: T, value: Config[T]): void {
        config[key] = value;

        localStorage.setItem("OPTIENGINE_CONFIG", JSON.stringify(config));
    }

    /**
     * Get a configuration parameter.
     **/
    static getValue<T extends keyof Config>(key: T): Config[T] {
        return config[key];
    }
}
