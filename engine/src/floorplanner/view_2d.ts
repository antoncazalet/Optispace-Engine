import { EventDispatcher, Vector2 } from "three";
import { v4 as uuidv4 } from "uuid";
import { Floorplan, FloorplanLoader } from "..";
import Corner from "../model/corner";
import Room from "../model/room";
import Wall from "../model/wall";
import { ImageType } from "../types/image_2d";
import { TextLabelType } from "../types/text_2d";
import { Configuration } from "../utils/configuration";
import { cmPerPixel, Dimensioning, pixelsPerCm } from "../utils/dimensioning";
import {
    EVENT_2D_IMAGE_CLICKED,
    EVENT_2D_TEXT_CLICKED,
    EVENT_2D_TEXT_HOVER,
    EVENT_2D_TEXT_MOVED,
    EVENT_CORNER_2D_CLICKED,
    EVENT_CORNER_2D_HOVER,
    EVENT_CORNER_ATTRIBUTES_CHANGED,
    EVENT_LOADED,
    EVENT_MODE_RESET,
    EVENT_NOTHING_CLICKED,
    EVENT_ROOM_2D_CLICKED,
    EVENT_ROOM_2D_HOVER,
    EVENT_ROOM_ATTRIBUTES_CHANGED,
    EVENT_WALL_2D_CLICKED,
    EVENT_WALL_2D_HOVER,
    EVENT_WALL_ATTRIBUTES_CHANGED,
} from "../utils/events";
import { CanvasController, floorplannerModes } from "./canvas";

export class View2D extends EventDispatcher {
    mode: number;

    activeWall: Wall;
    activeCorner: Corner;
    activeRoom: Room;
    activeText: TextLabelType;
    activeImage: ImageType;

    _clickedWall: Wall;
    _clickedCorner: Corner;
    _clickedRoom: Room;
    _clickedText: TextLabelType;
    _clickedImage: ImageType;

    _hoverRoom: Room;
    _hoverText: TextLabelType;
    _hoverImage: ImageType;

    originX: number;
    originY: number;
    unScaledOriginX: number;
    unScaledOriginY: number;
    targetX: number;
    targetY: number;
    lastNode: Corner;
    wallWidth: number;
    mouseDown: boolean;
    mouseMoved: boolean;
    mouseX: number;
    mouseY: number;
    rawMouseX: number;
    rawMouseY: number;
    lastX: number;
    lastY: number;
    canvas: string;
    floorplan: Floorplan;
    canvasElement: Element;
    view: CanvasController;
    cmPerPixel: number;
    pixelsPerCm: number;

    addEventListener: (type: string, listener: (event) => void) => void;

    constructor(model: FloorplanLoader) {
        super();
        this.mode = 0;

        this.activeWall = null;
        this.activeCorner = null;
        this.activeRoom = null;
        this.activeText = null;

        this._clickedWall = null;
        this._clickedCorner = null;
        this._clickedRoom = null;
        this._clickedImage = null;

        this._hoverImage = null;
        this._hoverRoom = null;
        this._hoverText = null;

        this.originX = 0;
        this.originY = 0;
        this.unScaledOriginX = 0;
        this.unScaledOriginY = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.lastNode = null;
        this.wallWidth = 0;
        this.mouseDown = false;
        this.mouseMoved = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.rawMouseX = 0;
        this.rawMouseY = 0;
        this.lastX = 0;
        this.lastY = 0;

        this.canvas = "optiengine-2d-canvas";
        this.floorplan = model.floorplan;
        this.canvasElement = document.querySelector(`#${this.canvas}`);
        this.view = new CanvasController(this.floorplan, this, this.canvas);
        this.cmPerPixel = cmPerPixel;
        this.pixelsPerCm = pixelsPerCm;

        this.wallWidth = Dimensioning.cmToPixel(Configuration.getValue("wallThickness"));
        this.setMode(floorplannerModes.MOVE);

        this.canvasElement.addEventListener("pointerdown", (event: MouseEvent) => this.mousedown(event));
        this.canvasElement.addEventListener("pointermove", (event: MouseEvent) => this.mousemove(event));
        this.canvasElement.addEventListener("pointerup", () => this.mouseup());
        this.canvasElement.addEventListener("pointerleave", () => this.mouseleave());

        this.floorplan.addEventListener("EVENT_2D_IMAGE_LOAD", (event) => {
            const img = event as unknown as { item: ImageType };
            this.view.addImage(img.item);
        });

        this.floorplan.addEventListener("EVENT_2D_IMAGE_DELETE_ALL", () => {
            this.view.deleteAllImages();
        });

        model.floorplan.addEventListener(EVENT_LOADED, () => this.reset());

        const updateView = () => {
            this.view.draw();
        };

        model.floorplan.addEventListener(EVENT_CORNER_ATTRIBUTES_CHANGED, updateView);
        model.floorplan.addEventListener(EVENT_WALL_ATTRIBUTES_CHANGED, updateView);
        model.floorplan.addEventListener(EVENT_ROOM_ATTRIBUTES_CHANGED, updateView);
    }

