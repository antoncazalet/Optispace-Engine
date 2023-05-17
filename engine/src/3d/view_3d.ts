import * as THREE from "three";
import {
    Event,
    EventDispatcher,
    EventListener,
    OrthographicCamera,
    PerspectiveCamera,
    Vector3,
    WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Item } from "../items/item";
import { FloorplanLoader } from "../model/floorplan_loader";
import { Scene } from "../model/scene";
import {
    EVENT_CAMERA_MOVED,
    EVENT_GLTF_READY,
    EVENT_ITEM_SELECTED,
    EVENT_ITEM_UNSELECTED,
    EVENT_UPDATED,
} from "../utils/events";
import { Controller } from "./controller";
import { Floorplan3D } from "./floorplan_3d";
import { Ground } from "./ground";
import { Lights } from "./lights";

const ORTHO_SCALE = 1;

enum CAMERA_TYPE {
    ORTHO = 1,
    PERSPECTIVE,
}

export class View3D extends EventDispatcher {
    pauseRender: boolean;
    model: FloorplanLoader;
    scene: Scene;
    element: Element;
    domElement: HTMLElement;

    perspectiveCamera: PerspectiveCamera;
    orthographicCamera: OrthographicCamera;
    currentCamera: "PERSECTIVE" | "ORTHOGRAPHIC" = "PERSECTIVE";

    controls: OrbitControls;
    renderer: WebGLRenderer;
    controller: Controller;
    floorplan: Floorplan3D;
    ground: Ground;
    lights: Lights;

    addEventListener: <T extends string>(type: T, listener: EventListener<Event, T, this>) => void;

    constructor(model: FloorplanLoader) {
        super();

        this.pauseRender = true;
        this.model = model;
        this.scene = model.scene;
        this.element = document.querySelector("#optiengine-3d-canvas");

        this.domElement = null;
        this.perspectiveCamera = null;

        this.controls = null;

        this.renderer = null;
        this.controller = null;

        this.floorplan = null;

        this.init();
    }

    getAllObjects(): Item[] {
        return this.model.scene.items;
    }

    getCurrentCamera(): PerspectiveCamera | OrthographicCamera {
        switch (this.currentCamera) {
            case "PERSECTIVE":
                return this.perspectiveCamera;
            case "ORTHOGRAPHIC":
                return this.orthographicCamera;
        }
    }

    init(): void {
        this.domElement = this.element as HTMLElement;

        const near = 100;
        const far = 10000000;
        const fov = 50;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const aspect = windowWidth / windowHeight;

        this.perspectiveCamera = new PerspectiveCamera(fov, aspect, near, far);

        this.orthographicCamera = new OrthographicCamera(
            windowWidth / -ORTHO_SCALE,
            windowWidth / ORTHO_SCALE,
            windowHeight / ORTHO_SCALE,
            windowHeight / -ORTHO_SCALE,
            near,
            far
        );

        this.renderer = new WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        this.domElement.appendChild(this.renderer.domElement);

        this.ground = new Ground(this.scene);
        this.controls = new OrbitControls(this.getCurrentCamera(), this.domElement);
        this.controls.maxDistance = 10000;
        this.controls.minDistance = 100;

        this.controls.maxPolarAngle = Math.PI / 2 - 0.03;

        this.controls.addEventListener("change", () =>
            this.controls.dispatchEvent({ type: EVENT_CAMERA_MOVED, target: undefined })
        );
        this.controller = new Controller(this, this.model, this.getCurrentCamera(), this.element, this.controls);

        this.updateWindowSize();

        window.addEventListener("resize", () => this.updateWindowSize());

        this.model.floorplan.addEventListener(EVENT_UPDATED, () => {
            this.centerCamera();
        });
        this.centerCamera();

        this.lights = new Lights(this.scene);
        this.floorplan = new Floorplan3D(this.scene, this.model.floorplan, this.controls);

        const animate = () => {
            this.renderer.setAnimationLoop(() => {
                this.render();
            });
            this.render();
        };
        animate();
    }

