export interface ImageType {
    id: string;
    src: string;
    type: "url" | "base64";
    position: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
}
