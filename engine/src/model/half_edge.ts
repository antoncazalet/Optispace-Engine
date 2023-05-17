import { Box3, BufferGeometry, EventDispatcher, Matrix4, Mesh, MeshBasicMaterial, Vector2, Vector3 } from "three";
import { EVENT_REDRAW } from "../utils/events";
import { Utils } from "../utils/utils";

import Texture from "../types/texture";
import Corner from "./corner";
import Room from "./room";
import Wall from "./wall";

/**
 * Half Edges are created by Room.
 *
 * Once rooms have been identified, Half Edges are created for each interior wall.
 *
 * A wall can have two half edges if it is visible from both sides.
 */
export class HalfEdge extends EventDispatcher {
    /**  The minimum point in space calculated from the bounds
     * @see https://threejs.org/docs/#api/en/math/Vector3
     **/
    min: Vector3;
    /**
     * The maximum point in space calculated from the bounds
     * @see https://threejs.org/docs/#api/en/math/Vector3
     **/
    max: Vector3;
    /**
     * The center of this half edge
     * @see https://threejs.org/docs/#api/en/math/Vector3
     **/
    center: Vector3;
    /**
     * Reference to a Room instance
     **/
    room: Room;
    /**
     *  Reference to a Wall instance
     **/
    wall: Wall;
    /**
     * Reference to the next halfedge instance connected to this
     **/
    next: HalfEdge;
    /**
     * Reference to the previous halfedge instance connected to this
     **/
    prev: HalfEdge;
    /**
     * The offset to maintain for the front and back walls from the midline of a wall
     **/
    offset: number;
    /**
     *  The height of a wall
     **/
    height: number;
    /**
     * The plane mesh that will be used for checking intersections of wall items
     * @see https://threejs.org/docs/#api/en/objects/Mesh
     */
    plane: Mesh<BufferGeometry, any>;
    /**
     * The interior transformation matrix that contains the homogeneous transformation of the plane based on the two corner positions of the wall
     * @see https://threejs.org/docs/#api/en/math/Matrix4
     */
    interiorTransform: Matrix4;
    /**
     * The inverse of the interior transformation matrix that contains the homogeneous transformation of the plane based on the two corner positions of the wall
     * @see https://threejs.org/docs/#api/en/math/Matrix4
     */
    invInteriorTransform: Matrix4;
    /**
     * The exterior transformation matrix that contains the homogeneous transformation of the plane based on the two corner positions of the wall
     * @see https://threejs.org/docs/#api/en/math/Matrix4
     */
    exteriorTransform: Matrix4;
    /**
     * The inverse of the exterior transformation matrix that contains the homogeneous transformation of the plane based on the two corner positions of the wall
     * @see https://threejs.org/docs/#api/en/math/Matrix4
     */
    invExteriorTransform: Matrix4;
    /**
     * Is this is the front edge or the back edge
     */
    isFront: boolean;

    /**
     * Constructs a half edge.
     * @param room The associated room. Instance of Room
     * @param wall The corresponding wall. Instance of Wall
     * @param isFront True if front side. Boolean value
     */
    constructor(room: Room, wall: Wall, isFront = false) {
        super();
        this.min = null;
        this.max = null;
        this.center = null;
        this.room = room;
        this.wall = wall;
        this.next = null;
        this.prev = null;
        this.offset = 0.0;
        this.height = 0.0;
        this.plane = null;
        this.interiorTransform = new Matrix4();
        this.invInteriorTransform = new Matrix4();
        this.exteriorTransform = new Matrix4();
        this.invExteriorTransform = new Matrix4();
        this.isFront = isFront;

        this.offset = wall.thickness / 2.0;
        this.height = wall.height;

        if (this.isFront) {
            this.wall.frontEdge = this;
        } else {
            this.wall.backEdge = this;
        }
    }

    /**
     * Two separate textures are used for the walls. Based on which side of the wall this {HalfEdge} refers the texture is returned
     * @returns front/back Two separate textures are used for the walls. Based on which side of the wall this {@link HalfEdge} refers the texture is returned
     */
    getTexture(): Texture {
        if (this.isFront) {
            return this.wall.frontTexture;
        } else {
            return this.wall.backTexture;
        }
    }

    /**
     * Set a Texture to the wall. Based on the edge side as front or back the texture is applied appropriately to the wall
     * @param texture New texture for the wall.
     * @emits EVENT_REDRAW
     */
    setTexture(texture: Texture): void {
        if (this.isFront) {
            this.wall.frontTexture = texture;
        } else {
            this.wall.backTexture = texture;
        }

        this.dispatchEvent({ type: EVENT_REDRAW, item: this });
    }

    /**
     * Emit the redraw event
     * @emits EVENT_REDRAW
     */
    dispatchRedrawEvent(): void {
        this.dispatchEvent({ type: EVENT_REDRAW, item: this });
    }