    zoomIn(): void {
        this.controls.zoomIn();
    }

    zoomOut(): void {
        this.controls.zoomOut();
    }

    gltfReady(event: { type: string; item: FloorplanLoader; gltf: string }): void {
        this.dispatchEvent({ type: EVENT_GLTF_READY, item: this, gltf: event.gltf });
    }

    itemIsSelected(item: Item): void {
        this.dispatchEvent({ type: EVENT_ITEM_SELECTED, item });
    }

    itemIsUnselected(): void {
        this.dispatchEvent({ type: EVENT_ITEM_UNSELECTED });
    }

    setCursorStyle(cursorStyle: string): void {
        this.domElement.style.cursor = cursorStyle;
    }

    updateWindowSize(): void {
        const offset = {
            top: this.element.getBoundingClientRect().top + window.scrollY,
            left: this.element.getBoundingClientRect().left + window.scrollX,
        };

        const elementWidth = parseFloat(window.getComputedStyle(this.element).width);
        const elementHeight = window.innerHeight - offset.top;

        this.perspectiveCamera.aspect = elementWidth / elementHeight;
        this.perspectiveCamera.updateProjectionMatrix();

        this.orthographicCamera.left = innerWidth / -ORTHO_SCALE;
        this.orthographicCamera.right = innerWidth / ORTHO_SCALE;
        this.orthographicCamera.top = innerHeight / ORTHO_SCALE;
        this.orthographicCamera.bottom = innerHeight / -ORTHO_SCALE;
        this.orthographicCamera.updateProjectionMatrix();

        this.renderer.setSize(elementWidth, elementHeight);
    }

    centerCamera(): void {
        if (this.currentCamera === "PERSECTIVE") {
            const pan = this.model.floorplan.getCenter();

            this.controls.target = pan;
            this.controls.update();

            const distance = this.model.floorplan.getSize().z * 1.5;
            const offset = pan.clone().add(new Vector3(0, distance, distance));

            this.perspectiveCamera.position.copy(offset);
        }
    }

    switchCamera(type: CAMERA_TYPE): void {
        let camera: typeof this.currentCamera = null;

        if (type === CAMERA_TYPE.ORTHO && this.currentCamera === "PERSECTIVE") {
            camera = "ORTHOGRAPHIC";
        } else if (type === CAMERA_TYPE.PERSPECTIVE && this.currentCamera === "ORTHOGRAPHIC") {
            camera = "PERSECTIVE";
        }

        if (camera) {
            this.currentCamera = camera;
            this.updateCamera();
        }
    }

    updateCamera(): void {
        switch (this.currentCamera) {
            case "PERSECTIVE":
                this.toPerspective();
                break;
            case "ORTHOGRAPHIC":
                this.toOrthographic();
                break;
        }
    }

    toOrthographic(): void {
        this.currentCamera = "ORTHOGRAPHIC";
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.PAN,
            RIGHT: THREE.MOUSE.PAN,
        };
        const p = this.controls.target;
        this.controls.target = new Vector3(p.x, 0, p.z);
        this.getCurrentCamera().position.copy(new Vector3(p.x, 2000, p.z));
        this.controls.object = this.getCurrentCamera();
        this.orthographicCamera.updateProjectionMatrix();
        this.controller.camera = this.getCurrentCamera();
        this.controller.changeCamera(this.orthographicCamera);
        this.controls.update();
    }

    toPerspective(): void {
        this.currentCamera = "PERSECTIVE";
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
        };
        this.controls.object = this.getCurrentCamera();
        this.perspectiveCamera.updateProjectionMatrix();
        this.controller.camera = this.getCurrentCamera();
        this.controller.changeCamera(this.perspectiveCamera);
        this.controls.update();
    }

    pauseTheRendering(flag: boolean): void {
        this.pauseRender = flag;
    }

    render(): void {
        if (this.pauseRender) {
            return;
        }

        this.renderer.render(this.scene.getScene(), this.getCurrentCamera());
        this.controls.update();
        this.dispatchEvent({ type: EVENT_CAMERA_MOVED });
    }
}
