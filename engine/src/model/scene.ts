import { Box3, Color, EventDispatcher, Group, Mesh, Object3D, Scene as ThreeScene, Vector3 } from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { TDSLoader } from "three/examples/jsm/loaders/TDSLoader";
import { Item } from "../items/item";
import { WallItem } from "../items/wall_item";
import { ItemCategory, ItemMetadata } from "../types/file";
import { EVENT_ITEM_LOADING } from "../utils/events";
import { Utils } from "../utils/utils";
import { FloorplanLoader } from "./floorplan_loader";

/**
 * The Scene is a manager of Items and also links to a ThreeJS scene.
 */
export class Scene extends EventDispatcher {
    model: FloorplanLoader;
    scene: ThreeScene;
    items: Item[];

    gltfloader: GLTFLoader;
    objLoader: OBJLoader;
    fbxLoader: FBXLoader;
    tdsLoader: TDSLoader;

    constructor(model: FloorplanLoader) {
        super();
        this.model = model;
        this.scene = new ThreeScene();
        this.scene.background = new Color(0xffffff);
        this.items = [];

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("/examples/js/libs/draco/");

        this.gltfloader = new GLTFLoader();
        this.gltfloader.setDRACOLoader(dracoLoader);

        this.objLoader = new OBJLoader();

        this.fbxLoader = new FBXLoader();

        this.tdsLoader = new TDSLoader();
    }

    /** Adds a non-item, basically a mesh, to the scene.
     * @param mesh The mesh to be added.
     */
    add(mesh: Object3D): void {
        this.scene.add(mesh);
    }

    setItemPositionFromName(name: string, position: Vector3): void {
        const item = this.items.find((i) => i.name === name);

        if (item) {
            item.setPosition(position);
            item.update();
        }
    }

    setItemFixedFromName(name: string, fixed: boolean): void {
        const item = this.items.find((i) => i.name === name);

        if (item) {
            item.setFixed(fixed);
            item.update();
        }
    }

    setItemRotationFromName(name: string, rotation: number): void {
        const item = this.items.find((i) => i.name === name);

        if (item) {
            item.object.rotation.set(0, rotation, 0);
            item.update();
        }
    }

    setItemScaleFromName(name: string, scale: { x: number; y: number; z: number }): void {
        const item = this.items.find((i) => i.name === name);

        if (item) {
            item.object.scale.set(scale.x, scale.y, scale.z);
            item.update();
        }
    }

    setItemColorFromName(name: string, color: string): void {
        const item = this.items.find((i) => i.name === name);

        if (item) {
            item.setColor(color);
            item.update();
        }
    }

    deleteItemFromName(name: string): void {
        const item = this.items.find((i) => i.name === name);

        if (item) {
            item.remove();
            this.scene.remove(item.object);
            Utils.removeValue(this.items, item);
        }
    }

    /** Removes a non-item, basically a mesh, from the scene.
     * @param mesh The mesh to be removed.
     */
    remove(mesh: Object3D): void {
        this.scene.remove(mesh);
        Utils.removeValue(this.items, mesh);
    }

    /** Gets the scene.
     * @returns The scene.
     */
    getScene(): ThreeScene {
        return this.scene;
    }

    /** Gets the items.
     * @returns The items.
     */
    getItems(): Item[] {
        return this.items;
    }

    /** Removes all items. */
    clearItems(): void {
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];

            this.scene.remove(item.object);
            this.items.splice(i, 1);
        }

        this.items = [];
    }

    addItem(metadata: ItemMetadata, position: Vector3): void {
        const createItem = (object: Group | Object3D) => {
            let item;

            switch (metadata.itemType) {
                default:
                case ItemCategory.Item:
                case ItemCategory.FloorItem:
                    item = new Item(this.model, metadata, object, position);
                    break;
                case ItemCategory.WallItem:
                case ItemCategory.InWallItem:
                    item = new WallItem(this.model, metadata, object, position);
                    break;
            }
            if (item === undefined) {
                return;
            }
            this.scene.add(object);
            this.items.push(item);
        };

        const gltfCallback = (gltfModel: GLTF) => {
            const object = gltfModel.scene;

            if (metadata.scale) {
                object.scale.set(metadata.scale.x, metadata.scale.y, metadata.scale.z);
            } else {
                object.scale.set(300, 300, 300);
            }

            if (metadata.itemType === ItemCategory.InWallItem) {
                object.traverse((o) => {
                    if (o instanceof Mesh) {
                        const box = new Box3().setFromObject(o);
                        const center = box.getCenter(new Vector3());
                        o.position.x -= center.x;
                    }
                });
            }

            createItem(object);
        };

        const objCallback = (objModel: Object3D) => {
            const object = objModel;

            createItem(object);
        };

        const fbxCallback = (fbxModel: Group) => {
            const object = fbxModel;

            createItem(object);
        };

        const tdsCallback = (tdsModel: Group) => {
            const object = tdsModel;

            createItem(object);
        };

        const fileName = `https://api.optispace.fr/furnitureModel/${metadata.modelUrl.split("/furnitureModel/")[1]}`;
        // Don't know why process is undefined so everything is https for now
        // const fileName = `${process.env.PRODUCTION ? "https" : "http"}://api.optispace.fr/furnitureModel/${metadata.modelUrl.split("/furnitureModel/")[1]}`;

        const onError = () => console.log(`[Error] while loading file ${fileName}`);

        this.dispatchEvent({ type: EVENT_ITEM_LOADING });

        switch (metadata.format) {
            case "gltf":
                this.gltfloader.load(fileName, gltfCallback, undefined, onError);
                break;
            case "obj":
                this.objLoader.load(fileName, objCallback, undefined, onError);
                break;
            case "fbx":
                this.fbxLoader.load(fileName, fbxCallback, undefined, onError);
                break;
            case "3ds":
                this.tdsLoader.load(fileName, tdsCallback, undefined, onError);
                break;
            default:
                console.error(`Skipped item ${fileName} ${metadata.format}`);
                break;
        }
    }
}