    /**
     * Transform the {@link Corner} instance to a [Vector3](https://threejs.org/docs/#api/en/math/Vector3) instance using the x and y position returned as x and z
     * @param corner Corner to transform
     * @returns Transformed [Corner](Corner) as [Vector3](https://threejs.org/docs/#api/en/math/Vector3)
     * @see https://threejs.org/docs/#api/en/math/Vector3
     */
    transformCorner(corner: Corner | Vector2): Vector3 {
        return new Vector3(corner.x, 0, corner.y);
    }

    /**
     * This generates the invisible planes in the scene that are used for interesection testing for the wall items
     */
    generatePlane(): void {
        const geometry = new BufferGeometry();
        const v1 = this.transformCorner(this.interiorStart());
        const v2 = this.transformCorner(this.interiorEnd());
        const v3 = v2.clone();
        const v4 = v1.clone();

        // v3.y = this.wall.height;
        // v4.y = this.wall.height;

        v3.y = this.wall.startElevation;
        v4.y = this.wall.endElevation;

        geometry.setFromPoints([v1, v2, v3, v4]);
        geometry.computeVertexNormals();
        geometry.computeBoundingBox();

        this.plane = new Mesh(geometry, new MeshBasicMaterial({ visible: true }));
        // The below line was originally setting the plane visibility to false
        // Now its setting visibility to true. This is necessary to be detected
        // with the raycaster objects to click walls and floors.
        this.plane.visible = true;

        this.computeTransforms(
            this.interiorTransform,
            this.invInteriorTransform,
            this.interiorStart(),
            this.interiorEnd()
        );
        this.computeTransforms(
            this.exteriorTransform,
            this.invExteriorTransform,
            this.exteriorStart(),
            this.exteriorEnd()
        );

        const b3 = new Box3();
        b3.setFromObject(this.plane);
        this.min = b3.min.clone();
        this.max = b3.max.clone();
        this.center = this.max.clone().sub(this.min).multiplyScalar(0.5).add(this.min);
    }

    /**
     * Calculate the transformation matrix for the edge (front/back) baesd on the parameters.
     * @param {Matrix4} transform The matrix reference in which the transformation is stored
     * @param {Matrix4} invTransform The inverse of the transform that is stored in the invTransform
     * @param {Vector2} start The starting point location
     * @param {Vector2} end The ending point location
     * @see https://threejs.org/docs/#api/en/math/Matrix4
     * @see https://threejs.org/docs/#api/en/math/Vector2
     */
    computeTransforms(transform: Matrix4, invTransform: Matrix4, start: Vector2, end: Vector2): void {
        const v1 = start;
        const v2 = end;

        const angle = Utils.angle(new Vector2(1, 0), new Vector2(v2.x - v1.x, v2.y - v1.y));

        const tt = new Matrix4();
        const tr = new Matrix4();

        tt.makeTranslation(-v1.x, 0, -v1.y);
        tr.makeRotationY(-angle);
        transform.multiplyMatrices(tr, tt);
        invTransform.copy(transform).invert();
    }

    /** Gets the distance from specified point.
     * @param {Number} x X coordinate of the point.
     * @param {Number} y Y coordinate of the point.
     * @returns {Number} The distance.
     */
    distanceTo(x: number, y: number): number {
        return Utils.pointDistanceFromLine(new Vector2(x, y), this.interiorStart(), this.interiorEnd());
    }

    /**
     * Get the starting corner of the wall this instance represents
     * @returns {Corner} The starting corner
     */
    getStart(): Corner {
        if (this.isFront) {
            return this.wall.getStart();
        } else {
            return this.wall.getEnd();
        }
    }

    /**
     * Get the ending corner of the wall this instance represents
     * @returns {Corner} The ending corner
     */
    getEnd(): Corner {
        if (this.isFront) {
            return this.wall.getEnd();
        } else {
            return this.wall.getStart();
        }
    }

    /**
     * If this is the front edge then return the back edge.
     * For example in a wall there are two halfedges, i.e one for front and one back. Based on which side this halfedge lies return the opposite {@link HalfEdge}
     * @returns {HalfEdge} The other HalfEdge
     */
    getOppositeEdge(): HalfEdge {
        if (this.isFront) {
            return this.wall.backEdge;
        } else {
            return this.wall.frontEdge;
        }
    }

    /**
     * Return the 2D interior location that is at the center/middle.
     * @returns {Vector2} Return an object with attributes x, y
     * @see https://threejs.org/docs/#api/en/math/Vector2
     */
    interiorCenter(): Vector2 {
        return new Vector2(
            (this.interiorStart().x + this.interiorEnd().x) / 2.0,
            (this.interiorStart().y + this.interiorEnd().y) / 2.0
        );
    }

    /**
     * Return the interior distance of the interior wall
     * @returns {Number} The distance
     */
    interiorDistance(): number {
        const start = this.interiorStart();
        const end = this.interiorEnd();

        return Utils.distance(start, end);
    }

