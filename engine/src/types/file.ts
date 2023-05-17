import Room from "../model/room";
import { ImageType } from "./image_2d";
import { TextLabelType } from "./text_2d";

export interface CornersType {
    [key: string]: {
        x: number;
        y: number;
        elevation: number;
    };
}

export interface TextureType {
    url: string;
    stretch: boolean;
    scale: number;
}

export interface WallType {
    corner1: string;
    corner2: string;
    frontTexture: TextureType;
    backTexture: TextureType;
}

export enum ItemCategory {
    Item = 0,
    FloorItem = 1,
    WallItem = 2,
    InWallItem = 3,
    RoofItem = 4,
    InWallFloorItem = 5,
    OnFloorItem = 6,
    WallFloorItem = 7,
}

export interface ItemMetadata {
    itemName: string;
    resizable: boolean;
    format: string;
    itemType: ItemCategory;
    scale?: {
        x: number;
        y: number;
        z: number;
    };
    modelUrl: string;
    rotation: number;
    fixed: boolean;
}

export interface FloorplanType {
    version: string;
    corners: CornersType;
    walls: WallType[];
    rooms: Pick<Room, "name" | "type" | "tags" | "colorTags" | "floorTexture">[];
    wallTextures: unknown;
    floorTextures: {
        [uuid: string]: TextureType;
    };
    newFloorTextures: {
        [uuid: string]: TextureType;
    };
    units: string;
    labels?: TextLabelType[];
    images?: ImageType[];
}

export interface ItemType {
    item_name: string;
    item_type: number;
    format: string;
    model_url: string;
    xpos: number;
    ypos: number;
    zpos: number;
    rotation: number;
    scale_x: number;
    scale_y: number;
    scale_z: number;
    fixed: boolean;
    resizable?: boolean;
    frame?: string;
}

export interface JSONFile {
    floorplan: FloorplanType;
    items: ItemType[];
    teams: any;
    status: {
        placedWorkers: number;
        remainingWorkers: number;
    }
}
