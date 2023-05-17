import { Box } from "@mui/material";
import React from "react";

interface View3DProps {
    currentView: string;
}

const View3D: React.FC<View3DProps> = (props: View3DProps) => {
    const { currentView } = props;

    return (
        <Box
            id="optiengine-3d-canvas"
            sx={{
                position: "absolute",
                top: "0",
                left: "0",
                visibility: currentView === "3D" || currentView === "3D_ORTHO" ? "visible" : "hidden",
                width: "100vw",
                height: "100vh",
            }}
        />
    );
};

export default View3D;
