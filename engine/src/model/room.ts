import {
    Box3,
    DoubleSide,
    EventDispatcher,
    Matrix4,
    Mesh,
    MeshBasicMaterial,
    Plane,
    Shape,
    ShapeGeometry,
    Vector2,
    Vector3,
} from "three";
import Texture from "../types/texture";
import { EVENT_MOVED, EVENT_ROOM_ATTRIBUTES_CHANGED } from "../utils/events";
import { Region, Utils } from "../utils/utils";
import Corner from "./corner";
import Floorplan from "./floorplan";
import { HalfEdge } from "./half_edge";
import Wall from "./wall";

/** Default texture to be used if nothing is provided. */
export const defaultRoomTexture: Texture = {
    url: "rooms/textures/default_floor_texture.jpg",
    stretch: false,
    scale: 400,
};

/**
 * A Room is the combination of a Floorplan with a floor plane.
 */
export class Room extends EventDispatcher {
    _name: string;
    min: Vector3;
    max: Vector3;
    center: Vector3;
    area: number;
    areaCenter: Vector2;
    _polygonPoints: Vector2[];
    floorplan: Floorplan;
    _corners: Corner[];
    interiorCorners: any[];
    edgePointer: HalfEdge;
    floorPlane: Mesh;
    roofPlane: Mesh;
    _roomByCornersId: string;

    type = "other";
    tags: string[] = [];
    colorTags: string[] = [];
    floorTexture: string;

    constructor(floorplan: Floorplan, corners: Corner[], name = "A new room") {
        super();
        this._name = name;
        this.min = null;
        this.max = null;
        this.center = null;
        this.area = 0.0;
        this.areaCenter = null;
        this._polygonPoints = [];

        this.colorTags = [];
        this.floorTexture = "rooms/textures/default_floor_texture.jpg";
        this.tags = [];

        this.floorplan = floorplan;
        this._corners = corners;
        this.interiorCorners = [];
        this.edgePointer = null;
        this.floorPlane = null;
        this.roofPlane = null;
        this.updateWalls();
        this.updateInteriorCorners();
        this.generatePlane();

        const cornerids = [];
        for (const corner of this.corners) {
            const c = corner;
            c.attachRoom(this);
            cornerids.push(c.id);
            c.addEventListener(EVENT_MOVED, () => this._roomUpdated());
        }
        this._roomByCornersId = cornerids.join(",");
    }

    get uuid(): string {
        return this.getUuid();
    }

    get corners(): Corner[] {
        return this._corners;
    }

    get roomCornerPoints(): Vector2[] {
        return this._polygonPoints;
    }

    get roomByCornersId(): string {
        return this._roomByCornersId;
    }

    set name(value: string) {
        const oldname = this._name;
        this._name = value;
        this.dispatchEvent({
            type: EVENT_ROOM_ATTRIBUTES_CHANGED,
            item: this,
            info: { from: oldname, to: this._name },
        });
    }
    get name(): string {
        return this._name;
    }

    _roomUpdated(): void {
        this.updateArea();
    }

    __getOrderedCorners(wall: Wall): { start: Vector2; end: Vector2 } {
        const i = this.corners.indexOf(wall.start);
        const j = this.corners.indexOf(wall.end);
        let start = this.corners[Math.max(i, j)].location.clone();
        let end = this.corners[Math.min(i, j)].location.clone();
        if ((i === 0 && j === this.corners.length - 1) || (j === 0 && i === this.corners.length - 1)) {
            end = this.corners[this.corners.length - 1].location.clone();
            start = this.corners[0].location.clone();
        }
        return { start, end };
    }

    getWallOutDirection(wall: Wall): Vector3 {
        const orderedCorners = this.__getOrderedCorners(wall);
        const start = orderedCorners.start;
        const end = orderedCorners.end;
        const vect = end.sub(start);
        const vect3 = new Vector3(vect.x, vect.y, 0);
        vect3.applyAxisAngle(new Vector3(0, 0, 1), 1.57);
        return vect3.normalize();
    }

