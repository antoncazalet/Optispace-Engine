import { MathUtils, Vector2 } from "three";
import { ImageType } from "../types/image_2d";
import { IntersectionType } from "../types/intersection";
import { TextLabelType } from "../types/text_2d";

export class Utils {
    /** Determines the distance of a point from a line.
     * @param point The Point coordinates as THREE.Vector2
     * @param start The starting coordinates of the line as THREE.Vector2
     * @param end The ending coordinates of the line as THREE.Vector2
     * @returns The distance value (number).
     */
    static pointDistanceFromLine(point: Vector2, start: Vector2, end: Vector2): number {
        const tPoint = Utils.closestPointOnLine(point, start, end);
        const tDx = point.x - tPoint.x;
        const tDy = point.y - tPoint.y;
        return Math.sqrt(tDx * tDx + tDy * tDy);
    }

    /** Gets the projection of a point onto a line.
     * @param point the point
     * @param start the starting coordinates of the line as THREE.Vector2
     * @param end the ending coordinates of the line as THREE.Vector2
     * @returns The point as THREE.Vector2.
     */
    static closestPointOnLine(point: Vector2, start: Vector2, end: Vector2): Vector2 {
        // Inspired by: http://stackoverflow.com/a/6853926
        const tA = point.x - start.x;
        const tB = point.y - start.y;
        const tC = end.x - start.x;
        const tD = end.y - start.y;

        const tDot = tA * tC + tB * tD;
        const tLenSq = tC * tC + tD * tD;
        const tParam = tDot / tLenSq;

        let tXx: number;
        let tYy: number;

        if (tParam < 0 || (start.x === end.x && start.y === end.y)) {
            tXx = start.x;
            tYy = start.y;
        } else if (tParam > 1) {
            tXx = end.x;
            tYy = end.y;
        } else {
            tXx = start.x + tParam * tC;
            tYy = start.y + tParam * tD;
        }

        return new Vector2(tXx, tYy);
    }

    /** Gets the distance of two points.
     * @param start the starting coordinate of the line as Vector2
     * @param end the ending coordinate of the line as Vector2
     * @returns The distance.
     */
    static distance(start: Vector2, end: Vector2): number {
        return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    }

    /**  Gets the angle between point1 -> start and 0,0 -> point2 (-pi to pi)
     * @returns The angle.
     */
    static angle(start: Vector2, end: Vector2): number {
        const tDot = start.x * end.x + start.y * end.y;
        const tDet = start.x * end.y - start.y * end.x;
        const tAngle = -Math.atan2(tDet, tDot);
        return tAngle;
    }

    /** shifts angle to be 0 to 2pi */
    static angle2pi(start: Vector2, end: Vector2): number {
        let tTheta = Utils.angle(start, end);
        if (tTheta < 0) {
            tTheta += 2.0 * Math.PI;
        }
        return tTheta;
    }

    /** shifts angle to be 0 to 2pi */
    static getCyclicOrder(
        points: Vector2[],
        start?: Vector2
    ): { indices: number[]; angles: number[]; points: Vector2[] } {
        if (!start) {
            start = new Vector2(0, 0);
        }
        const angles = [];
        for (const point of points) {
            const vect = point.clone().sub(start);
            const radians = Math.atan2(vect.y, vect.x);
            let degrees = MathUtils.radToDeg(radians);
            degrees = degrees > 0 ? degrees : (degrees + 360) % 360;
            angles.push(degrees);
        }
        const indices = Utils.argsort(angles);
        const sortedAngles: number[] = [];
        const sortedPoints: Vector2[] = [];
        for (const indice of indices) {
            sortedAngles.push(angles[indice]);
            sortedPoints.push(points[indice]);
        }
        return { indices, angles: sortedAngles, points: sortedPoints };
    }

    static argsort(numericalValues: number[], direction = 1): number[] {
        const indices = Array.from(new Array(numericalValues.length), (val, index) => index);
        return indices
            .map((item, index) => [numericalValues[index], item]) // add the clickCount to sort by
            .sort(([count1], [count2]) => (count1 - count2) * direction) // sort by the clickCount data
            .map(([, item]) => item); // extract the sorted items
    }

    /** Checks if an array of points is clockwise.
     * @param points Is array of points with x,y attributes
     * @returns {boolean} True if clockwise.
     */
    static isClockwise(points: Vector2[]): boolean {
        // make positive
        const tSubX = Math.min(
            0,
            Math.min.apply(
                null,
                points.map(function (p) {
                    return p.x;
                })
            )
        );
        const tSubY = Math.min(
            0,
            Math.min.apply(
                null,
                points.map(function (p) {
                    return p.x;
                })
            )
        );

        const tNewPoints: Vector2[] = points.map((p) => {
            return new Vector2(p.x - tSubX, p.y - tSubY);
        });

        // determine CW/CCW, based on:
        // http://stackoverflow.com/questions/1165647
        let tSum = 0;
        for (let tI = 0; tI < tNewPoints.length; tI++) {
            const tC1 = tNewPoints[tI];
            let tC2: Vector2;
            if (tI === tNewPoints.length - 1) {
                tC2 = tNewPoints[0];
            } else {
                tC2 = tNewPoints[tI + 1];
            }
            tSum += (tC2.x - tC1.x) * (tC2.y + tC1.y);
        }
        return tSum >= 0;
    }

