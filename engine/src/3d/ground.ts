import {
    CircleGeometry,
    EventDispatcher,
    FrontSide,
    Mesh,
    MeshBasicMaterial,
    RepeatWrapping,
    TextureLoader,
} from "three";
import { Scene } from "../model/scene";

export class Ground extends EventDispatcher {
    ground: Mesh;

    constructor(scene: Scene) {
        super();

        const groundTexture = new TextureLoader().load("rooms/textures/lab_floor_texture.jpg");
        groundTexture.wrapS = RepeatWrapping;
        groundTexture.wrapT = RepeatWrapping;

        groundTexture.repeat.set(1000, 1000);

        const groundGeo = new CircleGeometry(1000000, 64);
        const groundMat = new MeshBasicMaterial({ side: FrontSide, map: groundTexture });
        this.ground = new Mesh(groundGeo, groundMat);
        this.ground.rotateX(-Math.PI * 0.5);
        this.ground.position.y = -1;

        scene.add(this.ground);
    }
}