    getWallDirection(wall: Wall): Vector3 {
        const orderedCorners = this.__getOrderedCorners(wall);
        const start = orderedCorners.start;
        const end = orderedCorners.end;
        const vect = end.sub(start);
        const vect3 = new Vector3(vect.x, vect.y, 0);
        return vect3.normalize();
    }

    getWallStart(wall: Wall): Vector2 {
        const orderedCorners = this.__getOrderedCorners(wall);
        return orderedCorners.start;
    }

    getWallEnd(wall: Wall): Vector2 {
        const orderedCorners = this.__getOrderedCorners(wall);
        return orderedCorners.end;
    }

    getWallPlane(wall: Wall): Plane {
        const planeLocation = wall.start.location.clone().add(wall.end.location).multiplyScalar(0.5);
        const normal = this.getWallOutDirection(wall);
        let plane = new Plane(normal, 0);
        const m = new Matrix4();
        m.makeTranslation(planeLocation.x, planeLocation.y, 0);
        plane = plane.applyMatrix4(m);
        return plane;
    }

    getAllWallsRelatedToARoom(): Wall[] {
        const walls = [];
        let edge = this.edgePointer;
        const iterateWhile = true;
        walls.push(edge.wall);

        while (iterateWhile) {
            if (edge.next === this.edgePointer) {
                break;
            } else {
                edge = edge.next;
            }
            walls.push(edge.wall);
        }
        return walls;
    }

    roomIdentifier(): string {
        const cornerids = [];
        this.corners.forEach((corner) => {
            cornerids.push(corner.id);
        });
        const ids = cornerids.join(",");
        return ids;
    }

    getUuid(): string {
        const cornerUuids = this.corners.map(function (c) {
            return c.id;
        });
        cornerUuids.sort();
        return cornerUuids.join();
    }

    getTexture(): Texture {
        return {
            url: this.floorTexture,
            stretch: false,
            scale: 400,
        };
    }

    setRoomWallsTexture(texture: Texture): void {
        let edge = this.edgePointer;
        const iterateWhile = true;
        edge.setTexture(texture);
        while (iterateWhile) {
            if (edge.next === this.edgePointer) {
                break;
            } else {
                edge = edge.next;
            }
            edge.setTexture(texture);
        }
    }

    generatePlane(): void {
        const points = [];
        this.interiorCorners.forEach((corner) => {
            points.push(new Vector2(corner.x, corner.y));
        });
        const shape = new Shape(points);
        const geometry = new ShapeGeometry(shape);
        this.floorPlane = new Mesh(geometry, new MeshBasicMaterial({ side: DoubleSide, visible: false }));

        this.floorPlane.visible = false;
        this.floorPlane.rotation.set(Math.PI / 2, 0, 0);

        const b3 = new Box3();
        b3.setFromObject(this.floorPlane);
        this.min = b3.min.clone();
        this.max = b3.max.clone();
        this.center = this.max.clone().sub(this.min).multiplyScalar(0.5).add(this.min);
    }

    cycleIndex(index: number): number {
        if (index < 0) {
            return (index += this.corners.length);
        } else {
            return index % this.corners.length;
        }
    }

    pointInRoom(pt: Vector2): boolean {
        const polygon: Vector2[] = [];
        this.corners.forEach((corner) => {
            const co = new Vector2(corner.x, corner.y);
            polygon.push(co);
        });
        return Utils.pointInPolygon2(pt, polygon);
    }

    updateInteriorCorners(): void {
        let edge = this.edgePointer;
        const iterateWhile = true;
        while (iterateWhile) {
            this.interiorCorners.push(edge.interiorStart());
            edge.generatePlane();
            if (edge.next === this.edgePointer) {
                break;
            } else {
                edge = edge.next;
            }
        }
    }