    /** Creates a Guide.
     * @returns A new Guide.
     */
    static guide(): string {
        const tS4 = function () {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        };
        return tS4() + tS4() + "-" + tS4() + "-" + tS4() + "-" + tS4() + "-" + tS4() + tS4() + tS4();
    }

    /** both arguments are arrays of corners with x,y attributes */
    static polygonPolygonIntersect(firstCorners: Vector2[], secondCorners: Vector2[]): boolean {
        for (let tI = 0; tI < firstCorners.length; tI++) {
            const tFirstCorner: Vector2 = firstCorners[tI];
            let tSecondCorner: Vector2;
            if (tI === firstCorners.length - 1) {
                tSecondCorner = firstCorners[0];
            } else {
                tSecondCorner = firstCorners[tI + 1];
            }
            if (Utils.linePolygonIntersect(tFirstCorner, tSecondCorner, secondCorners)) {
                return true;
            }
        }
        return false;
    }

    /** Corners is an array of points with x,y attributes */
    static linePolygonIntersect(point: Vector2, point2: Vector2, corners: Vector2[]): boolean {
        for (let tI = 0; tI < corners.length; tI++) {
            const tFirstCorner: Vector2 = corners[tI];
            let tSecondCorner: Vector2;
            if (tI === corners.length - 1) {
                tSecondCorner = corners[0];
            } else {
                tSecondCorner = corners[tI + 1];
            }
            if (Utils.lineLineIntersect(point, point2, tFirstCorner, tSecondCorner)) {
                return true;
            }
        }
        return false;
    }

    /** */
    static lineLineIntersectPoint(aStart: Vector2, aEnd: Vector2, bStart: Vector2, bEnd: Vector2): Vector2 | undefined {
        const result = this.checkIntersection(aStart.x, aStart.y, aEnd.x, aEnd.y, bStart.x, bStart.y, bEnd.x, bEnd.y);
        if (result.type !== IntersectionType.INTERSECTING && result.point) {
            return new Vector2(result.point.x, result.point.y);
        }
        return undefined;
    }

    /** */
    static lineLineIntersect(lineAStart: Vector2, lineAEnd: Vector2, lineBStart: Vector2, lineBEnd: Vector2): boolean {
        function tCCW(p1, p2, p3) {
            const tA = p1.x;
            const tB = p1.y;
            const tC = p2.x;
            const tD = p2.y;
            const tE = p3.x;
            const tF = p3.y;
            return (tF - tB) * (tC - tA) > (tD - tB) * (tE - tA);
        }
        const tP1 = lineAStart;
        const tP2 = lineAEnd;
        const tP3 = lineBStart;
        const tP4 = lineBEnd;
        return tCCW(tP1, tP3, tP4) !== tCCW(tP2, tP3, tP4) && tCCW(tP1, tP2, tP3) !== tCCW(tP1, tP2, tP4);
    }

