import React from "react";

interface Props {
    src: string;

    height?: string;
}

const GLTFPreviewNoControls = ({ src, height }: Props) => {
    return (
        <model-viewer
            src={src}
            environment-image="neutral"
            shadow-intensity="1"
            autoplay
            style={{ width: "auto", height: height ?? "", backgroundColor: "#999999" }}
        />
    );
};

export default GLTFPreviewNoControls;
