import { EventDispatcher, Vector2 } from "three";
import { Item } from "../items/item";
import Texture from "../types/texture";
import { Configuration, configWallHeight, configWallThickness } from "../utils/configuration";
import { EVENT_DELETED, EVENT_MOVED } from "../utils/events";
import { Utils } from "../utils/utils";
import Corner from "./corner";
import HalfEdge from "./half_edge";

/** The default wall texture. */
export const defaultWallTexture: Texture = { url: "rooms/textures/default_wall_texture.png", stretch: true, scale: 0 };

/**
 * A Wall is the basic element to create Rooms.
 *
 * Walls consists of two half edges.
 */
export class Wall extends EventDispatcher {
    frontTexture: Texture;
    backTexture: Texture;
    start: Corner;
    end: Corner;
    name: string;
    id: string;
    frontEdge: HalfEdge;
    backEdge: HalfEdge;
    orphan: boolean;
    items: Item[];
    _thickness: number;
    height: number;
    /**
     * Constructs a new wall.
     * @param start Start corner.
     * @param end End corner.
     */
    constructor(start: Corner, end: Corner) {
        super();
        this.start = start;
        this.end = end;
        this.name = "wall";

        this.id = this.getUuid();

        this.start.attachStart(this);
        this.end.attachEnd(this);

        this.frontEdge = null;
        this.backEdge = null;
        this.orphan = false;
        this.items = [];
        this.frontTexture = defaultWallTexture;
        this.backTexture = defaultWallTexture;
        this._thickness = Configuration.getValue(configWallThickness);

        this.height = Configuration.getValue(configWallHeight);

        this.addCornerMoveListener(this.start);
        this.addCornerMoveListener(this.end);
    }

    addCornerMoveListener(corner: Corner, remove = false): void {
        if (remove) {
            corner.removeEventListener(EVENT_MOVED, () => this.updateControlVectors());
            return;
        }
        corner.addEventListener(EVENT_MOVED, () => this.updateControlVectors());
    }

    get thickness(): number {
        return this._thickness;
    }

    get uuid(): string {
        return this.getUuid();
    }

    updateControlVectors(): void {
        if (this.getStart() || this.getEnd()) {
            if (this.getStart() !== null) {
                this.getStart().floorplan.update("updateControlVectors 1", false);
            } else if (this.getEnd() !== null) {
                this.getEnd().floorplan.update("updateControlVectors 2", false);
            }
        }
    }

    getUuid(): string {
        return [this.start.id, this.end.id].join();
    }

    resetFrontBack(): void {
        this.frontEdge = null;
        this.backEdge = null;
        this.orphan = false;
    }

    snapToAxis(tolerance: number): void {
        // order here is important, but unfortunately arbitrary
        this.start.snapToAxis(tolerance);
        this.end.snapToAxis(tolerance);
    }

    move(newX: number, newY: number): void {
        const dx = newX - (this.start.location.x + this.end.location.x) * 0.5;
        const dy = newY - (this.start.location.y + this.end.location.y) * 0.5;
        this.relativeMove(dx, dy);
    }

    relativeMove(dx: number, dy: number): void {
        this.start.relativeMove(dx, dy);
        this.end.relativeMove(dx, dy);
        this.updateControlVectors();
    }

    fireMoved(): void {
        this.dispatchEvent({ type: EVENT_MOVED, item: this, position: null });
    }

    fireRedraw(): void {
        if (this.frontEdge) {
            this.frontEdge.dispatchRedrawEvent();
        }
        if (this.backEdge) {
            this.backEdge.dispatchRedrawEvent();
        }
    }