    get selectedCorner(): Corner {
        return this._clickedCorner;
    }

    get selectedWall(): Wall {
        return this._clickedWall;
    }

    updateTarget(): void {
        this.targetX = this.mouseX;
        this.targetY = this.mouseY;

        this.view.draw();
    }

    /* ENGINE-INTERFACE CALL FUNCTIONS */

    getAllText(): TextLabelType[] {
        return this.view.floorplan.labels2DView;
    }

    getAllImages(): ImageType[] {
        return this.view.floorplan.images2DView;
    }

    getAllRooms(): Room[] {
        return this.view.floorplan.rooms;
    }

    addText = (options: Omit<TextLabelType, "id" | "position">): void => {
        const room = this.floorplan.rooms?.[0];
        const position = new Vector2(0, 0);

        if (room) {
            position.x = room.areaCenter.x;
            position.y = room.areaCenter.y - 30;
        } else {
            position.x = this.mouseX;
            position.y = this.mouseY;
        }

        this.view.floorplan.addText({ ...options, position: { x: position.x, y: position.y }, id: uuidv4() });
    };

    editText = (id: string, text: Omit<TextLabelType, "id" | "position">): void => {
        this.view.floorplan.editText(id, text);
        this.view.draw();
    };

    deleteText = (id: string): void => {
        this.view.floorplan.deleteText(id);
        this.view.draw();
    };

    addImage(image: Omit<ImageType, "id" | "position">): void {
        const room = this.floorplan.rooms?.[0];
        const position = new Vector2(0, 0);

        if (room) {
            position.x = room.areaCenter.x;
            position.y = room.areaCenter.y - 30;
        } else {
            position.x = this.mouseX;
            position.y = this.mouseY;
        }

        const img = { ...image, position, id: uuidv4() };
        this.view.floorplan.addImage(img);
        this.view.addImage(img);
    }

    deleteAllImages(): void {
        this.view.deleteAllImages();
    }

    deleteImage(id: string): void {
        this.view.floorplan.deleteImage(id);
        this.view.deleteImage(id);
        this.view.draw();
    }

    updateImage(id: string, image: ImageType): void {
        this.view.floorplan.updateImage(id, image);
        this.view.updateImage(id, image);
        this.view.draw();
    }

