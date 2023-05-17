export interface TextLabelType {
    id: string;
    text: string;
    alignType: "left" | "center" | "right";
    fontSize: number;
    fontFamily: string;
    fontColor: string;
    fontBgColor: string;
    italic: boolean;
    bold: boolean;
    underline: boolean;
    position: {
        x: number;
        y: number;
    };
}
