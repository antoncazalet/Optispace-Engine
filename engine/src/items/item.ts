import { Box3, BoxHelper, Color, EventDispatcher, Group, Mesh, Object3D, Vector3 } from "three";
import { FloorplanLoader } from "../model/floorplan_loader";
import { ItemMetadata } from "../types/file";
import { Configuration } from "../utils/configuration";
import { EVENT_3D_FURNITURE_CLICKED, EVENT_3D_FURNITURE_MOVED } from "../utils/events";
import { Utils } from "../utils/utils";

export class Item extends EventDispatcher {
    name: string;
    model: FloorplanLoader;
    metadata: ItemMetadata;
    object: Group | Object3D;

    hover = false;
    selected = false;
    dragging = false;
    fixed = false;

    boxHelper: BoxHelper = null;

    constructor(model: FloorplanLoader, metadata: ItemMetadata, object: Group | Object3D, position: Vector3) {
        super();
        this.name = Utils.guide();
        this.model = model;
        this.metadata = metadata;

        this.object = object;

        this.placeInRoom(position);

        this.object.rotation.y = metadata.rotation;
        this.fixed = metadata.fixed ?? false;

        this.boxHelper = new BoxHelper(object, new Color("blue"));

        if (Configuration.getValue("debugMode")) {
            this.model.scene.add(this.boxHelper);
        }
        this.update();
    }

    placeInRoom(position: Vector3): void {
        if (!position) {
            const center = this.model.floorplan.getCenter();
            const boundingBox = new Box3().setFromObject(this.object);

            this.object.position.x = center.x;
            this.object.position.z = center.z;
            this.object.position.y = boundingBox.min.y;
        } else {
            this.object.position.set(position.x, position.y, position.z);
        }
    }

    setPosition(position: Vector3): void {
        this.object.position.copy(position);
        this.update();
    }

    mouseOver(): void {
        this.hover = true;
        this.updateHighlight();
    }

    mouseOff(): void {
        this.hover = false;
        this.updateHighlight();
    }

    getSize(): Vector3 {
        const boundingBox = new Box3().setFromObject(this.object);

        const size = boundingBox.getSize(new Vector3());

        if (size.x > size.z) {
            return new Vector3(size.x, size.y, size.x);
        } else {
            return new Vector3(size.z, size.y, size.z);
        }
    }

    clickPressed(): void {
        this.update();
        this.dispatchEvent({ type: EVENT_3D_FURNITURE_CLICKED });
    }

    /**
     * @deprecated
     */
    moveToPosition(vector: Vector3): void {
        this.object.position.copy(vector);

        if (this.boxHelper && Configuration.getValue("debugMode")) {
            this.boxHelper.update();
        }
    }

    remove(): void {
        if (this.boxHelper) {
            this.model.scene.remove(this.boxHelper);
        }
    }

    setSelected(): void {
        this.selected = true;
        this.update();
    }

    setUnselected(): void {
        this.selected = false;
        this.update();
    }

    update(): void {
        if (this.boxHelper && Configuration.getValue("debugMode")) {
            this.boxHelper.update();
        }
        this.dispatchEvent({ type: EVENT_3D_FURNITURE_MOVED, item: this });
        this.updateHighlight();
    }

    setColor(color: string): void {
        const threeColor = new Color(color);

        this.object.traverse((child) => {
            if (child instanceof Mesh) {
                if (child.material) {
                    child.material.color.copy(threeColor);
                }
            }
        });
    }

    setFixed(fixed: boolean): void {
        this.fixed = fixed;
    }

    clickReleased(): void {}

    updateHighlight(): void {
        const on = this.hover || this.selected;

        const hex = on ? 0x444444 : 0x000000;

        this.object.traverse((child: any) => {
            if (child.isMesh && child.material) {
                child.material.emissive.setHex(hex);
                child.material.emissiveIntensity = 1;
            }
        });
    }

    getMetaData(): Record<string, unknown> {
        return {
            item_name: this.metadata.itemName,
            item_type: this.metadata.itemType,
            format: this.metadata.format,
            model_url: this.metadata.modelUrl,
            xpos: this.object.position.x,
            ypos: this.object.position.y,
            zpos: this.object.position.z,
            rotation: this.object.rotation.y,
            scale_x: this.object.scale.x,
            scale_y: this.object.scale.y,
            scale_z: this.object.scale.z,
            fixed: this.fixed,
        };
    }
}
