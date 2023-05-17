import React from "react";

interface Props {
    src: string;

    height?: string;
}

const GLTFPreview = ({ src, height }: Props) => {
    return (
        <model-viewer
            src={src}
            bounds="tight"
            camera-controls
            environment-image="neutral"
            shadow-intensity="1"
            shadow-softness="0"
            auto-rotate
            autoplay
            style={{ width: "auto", height: height ?? "", backgroundColor: "#999999" }}
        />
    );
};

export default GLTFPreview;