    set wallSize(value: number) {
        const vector = this.getEnd().location.clone().sub(this.getStart().location);
        const currentLength = this.wallLength();
        const changeInLength = value / currentLength;

        const neighboursCountStart = this.getStart().adjacentCorners().length === 1;
        const neighboursCountEnd = this.getEnd().adjacentCorners().length === 1;

        let changeInLengthOffset;
        let movementVector;
        let startPoint;
        let endPoint;

        changeInLengthOffset = changeInLength - 1;

        if ((!neighboursCountStart && !neighboursCountEnd) || (neighboursCountStart && neighboursCountEnd)) {
            changeInLengthOffset *= 0.5;
            movementVector = vector.clone().multiplyScalar(changeInLengthOffset);
            startPoint = movementVector.clone().multiplyScalar(-1).add(this.getStart().location);
            endPoint = movementVector.clone().add(this.getEnd().location);
        } else if (neighboursCountStart) {
            movementVector = vector.clone().multiplyScalar(changeInLengthOffset);
            startPoint = movementVector.clone().multiplyScalar(-1).add(this.getStart().location);
            endPoint = this.getEnd().location;
        } else if (neighboursCountEnd) {
            movementVector = vector.clone().multiplyScalar(changeInLengthOffset);
            endPoint = movementVector.clone().add(this.getEnd().location);
            startPoint = this.getStart().location;
        }
        this.getStart().move(startPoint.x, startPoint.y);
        this.getEnd().move(endPoint.x, endPoint.y);

        this.updateAttachedRooms();
    }

    get wallSize(): number {
        return this.wallLength();
    }

    get startElevation(): number {
        if (this.start && this.start !== null) {
            return this.start.elevation;
        }
        return 0.0;
    }

    get endElevation(): number {
        if (this.end && this.end !== null) {
            return this.end.elevation;
        }
        return 0.0;
    }

    getStart(): Corner {
        return this.start;
    }

    getEnd(): Corner {
        return this.end;
    }

    getStartX(): number {
        return this.start.x;
    }

    getEndX(): number {
        return this.end.x;
    }

    getStartY(): number {
        return this.start.y;
    }

    getEndY(): number {
        return this.end.y;
    }

    wallLength(): number {
        const start = this.getStart();
        const end = this.getEnd();
        return Utils.distance(start.location, end.location);
    }

    wallCenter(): Vector2 {
        return new Vector2((this.getStart().x + this.getEnd().x) / 2.0, (this.getStart().y + this.getEnd().y) / 2.0);
    }

    remove(): void {
        this.start.detachWall(this);
        this.end.detachWall(this);
        this.dispatchEvent({ type: EVENT_DELETED, item: this });
    }

    setStart(corner: Corner): void {
        this.start.detachWall(this);
        this.addCornerMoveListener(this.start, true);

        corner.attachStart(this);
        this.start = corner;
        this.addCornerMoveListener(this.start);
        this.fireMoved();
    }

    setEnd(corner: Corner): void {
        this.end.detachWall(this);
        this.addCornerMoveListener(this.end);

        corner.attachEnd(this);
        this.end = corner;
        this.addCornerMoveListener(this.end, true);
        this.fireMoved();
    }

    distanceFrom(point: Vector2): number {
        return Utils.pointDistanceFromLine(
            point,
            new Vector2(this.getStartX(), this.getStartY()),
            new Vector2(this.getEndX(), this.getEndY())
        );
    }

    /** Return the corner opposite of the one provided.
     * @param corner The given corner.
     * @returns The opposite corner.
     */
    oppositeCorner(corner: Corner): Corner | null {
        if (this.start === corner) {
            return this.end;
        } else if (this.end === corner) {
            return this.start;
        } else {
            console.log("Wall does not connect to corner");
            return null;
        }
    }

    getClosestCorner(point: Vector2): Corner | null {
        const startVector = new Vector2(this.start.x, this.start.y);
        const endVector = new Vector2(this.end.x, this.end.y);
        const startDistance = point.distanceTo(startVector);
        const endDistance = point.distanceTo(endVector);
        if (startDistance <= this.thickness * 2) {
            return this.start;
        } else if (endDistance <= this.thickness * 2) {
            return this.end;
        }
        return null;
    }

    updateAttachedRooms(explicit = false): void {
        if (this.start !== null) {
            this.start.updateAttachedRooms(explicit);
        }
        if (this.end) {
            this.end.updateAttachedRooms(explicit);
        }
    }
}

export default Wall;
