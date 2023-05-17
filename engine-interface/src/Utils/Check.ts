import axios from "axios";
import { JSONFile } from "../Optiengine/types/file";

export async function checkDeadTextureUrlInPlan(plan: JSONFile) {
    if (plan.floorplan.rooms) {
        for (const room of Object.keys(plan.floorplan.rooms)) {
            const response = await axios
                .get((plan.floorplan.rooms[room as any] as any).floorTexture, { baseURL: '/'})
                .then(() => true)
                .catch(() => false);

            if (!response) {
                (plan.floorplan.rooms as any)[room].floorTexture = "/rooms/textures/default_floor_texture.jpg";
            }
        }
    }
}
