import {
    BackSide,
    BufferGeometry,
    DoubleSide,
    EventDispatcher,
    FrontSide,
    Matrix4,
    Mesh,
    MeshBasicMaterial,
    Path,
    Shape,
    ShapeGeometry,
    Side,
    Vector2,
    Vector3,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import HalfEdge from "../model/half_edge";
import { Scene } from "../model/scene";
import Wall from "../model/wall";
import { EVENT_CAMERA_MOVED, EVENT_REDRAW } from "../utils/events";

export class Edge extends EventDispatcher {
    scene: Scene;
    edge: HalfEdge;
    controls: OrbitControls;
    wall: Wall;
    front: boolean;
    planes: Mesh<any, any>[];
    basePlanes: Mesh<any, any>[];
    color: number;
    visible: boolean;
    index: number;
    redrawevent: () => void;
    visibilityevent: () => void;

    constructor(scene: Scene, edge: HalfEdge, controls: OrbitControls, index: number) {
        super();
        this.scene = scene;
        this.edge = edge;
        this.controls = controls;
        this.wall = edge.wall;
        this.front = edge.isFront;

        this.planes = [];
        this.basePlanes = [];

        this.color = 0xdddddd;
        this.visible = false;

        this.index = index;

        this.redrawevent = () => {
            this.redraw();
        };

        this.visibilityevent = () => {
            this.updateVisibility();
        };

        this.edge.addEventListener(EVENT_REDRAW, this.redrawevent);
        this.controls.addEventListener(EVENT_CAMERA_MOVED, this.visibilityevent);

        this.updatePlanes();
    }

    remove(): void {
        this.edge.removeEventListener(EVENT_REDRAW, this.redrawevent);
        this.controls.removeEventListener(EVENT_CAMERA_MOVED, this.visibilityevent);
        this.removeFromScene();
    }

    redraw(): void {
        this.removeFromScene();
        this.updatePlanes();
        this.addToScene();
    }

    removeFromScene(): void {
        this.planes.forEach((plane) => {
            this.scene.remove(plane);
        });
        this.basePlanes.forEach((plane) => {
            this.scene.remove(plane);
        });
        this.planes = [];
        this.basePlanes = [];
    }

    addToScene(): void {
        const index = this.index * 0.02;

        this.planes.forEach((plane) => {
            plane.position.y = index;
            this.scene.add(plane);
        });
        this.basePlanes.forEach((plane) => {
            plane.position.y = index;
            this.scene.add(plane);
        });
        this.updateVisibility();
    }

    updateVisibility(): void {
        const start = this.edge.interiorStart();
        const end = this.edge.interiorEnd();
        const x = end.x - start.x;
        const y = end.y - start.y;
        const normal = new Vector3(-y, 0, x);
        normal.normalize();

        const position = this.controls.object.position.clone();
        const focus = new Vector3((start.x + end.x) / 2.0, 0, (start.y + end.y) / 2.0);
        const direction = position.sub(focus).normalize();

        const dot = normal.dot(direction);
        this.visible = dot >= 0;
        this.planes.forEach((plane) => {
            plane.material.transparent = !this.visible;
            plane.material.opacity = this.visible ? 1.0 : 0.3;
        });
    }

    updatePlanes(): void {
        const extStartCorner = this.edge.getStart();
        const extEndCorner = this.edge.getEnd();

        if (extStartCorner === null || extEndCorner === null) {
            return;
        }

        const wallMaterial = new MeshBasicMaterial({
            color: this.color,
            side: FrontSide,
            transparent: true,
            opacity: 1.0,
            wireframe: false,
        });
        const fillerMaterial = new MeshBasicMaterial({
            color: this.color,
            side: DoubleSide,
            transparent: true,
            opacity: 1.0,
            wireframe: false,
        });

        if (this.edge.wall.start.getAttachedRooms().length < 2 || this.edge.wall.end.getAttachedRooms().length < 2) {
            this.planes.push(
                this.makeWall(
                    this.edge.exteriorStart(),
                    this.edge.exteriorEnd(),
                    this.edge.exteriorTransform,
                    this.edge.invExteriorTransform,
                    fillerMaterial
                )
            );
        }

        this.planes.push(
            this.makeWall(
                this.edge.interiorStart(),
                this.edge.interiorEnd(),
                this.edge.interiorTransform,
                this.edge.invInteriorTransform,
                wallMaterial
            )
        );

        this.basePlanes.push(this.buildFillerUniformHeight(this.edge, 0, BackSide, this.color));
        if (this.edge.wall.start.getAttachedRooms().length < 2 || this.edge.wall.end.getAttachedRooms().length < 2) {
            this.planes.push(this.buildFillerVaryingHeights(this.edge, DoubleSide, this.color));
        }

        this.planes.push(
            this.buildSideFillter(
                this.edge.interiorStart(),
                this.edge.exteriorStart(),
                extStartCorner.elevation,
                this.color
            )
        );
        this.planes.push(
            this.buildSideFillter(this.edge.interiorEnd(), this.edge.exteriorEnd(), extEndCorner.elevation, this.color)
        );
    }

    makeWall(
        start: Vector2,
        end: Vector2,
        transform: Matrix4,
        invTransform: Matrix4,
        material: MeshBasicMaterial
    ): Mesh {
        const v1 = this.toVec3(start);
        const v2 = this.toVec3(end);
        const v3 = v2.clone();
        const v4 = v1.clone();

        v3.y = this.edge.getEnd().elevation;
        v4.y = this.edge.getStart().elevation;

        const points = [v1.clone(), v2.clone(), v3.clone(), v4.clone()];

        points.forEach((p) => {
            p.applyMatrix4(transform);
        });

        const spoints = [
            new Vector2(points[0].x, points[0].y),
            new Vector2(points[1].x, points[1].y),
            new Vector2(points[2].x, points[2].y),
            new Vector2(points[3].x, points[3].y),
        ];
        const shape = new Shape(spoints);

        this.wall.items.forEach((item) => {
            const pos = item.object.position.clone();
            pos.applyMatrix4(transform);
            const size = item.getSize();

            const min = size.clone().multiplyScalar(-1);
            const max = size.clone();

            min.add(pos);
            max.add(pos);

            min.x += size.x * 0.5;
            max.x -= size.x * 0.5;

            if (max.y >= this.edge.getEnd().elevation) {
                max.y = this.edge.getEnd().elevation;
            }

            const holePoints = [
                new Vector2(min.x, min.y),
                new Vector2(max.x, min.y),
                new Vector2(max.x, max.y),
                new Vector2(min.x, max.y),
            ];

            holePoints.forEach((p) => {
                if (p.y < 0) {
                    p.y = 0;
                }
            });

            shape.holes.push(new Path(holePoints));
        });

        const geometry = new ShapeGeometry(shape);

        const positions = (geometry as BufferGeometry).attributes.position.array as number[];
        for (let i = 0; i < positions.length; i += 3) {
            const v = new Vector3(positions[i], positions[i + 1], positions[i + 2]).applyMatrix4(invTransform);
            positions[i] = v.x;
            positions[i + 1] = v.y;
            positions[i + 2] = v.z;
        }

        geometry.computeVertexNormals();

        const mesh = new Mesh(geometry, material);
        return mesh;
    }

    buildSideFillter(p1: Vector2, p2: Vector2, height: number, color: number): Mesh {
        const points = [this.toVec3(p1), this.toVec3(p2), this.toVec3(p2, height), this.toVec3(p1, height)];

        const geometry = new BufferGeometry().setFromPoints(points);

        const fillerMaterial = new MeshBasicMaterial({ color, side: DoubleSide });
        const filler = new Mesh(geometry, fillerMaterial);
        return filler;
    }

    buildFillerVaryingHeights(edge: HalfEdge, side: Side, color: number): Mesh {
        const a = this.toVec3(edge.exteriorStart(), this.edge.getStart().elevation);
        const b = this.toVec3(edge.exteriorEnd(), this.edge.getEnd().elevation);
        const c = this.toVec3(edge.interiorEnd(), this.edge.getEnd().elevation);
        const d = this.toVec3(edge.interiorStart(), this.edge.getStart().elevation);

        const fillerMaterial = new MeshBasicMaterial({ color, side });

        const geometry = new BufferGeometry().setFromPoints([a, b, c, d]);

        const filler = new Mesh(geometry, fillerMaterial);
        return filler;
    }

    buildFillerUniformHeight(edge: HalfEdge, height: number, side: Side, color: number): Mesh {
        const points = [
            this.toVec2(edge.exteriorStart()),
            this.toVec2(edge.exteriorEnd()),
            this.toVec2(edge.interiorEnd()),
            this.toVec2(edge.interiorStart()),
        ];

        const fillerMaterial = new MeshBasicMaterial({ color, side });
        const shape = new Shape(points);
        const geometry = new ShapeGeometry(shape);
        const filler = new Mesh(geometry, fillerMaterial);
        filler.rotation.set(Math.PI / 2, 0, 0);
        filler.position.y = height;
        return filler;
    }

    toVec2(pos: Vector2): Vector2 {
        return new Vector2(pos.x, pos.y);
    }

    toVec3(pos: Vector2, height = 0): Vector3 {
        return new Vector3(pos.x, height, pos.y);
    }
}
