import { Camera, EventDispatcher, Intersection, Raycaster, Vector2 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { Item } from "../items/item";
import { FloorplanLoader } from "../model/floorplan_loader";
import { Scene } from "../model/scene";
import { EVENT_ITEM_REMOVED } from "../utils/events";
import { View3D } from "./view_3d";

export enum ItemState {
    UNSELECTED = 0,
    SELECTED,
}

export class Controller extends EventDispatcher {
    three: View3D;
    model: FloorplanLoader;
    camera: Camera;
    controls: OrbitControls;
    enabled: boolean;
    scene: Scene;

    objectController: TransformControls;

    intersectedObject: Item;
    mouseoverObject: Item;

    mouseDown: boolean;
    mouseMoved: boolean;

    state: ItemState;

    pointer: Vector2;
    selectedObject: Item;

    raycaster: Raycaster;

    constructor(three: View3D, model: FloorplanLoader, camera: Camera, element: Element, controls: OrbitControls) {
        super();
        this.three = three;
        this.model = model;
        this.camera = camera;
        this.controls = controls;

        this.enabled = true;
        this.scene = model.scene;

        this.intersectedObject = null;
        this.mouseoverObject = null;
        this.selectedObject = null;

        this.mouseDown = false;
        this.mouseMoved = false;

        this.state = ItemState.UNSELECTED;

        element.addEventListener("pointerdown", (event: MouseEvent) => this.mouseDownEvent(event));
        element.addEventListener("pointerup", () => this.mouseUpEvent());
        element.addEventListener("pointermove", (event: MouseEvent) => this.mouseMoveEvent(event));
        element.addEventListener("pointercancel", () => this.onPointerCancel());

        this.scene.addEventListener(EVENT_ITEM_REMOVED, (o) => this.itemRemoved(o.item));

        this.raycaster = new Raycaster();
        this.pointer = new Vector2();

        this.objectController = new TransformControls(this.camera, element as HTMLElement);
        this.setTransformMode("translate");

        this.scene.add(this.objectController);

        this.objectController.addEventListener("dragging-changed", (event) => {
            this.controls.enabled = !event.value;
        });

        this.objectController.addEventListener("objectChange", () => {
            if (this.selectedObject.fixed) {
                this.objectController.reset();
                return;
            }
            this.selectedObject.update();
        });
    }

    setTransformMode(mode: "translate" | "rotate" | "scale"): void {
        switch (mode) {
            case "translate":
                this.objectController.showY = true;
                this.objectController.showX = true;
                this.objectController.showZ = true;
                break;
            case "rotate":
                this.objectController.showY = true;
                this.objectController.showX = false;
                this.objectController.showZ = false;
                break;
            case "scale":
                this.objectController.showY = true;
                this.objectController.showX = true;
                this.objectController.showZ = true;
                break;
        }

        this.objectController.setSize(0.5);
        this.objectController.setMode(mode);
    }

    getTransformMode(): "translate" | "rotate" | "scale" {
        return this.objectController.getMode();
    }

    detachObject(): void {
        this.objectController.detach();
    }

    changeCamera(camera: Camera): void {
        this.camera = camera;
        this.objectController.camera = camera;
    }

    itemRemoved(item: Item): void {
        if (item === this.selectedObject) {
            this.selectedObject.setUnselected();
            this.selectedObject.mouseOff();
            this.setSelectedObject(null);
        }
    }

    clickPressed(): void {
        const intersection = this.itemIntersection(this.selectedObject);

        if (intersection) {
            this.selectedObject.clickPressed();
        }
    }

    mouseDownEvent(event: MouseEvent): void {
        if (this.enabled) {
            event.preventDefault();

            this.mouseMoved = false;
            this.mouseDown = true;

            this.updateIntersections();

            switch (this.state) {
                case ItemState.SELECTED:
                    if (this.intersectedObject !== null) {
                        this.setSelectedObject(this.intersectedObject);
                    }
                    break;
                case ItemState.UNSELECTED:
                    if (this.intersectedObject !== null) {
                        this.setSelectedObject(this.intersectedObject);
                    }
                    break;
            }
        }
    }

    mouseMoveEvent(event: MouseEvent): void {
        if (this.enabled) {
            event.preventDefault();
            this.mouseMoved = true;

            this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

            if (!this.mouseDown) {
                this.updateIntersections();
            }

            switch (this.state) {
                case ItemState.UNSELECTED:
                    this.updateMouseover();
                    break;
                case ItemState.SELECTED:
                    this.updateMouseover();
                    break;
            }
        }
    }

    mouseUpEvent(): void {
        if (this.enabled) {
            this.mouseDown = false;

            switch (this.state) {
                case ItemState.UNSELECTED:
                    break;
                case ItemState.SELECTED:
                    if (this.intersectedObject === null && !this.mouseMoved) {
                        this.switchState(ItemState.UNSELECTED);
                    }
                    break;
            }
        }
    }

    onPointerCancel(): void {
        this.mouseDown = false;
        this.mouseMoved = false;
    }

    switchState(newState: number): void {
        if (newState !== this.state) {
            this.onExit(this.state);
            this.onEntry(newState);
        }
        this.state = newState;
    }

    onEntry(state: number): void {
        switch (state) {
            case ItemState.UNSELECTED:
                this.setSelectedObject(null);
                break;
            case ItemState.SELECTED:
                this.controls.enabled = true;
                break;
        }
    }

    onExit(state: number): void {
        switch (state) {
            case ItemState.UNSELECTED:
            case ItemState.SELECTED:
                break;
        }
    }

    getSelectedObject(): Item {
        return this.selectedObject;
    }

    updateIntersections(): void {
        const items = this.model.scene.getItems();
        let shortestLenght: number = null;
        let bestItem: Item = null;

        if (this.objectController.visible && this.objectController.axis) {
            this.intersectedObject = null;
            return;
        }

        for (const item of items) {
            const intersects = this.getNewIntersections(item);

            if (intersects.length !== 0) {
                if (shortestLenght === null || intersects[0].distance < shortestLenght) {
                    shortestLenght = intersects[0].distance;
                    bestItem = item;
                }
            }
        }
        this.intersectedObject = bestItem;
    }

    itemIntersection(item: Item): Intersection {
        const intersects = this.getNewIntersections(item);

        return intersects[0];
    }

    getNewIntersections(object: Item): Intersection[] {
        this.raycaster.setFromCamera(this.pointer, this.camera);

        const intersects = this.raycaster.intersectObject(object.object, true);

        return intersects;
    }

    setSelectedObject(object: Item): void {
        if (this.state === ItemState.UNSELECTED) {
            this.switchState(ItemState.SELECTED);
        }
        if (this.selectedObject !== null) {
            this.selectedObject.setUnselected();
        }
        if (object !== null) {
            this.selectedObject = object;
            this.selectedObject.setSelected();
            this.three.itemIsSelected(object);

            this.objectController.attach(object.object);
        } else {
            this.selectedObject = null;
            this.three.itemIsUnselected();

            this.objectController.detach();
        }
    }

    updateMouseover(): void {
        if (this.intersectedObject !== null) {
            if (this.mouseoverObject !== null) {
                if (this.mouseoverObject !== this.intersectedObject) {
                    this.mouseoverObject.mouseOff();
                    this.mouseoverObject = this.intersectedObject;
                    this.mouseoverObject.mouseOver();
                }
            } else {
                this.mouseoverObject = this.intersectedObject;
                this.mouseoverObject.mouseOver();
                this.three.setCursorStyle("pointer");
            }
        } else if (this.mouseoverObject !== null) {
            this.mouseoverObject.mouseOff();
            this.three.setCursorStyle("auto");
            this.mouseoverObject = null;
        }
    }
}
