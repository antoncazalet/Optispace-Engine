export { Controller, ItemState } from "./3d/controller";
export { Edge } from "./3d/edge";
export { Floor } from "./3d/floor";
export { Floorplan3D } from "./3d/floorplan_3d";
export { Lights } from "./3d/lights";
export { View3D } from "./3d/view_3d";
export {
    CanvasController,
    cornerColor,
    cornerColorHover,
    cornerColorSelected,
    cornerRadius,
    deleteColor,
    floorplannerModes,
    gridColor,
    gridWidth,
    wallColor,
    wallColorHover,
    wallColorSelected,
    wallWidth,
} from "./floorplanner/canvas";
export { View2D } from "./floorplanner/view_2d";
export { Item } from "./items/item";
export { Corner } from "./model/corner";
export { defaultFloorPlanTolerance, Floorplan } from "./model/floorplan";
export { FloorplanLoader } from "./model/floorplan_loader";
export { HalfEdge } from "./model/half_edge";
export { defaultRoomTexture, Room } from "./model/room";
export { Scene } from "./model/scene";
export { ImageType } from "./types/image_2d";
export { IntersectionType } from "./types/intersection";
export { Texture } from "./types/texture";
export { TextLabelType } from "./types/text_2d";
export {
    config,
    configDimUnit,
    Configuration,
    configWallHeight,
    configWallThickness,
    cornerTolerance,
    gridSpacing,
    scale,
    wallInformation,
} from "./utils/configuration";
export {
    cmPerFoot,
    cmPerPixel,
    decimals,
    dimCentiMeter,
    Dimensioning,
    dimensioningOptions,
    dimFeetAndInch,
    dimInch,
    dimMeter,
    dimMilliMeter,
    pixelsPerCm,
    pixelsPerFoot,
} from "./utils/dimensioning";
export {
    EVENT_2D_IMAGE_CLICKED,
    EVENT_2D_IMAGE_HOVER,
    EVENT_2D_IMAGE_MOVED,
    EVENT_2D_TEXT_CLICKED,
    EVENT_2D_TEXT_HOVER,
    EVENT_2D_TEXT_MOVED,
    EVENT_3D_FURNITURE_CLICKED,
    EVENT_3D_FURNITURE_MOVED,
    EVENT_3D_FURNITURE_ROTATED,
    EVENT_ACTION,
    EVENT_ACTION_DONE,
    EVENT_CAMERA_MOVED,
    EVENT_CAMERA_VIEW_CHANGE,
    EVENT_CHANGED,
    EVENT_CORNER_2D_CLICKED,
    EVENT_CORNER_2D_DOUBLE_CLICKED,
    EVENT_CORNER_2D_HOVER,
    EVENT_CORNER_ATTRIBUTES_CHANGED,
    EVENT_DELETED,
    EVENT_FLOOR_CLICKED,
    EVENT_GLTF_READY,
    EVENT_ITEM_LOADED,
    EVENT_ITEM_LOADING,
    EVENT_ITEM_REMOVED,
    EVENT_ITEM_SELECTED,
    EVENT_ITEM_UNSELECTED,
    EVENT_LOADED,
    EVENT_LOADING,
    EVENT_MODE_RESET,
    EVENT_MOVED,
    EVENT_NEW,
    EVENT_NOTHING_CLICKED,
    EVENT_REDRAW,
    EVENT_ROOM_2D_CLICKED,
    EVENT_ROOM_2D_DOUBLE_CLICKED,
    EVENT_ROOM_2D_HOVER,
    EVENT_ROOM_ATTRIBUTES_CHANGED,
    EVENT_ROOM_NAME_CHANGED,
    EVENT_SAVED,
    EVENT_UPDATED,
    EVENT_WALL_2D_CLICKED,
    EVENT_WALL_2D_DOUBLE_CLICKED,
    EVENT_WALL_2D_HOVER,
    EVENT_WALL_ATTRIBUTES_CHANGED,
    EVENT_WALL_CLICKED,
} from "./utils/events";
export { Region, Utils } from "./utils/utils";
import { View3D } from "./3d/view_3d";
import { View2D } from "./floorplanner/view_2d";
import { FloorplanLoader } from "./model/floorplan_loader";
import { configDimUnit, Configuration } from "./utils/configuration";
import { dimMeter } from "./utils/dimensioning";

export class Optiengine {
    View3D: View3D;
    View2D: View2D;
    model: FloorplanLoader;

    constructor() {
        Configuration.init();
        Configuration.setValue(configDimUnit, dimMeter);

        this.model = new FloorplanLoader();

        this.View3D = new View3D(this.model);
        this.View2D = new View2D(this.model);
    }
}
