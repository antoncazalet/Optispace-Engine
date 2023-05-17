import { DirectionalLight, EventDispatcher, HemisphereLight } from "three";
import { Scene } from "../model/scene";

export class Lights extends EventDispatcher {
    constructor(scene: Scene) {
        super();

        const light = new HemisphereLight(0xffffff, 0x888888, 1.1);
        light.position.set(0, 300, 0);
        scene.add(light);

        const dirLight = new DirectionalLight(0xffffff, 0.5);

        dirLight.color.setHSL(1, 1, 0.1);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        dirLight.shadow.camera.far = 300;
        dirLight.shadow.bias = -0.0001;
        dirLight.visible = true;

        scene.add(dirLight);
        scene.add(dirLight.target);
    }
}
