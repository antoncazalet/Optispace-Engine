import { EventDispatcher, Vector2 } from "three";
import Corner from "../model/corner";
import Floorplan from "../model/floorplan";
import HalfEdge from "../model/half_edge";
import Room from "../model/room";
import Wall from "../model/wall";
import { ImageType } from "../types/image_2d";
import { Configuration, gridSpacing, wallInformation } from "../utils/configuration";
import { Dimensioning } from "../utils/dimensioning";
import { View2D } from "./view_2d";

export const floorplannerModes = { MOVE: 0, DRAW: 1, DELETE: 2 };
export const gridWidth = 1;
export const gridColor = "#f1f1f1";
export const wallWidth = 10;
export const wallColor = "#7f8c8d";
export const wallColorHover = "#008cba";
export const wallColorSelected = "#006d91";
export const deleteColor = "#ff0000";
export const cornerRadius = 6;
export const cornerColor = "#cccccc";
export const cornerColorHover = "#008cba";
export const cornerColorSelected = "#00ba8c";

const Tags = {
    red: "#FF625B",
    orange: "#FFB021",
    yellow: "#FFEE26",
    green: "#37FB56",
    blue: "#28A3FF",
    purple: "#E37EFF",
    gray: "#9EA0AA",
};

export class CanvasController extends EventDispatcher {
    canvas: string;
    canvasElement: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    floorplan: Floorplan;
    viewmodel: View2D;

    images: {
        image: HTMLImageElement;
        imgFrom: ImageType;
    }[];

