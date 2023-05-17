import { Box, Button, Container, Grid, Switch, TextField, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import React from "react";
import { ChromePicker } from "react-color";
import { useLang } from "../../../Context/LangProvider";
import * as Optispace from "../../../Optiengine";
import { Dimensioning } from "../../../Optiengine";
import { WithEventListener } from "../../../Types/WithEventListener";
import { degToRad, radToDeg } from "../../../Utils/Math";

interface Props {
    item: WithEventListener<Optispace.Item>;
    engine: Optispace.Optiengine;

    onDelete: () => void;
}

const ItemInfo = (props: Props) => {
    const { item, engine, onDelete } = props;

    const { translate } = useLang();
    const { enqueueSnackbar } = useSnackbar();

    const [rotation, setRotation] = React.useState<string>(
        Dimensioning.degresToMeasure(radToDeg(item.object.rotation.y))
    );
    const [position, _setPosition] = React.useState<{ x: string; y: string; z: string }>({
        x: Dimensioning.cmToMeasure(item.object.position.x),
        y: Dimensioning.cmToMeasure(item.object.position.y),
        z: Dimensioning.cmToMeasure(item.object.position.z),
    });

    const [scale, _setScale] = React.useState<{ x: string; y: string; z: string }>({
        x: Dimensioning.cmToMeasure(item.object.scale.x),
        y: Dimensioning.cmToMeasure(item.object.scale.y),
        z: Dimensioning.cmToMeasure(item.object.scale.z),
    });

    const [fixed, setFixed] = React.useState<boolean>(item.fixed);

    const [color, setColor] = React.useState<string>(item.object?.children?.[0].material?.color.getHexString() ?? "");

    const positionRef = React.useRef(position);
    const setPosition = (data: { x: string; y: string; z: string }) => {
        positionRef.current = data;
        _setPosition({ ...data });
    };

    const scaleRef = React.useRef(scale);
    const setScale = (data: { x: string; y: string; z: string }) => {
        scaleRef.current = data;
        _setScale({ ...data });
    };

    React.useEffect(() => {
        const updatePosition = (event: { type: string; target: EventTarget | null }) => {
            if (!event.target || !(event.target instanceof Optispace.Item)) {
                return;
            }
            const positionFromObject = { ...event.target.object.position };

            positionFromObject.x = Dimensioning.cmToMeasure(positionFromObject.x);
            positionFromObject.y = Dimensioning.cmToMeasure(positionFromObject.y);
            positionFromObject.z = Dimensioning.cmToMeasure(positionFromObject.z);

            setPosition(positionFromObject);
            setRotation(Dimensioning.degresToMeasure(radToDeg(event.target.object.rotation.y)));
            setScale({
                x: Dimensioning.cmToMeasure(event.target.object.scale.x),
                y: Dimensioning.cmToMeasure(event.target.object.scale.y),
                z: Dimensioning.cmToMeasure(event.target.object.scale.z),
            });
            setFixed(event.target.fixed);
        };

        item.addEventListener("FURNITURE_MOVED_3D_EVENT", updatePosition);
        return () => {
            document.removeEventListener("FURNITURE_MOVED_3D_EVENT", updatePosition);
        };
    }, [item]);

    const update = (onlyColor: boolean) => {
        engine.View3D.scene.setItemFixedFromName(item.name, fixed);

        const [x, y, z] = [position.x, position.y, position.z].map((value) =>
            Dimensioning.cmFromMeasureRaw(parseFloat(value.toString()))
        );

        if ([x, y, z].some((value) => isNaN(value)) === false) {
            engine.View3D.scene.setItemPositionFromName(item.name, { x, y, z });
        }

        const rad = degToRad(Number(rotation));

        if (!isNaN(rad)) {
            engine.View3D.scene.setItemRotationFromName(item.name, rad);
        }

        if (color[0] === "#") {
            engine.View3D.scene.setItemColorFromName(item.name, color);
        }

        const [x2, y2, z2] = [scale.x, scale.y, scale.z].map((value) =>
            Dimensioning.cmFromMeasureRaw(parseFloat(value.toString()))
        );

        if ([x2, y2, z2].some((value) => isNaN(value)) === false) {
            engine.View3D.scene.setItemScaleFromName(item.name, { x: x2, y: y2, z: z2 });
        }

        if (!onlyColor) {
            enqueueSnackbar(translate("ITEM_PANEL.UPDATE_SUCCESS"), { variant: "success" });
        }
    };

    React.useEffect(() => update(true), [color]);

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key == "Enter") {
            update(false);
        }
    };

    return (
        <Container key={item.name} sx={{ pt: 1 }}>
            <Typography>
                {translate("ITEM_PANEL.NAME")}: {item.metadata.itemName}
            </Typography>
            <Typography>
                {translate("ITEM_PANEL.TYPE")}: {item.metadata.format}
            </Typography>
            <Box>
                <Typography>
                    Item fixed:{" "}
                    <Switch checked={fixed} onChange={(e) => setFixed(e.target.checked)} color="secondary" />
                </Typography>
            </Box>
            <Box component="hr" />
            <Typography sx={{ textAlign: "center" }}>{translate("ITEM_PANEL.POSITION")}</Typography>
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <TextField
                        label="X"
                        value={position.x}
                        onKeyDown={onKeyDown}
                        onChange={(event) => {
                            setPosition({
                                ...position,
                                x: event.target.value,
                            });
                        }}
                    />
                </Grid>
                <Grid item xs={4}>
                    <TextField
                        label="Y"
                        value={position.y}
                        onKeyDown={onKeyDown}
                        onChange={(event) => {
                            setPosition({
                                ...position,
                                y: event.target.value,
                            });
                        }}
                    />
                </Grid>
                <Grid item xs={4}>
                    <TextField
                        label="Z"
                        value={position.z}
                        onKeyDown={onKeyDown}
                        onChange={(event) => {
                            setPosition({
                                ...position,
                                z: event.target.value,
                            });
                        }}
                    />
                </Grid>
            </Grid>
            <Box component="hr" />
            <Typography sx={{ textAlign: "center" }}>{translate("ITEM_PANEL.ROTATION")}</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        label="Rotation"
                        value={rotation}
                        onKeyDown={onKeyDown}
                        fullWidth
                        onChange={(event) => {
                            setRotation(event.target.value);
                        }}
                    />
                </Grid>
            </Grid>
            <Box component="hr" />
            <Typography sx={{ textAlign: "center" }}>{translate("ITEM_PANEL.SCALE")}</Typography>
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <TextField
                        label="X"
                        value={scale.x}
                        onKeyDown={onKeyDown}
                        onChange={(event) => {
                            setScale({
                                ...scale,
                                x: event.target.value,
                            });
                        }}
                    />
                </Grid>
                <Grid item xs={4}>
                    <TextField
                        label="Y"
                        value={scale.y}
                        onKeyDown={onKeyDown}
                        onChange={(event) => {
                            setScale({
                                ...scale,
                                y: event.target.value,
                            });
                        }}
                    />
                </Grid>
                <Grid item xs={4}>
                    <TextField
                        label="Z"
                        value={scale.z}
                        onKeyDown={onKeyDown}
                        onChange={(event) => {
                            setScale({
                                ...scale,
                                z: event.target.value,
                            });
                        }}
                    />
                </Grid>
            </Grid>
            <Box component="hr" />
            <Typography sx={{ textAlign: "center" }}>{translate("ITEM_PANEL.COLOR")}</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Box sx={{ width: "100%" }}>
                        <ChromePicker
                            styles={{
                                default: {
                                    alpha: {
                                        display: "none",
                                    },
                                    picker: {
                                        width: "100%",
                                    },
                                },
                            }}
                            color={color}
                            onChange={(color) => setColor(color.hex)}
                        />
                    </Box>
                </Grid>
            </Grid>
            <Box component="hr" />
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Button fullWidth variant="contained" color="success" onClick={() => update(false)}>
                        {translate("ITEM_PANEL.UPDATE")}
                    </Button>
                </Grid>
                <Grid item xs={6}>
                    <Button
                        fullWidth
                        variant="contained"
                        color="error"
                        onClick={() => {
                            engine.View3D.scene.deleteItemFromName(item.name);
                            engine.View3D.controller.detachObject();
                            onDelete();
                        }}
                    >
                        {translate("ITEM_PANEL.DELETE")}
                    </Button>
                </Grid>
            </Grid>
        </Container>
    );
};

export default ItemInfo;
