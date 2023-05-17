import { Group, Object3D, Vector3 } from "three";
import { FloorplanLoader } from "../model/floorplan_loader";
import HalfEdge from "../model/half_edge";
import { ItemMetadata } from "../types/file";
import { EVENT_DELETED } from "../utils/events";
import { Utils } from "../utils/utils";
import { Item } from "./item";

export class WallItem extends Item {
    currentWallEdge: HalfEdge;
    addToWall = true;

    constructor(model: FloorplanLoader, metadata: ItemMetadata, object: Group | Object3D, position: Vector3) {
        super(model, metadata, object, position);

        this.currentWallEdge = undefined;

        this.placeInRoom(position);
    }

    closestWallEdge(): HalfEdge {
        const wallEdges = this.model.floorplan.wallEdges();
        let wallEdge: HalfEdge;
        let minDistance;

        const itemX = this.object.position.x;
        const itemZ = this.object.position.z;

        wallEdges.forEach((edge) => {
            const distance = edge.distanceTo(itemX, itemZ);
            if (minDistance === undefined || distance < minDistance) {
                minDistance = distance;
                wallEdge = edge;
            }
        });
        return wallEdge;
    }

    remove(): void {
        if (this.currentWallEdge !== undefined) {
            Utils.removeValue(this.currentWallEdge.wall.items, this);
            this.redrawWall();
        }
    }

    redrawWall(): void {
        if (this.currentWallEdge) {
            this.currentWallEdge.wall.fireRedraw();
        }
    }

    update(): void {
        super.update();
        if (this.object.position.y < 0) {
            this.object.position.y = 0;
        }
        const closestWallEdge = this.closestWallEdge();
        if (closestWallEdge !== this.currentWallEdge) {
            this.changeWallEdge(closestWallEdge);
        }
        this.redrawWall();
    }

    placeInRoom(position: Vector3): void {
        const closestWallEdge = this.closestWallEdge();
        this.changeWallEdge(closestWallEdge);

        if (position) {
            this.object.position.set(position.x, position.y, position.z);
        } else {
            const center = closestWallEdge.interiorCenter();

            this.object.position.copy(new Vector3(center.x, 0, center.y));
        }
    }

    changeWallEdge(wallEdge: HalfEdge): void {
        if (this.currentWallEdge !== undefined) {
            Utils.removeValue(this.currentWallEdge.wall.items, this);
            this.redrawWall();
        }

        if (this.currentWallEdge !== undefined) {
            this.currentWallEdge.wall.removeEventListener(EVENT_DELETED, () => this.remove());
        }
        wallEdge.wall.addEventListener(EVENT_DELETED, () => this.remove());

        this.currentWallEdge = wallEdge;

        if (this.addToWall) {
            wallEdge.wall.items.push(this);
            this.redrawWall();
        }
    }
}
