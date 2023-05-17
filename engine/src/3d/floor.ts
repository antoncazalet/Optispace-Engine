import {
    DoubleSide,
    EventDispatcher,
    Mesh,
    MeshPhysicalMaterial,
    RepeatWrapping,
    Shape,
    ShapeGeometry,
    TextureLoader,
    Vector2,
} from "three";
import Room from "../model/room";
import { Scene } from "../model/scene";

export class Floor extends EventDispatcher {
    scene: Scene;
    room: Room;
    floorPlane: Mesh;

    constructor(scene: Scene, room: Room) {
        super();
        this.scene = scene;
        this.room = room;
        this.floorPlane = this.buildFloor();
    }

    buildFloor(): Mesh {
        const textureSettings = this.room.getTexture();
        const floorTexture = new TextureLoader().load(
            textureSettings.url ?? "/rooms/textures/default_floor_texture.jpg"
        );
        floorTexture.wrapS = RepeatWrapping;
        floorTexture.wrapT = RepeatWrapping;
        floorTexture.repeat.set(1, 1);

        const floorMaterialTop = new MeshPhysicalMaterial({
            map: floorTexture,
            side: DoubleSide,
        });

        const textureScale = textureSettings.scale;
        // http://stackoverflow.com/questions/19182298/how-to-texture-a-three-js-mesh-created-with-shapegeometry
        // scale down coords to fit 0 -> 1, then rescale

        const points: Vector2[] = [];

        this.room.interiorCorners.forEach((corner) => {
            points.push(new Vector2(corner.x / textureScale, corner.y / textureScale));
        });

        const shape = new Shape(points);
        const geometry = new ShapeGeometry(shape);
        const floor = new Mesh(geometry, floorMaterialTop);

        floor.rotation.set(Math.PI / 2, 0, 0);
        floor.scale.set(textureScale, textureScale, textureScale);

        return floor;
    }

    addToScene(index: number): void {
        this.floorPlane.position.y = index * 0.02;
        this.room.floorPlane.position.y = index * 0.02;

        this.scene.add(this.floorPlane);
        this.scene.add(this.room.floorPlane);
    }

    removeFromScene(): void {
        this.scene.remove(this.floorPlane);
        this.scene.remove(this.room.floorPlane);
    }
}