    updateArea(): void {
        const oldarea = this.area;
        let points: Vector2[] = [];
        const allpoints: Vector2[] = [];
        this.areaCenter = new Vector2();
        this._polygonPoints = [];

        let firstCorner: Corner;
        let secondCorner: Corner;
        let wall: Wall;
        let corner: Corner;

        for (let i = 0; i < this.corners.length; i++) {
            corner = this.corners[i];
            firstCorner = this.corners[i];
            secondCorner = this.corners[(i + 1) % this.corners.length];
            wall = firstCorner.wallToOrFrom(secondCorner);

            if (wall !== null) {
                allpoints.push(corner.location.clone());
            } else {
                allpoints.push(corner.location.clone());
            }
        }

        points = allpoints;
        const region = new Region(points);
        this.area = Math.abs(region.area());
        this.areaCenter = region.centroid();
        this._polygonPoints = points;
        this.dispatchEvent({ type: EVENT_ROOM_ATTRIBUTES_CHANGED, item: this, info: { from: oldarea, to: this.area } });
    }

    updateArea2(): void {
        const oldarea = this.area;
        const points = [];
        let area = 0;
        this.areaCenter = new Vector2();
        this._polygonPoints = [];

        for (let i = 0; i < this.corners.length; i++) {
            const firstCorner = this.corners[i];
            const secondCorner = this.corners[(i + 1) % this.corners.length];
            firstCorner.wallToOrFrom(secondCorner);
        }

        let inext;
        let a;
        let b;
        let ax_by;
        let ay_bx;
        let delta;
        this.corners.forEach((corner) => {
            const co = new Vector2(corner.x, corner.y);
            this.areaCenter.add(co);
            points.push(co);
        });
        this.areaCenter.multiplyScalar(1.0 / points.length);
        for (let i = 0; i < points.length; i++) {
            inext = (i + 1) % points.length;
            a = points[i];
            b = points[inext];
            ax_by = a.x * b.y;
            ay_bx = a.y * b.x;
            delta = ax_by - ay_bx;
            area += delta;
        }
        this.area = Math.abs(area) * 0.5;
        this._polygonPoints = points;
        this.dispatchEvent({ type: EVENT_ROOM_ATTRIBUTES_CHANGED, item: this, info: { from: oldarea, to: this.area } });
    }

    hasAllCornersById(ids: string[]): boolean {
        let sum = 0;
        for (const id of ids) {
            sum += this.hasACornerById(id);
        }
        return sum === this.corners.length;
    }

    hasACornerById(id: string): 0 | 1 {
        for (const corner of this.corners) {
            if (corner.id === id) {
                return 1;
            }
        }
        return 0;
    }

    /**
     * Populates each wall's half edge relating to this room
     * this creates a fancy doubly connected edge list (DCEL)
     */
    updateWalls(): void {
        let prevEdge: HalfEdge = null;
        let firstEdge: HalfEdge = null;

        for (let i = 0; i < this.corners.length; i++) {
            const firstCorner = this.corners[i];
            const secondCorner = this.corners[(i + 1) % this.corners.length];

            // find if wall is heading in that direction
            const wallTo = firstCorner.wallTo(secondCorner);
            const wallFrom = firstCorner.wallFrom(secondCorner);
            let edge = null;
            if (wallTo) {
                edge = new HalfEdge(this, wallTo, true);
            } else if (wallFrom) {
                edge = new HalfEdge(this, wallFrom, false);
            } else {
                // something horrible has happened
                console.log("corners arent connected by a wall, uh oh");
            }

            if (i === 0) {
                firstEdge = edge;
            } else {
                edge.prev = prevEdge;
                prevEdge.next = edge;
                if (i + 1 === this.corners.length) {
                    firstEdge.prev = edge;
                    edge.next = firstEdge;
                }
            }
            prevEdge = edge;
        }

        // hold on to an edge reference
        this.edgePointer = firstEdge;
    }
}
export default Room;
