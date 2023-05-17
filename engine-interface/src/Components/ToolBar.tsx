import {
    Architecture,
    CameraAlt,
    Chair,
    Close,
    Create,
    EditOff,
    FitScreen,
    FormatListBulleted,
    GridView,
    Groups,
    Image,
    Info,
    OpenWith,
    Queue,
    TextFields,
    ThreeSixty,
    ViewInAr,
    ZoomIn,
    ZoomOut,
} from "@mui/icons-material";
import { Box, Button, Divider, Drawer, IconButton, Popover, Slider, Stack, styled, Tooltip } from "@mui/material";
import { useSnackbar } from "notistack";
import React from "react";
import { match } from "ts-pattern";
import ObjectLists from "../Components/Drawers/ObjectLists";
import { useDialog } from "../Context/DialogProvider";
import { useDrawer } from "../Context/DrawerProvider";
import { useLang } from "../Context/LangProvider";
import * as Optispace from "../Optiengine";
import { ViewType } from "../Types/View";
import { generateScreenshotWithWatermark } from "../Utils/Canvas";
import EngineInfoDialog from "./Dialogs/EngineInfoDialog";
import FurnituresDrawer from "./Drawers/FurnituresDrawer/FurnituresDrawer";
import LogosDrawer from "./Drawers/LogoDrawer/LogoDrawer";
import PutImage from "./Drawers/PutImage";
import WriteText from "./Drawers/WriteText";
import Share from "./Screenshot/Share";
import TeamsEditor from "./TeamsEditor";

type Drawers = "SETTINGS" | "FURNITURES";

interface Props {
    currentView: ViewType;

    engine: Optispace.Optiengine;

    isDisabled: boolean;

    switchTo3D: () => void;
    switchTo2D: () => void;
    switchTo3DOrtho: () => void;
}

const ToolIcon = styled(IconButton)({
    marginRight: "auto",
    marginLeft: "auto",
    display: "flex",
});

