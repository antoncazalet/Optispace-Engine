import { ArrowBack, ArrowDownward, ArrowForward, ArrowUpward } from "@mui/icons-material";
import { Box, Button, Card, Grid, IconButton, TextField, Typography } from "@mui/material";
import { Container } from "@mui/system";
import { useSnackbar } from "notistack";
import React from "react";
import { useLang } from "../../Context/LangProvider";
import * as Optispace from "../../Optiengine";
import { loadImage } from "../../Utils/Canvas";

interface PutImageProps {
    engine: Optispace.Optiengine;
    imageEdit?: Optispace.ImageType;

    closeDrawer?: () => void;
}

export const PutImage: React.FC<PutImageProps> = (props: PutImageProps) => {
    const { engine, imageEdit, closeDrawer } = props;

    const { enqueueSnackbar } = useSnackbar();
    const { translate } = useLang();

    const [currentImage, setCurrentImage] = React.useState<string | undefined>(undefined);
    const [size, setSize] = React.useState<{ width: string; height: string }>({ width: "0", height: "0" });

    const [position, _setPosition] = React.useState<{ x: string; y: string }>({ x: "0", y: "0" });

    const positionRef = React.useRef(position);
    const setPosition = (pos: { x: string; y: string }) => {
        positionRef.current = pos;
        _setPosition(pos);
    };

    const [hold, _setHold] = React.useState<(() => void) | undefined>(undefined);
    const holdRef = React.useRef<typeof hold>(hold);

    const setHold = (data: (() => void) | undefined) => {
        holdRef.current = data;
        _setHold(data);
    };

    const addImage = async () => {
        if (!currentImage) {
            return;
        }

        const img = await loadImage(currentImage);

        const options = {
            src: currentImage,
            type: "base64" as "base64",
            size: {
                width: img.width,
                height: img.height,
            },
        };

        engine.View2D.addImage(options);

        enqueueSnackbar(translate("IMAGE_PANEL.MESSAGES.ADD_SUCCESS"), { variant: "success" });
    };

    const updateImage = (disableSnack?: boolean) => {
        if (!imageEdit) {
            return;
        }
        const options = {
            id: imageEdit.id,
            src: currentImage!,
            type: "base64" as "base64",
            size: {
                width: parseFloat(size.width),
                height: parseFloat(size.height),
            },
            position: {
                x: parseFloat(positionRef.current.x),
                y: parseFloat(positionRef.current.y),
            },
        };

        engine.View2D.updateImage(imageEdit.id, options);

        if (!disableSnack) {
            enqueueSnackbar(translate("IMAGE_PANEL.MESSAGES.UPDATE_SUCCESS"), { variant: "success" });
        }
    };

    const deleteImage = () => {
        if (!imageEdit) {
            return;
        }
        engine.View2D.deleteImage(imageEdit.id);
        enqueueSnackbar(translate("IMAGE_PANEL.MESSAGES.DELETE_SUCCESS"), { variant: "success" });
        if (closeDrawer) {
            closeDrawer();
        }
    };

    const uploadFile = (file: File) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.addEventListener("load", () => {
            const base64 = reader.result;

            setCurrentImage(base64 as string);
        });
    };

    const release = () => {
        setHold(undefined);
    };

    const holdMouse = (func: () => void) => {
        setHold(func);
    };

    React.useEffect(() => {
        const timeout = setInterval(() => {
            if (holdRef.current) {
                holdRef.current();
            }
        }, 1);

        return () => {
            clearInterval(timeout);
        };
    }, [hold]);

    const directions = {
        goDown: () => {
            setPosition({ ...positionRef.current, y: (parseFloat(positionRef.current.y) + 5).toString() });
            updateImage(true);
        },
        goUp: () => {
            setPosition({ ...positionRef.current, y: (parseFloat(positionRef.current.y) - 5).toString() });
            updateImage(true);
        },
        goLeft: () => {
            setPosition({ ...positionRef.current, x: (parseFloat(positionRef.current.x) - 5).toString() });
            updateImage(true);
        },
        goRight: () => {
            setPosition({ ...positionRef.current, x: (parseFloat(positionRef.current.x) + 5).toString() });
            updateImage(true);
        },
    };

    React.useEffect(() => {
        if (imageEdit) {
            setCurrentImage(imageEdit.src);
            setSize({ width: imageEdit.size.width.toString(), height: imageEdit.size.height.toString() });
            setPosition({ x: imageEdit.position.x.toString(), y: imageEdit.position.y.toString() });
        }
    }, [imageEdit]);

    const isEditMode = imageEdit !== undefined;

    return (
        <Container sx={{ pt: 2 }}>
            <Grid container justifyContent="center" alignItems="center" spacing={2}>
                {!isEditMode && (
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                width: "100%",
                                height: "100%",
                                border: "1px dashed rgb(45, 55, 72)",
                                alignItems: "center",
                                display: "flex",
                                justifyContent: "center",
                            }}
                            tabIndex={0}
                            component={Button}
                            onClick={() => {
                                const input = document.getElementById("file-input");
                                if (input) {
                                    input.click();
                                }
                            }}
                        >
                            <Box component="span">
                                <input
                                    type="file"
                                    hidden
                                    id="file-input"
                                    onChange={(event) =>
                                        event.target.files !== null ? uploadFile(event.target.files[0]) : null
                                    }
                                />
                                <Box>
                                    <img
                                        alt="Select file"
                                        src="/assets/images/UploadFile.svg"
                                        style={{
                                            width: "100px",
                                        }}
                                    />
                                </Box>
                                <Box sx={{ p: 2 }}>{translate("IMAGE_PANEL.SELECT_IMAGE")}</Box>
                            </Box>
                        </Box>
                    </Grid>
                )}
                {currentImage && (
                    <Grid item xs={12}>
                        <Card sx={{ display: "flex", justifyContent: "center" }}>
                            <Box
                                component="img"
                                src={currentImage}
                                alt="Preview"
                                sx={{ width: "auto", height: "200px" }}
                            />
                        </Card>
                    </Grid>
                )}
                {isEditMode && (
                    <>
                        <Grid item xs={12}>
                            <Typography sx={{ textAlign: "center" }}>
                                {translate("IMAGE_PANEL.PARAMETERS.POSITION")}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        label="X"
                                        value={position.x}
                                        onChange={(event) => {
                                            setPosition({
                                                ...position,
                                                x: event.target.value,
                                            });
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Y"
                                        value={position.y}
                                        onChange={(event) => {
                                            setPosition({
                                                ...position,
                                                y: event.target.value,
                                            });
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container spacing={0}>
                                <Grid item xs={12} display="flex" justifyContent="center">
                                    <IconButton onMouseDown={() => holdMouse(directions.goUp)} onMouseUp={release}>
                                        <ArrowUpward />
                                    </IconButton>
                                </Grid>
                                <Grid item xs={6} display="flex" justifyContent="right" paddingRight={2}>
                                    <IconButton onMouseDown={() => holdMouse(directions.goLeft)} onMouseUp={release}>
                                        <ArrowBack />
                                    </IconButton>
                                </Grid>
                                <Grid item xs={6} display="flex" justifyContent="left" paddingLeft={2}>
                                    <IconButton onMouseDown={() => holdMouse(directions.goRight)} onMouseUp={release}>
                                        <ArrowForward />
                                    </IconButton>
                                </Grid>
                                <Grid item xs={12} display="flex" justifyContent="center">
                                    <IconButton onMouseDown={() => holdMouse(directions.goDown)} onMouseUp={release}>
                                        <ArrowDownward />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography sx={{ textAlign: "center" }}>
                                {translate("IMAGE_PANEL.PARAMETERS.SIZE")}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Width"
                                        value={size.width}
                                        onChange={(event) => {
                                            setSize({
                                                ...size,
                                                width: event.target.value,
                                            });
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Height"
                                        value={size.height}
                                        onChange={(event) => {
                                            setSize({
                                                ...size,
                                                height: event.target.value,
                                            });
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </>
                )}
                {isEditMode && (
                    <>
                        <Grid item xs={12}>
                            <Button fullWidth variant="contained" color="success" onClick={() => updateImage()}>
                                {translate("IMAGE_PANEL.UPDATE")}
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button fullWidth variant="contained" color="error" onClick={deleteImage}>
                                {translate("IMAGE_PANEL.DELETE")}
                            </Button>
                        </Grid>
                    </>
                )}
                {!isEditMode && (
                    <Grid item xs={12}>
                        <Button fullWidth variant="contained" color="success" onClick={addImage}>
                            {translate("IMAGE_PANEL.ADD")}
                        </Button>
                    </Grid>
                )}
            </Grid>
        </Container>
    );
};

export default PutImage;
