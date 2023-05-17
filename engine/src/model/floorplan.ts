import { EventDispatcher, EventListener, Vector2, Vector3 } from "three";
import { FloorplanType, JSONFile } from "../types/file";
import { ImageType } from "../types/image_2d";
import Texture from "../types/texture";
import { TextLabelType } from "../types/text_2d";
import { configDimUnit, Configuration, cornerTolerance } from "../utils/configuration";
import { dimCentiMeter, Dimensioning, dimFeetAndInch, dimInch, dimMeter, dimMilliMeter } from "../utils/dimensioning";
import {
    EVENT_CORNER_ATTRIBUTES_CHANGED,
    EVENT_DELETED,
    EVENT_LOADED,
    EVENT_MOVED,
    EVENT_NEW,
    EVENT_UPDATED,
    EVENT_WALL_ATTRIBUTES_CHANGED,
} from "../utils/events";
import { Utils } from "../utils/utils";
import { Corner } from "./corner";
import { HalfEdge } from "./half_edge";
import { Room } from "./room";
import { Wall } from "./wall";

/** */
export const defaultFloorPlanTolerance = 20.0;

/**
 * A Floorplan represents a number of Walls, Corners and Rooms. This is an
 * abstract that keeps the 2d and 3d in sync
 */
export class Floorplan extends EventDispatcher {
    /**
     * List of elements of Wall instance
     */
    walls: Wall[];
    /**
     * List of elements of Corner instance
     */
    corners: Corner[];
    /**
     * List of elements of Room instance
     */
    rooms: Room[];

    labels2DView: TextLabelType[];
    images2DView: ImageType[];

    floorTextures: { [uuid: string]: Texture };
    addEventListener: <T extends string>(type: T, listener: EventListener<Event, T, this>) => void;

    initialFloorplan: FloorplanType;
    flagReloadRoomASAP: boolean;
    teamsConfig: any;

    /**
     * Constructs a floorplan.
     **/
    constructor() {
        super();
        this.walls = [];
        this.corners = [];
        this.rooms = [];
        this.labels2DView = [];
        this.images2DView = [];

        this.floorTextures = {};

        this.flagReloadRoomASAP = false;
        this.teamsConfig = {};
    }

    /**
     * @returns The array of [HalfEdge](HalfEdge).
     */
    wallEdges(): HalfEdge[] {
        const edges: HalfEdge[] = [];
        this.walls.forEach((wall) => {
            if (wall.frontEdge) {
                edges.push(wall.frontEdge);
            }
            if (wall.backEdge) {
                edges.push(wall.backEdge);
            }
        });
        return edges;
    }

    updateRoomByUUID(uuid: string, data: Record<string, unknown>): void {
        const room = this.rooms.find((r) => r.uuid === uuid);

        if (room) {
            for (const key in data) {
                room[key] = data[key];
            }
        }
    }

    // This method needs to be called from the 2d floorplan whenever
    // the other method newWall is called.
    // This is to ensure that there are no floating walls going across
    // other walls. If two walls are intersecting then the intersection point
    // has to create a new wall.
    /**
     * Checks existing [walls](Wall) for any intersections they would make. If there are
     * intersections then introduce new [corners](Corner) and new [walls](Wall) as required at
     * places
     *
     * @param start
     * @param end
     * @returns If there is an intersection or not
     */
    newWallsForIntersections(start: Corner, end: Corner): boolean {
        let intersections = false;
        // This is a bug in the logic
        // When creating a new wall with a start and end
        // it needs to be checked if it is cutting other walls
        // If it cuts then all those walls have to removed and introduced as
        // new walls along with this new wall
        const cStart = new Vector2(start.x, start.y);
        const cEnd = new Vector2(end.x, end.y);
        const newCorners = [];

        for (const wall of this.walls) {
            const bstart = new Vector2(wall.getStartX(), wall.getStartY());
            const bend = new Vector2(wall.getEndX(), wall.getEndY());
            const iPoint = Utils.lineLineIntersectPoint(cStart, cEnd, bstart, bend);
            if (iPoint) {
                const nCorner = this.newCorner(iPoint.x, iPoint.y);
                newCorners.push(nCorner);
                nCorner.mergeWithIntersected(false);
                intersections = true;
            }
        }
        this.update("newWallsForIntersections");

        return intersections;
    }