const ToolBar: React.FC<Props> = (props: Props) => {
    const { currentView, switchTo3D, switchTo2D, switchTo3DOrtho, isDisabled, engine } = props;

    const { openDialog } = useDialog();
    const { openDrawer, closeDrawer } = useDrawer();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const { translate } = useLang();

    const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

    const [openedDrawer, setOpenedDrawer] = React.useState<Drawers | undefined>(undefined);

    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

    const [zoomValue, setZoomValue] = React.useState<number>(1);

    const openZoomPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const zoomRef = React.useRef(zoomValue);
    const engineRef = React.useRef(engine);

    const handleZoomChange = (newValue: number) => {
        const value: number = Number(newValue);
        if (value < 0.2 || value > 1.5) {
            return;
        }
        Optispace.Configuration.setValue("scale", value);
        Optispace.Configuration.setValue("gridSpacing", Optispace.Dimensioning.cmFromMeasureRaw(value / 1.5));

        engineRef.current.View2D.zoom();
        engineRef.current.View2D.view.draw();
        zoomRef.current = newValue;
        setZoomValue(newValue);
    };

    React.useEffect(() => {
        zoomRef.current = zoomValue;
        engineRef.current = engine;

        document.getElementById("optiengine-2d-canvas")?.addEventListener("wheel", (event) => {
            if (event.deltaY < 0) {
                handleZoomChange(zoomRef.current + 0.05);
            } else if (event.deltaY > 0) {
                handleZoomChange(zoomRef.current - 0.05);
            }
        });
    }, [engine]);

    React.useEffect(() => {
        closeDrawer();

        if (engine && currentView !== "3D") {
            engine.View2D.setMode(Optispace.floorplannerModes.MOVE);
        }
    }, [currentView]);

    const openTeamsDialog = () => {
        openDialog({
            title: "Teams",
            content: <TeamsEditor engine={engine} />,
            maxWidth: "md",
            fullWidth: true,
            hideOk: true,
            cancelText: translate("DIALOG.CLOSE"),
            disableContentPadding: true,
            disableOutsideClick: true,
        });
    };

    const openFurnitureDrawer = () => {
        if (openedDrawer !== "FURNITURES") {
            if (openedDrawer) {
                closeDrawer();
            }
            openDrawer({
                content: <FurnituresDrawer engine={engine} />,
                headerTitle: translate("FURNITURE.FURNITURES"),
                width: "100%",
                anchor: "left",
                onClose: () => {
                    setOpenedDrawer(undefined);
                },
            });
            setOpenedDrawer("FURNITURES");
        } else {
            closeDrawer();
            setOpenedDrawer(undefined);
        }
    };

    const doScreenshot = async () => {
        const canvas = match(currentView)
            .with("2D", () => document.getElementById("optiengine-2d-canvas") as HTMLCanvasElement)
            .with(
                "3D",
                () =>
                    document
                        .getElementById("optiengine-3d-canvas")
                        ?.getElementsByTagName("canvas")[0] as HTMLCanvasElement
            )
            .with(
                "3D_ORTHO",
                () =>
                    document
                        .getElementById("optiengine-3d-canvas")
                        ?.getElementsByTagName("canvas")[0] as HTMLCanvasElement
            )
            .exhaustive();

        const screenshot = canvas.toDataURL("png");
        const screenshotWithWatermark = await generateScreenshotWithWatermark(screenshot);

        if (!screenshotWithWatermark) {
            enqueueSnackbar(translate("SCREENSHOT_TOOL.ACTION_FAILED"), {
                variant: "error",
            });
            return;
        }
        enqueueSnackbar(translate("SCREENSHOT_TOOL.ACTION_SUCCESS"), {
            variant: "success",
            persist: true,
            action: (key) => (
                <>
                    <Button
                        sx={{ mx: 0.5 }}
                        size="small"
                        variant="contained"
                        onClick={() => {
                            const link = document.createElement("a");
                            const date = new Date();

                            link.href = screenshotWithWatermark;
                            link.download = `Optispace-${date.getFullYear()}-${date.getMonth()}-${date.getDay()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.png`;
                            link.click();
                            closeSnackbar(key);
                        }}
                    >
                        {translate("SCREENSHOT_TOOL.DOWNLOAD")}
                    </Button>
                    <Button
                        sx={{ mx: 0.5 }}
                        size="small"
                        variant="contained"
                        onClick={() => {
                            openDialog({
                                title: translate("SCREENSHOT_TOOL.SHARE"),
                                hideOk: true,
                                content: <Share screenshot={screenshotWithWatermark} />,
                                cancelText: translate("DIALOG.CLOSE"),
                            });
                            closeSnackbar(key);
                        }}
                    >
                        {translate("SCREENSHOT_TOOL.SHARE")}
                    </Button>
                    <IconButton size="small" onClick={() => closeSnackbar(key)}>
                        <Close />
                    </IconButton>
                </>
            ),
        });
    };

    return (
        <Drawer
            sx={{
                "& .MuiDrawer-paper": {
                    zIndex: 9,
                    width: "64px",
                    top: "64px",
                    height: "calc(100% - 64px)",
                    boxShadow: 1,
                },
            }}
            variant="permanent"
            anchor={"left"}
            open={true}
        >
            <Box>
                <ToolIcon color={currentView === "2D" ? "primary" : "default"} onClick={switchTo2D}>
                    <Tooltip title={translate("2D_VIEW")} placement="right">
                        <Architecture sx={{ fontSize: 28 }} />
                    </Tooltip>
                </ToolIcon>
                <ToolIcon color={currentView === "3D" ? "primary" : "default"} onClick={switchTo3D}>
                    <Tooltip title={translate("3D_VIEW")} placement="right">
                        <ViewInAr sx={{ fontSize: 28 }} />
                    </Tooltip>
                </ToolIcon>
                <ToolIcon color={currentView === "3D_ORTHO" ? "primary" : "default"} onClick={switchTo3DOrtho}>
                    <Tooltip title={translate("3D_ORTHO")} placement="right">
                        <GridView sx={{ fontSize: 28 }} />
                    </Tooltip>
                </ToolIcon>
                <Divider />
                <ToolIcon
                    color={engine?.View2D.mode === Optispace.floorplannerModes.MOVE ? "primary" : "default"}
                    onClick={() => engine.View2D.setMode(Optispace.floorplannerModes.MOVE)}
                    disabled={currentView !== "2D" && engine !== undefined}
                >
                    <Tooltip title={translate("FREE_ROAM_MODE")} placement="right">
                        <OpenWith sx={{ fontSize: 28 }} />
                    </Tooltip>
                </ToolIcon>
                <ToolIcon
                    color={engine?.View2D.mode === Optispace.floorplannerModes.DRAW ? "primary" : "default"}
                    onClick={() => engine.View2D.setMode(Optispace.floorplannerModes.DRAW)}
                    disabled={currentView !== "2D" && engine !== undefined}
                >
                    <Tooltip title={translate("DRAW_WALL_MODE")} placement="right">
                        <Create sx={{ fontSize: 28 }} />
                    </Tooltip>
                </ToolIcon>
                <ToolIcon
                    color={engine?.View2D.mode === Optispace.floorplannerModes.DELETE ? "primary" : "default"}
                    onClick={() => engine.View2D.setMode(Optispace.floorplannerModes.DELETE)}
                    disabled={currentView !== "2D" && engine !== undefined}
                >
                    <Tooltip title={translate("DELETE_WALL_MODE")} placement="right">
                        <EditOff sx={{ fontSize: 28 }} />
                    </Tooltip>
                </ToolIcon>
                <ToolIcon
                    color="default"
                    onClick={() =>
                        openDrawer({
                            headerTitle: translate("ADD_TEXT"),
                            content: <WriteText engine={engine} />,
                            width: 460,
                        })
                    }
                    disabled={currentView !== "2D" && engine !== undefined}
                >
                    <Tooltip title={translate("ADD_TEXT")} placement="right">
                        <TextFields sx={{ fontSize: 28 }} />
                    </Tooltip>
                </ToolIcon>
                <ToolIcon
                    color="default"
                    onClick={() =>
                        openDrawer({
                            headerTitle: translate("ADD_IMAGE"),
                            content: <PutImage engine={engine} />,
                            width: 460,
                        })
                    }
                    disabled={currentView !== "2D" && engine !== undefined}
                >
                    <Tooltip title={translate("ADD_IMAGE")} placement="right">
                        <Image sx={{ fontSize: 28 }} />
                    </Tooltip>
                </ToolIcon>
                <ToolIcon
                    color="default"
                    onClick={() => {
                        openDrawer({
                            content: <LogosDrawer engine={engine} close={closeDrawer} />,
                            headerTitle: translate("ADD_LOGO"),
                            width: "100%",
                            anchor: "left",
                            onClose: () => {
                                setOpenedDrawer(undefined);
                            },
                        });
                    }}
                    disabled={currentView !== "2D" && engine !== undefined}
                >
                    <Tooltip title={translate("ADD_LOGO")} placement="right">
                        <Queue sx={{ fontSize: 28 }} />
                    </Tooltip>
                </ToolIcon>
                <Divider />
                <ToolIcon
                    color={engine?.View3D.controller.getTransformMode() === "translate" ? "primary" : "default"}
                    onClick={() => {
                        engine.View3D.controller.setTransformMode("translate");
                        forceUpdate();
                    }}
                    disabled={currentView === "2D" && engine !== undefined}
                >
                    <Tooltip title={translate("TOOLBAR_3D.TRANSLATE_MODE")} placement="right">
                        <OpenWith sx={{ fontSize: 28 }} />
                    </Tooltip>
                </ToolIcon>
                <ToolIcon
                    color={engine?.View3D.controller.getTransformMode() === "rotate" ? "primary" : "default"}
                    onClick={() => {
                        engine.View3D.controller.setTransformMode("rotate");
                        forceUpdate();
                    }}
                    disabled={currentView === "2D" && engine !== undefined}
                >
                    <Tooltip title={translate("TOOLBAR_3D.ROTATE_MODE")} placement="right">
                        <ThreeSixty sx={{ fontSize: 28 }} />
                    </Tooltip>
                </ToolIcon>
                <ToolIcon
                    color={engine?.View3D.controller.getTransformMode() === "scale" ? "primary" : "default"}
                    onClick={() => {
                        engine.View3D.controller.setTransformMode("scale");
                        forceUpdate();
                    }}
                    disabled={currentView === "2D" && engine !== undefined}
                >
                    <Tooltip title={translate("TOOLBAR_3D.SCALE_MODE")} placement="right">
                        <FitScreen sx={{ fontSize: 28 }} />
                    </Tooltip>
                </ToolIcon>
                <Divider />
                <ToolIcon onClick={openZoomPopover}>
                    <Tooltip title={translate("ZOOM")} placement="right">
                        <ZoomIn sx={{ fontSize: 28 }} />
                    </Tooltip>
                </ToolIcon>
                <Divider />
                <Popover
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: "center",
                        horizontal: "right",
                    }}
                    transformOrigin={{
                        vertical: "center",
                        horizontal: "left",
                    }}
                    PaperProps={{
                        style: {
                            transform: "translateX(15px) translateY(0px)",
                        },
                    }}
                >
                    <Box sx={{ width: 200, px: 2 }}>
                        <Stack spacing={0} direction="row" sx={{ my: 1 }} alignItems="center">
                            <IconButton
                                sx={{ p: 0.5 }}
                                onClick={() => {
                                    if (currentView === "2D") {
                                        handleZoomChange(zoomValue - 0.01);
                                    } else {
                                        engine.View3D.zoomOut();
                                    }
                                }}
                            >
                                <ZoomOut />
                            </IconButton>
                            <Slider
                                max={1.5}
                                step={0.01}
                                min={0.2}
                                value={zoomValue}
                                onChange={(_, newValue) => handleZoomChange(newValue as number)}
                                aria-label="Zoom"
                                size="small"
                                disabled={currentView !== "2D"}
                            />
                            <IconButton
                                sx={{ p: 0.5 }}
                                onClick={() => {
                                    if (currentView === "2D") {
                                        handleZoomChange(zoomValue + 0.01);
                                    } else {
                                        engine.View3D.zoomIn();
                                    }
                                }}
                            >
                                <ZoomIn />
                            </IconButton>
                        </Stack>
                    </Box>
                </Popover>
                <ToolIcon onClick={openFurnitureDrawer} disabled={currentView === "2D"}>
                    <Tooltip title={translate("FURNITURE.ADD")} placement="right">
                        <Chair sx={{ fontSize: 28 }} />
                    </Tooltip>
                </ToolIcon>
                <ToolIcon
                    color="default"
                    onClick={() => {
                        openDrawer({
                            content: <ObjectLists engine={engine} />,
                            headerTitle: translate("OBJECTS_LISTS.HEADER"),
                            width: 460,
                            onClose: () => {
                                setOpenedDrawer(undefined);
                            },
                        });
                    }}
                >
                    <Tooltip title={translate("OBJECTS_LISTS.HEADER")} placement="right">
                        <FormatListBulleted sx={{ fontSize: 28 }} />
                    </Tooltip>
                </ToolIcon>
                <ToolIcon onClick={openTeamsDialog}>
                    <Tooltip title={"Teams"} placement="right">
                        <Groups sx={{ fontSize: 28 }} />
                    </Tooltip>
                </ToolIcon>
                <ToolIcon onClick={doScreenshot}>
                    <Tooltip title={translate("SCREENSHOT")} placement="right">
                        <CameraAlt sx={{ fontSize: 28 }} />
                    </Tooltip>
                </ToolIcon>
            </Box>
            <Box sx={{ flex: "1 1 auto" }} />
            <Divider />
            <ToolIcon
                onClick={() =>
                    openDialog({
                        fullScreen: false,
                        fullWidth: true,
                        maxWidth: "xs",
                        cancelText: translate("DIALOG.CLOSE"),
                        hideCancel: false,
                        hideOk: true,
                        content: <EngineInfoDialog engine={engine} />,
                        disableContentPadding: false,
                    })
                }
            >
                <Tooltip title={translate("ABOUT")} placement="right">
                    <Info sx={{ fontSize: 28 }} />
                </Tooltip>
            </ToolIcon>
        </Drawer>
    );
};

export default ToolBar;