    /**
     @param corners Is an array of points with x,y attributes
      @param startX X start coord for raycast
      @param startY Y start coord for raycast
     */
    static pointInPolygon2(point: Vector2, polygon: Vector2[]): boolean {
        const x = point.x;
        const y = point.y;
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const intersect =
                ((polygon[i].y <= y && y < polygon[j].y) || (polygon[j].y <= y && y < polygon[i].y)) &&
                x < ((polygon[j].x - polygon[i].x) * (y - polygon[i].y)) / (polygon[j].y - polygon[i].y) + polygon[i].x;
            if (intersect) {
                inside = !inside;
            }
        }
        return inside;
    }

    /**
     @param corners Is an array of points with x,y attributes
      @param startX X start coord for raycast
      @param startY Y start coord for raycast
     */
    static pointInPolygon(point: Vector2, corners: Vector2[], start?: Vector2): boolean {
        start = start || new Vector2(0, 0);
        let startX = start.x || 0;
        let startY = start.y || 0;

        // ensure that point(startX, startY) is outside the polygon consists of corners
        let tMinX = 0;
        let tMinY = 0;
        let tI = 0;

        if (startX === undefined || startY === undefined) {
            for (tI = 0; tI < corners.length; tI++) {
                tMinX = Math.min(tMinX, corners[tI].x);
                tMinY = Math.min(tMinX, corners[tI].y);
            }
            startX = tMinX - 10;
            startY = tMinY - 10;
        }

        let tIntersects = 0;
        for (tI = 0; tI < corners.length; tI++) {
            const tFirstCorner: Vector2 = corners[tI];
            let tSecondCorner: Vector2;
            if (tI === corners.length - 1) {
                tSecondCorner = corners[0];
            } else {
                tSecondCorner = corners[tI + 1];
            }

            if (Utils.lineLineIntersect(start, point, tFirstCorner, tSecondCorner)) {
                tIntersects++;
            }
        }
        // odd intersections means the point is in the polygon
        return tIntersects % 2 === 1;
    }

    /** Checks if all corners of insideCorners are inside the polygon described by outsideCorners */
    static polygonInsidePolygon(insideCorners: Vector2[], outsideCorners: Vector2[], start: Vector2): boolean {
        start.x = start.x || 0;
        start.y = start.y || 0;

        for (const insideCorner of insideCorners) {
            if (!Utils.pointInPolygon(new Vector2(insideCorner.x, insideCorner.y), outsideCorners, start)) {
                return false;
            }
        }
        return true;
    }

    /** Checks if any corners of firstCorners is inside the polygon described by secondCorners */
    static polygonOutsidePolygon(insideCorners: Vector2[], outsideCorners: Vector2[], start: Vector2): boolean {
        start.x = start.x || 0;
        start.y = start.y || 0;

        for (const insideCorner of insideCorners) {
            if (Utils.pointInPolygon(new Vector2(insideCorner.x, insideCorner.y), outsideCorners, start)) {
                return false;
            }
        }
        return true;
    }

    /** Shift the items in an array by shift (positive integer) */
    static cycle(arr: unknown[], shift: number): unknown[] {
        const tReturn = arr.slice(0);
        for (let tI = 0; tI < shift; tI++) {
            const tmp = tReturn.shift();
            tReturn.push(tmp);
        }
        return tReturn;
    }

    /** Remove value from array, if it is present */
    static removeValue(array: unknown[], value: unknown): void {
        for (let tI = array.length - 1; tI >= 0; tI--) {
            if (array[tI] === value) {
                array.splice(tI, 1);
            }
        }
    }

    static checkIfMouseOver(text: TextLabelType, mousePosition: Vector2): boolean {
        const textWidth = text.text.length * text.fontSize;
        const textHeight = text.fontSize * 2;

        let textX = 0;

        if (text.alignType === "left") {
            textX = text.position.x;
        } else if (text.alignType === "center") {
            textX = text.position.x - textWidth / 2;
        } else if (text.alignType === "right") {
            textX = text.position.x - textWidth;
        }

        const textY = text.position.y;

        const textBoundingBox = {
            x: textX,
            y: textY - textHeight,
            width: textWidth + 50,
            height: textHeight + 20,
        };

        if (
            mousePosition.x >= textBoundingBox.x &&
            mousePosition.x <= textBoundingBox.x + textBoundingBox.width &&
            mousePosition.y >= textBoundingBox.y &&
            mousePosition.y <= textBoundingBox.y + textBoundingBox.height
        ) {
            return true;
        }

        return false;
    }

    static checkIfMouseOverImage(image: ImageType, mousePosition: Vector2): boolean {
        const imageBoundingBox = {
            x: image.position.x,
            y: image.position.y,
            width: image.size.width * 2,
            height: image.size.height * 2,
        };

        if (
            mousePosition.x >= imageBoundingBox.x &&
            mousePosition.x <= imageBoundingBox.x + imageBoundingBox.width &&
            mousePosition.y >= imageBoundingBox.y &&
            mousePosition.y <= imageBoundingBox.y + imageBoundingBox.height
        ) {
            return true;
        }

        return false;
    }

    static checkIntersection(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        x3: number,
        y3: number,
        x4: number,
        y4: number
    ): { type: IntersectionType; point?: Vector2 } {
        const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        const numeA = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
        const numeB = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);

        if (denom === 0) {
            if (numeA === 0 && numeB === 0) {
                return { type: IntersectionType.COLINEAR };
            }
            return { type: IntersectionType.PARALLEL };
        }

        const uA = numeA / denom;
        const uB = numeB / denom;

        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
            return {
                type: IntersectionType.INTERSECTING,
                point: new Vector2(x1 + uA * (x2 - x1), y1 + uA * (y2 - y1)),
            };
        }
        return { type: IntersectionType.NONE };
    }
}

export class Region {
    points: Vector2[];
    length: number;
    constructor(points: Vector2[]) {
        this.points = points || [];
        this.length = points.length;
    }

    area(): number {
        let area = 0;
        let i = 0;
        let j = this.length - 1;
        let point1;
        let point2;

        for (; i < this.length; j = i, i += 1) {
            point1 = this.points[i];
            point2 = this.points[j];
            area += point1.x * point2.y;
            area -= point1.y * point2.x;
        }
        area *= 0.5;

        return area;
    }

    centroid(): Vector2 {
        let x = 0;
        let y = 0;
        let f = 0;
        let point1 = new Vector2();
        let point2 = new Vector2();

        for (let i = 0, j = this.length - 1; i < this.length; j = i, i += 1) {
            point1 = this.points[i];
            point2 = this.points[j];
            f = point1.x * point2.y - point2.x * point1.y;
            x += (point1.x + point2.x) * f;
            y += (point1.y + point2.y) * f;
        }

        f = this.area() * 6;

        return new Vector2(x / f, y / f);
    }
}
