import { JSONFile } from "../Optiengine/types/file";
import Item from "../Types/Item";
import { Project } from "../Types/Project";
import Provider from "./Provider";

class Requests {
    async fetchProjectFile(id: string) {
        return Provider.request<JSONFile>("GET", `/currentPlan/${id}`);
    }

    async fetchProject(id: string) {
        return Provider.request<{ success: boolean; project: Project }>("GET", `/project/${id}`);
    }

    async getFurnitures() {
        const response = await Provider.request<{ success: boolean; items: Item[] }>("GET", `/furnitures`);

        return response.items;
    }

    async getFurnitureModel(furnitureId: string) {
        return Provider.request<Project>("GET", `/furnitureModel/${furnitureId}`);
    }

    async saveProject(id: string, token: string, data: string) {
        Provider.setAuthentificationToken(token);

        const file = new Blob([data], { type: "text/plain" });
        const formData = new FormData();
        formData.append("file", file);

        const response = await Provider.request<Project>("PATCH", `/placementAlgoFile/${id}`, formData);

        return response;
    }

    async uploadProjectImage(id: string, data: string) {
        const file = await fetch(data)
            .then((res) => res.blob())
            .then((blob) => new File([blob], "File name", { type: "image/png" }));

        const formData = new FormData();
        formData.append("file", file);

        const response = await Provider.request<Project>("POST", `/file/${id}`, formData, {
            "Content-Type": "multipart/form-data",
        });

        return response;
    }

    async uploadPlan(formData: FormData, projectId: string) {
        return Provider.request<{ success: boolean }>("POST", `/scanAutocadFile/${projectId}`, formData);
    }

    async startAlgorithm(projectId: string) {
        return Provider.request("POST", `/startPlacementAlgo/${projectId}`);
    }

    async saveAlgorithmParameters(projectId: string, parameters: Record<string, unknown>) {
        return Provider.request("PATCH", `/projectParameters/${projectId}`, parameters);
    }
}

export default new Requests();