    mousedown(event: MouseEvent): void {
        if (event instanceof MouseEvent) {
            if (event.button !== 0 && event.button !== 2) {
                return;
            }
        }

        this.mouseDown = true;
        this.mouseMoved = false;

        if (window.TouchEvent && event instanceof TouchEvent) {
            this.rawMouseX = event.touches[0].clientX;
            this.rawMouseY = event.touches[0].clientY;
        }

        this.lastX = this.rawMouseX;
        this.lastY = this.rawMouseY;

        if (event instanceof MouseEvent) {
            this.mouseX = Dimensioning.pixelToCm(event.clientX) + Dimensioning.pixelToCm(this.originX);
            this.mouseY = Dimensioning.pixelToCm(event.clientY) + Dimensioning.pixelToCm(this.originY);
        }

        const mDownCorner = this.floorplan.overlappedCorner(this.mouseX, this.mouseY);
        const mDownWall = this.floorplan.overlappedWall(this.mouseX, this.mouseY);
        const mDownRoom = this.floorplan.overlappedRoom(this.mouseX, this.mouseY);
        const mDownTextLabel = this.floorplan.overlappedText(this.mouseX, this.mouseY);
        const mDownImage = this.floorplan.overlappedImage(this.mouseX, this.mouseY);

        if (this.mode === floorplannerModes.DELETE) {
            if (event.button === 0) {
                if (this.activeCorner) {
                    this.activeCorner.removeAll();
                } else if (this.activeWall) {
                    this.activeWall.remove();
                }
            } else if (event.button === 2) {
                this.setMode(floorplannerModes.MOVE);
            }
        } else if (this.mode === floorplannerModes.DRAW) {
            if (event.button === 2) {
                this.setMode(floorplannerModes.MOVE);
            }
        } else if (this.mode === floorplannerModes.MOVE) {
            if (mDownTextLabel !== null) {
                this._clickedCorner = null;
                this._clickedWall = null;
                this._clickedRoom = null;
                this._clickedText = mDownTextLabel;
                this._clickedImage = null;
                this.floorplan.dispatchEvent({ type: EVENT_2D_TEXT_CLICKED, item: this._clickedText });
            } else if (mDownRoom !== null) {
                this._clickedCorner = null;
                this._clickedWall = null;
                this._clickedRoom = null;
                this._clickedRoom = mDownRoom;
                this._clickedText = null;
                this.floorplan.dispatchEvent({ type: EVENT_ROOM_2D_CLICKED, room: this._clickedRoom });
            } else if (mDownImage !== null) {
                this._clickedCorner = null;
                this._clickedWall = null;
                this._clickedRoom = null;
                this._clickedText = null;
                this._clickedImage = mDownImage;
                this.floorplan.dispatchEvent({ type: EVENT_2D_IMAGE_CLICKED, item: this._clickedImage });
            } else if (mDownCorner === null && mDownWall === null && mDownRoom === null) {
                this._clickedCorner = null;
                this._clickedWall = null;
                this._clickedRoom = null;
                this._clickedText = null;
                this._clickedImage = null;
                this.floorplan.dispatchEvent({ type: EVENT_NOTHING_CLICKED });
            } else if (mDownCorner !== null) {
                this._clickedCorner = null;
                this._clickedWall = null;
                this._clickedRoom = null;
                this._clickedCorner = mDownCorner;
                this._clickedText = null;
                this._clickedImage = null;
                this.floorplan.dispatchEvent({ type: EVENT_CORNER_2D_CLICKED, corner: this._clickedCorner });
            } else if (mDownWall !== null) {
                this._clickedCorner = null;
                this._clickedWall = null;
                this._clickedRoom = null;
                this._clickedWall = mDownWall;
                this._clickedText = null;
                this._clickedImage = null;
                this.floorplan.dispatchEvent({ type: EVENT_WALL_2D_CLICKED, wall: this._clickedWall });
            }
        }
        this.view.draw();
    }

    mousemove(event: TouchEvent | MouseEvent): void {
        this.mouseMoved = true;

        if (window.TouchEvent && event instanceof TouchEvent) {
            event.stopPropagation();
            event.preventDefault();
            this.rawMouseX = event.touches[0].clientX;
            this.rawMouseY = event.touches[0].clientY;
        }

        if (event instanceof MouseEvent) {
            this.rawMouseX = event.clientX;
            this.rawMouseY = event.clientY;

            this.mouseX = Dimensioning.pixelToCm(event.clientX) + Dimensioning.pixelToCm(this.originX);
            this.mouseY = Dimensioning.pixelToCm(event.clientY) + Dimensioning.pixelToCm(this.originY);
        }

        if (this.mode === floorplannerModes.DRAW || (this.mode === floorplannerModes.MOVE && this.mouseDown)) {
            this.updateTarget();
        }

        if (!this.mouseDown) {
            const hoverCorner = this.floorplan.overlappedCorner(this.mouseX, this.mouseY);
            const hoverWall = this.floorplan.overlappedWall(this.mouseX, this.mouseY);
            const hoverRoom = this.floorplan.overlappedRoom(this.mouseX, this.mouseY);
            const hoverText = this.floorplan.overlappedText(this.mouseX, this.mouseY);
            const hoverImage = this.floorplan.overlappedImage(this.mouseX, this.mouseY);

            if (hoverCorner !== this.activeCorner && this.activeWall === null) {
                this.activeCorner = hoverCorner;
                this.floorplan.dispatchEvent({ type: EVENT_CORNER_2D_HOVER, item: hoverCorner });
            }

            if (hoverText !== this.activeText) {
                this.activeText = hoverText;
                this._hoverText = hoverText;
                this.floorplan.dispatchEvent({ type: EVENT_2D_TEXT_HOVER, item: hoverText });
            }

            if (hoverImage !== this._hoverImage) {
                this._hoverImage = hoverImage;
            }

            if (hoverWall !== this.activeWall && this.activeCorner === null) {
                this.activeWall = hoverWall;
                this.floorplan.dispatchEvent({ type: EVENT_WALL_2D_HOVER, item: hoverWall });
            } else {
                this.activeWall = null;
            }

            if (this.activeWall === null && this.activeCorner === null) {
                this.activeRoom = hoverRoom;
            }

            if (this.activeCorner === null && this.activeWall === null && this.activeRoom !== null) {
                this._hoverRoom = hoverRoom;
                this.floorplan.dispatchEvent({ type: EVENT_ROOM_2D_HOVER, room: hoverRoom });
            } else {
                this._hoverRoom = null;
            }
        }

        if (this.mouseDown && !this.activeCorner && !this.activeWall && !this.activeText) {
            this.originX += this.lastX - this.rawMouseX;
            this.originY += this.lastY - this.rawMouseY;
            this.unScaledOriginX += (this.lastX - this.rawMouseX) * (1 / Configuration.getValue("scale"));
            this.unScaledOriginY += (this.lastY - this.rawMouseY) * (1 / Configuration.getValue("scale"));
            this.lastX = this.rawMouseX;
            this.lastY = this.rawMouseY;
        }

        if (this.mode === floorplannerModes.MOVE && this.mouseDown) {
            if (this.activeCorner) {
                this.activeCorner.move(this.mouseX, this.mouseY);
            } else if (this.activeWall) {
                this.activeWall.relativeMove(
                    Dimensioning.pixelToCm(this.rawMouseX - this.lastX),
                    Dimensioning.pixelToCm(this.rawMouseY - this.lastY)
                );

                this.lastX = this.rawMouseX;
                this.lastY = this.rawMouseY;
            } else if (this.activeText) {
                this.activeText.position.x = this.mouseX;
                this.activeText.position.y = this.mouseY;

                this.lastX = this.rawMouseX;
                this.lastY = this.rawMouseY;
                this.floorplan.dispatchEvent({ type: EVENT_2D_TEXT_MOVED, item: this.activeText });
            }
        }
        this.view.draw();
    }