    constructor(floorplan: Floorplan, viewmodel: View2D, canvas: string) {
        super();
        this.canvas = canvas;
        this.canvasElement = document.getElementById(canvas) as HTMLCanvasElement;
        this.context = this.canvasElement.getContext("2d");
        this.floorplan = floorplan;
        this.viewmodel = viewmodel;
        this.images = [];

        window.addEventListener("resize", () => this.handleWindowResize());
        window.addEventListener("orientationchange", () => this.handleWindowResize());
        this.canvasElement.addEventListener("contextmenu", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
        });
        this.handleWindowResize();
    }

    addImage(image: ImageType): void {
        const img = new Image();
        img.src = image.src;

        this.images.push({ image: img, imgFrom: image });
    }

    deleteImage(id: string): void {
        const index = this.images.findIndex((img) => img.imgFrom.id === id);
        if (index !== -1) {
            this.images.splice(index, 1);
        }
    }

    deleteAllImages(): void {
        this.images = [];
    }

    updateImage(id: string, image: ImageType): void {
        const index = this.images.findIndex((img) => img.imgFrom.id === id);

        if (index !== -1) {
            this.images[index].imgFrom = image;
        }
    }

    handleWindowResize(): void {
        const canvas = document.querySelector<HTMLElement>(`#${this.canvas}`);
        const parentElement = canvas.parentElement;

        const w = window.innerWidth;
        const h = window.innerHeight;

        parentElement.style.width = `${w}`;
        parentElement.style.height = `${h}`;

        this.canvasElement.height = h;
        this.canvasElement.width = w;

        this.draw();
    }

    async draw(): Promise<void> {
        this.context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.context.rect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.context.fillStyle = "#ffffff";
        this.context.fill();

        this.drawGrid();

        for (const img of this.images) {
            // eslint-disable-next-line no-underscore-dangle
            const hover = this.viewmodel._hoverImage?.id === img.imgFrom.id;
            const scale = Configuration.getValue("scale");

            if (hover) {
                this.context.globalAlpha = 0.5;

                this.context.beginPath();
                this.context.rect(
                    this.viewmodel.convertX(img.imgFrom.position.x),
                    this.viewmodel.convertY(img.imgFrom.position.y),
                    img.imgFrom.size.width * scale,
                    img.imgFrom.size.height * scale
                );
                this.context.lineWidth = 2;
                this.context.strokeStyle = "#000000";
                this.context.stroke();
            }

            this.context.drawImage(
                img.image,
                this.viewmodel.convertX(img.imgFrom.position.x),
                this.viewmodel.convertY(img.imgFrom.position.y),
                img.imgFrom.size.width * scale,
                img.imgFrom.size.height * scale
            );

            this.context.globalAlpha = 1;
        }

        this.floorplan.getRooms().forEach((room) => {
            this.drawRoom(room);
        });

        this.floorplan.getWalls().forEach((wall) => {
            this.drawWall(wall);
        });

        this.floorplan.getCorners().forEach((corner) => {
            this.drawCorner(corner);
        });

        if (this.viewmodel.mode === floorplannerModes.DRAW) {
            this.drawTarget(this.viewmodel.targetX, this.viewmodel.targetY, this.viewmodel.lastNode);

            if (this.viewmodel.lastNode !== null && this.viewmodel.lastNode !== undefined) {
                const a = new Vector2(this.viewmodel.lastNode.x, this.viewmodel.lastNode.y);
                const b = new Vector2(this.viewmodel.targetX, this.viewmodel.targetY);
                const abvector = b.clone().sub(a);
                const midPoint = abvector.multiplyScalar(0.5).add(a);
                this.drawTextLabel(
                    Dimensioning.cmToMeasure(a.distanceTo(b)),
                    this.viewmodel.convertX(midPoint.x),
                    this.viewmodel.convertY(midPoint.y)
                );

                const vector = b.clone().sub(a);
                let sAngle = (vector.angle() * 180) / Math.PI;
                const result = this.viewmodel.lastNode.closestAngle(sAngle);
                let eAngle = result.angle;
                const closestVector = result.point.sub(a);

                const textDistance = 60;
                const radius = Math.min(textDistance, vector.length());
                const location = vector.normalize().add(closestVector.normalize()).multiplyScalar(textDistance).add(a);

                const ox = this.viewmodel.convertX(this.viewmodel.lastNode.x);
                const oy = this.viewmodel.convertY(this.viewmodel.lastNode.y);
                let angle = Math.abs(eAngle - sAngle);
                angle = angle > 180 ? 360 - angle : angle;
                angle = Math.round(angle * 10) / 10;

                sAngle = (sAngle * Math.PI) / 180;
                eAngle = (eAngle * Math.PI) / 180;

                this.context.strokeStyle = "#34495e";
                this.context.lineWidth = 4;
                this.context.beginPath();
                this.context.arc(ox, oy, radius * 0.5, Math.min(sAngle, eAngle), Math.max(sAngle, eAngle), false);
                this.context.stroke();
                this.drawTextLabel(
                    `${angle}°`,
                    this.viewmodel.convertX(location.x),
                    this.viewmodel.convertY(location.y)
                );
            }
        }
        this.floorplan.getWalls().forEach((wall) => {
            this.drawWallLabels(wall);

            if (Configuration.getValue("debugMode")) {
                this.drawTextLabel(
                    `Corner: ${wall.start.uuid}`,
                    this.viewmodel.convertX(wall.start.x),
                    this.viewmodel.convertY(wall.start.y)
                );
                this.drawTextLabel(
                    `Corner: ${wall.end.uuid}`,
                    this.viewmodel.convertX(wall.end.x),
                    this.viewmodel.convertY(wall.end.y)
                );
            }
        });

        for (const text of this.floorplan.labels2DView) {
            // eslint-disable-next-line no-underscore-dangle
            const hover = this.viewmodel._hoverText === text;
            let color = text.fontColor;

            if (hover) {
                color = "red";
            }

            this.context.fillStyle = color;
            this.context.font = `${text.bold ? "bold" : ""} ${text.italic ? "italic" : ""} ${text.fontSize}px ${
                text.fontFamily
            }`;
            this.context.textAlign = text.alignType;

            if (text.fontBgColor && text.fontBgColor !== "transparant") {
                const textWidth = this.context.measureText(text.text).width;
                this.context.fillStyle = text.fontBgColor;

                if (text.alignType === "center") {
                    this.context.fillRect(
                        this.viewmodel.convertX(text.position.x) - textWidth / 2,
                        this.viewmodel.convertY(text.position.y) - text.fontSize / 2 - 5,
                        textWidth,
                        text.fontSize + 5
                    );
                } else if (text.alignType === "left") {
                    this.context.fillRect(
                        this.viewmodel.convertX(text.position.x),
                        this.viewmodel.convertY(text.position.y) - text.fontSize / 2 - 5,
                        textWidth,
                        text.fontSize + 5
                    );
                } else if (text.alignType === "right") {
                    this.context.fillRect(
                        this.viewmodel.convertX(text.position.x) - textWidth,
                        this.viewmodel.convertY(text.position.y) - text.fontSize / 2 - 5,
                        textWidth,
                        text.fontSize + 5
                    );
                }
            }

            this.context.fillStyle = color;
            this.context.fillText(
                text.text,
                this.viewmodel.convertX(text.position.x),
                this.viewmodel.convertY(text.position.y)
            );

            if (text.underline) {
                const textWidth = this.context.measureText(text.text).width;
                this.context.strokeStyle = color;
                this.context.lineWidth = 2;
                this.context.beginPath();
                const x = this.viewmodel.convertX(text.position.x);

                if (text.alignType === "center") {
                    this.context.moveTo(x - textWidth / 2, this.viewmodel.convertY(text.position.y) + 5);
                    this.context.lineTo(x + textWidth / 2, this.viewmodel.convertY(text.position.y) + 5);
                } else if (text.alignType === "right") {
                    this.context.moveTo(x - textWidth, this.viewmodel.convertY(text.position.y) + 5);
                    this.context.lineTo(x, this.viewmodel.convertY(text.position.y) + 5);
                } else {
                    this.context.moveTo(x, this.viewmodel.convertY(text.position.y) + 5);
                    this.context.lineTo(x + textWidth, this.viewmodel.convertY(text.position.y) + 5);
                }
                this.context.stroke();
            }
        }
    }

    zoom(): void {
        const originx = parseInt(window.getComputedStyle(this.viewmodel.canvasElement).width, 10) / 2.0;
        const originy = parseInt(window.getComputedStyle(this.viewmodel.canvasElement).height, 10) / 2.0;

        if (Configuration.getValue("scale") !== 1) {
            this.context.setTransform(1, 0, 0, 1, 0, 0);
            this.context.translate(originx, originy);
            this.context.scale(Configuration.getValue("scale"), Configuration.getValue("scale"));
            this.context.translate(-originx, -originy);
        } else {
            this.context.setTransform(1, 0, 0, 1, 0, 0);
        }
        this.draw();
    }

    drawCornerAngles(corner: Corner): void {
        const ox = this.viewmodel.convertX(corner.location.x);
        const oy = this.viewmodel.convertY(corner.location.y);
        const offsetRatio = 2.0;

        for (let i = 0; i < corner.angles.length; i++) {
            const direction = corner.angleDirections[i];
            const location = direction.clone().add(corner.location);
            const sAngle = (corner.startAngles[i] * Math.PI) / 180;
            const eAngle = (corner.endAngles[i] * Math.PI) / 180;
            const angle = corner.angles[i];
            const lx = this.viewmodel.convertX(location.x);
            const ly = this.viewmodel.convertY(location.y);
            const radius = direction.length() * offsetRatio * 0.5;

            if (angle > 130 || angle === 0) {
                continue;
            }
            const ccwise = Math.abs(corner.startAngles[i] - corner.endAngles[i]) > 180;

            this.context.strokeStyle = "#000000";
            this.context.lineWidth = 4;
            this.context.beginPath();
            this.context.arc(ox, oy, radius, Math.min(sAngle, eAngle), Math.max(sAngle, eAngle), ccwise);
            this.context.stroke();

            this.drawTextLabel(`${angle}°`, lx, ly);
        }
    }

    drawWallLabels(wall: Wall): void {
        if (wall.backEdge && wall.frontEdge) {
            if (wall.backEdge.interiorDistance() < wall.frontEdge.interiorDistance()) {
                this.drawEdgeLabel(wall.backEdge);
                this.drawEdgeLabelExterior(wall.backEdge);
            } else {
                this.drawEdgeLabel(wall.frontEdge);
                this.drawEdgeLabelExterior(wall.frontEdge);
            }
        } else if (wall.backEdge) {
            this.drawEdgeLabel(wall.backEdge);
            this.drawEdgeLabelExterior(wall.backEdge);
        } else if (wall.frontEdge) {
            this.drawEdgeLabel(wall.frontEdge);
            this.drawEdgeLabelExterior(wall.frontEdge);
        }
        this.drawWallLabelsMiddle(wall);
    }

    drawWallLabelsMiddle(wall: Wall): void {
        if (!wallInformation.midline) {
            return;
        }
        const pos = wall.wallCenter();
        const length = wall.wallLength();
        if (length < 60) {
            return;
        }
        const label = !wallInformation.labels ? "" : wallInformation.midlinelabel;
        this.drawTextLabel(
            `${label}${Dimensioning.cmToMeasure(length)}`,
            this.viewmodel.convertX(pos.x),
            this.viewmodel.convertY(pos.y)
        );
    }

    drawEdgeLabelExterior(edge: HalfEdge): void {
        const pos = edge.exteriorCenter();
        const length = edge.exteriorDistance();
        if (length < 60) {
            return;
        }
        if (wallInformation.exterior) {
            const label = !wallInformation.labels ? "" : wallInformation.exteriorlabel;
            this.drawTextLabel(
                `${label}${Dimensioning.cmToMeasure(length)}`,
                this.viewmodel.convertX(pos.x),
                this.viewmodel.convertY(pos.y + 40)
            );
        }
    }

    drawEdgeLabel(edge: HalfEdge): void {
        const pos = edge.interiorCenter();
        const length = edge.interiorDistance();
        if (length < 60) {
            return;
        }
        if (wallInformation.interior) {
            const label = !wallInformation.labels ? "" : wallInformation.interiorlabel;
            this.drawTextLabel(
                `${label}${Dimensioning.cmToMeasure(length)}`,
                this.viewmodel.convertX(pos.x),
                this.viewmodel.convertY(pos.y - 40)
            );
        }
    }

    drawTextLabel(
        label: string,
        x: number,
        y: number,
        textcolor = "#000000",
        strokecolor = "#ffffff",
        style = "normal",
        fontSize = 12
    ): void {
        this.context.font = `${style} ${fontSize}px Arial`;
        this.context.fillStyle = textcolor;
        this.context.textAlign = "center";
        this.context.lineWidth = 4;
        this.context.strokeStyle = strokecolor;
        this.context.strokeText(label, x, y);
        this.context.fillText(label, x, y);
    }

    drawWall(wall: Wall): void {
        const selected = wall === this.viewmodel.selectedWall;
        let hover = wall === this.viewmodel.activeWall && wall !== this.viewmodel.selectedWall;

        // eslint-disable-next-line no-underscore-dangle
        const wallsInHoveredRoom = this.viewmodel?._hoverRoom?.getAllWallsRelatedToARoom();

        if (wallsInHoveredRoom?.includes(wall)) {
            hover = true;
        }

        let color = wallColor;

        if (hover && this.viewmodel.mode === floorplannerModes.DELETE) {
            color = deleteColor;
        } else if (hover) {
            color = wallColorHover;
        } else if (selected) {
            color = wallColorSelected;
        }

        this.drawLine(
            this.viewmodel.convertX(wall.getStartX()),
            this.viewmodel.convertY(wall.getStartY()),
            this.viewmodel.convertX(wall.getEndX()),
            this.viewmodel.convertY(wall.getEndY()),
            wallWidth,
            color
        );

        if (selected) {
            this.drawCornerAngles(wall.start);
            this.drawCornerAngles(wall.end);
        }
    }

    drawRoom(room: Room): void {
        this.drawTextLabel(
            Dimensioning.cmToMeasure(room.area, 2) + String.fromCharCode(178),
            this.viewmodel.convertX(room.areaCenter.x),
            this.viewmodel.convertY(room.areaCenter.y),
            "#2C3E50",
            "#FFFFFF",
            "bold"
        );
        this.drawTextLabel(
            room.name,
            this.viewmodel.convertX(room.areaCenter.x),
            this.viewmodel.convertY(room.areaCenter.y + 40),
            "#000000",
            "#FFFFFF",
            "bold"
        );
        if (room.colorTags) {
            for (let i = 0; i < room.colorTags.length; i++) {
                this.drawCircle(
                    this.viewmodel.convertX(room.areaCenter.x + 40 * (i - 1)),
                    this.viewmodel.convertY(room.areaCenter.y + 70),
                    7,
                    Tags[room.colorTags[i]]
                );
            }
        }
    }

    drawCorner(corner: Corner): void {
        const cornerX = this.viewmodel.convertX(corner.x);
        const cornerY = this.viewmodel.convertY(corner.y);
        const hover = corner === this.viewmodel.activeCorner && corner !== this.viewmodel.selectedCorner;
        const selected = corner === this.viewmodel.selectedCorner;
        let color = cornerColor;

        if (hover && this.viewmodel.mode === floorplannerModes.DELETE) {
            color = deleteColor;
        } else if (
            hover &&
            (this.viewmodel.mode === floorplannerModes.MOVE || this.viewmodel.mode === floorplannerModes.DRAW)
        ) {
            color = cornerColorHover;
        } else if (selected) {
            color = cornerColorSelected;
        }

        if (selected) {
            this.drawCornerAngles(corner);
            corner.adjacentCorners().forEach((neighbour) => {
                this.drawCornerAngles(neighbour);
            });
        }

        this.drawCircle(cornerX, cornerY, cornerRadius, color);
    }

    drawTarget(x: number, y: number, lastNode: Corner): void {
        if (lastNode) {
            this.drawLine(
                this.viewmodel.convertX(lastNode.x),
                this.viewmodel.convertY(lastNode.y),
                this.viewmodel.convertX(x),
                this.viewmodel.convertY(y),
                wallWidth,
                wallColorHover
            );
        }
    }

    drawLine(startX: number, startY: number, endX: number, endY: number, width: number, color: string): void {
        this.context.beginPath();
        this.context.moveTo(startX, startY);
        this.context.lineTo(endX, endY);
        this.context.closePath();
        this.context.lineWidth = width;
        this.context.strokeStyle = color;
        this.context.stroke();
    }

    drawPolygon(
        xArr: number[],
        yArr: number[],
        fill = false,
        fillColor: string,
        stroke = false,
        strokeColor: string,
        strokeWidth: number
    ): void {
        this.context.beginPath();
        this.context.moveTo(xArr[0], yArr[0]);

        for (let i = 1; i < xArr.length; i++) {
            this.context.lineTo(xArr[i], yArr[i]);
        }

        this.context.closePath();

        if (fill) {
            this.context.fillStyle = fillColor;
            this.context.fill();
        }

        if (stroke) {
            this.context.lineWidth = strokeWidth;
            this.context.strokeStyle = strokeColor;
            this.context.stroke();
        }
    }

    drawCircle(centerX: number, centerY: number, radius: number, fillColor: string): void {
        this.context.beginPath();
        this.context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        this.context.closePath();
        this.context.fillStyle = fillColor;
        this.context.fill();
    }

    calculateGridOffset(n: number): number {
        const gspacing = Dimensioning.cmToPixel(Configuration.getValue(gridSpacing));
        if (n >= 0) {
            return ((n + gspacing / 2.0) % gspacing) - gspacing / 2.0;
        } else {
            return ((n - gspacing / 2.0) % gspacing) + gspacing / 2.0;
        }
    }

    drawGrid(): void {
        const gspacing = Dimensioning.cmToPixel(Configuration.getValue(gridSpacing));
        const offsetX = this.calculateGridOffset(-this.viewmodel.originX);
        const offsetY = this.calculateGridOffset(-this.viewmodel.originY);

        let width = this.canvasElement.width;
        let height = this.canvasElement.height;
        const scale = Configuration.getValue("scale");

        if (scale < 1.0) {
            width = width / scale;
            height = height / scale;
        }

        for (let x = 0; x <= width / gspacing; x++) {
            this.drawLine(gspacing * x + offsetX, 0, gspacing * x + offsetX, height, gridWidth, gridColor);
        }
        for (let y = 0; y <= height / gspacing; y++) {
            this.drawLine(0, gspacing * y + offsetY, width, gspacing * y + offsetY, gridWidth, gridColor);
        }
    }
}
