import { Box } from "@mui/material";
import React from "react";

interface View2DProps {
    currentView: string;
    mode?: number;
}

const ModeType: Record<number, string> = {
    0: "default",
    1: "url('/assets/cursor/edit.svg') 7 40, pointer",
    2: "default",
};

const View2D: React.FC<View2DProps> = (props: View2DProps) => {
    const { currentView } = props;

    const cursor: string = props.mode !== undefined ? ModeType[props.mode] : "default";

    return (
        <Box
            id="floorplanner"
            sx={{
                position: "absolute",
                top: "0",
                left: "0",
                visibility: currentView === "2D" ? "visible" : "hidden",
                cursor,
            }}
        >
            <canvas id="optiengine-2d-canvas" />
        </Box>
    );
};

export default View2D;