    mouseup(): void {
        this.mouseDown = false;
        if (this.mode === floorplannerModes.DRAW && !this.mouseMoved) {
            const corner = this.floorplan.newCorner(this.targetX, this.targetY);

            if (this.lastNode !== null) {
                this.floorplan.newWall(this.lastNode, corner);
                this.floorplan.newWallsForIntersections(this.lastNode, corner);
                this.view.draw();
            }
            if (corner.mergeWithIntersected() && this.lastNode !== null) {
                this.setMode(floorplannerModes.MOVE);
            }
            this.lastNode = corner;
        } else {
            if (this.activeCorner !== null) {
                this.activeCorner.updateAttachedRooms(true);
            }
            if (this.activeWall !== null) {
                this.activeWall.updateAttachedRooms(true);
            }
            if (this._clickedCorner) {
                this._clickedCorner.updateAttachedRooms(true);
            }
            if (this._clickedWall) {
                this._clickedWall.updateAttachedRooms(true);
            }
        }
        this.view.draw();
    }

    mouseleave(): void {
        this.mouseDown = false;
    }

    reset(): void {
        this.resizeView();
        this.setMode(floorplannerModes.MOVE);
        this.resetOrigin();
        this.view.draw();
    }

    resizeView(): void {
        this.view.handleWindowResize();
    }

    setMode(mode: number): void {
        this.lastNode = null;
        this.mode = mode;
        this.dispatchEvent({ type: EVENT_MODE_RESET, mode });
        this.updateTarget();
    }

    /** Sets the origin so that floorplan is centered */
    resetOrigin(): void {
        const centerX = parseInt(window.getComputedStyle(this.canvasElement).width, 10) / 2.0;
        const centerY = parseInt(window.getComputedStyle(this.canvasElement).height, 10) / 2.0;

        const centerFloorplan = this.floorplan.getCenter();
        this.originX = Dimensioning.cmToPixel(centerFloorplan.x) - centerX;
        this.originY = Dimensioning.cmToPixel(centerFloorplan.z) - centerY;

        this.unScaledOriginX = Dimensioning.cmToPixel(centerFloorplan.x, false) - centerX;
        this.unScaledOriginY = Dimensioning.cmToPixel(centerFloorplan.z, false) - centerY;
    }

    zoom(): void {
        const centerX = parseInt(window.getComputedStyle(this.canvasElement).width, 10) / 2.0;
        const centerY = parseInt(window.getComputedStyle(this.canvasElement).height, 10) / 2.0;
        const originScreen = new Vector2(centerX, centerY);
        let currentPan = new Vector2(this.unScaledOriginX + centerX, this.unScaledOriginY + centerY);
        currentPan = currentPan.multiplyScalar(Configuration.getValue("scale")).sub(originScreen);

        this.originX = currentPan.x;
        this.originY = currentPan.y;
    }

    convertX(x: number): number {
        return Dimensioning.cmToPixel(x - Dimensioning.pixelToCm(this.originX));
    }

    convertY(y: number): number {
        return Dimensioning.cmToPixel(y - Dimensioning.pixelToCm(this.originY));
    }
}