    /**
     * Return the 2D interior location that is at the start.
     * @returns {Vector2} Return an object with attributes x, y
     * @see https://threejs.org/docs/#api/en/math/Vector2
     */
    interiorStart(): Vector2 {
        const vec = this.halfAngleVector(this.prev, this);
        return new Vector2(this.getStart().x + vec.x, this.getStart().y + vec.y);
        // return {x:this.getStart().x + vec.x, y:this.getStart().y + vec.y};
    }

    /**
     * Return the 2D interior location that is at the end.
     * @returns {Vector2} Return an object with attributes x, y
     * @see https://threejs.org/docs/#api/en/math/Vector2
     */
    //
    interiorEnd(): Vector2 {
        const vec = this.halfAngleVector(this, this.next);
        return new Vector2(this.getEnd().x + vec.x, this.getEnd().y + vec.y);
        // return {x:this.getEnd().x + vec.x, y:this.getEnd().y + vec.y};
    }

    /**
     * Return the 2D exterior location that is at the end.
     * @returns {Vector2} Return an object with attributes x, y
     * @see https://threejs.org/docs/#api/en/math/Vector2
     */
    exteriorEnd(): Vector2 {
        const vec = this.halfAngleVector(this, this.next);
        return new Vector2(this.getEnd().x - vec.x, this.getEnd().y - vec.y);
    }

    /**
     * Return the 2D exterior location that is at the start.
     * @returns {Vector2} Return an object with attributes x, y
     * @see https://threejs.org/docs/#api/en/math/Vector2
     */
    exteriorStart(): Vector2 {
        const vec = this.halfAngleVector(this.prev, this);
        return new Vector2(this.getStart().x - vec.x, this.getStart().y - vec.y);
    }

    /**
     * Return the 2D exterior location that is at the center/middle.
     * @returns {Vector2} Return an object with attributes x, y
     * @see https://threejs.org/docs/#api/en/math/Vector2
     */
    exteriorCenter(): Vector2 {
        return new Vector2(
            (this.exteriorStart().x + this.exteriorEnd().x) / 2.0,
            (this.exteriorStart().y + this.exteriorEnd().y) / 2.0
        );
    }

    /**
     * Return the exterior distance of the exterior wall
     * @returns {Number} The distance
     */
    exteriorDistance(): number {
        const start = this.exteriorStart();
        const end = this.exteriorEnd();
        return Utils.distance(start, end);
    }

    /** Get the corners of the half edge.
     * @returns {Corner[]} An array of x,y pairs.
     */
    corners(): Vector2[] {
        return [this.interiorStart(), this.interiorEnd(), this.exteriorEnd(), this.exteriorStart()];
    }

    /**
     * Gets CCW angle from v1 to v2
     * @param {HalfEdge} v1 The point a
     * @param {HalfEdge} v1 The point b
     * @returns {Object} contains keys x and y with number representing the halfAngles
     */
    halfAngleVector(v1: HalfEdge, v2: HalfEdge): { x: number; y: number } {
        let v1startX = 0.0;
        let v1startY = 0.0;
        let v1endX = 0.0;
        let v1endY = 0.0;
        let v2startX = 0.0;
        let v2startY = 0.0;
        let v2endX = 0.0;
        let v2endY = 0.0;

        // make the best of things if we dont have prev or next
        if (!v1) {
            v1startX = v2.getStart().x - (v2.getEnd().x - v2.getStart().x);
            v1startY = v2.getStart().y - (v2.getEnd().y - v2.getStart().y);

            v1endX = v2.getStart().x;
            v1endY = v2.getStart().y;
        } else {
            v1startX = v1.getStart().x;
            v1startY = v1.getStart().y;
            v1endX = v1.getEnd().x;
            v1endY = v1.getEnd().y;
        }

        if (!v2) {
            v2startX = v1.getEnd().x;
            v2startY = v1.getEnd().y;
            v2endX = v1.getEnd().x + (v1.getEnd().x - v1.getStart().x);
            v2endY = v1.getEnd().y + (v1.getEnd().y - v1.getStart().y);
        } else {
            v2startX = v2.getStart().x;
            v2startY = v2.getStart().y;
            v2endX = v2.getEnd().x;
            v2endY = v2.getEnd().y;
        }

        // CCW angle between edges
        const theta = Utils.angle2pi(
            new Vector2(v1startX - v1endX, v1startY - v1endY),
            new Vector2(v2endX - v1endX, v2endY - v1endY)
        );

        // cosine and sine of half angle
        const cs = Math.cos(theta / 2.0);
        const sn = Math.sin(theta / 2.0);

        // rotate v2
        const v2dx = v2endX - v2startX;
        const v2dy = v2endY - v2startY;

        const vx = v2dx * cs - v2dy * sn;
        const vy = v2dx * sn + v2dy * cs;

        // normalize
        const mag = Utils.distance(new Vector2(0, 0), new Vector2(vx, vy));
        const desiredMag = this.offset / sn;
        const scalar = desiredMag / mag;

        const halfAngleVector = { x: vx * scalar, y: vy * scalar }; // new Vector2(vx * scalar, vy * scalar);
        return halfAngleVector;
    }
}

export default HalfEdge;