    /**
     * Creates a new [wall](Wall).
     *
     * @param start The start [corner](Corner).
     * @param end The end [corner](Corner).
     * @returns The created [wall](Wall).
     */
    newWall(start: Corner, end: Corner): Wall {
        const wall = new Wall(start, end);

        this.walls.push(wall);
        wall.addEventListener(EVENT_DELETED, (o) => {
            this.removeWall(o.item);
        });
        wall.addEventListener(EVENT_WALL_ATTRIBUTES_CHANGED, (o) => {
            this.dispatchEvent(o);
        });

        this.dispatchEvent({ type: EVENT_NEW, item: this, newItem: wall });
        this.update("newWall");
        return wall;
    }

    /**
     * Creates a new [corner](Corner).
     *
     * @param x The x coordinate.
     * @param y The y coordinate.
     * @param id An optional id. If unspecified, the id will be created
     *        internally.
     * @returns The created [corner](Corner).
     */
    newCorner(x: number, y: number, id?: string): Corner {
        const corner = new Corner(this, x, y, id);

        for (const existingCorner of this.corners) {
            if (existingCorner.distanceFromCorner(corner) < cornerTolerance) {
                return existingCorner;
            }
        }

        this.corners.push(corner);
        corner.addEventListener(EVENT_DELETED, (o) => {
            this.removeCorner(o.item);
            this.update("newCorner / Event deleted");
            this.dispatchEvent({ type: EVENT_DELETED, item: this });
        });
        corner.addEventListener(EVENT_CORNER_ATTRIBUTES_CHANGED, (o) => {
            this.dispatchEvent(o);
            const updatecorners = o.item.adjacentCorners();
            updatecorners.push(o.item);
            this.update("newCorner / Event corner changed", false, updatecorners);
        });
        corner.addEventListener(EVENT_MOVED, (o) => {
            this.dispatchEvent(o);
            const updatecorners = o.item.adjacentCorners();
            updatecorners.push(o.item);
            this.update("newCorner / Event corner moved", false, updatecorners);
        });

        this.dispatchEvent({ type: EVENT_NEW, item: this, newItem: corner });

        this.update("new Corner");

        return corner;
    }

    /**
     * Removes a [wall](Wall).
     *
     * @param wall The [wall](Wall) to be removed.
     */
    removeWall(wall: Wall): void {
        this.dispatchEvent({ type: EVENT_DELETED, item: this, deleted: wall, item_type: "wall" });
        Utils.removeValue(this.walls, wall);
        this.update("removeWall");
    }

    /**
     * Removes a [corner](Corner).
     *
     * @param corner The [corner](Corner) to be removed.
     */
    removeCorner(corner: Corner): void {
        this.dispatchEvent({ type: EVENT_DELETED, item: this, deleted: corner, item_type: "corner" });
        Utils.removeValue(this.corners, corner);
    }

    /**
     * Gets the [walls](Wall).
     *
     * @returns The list of [walls](Wall).
     */
    getWalls(): Wall[] {
        return this.walls;
    }

    /**
     * Gets the [corners](Corner).
     *
     * @returns The list of [corners](Corner).
     */
    getCorners(): Corner[] {
        return this.corners;
    }

    /**
     * Gets the [rooms](Room).
     *
     * @returns The list of [rooms](Room).
     */
    getRooms(): Room[] {
        return this.rooms;
    }

    /**
     * Gets the [room](Room) overlapping the location x, y.
     *
     * @param mx
     * @param my
     * @returns Get the overlapping [room](Room).
     */
    overlappedRoom(mx: number, my: number): Room {
        for (const room of this.rooms) {
            const flag = room.pointInRoom(new Vector2(mx, my));
            if (flag) {
                return room;
            }
        }

        return null;
    }

