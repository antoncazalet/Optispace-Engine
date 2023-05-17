import { EventDispatcher } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Floorplan from "../model/floorplan";
import { Scene } from "../model/scene";
import { EVENT_UPDATED } from "../utils/events";
import { Edge } from "./edge";
import { Floor } from "./floor";

export class Floorplan3D extends EventDispatcher {
    scene: Scene;
    floorplan: Floorplan;
    controls: OrbitControls;
    floors: Floor[];
    edges: Edge[];
    updatedroomsevent: () => void;

    constructor(scene: Scene, floorPlan: Floorplan, controls: OrbitControls) {
        super();
        this.scene = scene;
        this.floorplan = floorPlan;
        this.controls = controls;
        this.floors = [];
        this.edges = [];

        this.floorplan.addEventListener(EVENT_UPDATED, () => this.redraw());
    }

    redraw(): void {
        this.floors.forEach((floor) => {
            floor.removeFromScene();
        });
        this.edges.forEach((edge) => {
            edge.remove();
        });

        this.floors = [];
        this.edges = [];

        this.floorplan.getRooms().forEach((room, index) => {
            const threeFloor = new Floor(this.scene, room);
            this.floors.push(threeFloor);
            threeFloor.addToScene(index);
        });

        this.floorplan.wallEdges().forEach((edge, index) => {
            const threeEdge = new Edge(this.scene, edge, this.controls, index);
            this.edges.push(threeEdge);
            threeEdge.addToScene();
        });
    }
}
