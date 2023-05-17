import {
    Alert,
    Button,
    Card,
    CardContent,
    CardMedia,
    CircularProgress,
    Container,
    Divider,
    Grid,
    TextField,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React from "react";
import { match } from "ts-pattern";
import { useDialog } from "../../../Context/DialogProvider";
import { useLang } from "../../../Context/LangProvider";
import * as Optispace from "../../../Optiengine";
import SelectFloorTexture from "../../Dialogs/SelectFloorTexture";
import InputArrayTextField from "../../InputArrayTextField";
import RoomTypeSelect from "../../RoomTypeSelect";
import TagInput from "../../TagInput";

interface Props {
    room: Optispace.Room;
    engine: Optispace.Optiengine;
}

const RoomInfo = (props: Props) => {
    const { room, engine } = props;

    const { enqueueSnackbar } = useSnackbar();
    const { translate } = useLang();
    const { openDialog } = useDialog();

    const [name, setName] = React.useState<string>(room.name ?? "");
    const [type, setType] = React.useState<string>(room.type ?? "other");
    const [tags, setTags] = React.useState<string[]>(room.tags ?? []);
    const [colorTags, setColorTags] = React.useState<string[]>(room.colorTags ?? []);
    const [floorTexture, setFloorTexture] = React.useState<string>(room.floorTexture ?? "");

    React.useEffect(() => {
        setName(room.name ?? "");
        setType(room.type ?? "other");
        setTags(room.tags ?? []);
        setColorTags(room.colorTags ?? []);
        setFloorTexture(room.floorTexture ?? "");
    }, [room]);

    const showWarningByRoomType = () => (
        match(type)
            .with("toilet", () => <Grid item xs={12}><Alert severity="warning">{translate("ROOM_TYPE_WARNING.TOILET")}</Alert></Grid>)
            .with("kitchen", () => <Grid item xs={12}><Alert severity="warning">{translate("ROOM_TYPE_WARNING.KITCHEN")}</Alert></Grid>)
            .with("bathroom", () => <Grid item xs={12}><Alert severity="warning">{translate("ROOM_TYPE_WARNING.BATHROOM")}</Alert></Grid>)
            .otherwise(() => <></>)
    );

    return (
        <Container sx={{ pt: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label={translate("ROOM_PANEL.PARAMETERS_NAME")}
                        value={name}
                        onKeyDown={() => undefined}
                        onChange={(event) => {
                            setName(event.target.value);
                        }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label={translate("ROOM_PANEL.PARAMETERS_SIZE")}
                        disabled
                        value={`${Optispace.Dimensioning.cmToMeasure(room.area, 2) + String.fromCharCode(178)}`}
                    />
                </Grid>
                <Grid item xs={12}>
                    <RoomTypeSelect
                        onChange={(t) => setType(t)}
                        value={type}
                        label={translate("ROOM_PANEL.PARAMETERS_TYPE")}
                    />
                </Grid>
                {showWarningByRoomType()}
                <Grid item xs={12}>
                    <InputArrayTextField
                        onChange={(t) => setTags(t)}
                        initialValues={tags}
                        label={translate("ROOM_PANEL.PARAMETERS_TAGS")}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TagInput onChange={(ct) => setColorTags(ct)} value={colorTags} label="Color tag" />
                </Grid>
                <Grid item xs={12}>
                    <Card>
                        <CardMedia component="img" height="140" image={floorTexture} />
                        <CardContent>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() =>
                                    openDialog({
                                        title: "Texture",
                                        content: <SelectFloorTexture onChange={(url) => setFloorTexture(url)} />,
                                        maxWidth: "md",
                                    })
                                }
                            >
                                {translate("ROOM_PANEL.PARAMETERS_FLOOR_MATERIEL")}
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Divider sx={{ mt: 2 }} />
            <Grid container spacing={2} sx={{ mt: 1, mb: 1 }}>
                <Grid item xs={12}>
                    <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        onClick={() => {
                            engine.View2D.floorplan.updateRoomByUUID(room.uuid, {
                                name: name,
                                type: type,
                                tags: tags,
                                colorTags: colorTags,
                                floorTexture: floorTexture,
                            });
                            enqueueSnackbar(translate("ROOM_PANEL.UPDATE_SUCCESS"), { variant: "success" });
                        }}
                    >
                        {translate("ROOM_PANEL.UPDATE")}
                    </Button>
                </Grid>
            </Grid>
        </Container>
    );
};

export default RoomInfo;