    /**
     * Gets the [corner](Corner) overlapping the location x, y at a tolerance.
     *
     * @param x
     * @param y
     * @param tolerance
     * @returns The overlapping [corner](Corner).
     */
    overlappedCorner(x: number, y: number): Corner {
        const tolerance = defaultFloorPlanTolerance;
        for (const corner of this.corners) {
            if (corner.distanceFrom(new Vector2(x, y)) < tolerance) {
                return corner;
            }
        }
        return null;
    }

    /**
     * Gets the [wall](Wall) overlapping the location x, y at a tolerance.
     *
     * @param x
     * @param y
     * @param tolerance
     * @returns The overlapping [wall](Wall).
     */
    overlappedWall(x: number, y: number): Wall {
        const tolerance = defaultFloorPlanTolerance;
        for (const wall of this.walls) {
            if (wall.distanceFrom(new Vector2(x, y)) < tolerance) {
                return wall;
            }
        }
        return null;
    }

    overlappedText(x: number, y: number): TextLabelType {
        for (const text of this.labels2DView) {
            if (Utils.checkIfMouseOver(text, new Vector2(x, y))) {
                return text;
            }
        }
        return null;
    }

    overlappedImage(x: number, y: number): ImageType {
        for (const img of this.images2DView) {
            if (Utils.checkIfMouseOverImage(img, new Vector2(x, y))) {
                return img;
            }
        }
        return null;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    saveTeamsConfig(teamsConfig: any): void {
        this.teamsConfig = teamsConfig;
    }

    getTeamsConfig(): any {
        return this.teamsConfig;
    }

    saveFloorplan(): JSONFile["floorplan"] {
        const floorplans: any = {
            version: "1.0",
            corners: {},
            walls: [],
            rooms: {},
            wallTextures: [],
            floorTextures: {},
            newFloorTextures: {},
            units: {},
            labels: [],
            images: [],
        };
        const cornerIds = [];

        this.walls.forEach((wall) => {
            if (wall.getStart() && wall.getEnd()) {
                floorplans.walls.push({
                    corner1: wall.getStart().id,
                    corner2: wall.getEnd().id,
                    frontTexture: wall.frontTexture,
                    backTexture: wall.backTexture,
                });
                cornerIds.push(wall.getStart());
                cornerIds.push(wall.getEnd());
            }
        });

        cornerIds.forEach((corner) => {
            floorplans.corners[corner.id] = {
                x: Dimensioning.cmToMeasureRaw(corner.x),
                y: Dimensioning.cmToMeasureRaw(corner.y),
                elevation: Dimensioning.cmToMeasureRaw(corner.elevation),
            };
        });

        const rooms = this.getRooms();

        for (const room of rooms) {
            floorplans.rooms[room.roomByCornersId] = {
                name: room.name,
                type: room.type,
                tags: room.tags,
                colorTags: room.colorTags,
                floorTexture: room.floorTexture,
            };
        }

        floorplans.units = Configuration.getValue(configDimUnit);
        floorplans.newFloorTextures = this.floorTextures;
        floorplans.labels = this.labels2DView;
        floorplans.images = this.images2DView;
        return floorplans;
    }

    /**
     * Load the floorplan from a previously saved json object file
     *
     * @param floorplan JSON object
     * @emits EVENT_LOADED
     */
    loadFloorplan(floorplan: FloorplanType, flagReset = false): void {
        this.reset();
        this.initialFloorplan = floorplan;

        if (!flagReset) {
            if (this.initialFloorplan.rooms === undefined) {
                this.flagReloadRoomASAP = true;
            }
        } else {
            this.flagReloadRoomASAP = false;
        }

        const corners = {};
        if (floorplan === null || !("corners" in floorplan) || !("walls" in floorplan)) {
            return;
        }

        if (floorplan.units) {
            switch (floorplan.units) {
                case dimInch:
                    Configuration.setValue(configDimUnit, dimInch);
                    break;
                case dimFeetAndInch:
                    Configuration.setValue(configDimUnit, dimFeetAndInch);
                    break;
                case dimMeter:
                    Configuration.setValue(configDimUnit, dimMeter);
                    break;
                case dimCentiMeter:
                    Configuration.setValue(configDimUnit, dimCentiMeter);
                    break;
                case dimMilliMeter:
                    Configuration.setValue(configDimUnit, dimMilliMeter);
                    break;
            }
        }

        for (const id in floorplan.corners) {
            const corner = floorplan.corners[id];
            corners[id] = this.newCorner(
                Dimensioning.cmFromMeasureRaw(corner.x),
                Dimensioning.cmFromMeasureRaw(corner.y),
                id
            );
            if (corner.elevation) {
                corners[id].elevation = Dimensioning.cmFromMeasureRaw(corner.elevation);
            }
        }

        floorplan.walls.forEach((wall) => {
            const newWall = this.newWall(corners[wall.corner1], corners[wall.corner2]);

            if (wall.frontTexture) {
                newWall.frontTexture = wall.frontTexture;
            }
            if (wall.backTexture) {
                newWall.backTexture = wall.backTexture;
            }
        });

        if (floorplan.labels) {
            this.labels2DView = [];
            floorplan.labels.forEach((label) => {
                this.labels2DView.push(label);
            });
        }

        if (floorplan.images) {
            this.images2DView = [];
            floorplan.images.forEach((img) => {
                this.images2DView.push(img);
                this.dispatchEvent({ type: "EVENT_2D_IMAGE_LOAD", item: img });
            });
        }

        if ("newFloorTextures" in floorplan) {
            this.floorTextures = floorplan.newFloorTextures;
        }
        this.update("loadFloorplan");
        this.dispatchEvent({ type: EVENT_LOADED, item: this });
    }

    addText(text: TextLabelType): void {
        this.labels2DView.push(text);
    }

    editText(id: string, text: Omit<TextLabelType, "id" | "position">): void {
        const textFind = this.labels2DView.find((t) => t.id === id);

        if (textFind) {
            Object.assign(textFind, text);
        }
    }

    deleteText(id: string): void {
        this.labels2DView = this.labels2DView.filter((text) => text.id !== id);
    }

    addImage(image: ImageType): void {
        this.images2DView.push(image);
    }

    updateImage(id: string, image: ImageType): void {
        const imageFind = this.images2DView.find((t) => t.id === id);

        if (imageFind) {
            Object.assign(imageFind, image);
        }
    }

    deleteImage(id: string): void {
        this.images2DView = this.images2DView.filter((img) => img.id !== id);

        this.dispatchEvent({ type: "EVENT_2D_IMAGE_DELETED", id });
    }

    /**
     * @deprecated
     */
    getFloorTexture(uuid: string): Texture {
        if (uuid in this.floorTextures) {
            return this.floorTextures[uuid];
        }
        return null;
    }

    /**
     * @deprecated
     */
    setFloorTexture(uuid: string, texture: Texture): void {
        this.floorTextures[uuid] = texture;
    }

    /**
     * Resets the floorplan data to empty
     *
     * @returns {void}
     */
    reset(): void {
        const tmpCorners = this.corners.slice(0);
        const tmpWalls = this.walls.slice(0);

        tmpCorners.forEach((corner) => {
            corner.remove();
        });
        tmpWalls.forEach((wall) => {
            wall.remove();
        });

        this.corners = [];
        this.walls = [];
        this.rooms = [];
    }

    /**
     * Update the floorplan with new rooms, remove old rooms etc.
     */
    update(from: string, updateroomconfiguration = true, updatecorners = null): void {
        if (updatecorners !== null) {
            updatecorners.forEach((corner) => {
                corner.updateAngles();
            });
        }

        if (!updateroomconfiguration) {
            this.dispatchEvent({ type: EVENT_UPDATED, item: this });
            return;
        }

        this.walls.forEach((wall) => {
            wall.resetFrontBack();
        });

        if (this.rooms.length > 0 && Object.keys(this.initialFloorplan.rooms ?? {}).length > 0) {
            for (const room of this.rooms) {
                this.initialFloorplan.rooms[room.roomByCornersId] = {
                    name: room.name,
                    type: room.type,
                    tags: room.tags,
                    colorTags: room.colorTags,
                    floorTexture: room.floorTexture,
                };
            }
        }

        const roomCorners = this.findRooms(this.corners);
        this.rooms = [];

        this.corners.forEach((corner) => {
            corner.clearAttachedRooms();
        });

        roomCorners.forEach((corners) => {
            const room = new Room(this, corners, `My new room ${this.rooms.length}`);
            const roomByCornersId = room.roomByCornersId;

            if (this.initialFloorplan.rooms !== undefined) {
                for (const findRoom of Object.keys(this.initialFloorplan.rooms)) {
                    if (findRoom === roomByCornersId) {
                        room.name = this.initialFloorplan.rooms[findRoom].name;
                        room.type = this.initialFloorplan.rooms[findRoom].type;
                        room.tags = this.initialFloorplan.rooms[findRoom].tags;
                        room.colorTags = this.initialFloorplan.rooms[findRoom].colorTags;
                        room.floorTexture = this.initialFloorplan.rooms[findRoom].floorTexture;
                    }
                }
            }
            room.updateArea();
            this.rooms.push(room);
        });
        if (this.flagReloadRoomASAP && this.rooms.length > 0 && from === "loadFloorplan") {
            const plan = this.saveFloorplan();

            this.loadFloorplan(plan, true);
        }
        this.assignOrphanEdges();
        this.dispatchEvent({ type: EVENT_UPDATED, item: this });
    }

    /**
     * Returns the center of the floorplan in the y plane
     *
     * @returns {Vector2} center
     * @see https://threejs.org/docs/#api/en/math/Vector2
     */
    getCenter(): Vector3 {
        return this.getDimensions(true);
    }

    /**
     * Returns the bounding volume of the full floorplan
     *
     * @returns {Vector3} size
     * @see https://threejs.org/docs/#api/en/math/Vector3
     */
    getSize(): Vector3 {
        return this.getDimensions(false);
    }

    /**
     * Returns the bounding size or the center location of the full floorplan
     *
     * @param {boolean}
     *            center If true return the center else the size
     * @returns {Vector3} size
     * @see https://threejs.org/docs/#api/en/math/Vector3
     */
    getDimensions(center: boolean): Vector3 {
        center = center || false; // otherwise, get size

        let xMin = Infinity;
        let xMax = -Infinity;
        let zMin = Infinity;
        let zMax = -Infinity;
        this.corners.forEach((corner) => {
            if (corner.x < xMin) xMin = corner.x;
            if (corner.x > xMax) xMax = corner.x;
            if (corner.y < zMin) zMin = corner.y;
            if (corner.y > zMax) zMax = corner.y;
        });
        let ret;
        if (xMin === Infinity || xMax === -Infinity || zMin === Infinity || zMax === -Infinity) {
            ret = new Vector3();
        } else {
            if (center) {
                // center
                ret = new Vector3((xMin + xMax) * 0.5, 0, (zMin + zMax) * 0.5);
            } else {
                // size
                ret = new Vector3(xMax - xMin, 0, zMax - zMin);
            }
        }
        return ret;
    }

    /**
     * An internal cleanup method
     */
    assignOrphanEdges(): void {
        // kinda hacky
        // find orphaned wall segments (i.e. not part of rooms) and
        // give them edges
        const orphanWalls = [];
        this.walls.forEach((wall) => {
            if (!wall.backEdge && !wall.frontEdge) {
                wall.orphan = true;
                const back = new HalfEdge(null, wall, false);
                const front = new HalfEdge(null, wall, true);
                back.generatePlane();
                front.generatePlane();
                orphanWalls.push(wall);
            }
        });
    }

    /**
     * Find the "rooms" in our planar straight-line graph. Rooms are set of the
     * smallest (by area) possible cycles in this graph.
     *
     * @param corners
     *            The corners of the floorplan.
     * @returns The rooms, each room as an array of corners.
     * @param {Corner[]}
     *            corners
     * @returns {Corner[][]} loops
     */
    findRooms(corners: Corner[]): Corner[][] {
        function customCalculateTheta(previousCorner, currentCorner, nextCorner) {
            const theta = Utils.angle2pi(
                new Vector2(previousCorner.x - currentCorner.x, previousCorner.y - currentCorner.y),
                new Vector2(nextCorner.x - currentCorner.x, nextCorner.y - currentCorner.y)
            );
            return theta;
        }

        function customRemoveDuplicateRooms(roomArray) {
            const results = [];
            const lookup = {};
            let str;
            const hashFunc = function (corner) {
                return corner.id;
            };
            const sep = "-";
            for (const room of roomArray) {
                // rooms are cycles, shift it around to check uniqueness
                let add = true;
                for (let j = 0; j < room.length; j++) {
                    const roomShift = Utils.cycle(room, j);
                    str = roomShift.map(hashFunc).join(sep);
                    if (Object.prototype.hasOwnProperty.call(lookup, str)) {
                        add = false;
                    }
                }
                if (add) {
                    results.push(room);
                    lookup[str] = true;
                }
            }
            return results;
        }

        /**
         * An internal method to find rooms based on corners and their
         * connectivities
         */
        function findTightestCycle(firstCorner, secondCorner) {
            const stack = [];
            let next = { corner: secondCorner, previousCorners: [firstCorner] };
            const visited = {};
            visited[firstCorner.id] = true;

            while (next) {
                // update previous corners, current corner, and visited corners
                const currentCorner = next.corner;
                visited[currentCorner.id] = true;

                // did we make it back to the startCorner?
                if (next.corner === firstCorner && currentCorner !== secondCorner) {
                    return next.previousCorners;
                }

                const addToStack = [];
                const adjacentCorners = next.corner.adjacentCorners();
                for (const nextCorner of adjacentCorners) {
                    // is this where we came from?
                    // give an exception if its the first corner and we aren't
                    // at the second corner
                    if (nextCorner.id in visited && !(nextCorner === firstCorner && currentCorner !== secondCorner)) {
                        continue;
                    }

                    // nope, throw it on the queue
                    addToStack.push(nextCorner);
                }

                const previousCorners = next.previousCorners.slice(0);
                previousCorners.push(currentCorner);
                if (addToStack.length > 1) {
                    // visit the ones with smallest theta first
                    const previousCorner = next.previousCorners[next.previousCorners.length - 1];
                    addToStack.sort(function (a, b) {
                        return (
                            customCalculateTheta(previousCorner, currentCorner, b) -
                            customCalculateTheta(previousCorner, currentCorner, a)
                        );
                    });
                }

                if (addToStack.length > 0) {
                    // add to the stack
                    addToStack.forEach((corner) => {
                        stack.push({ corner, previousCorners });
                    });
                }

                // pop off the next one
                next = stack.pop();
            }
            return [];
        }

        // find tightest loops, for each corner, for each adjacent
        // TODO: optimize this, only check corners with > 2 adjacents, or
        // isolated cycles
        const loops = [];

        corners.forEach((firstCorner) => {
            firstCorner.adjacentCorners().forEach((secondCorner) => {
                loops.push(findTightestCycle(firstCorner, secondCorner));
            });
        });

        // remove duplicates
        const uniqueLoops = customRemoveDuplicateRooms(loops);
        // remove CW loops
        const uniqueCCWLoops = uniqueLoops.filter((value) => !Utils.isClockwise(value));
        return uniqueCCWLoops;
    }
}
export default Floorplan;
