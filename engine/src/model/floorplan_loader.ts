import { EventDispatcher, Vector3 } from "three";
import { EVENT_LOADED, EVENT_LOADING } from "../utils/events";
import { Floorplan } from "./floorplan";
import { Scene } from "./scene";

import { ItemMetadata, JSONFile } from "../types/file";

/**
 * A FloorplanLoader is an abstract concept the has the data structuring a floorplan. It connects a {@link Floorplan} and a {@link Scene}
 */
export class FloorplanLoader extends EventDispatcher {
    floorplan: Floorplan;
    scene: Scene;

    constructor() {
        super();
        this.floorplan = new Floorplan();
        this.scene = new Scene(this);
    }

    loadObject(obj: JSONFile): void {
        this.dispatchEvent({ type: EVENT_LOADING, item: this });
        this.loadFloorplan(obj);
        this.dispatchEvent({ type: EVENT_LOADED, item: this });
    }

    exportSerialized(): string {
        const itemsArray = this.scene.getItems().map((item) => item.getMetaData());

        const room = {
            floorplan: this.floorplan.saveFloorplan(),
            items: itemsArray,
            teams: this.floorplan.teamsConfig,
        };
        return JSON.stringify(room);
    }

    loadFloorplan(obj: JSONFile): void {
        const { floorplan, items, teams } = obj;

        this.floorplan.saveTeamsConfig(teams);

        this.scene.clearItems();
        this.floorplan.loadFloorplan(floorplan);

        items.forEach((item) => {
            const position = new Vector3(item.xpos, item.ypos, item.zpos);

            const metadata: ItemMetadata = {
                itemName: item.item_name,
                resizable: item.resizable,
                format: item.format,
                itemType: item.item_type,
                modelUrl: item.model_url,
                rotation: item.rotation,
                scale: {
                    x: item.scale_x,
                    y: item.scale_y,
                    z: item.scale_z,
                },
                fixed: item.fixed,
            };
            this.scene.addItem(metadata, position);
        });
    }
}
