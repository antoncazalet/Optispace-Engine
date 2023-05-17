import {
    FormatAlignCenter,
    FormatAlignLeft,
    FormatAlignRight,
    FormatBold,
    FormatItalic,
    FormatUnderlined,
} from "@mui/icons-material";
import { Button, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip } from "@mui/material";
import { Container } from "@mui/system";
import { useSnackbar } from "notistack";
import React from "react";
import { useLang } from "../../Context/LangProvider";
import * as Optispace from "../../Optiengine";

interface WriteTextProps {
    engine: Optispace.Optiengine;
    textEdit?: Optispace.TextLabelType;

    closeDrawer?: () => void;
}

const Colors = ["transparant", "black", "white", "red", "green", "blue", "yellow", "orange", "purple", "brown"];
const Fonts = [
    "Arial",
    "Times New Roman",
    "Courier New",
    "Comic Sans MS",
    "Impact",
    "Verdana",
    "Georgia",
    "Trebuchet MS",
];

export const WriteText: React.FC<WriteTextProps> = (props: WriteTextProps) => {
    const { engine, textEdit, closeDrawer } = props;

    const { enqueueSnackbar } = useSnackbar();
    const { translate } = useLang();

    const [text, setText] = React.useState<string>("");
    const [alignType, setAlignType] = React.useState<"left" | "right" | "center">("center");
    const [fontSize, setFontSize] = React.useState<number>(12);
    const [fontFamily, setFontFamily] = React.useState<string>("Arial");
    const [fontColor, setFontColor] = React.useState<string>("black");
    const [fontBgColor, setFontBgColor] = React.useState<string>("transparant");
    const [italic, setItalic] = React.useState<boolean>(false);
    const [bold, setBold] = React.useState<boolean>(false);
    const [underline, setUnderline] = React.useState<boolean>(false);

    const addText = () => {
        if (!text.length) {
            enqueueSnackbar(translate("TEXT_PANEL.MESSAGES.NOT_VALID"), { variant: "error" });
            return;
        }

        const options = {
            text,
            alignType,
            fontSize,
            fontFamily,
            fontColor,
            fontBgColor,
            italic,
            bold,
            underline,
        };

        engine.View2D.addText(options);
        enqueueSnackbar(translate("TEXT_PANEL.MESSAGES.ADD_SUCCESS"), { variant: "success" });
    };

    const updateText = () => {
        if (!text.length || !textEdit) {
            enqueueSnackbar(translate("TEXT_PANEL.MESSAGES.NOT_VALID"), { variant: "error" });
            return;
        }

        const options = {
            text,
            alignType,
            fontSize,
            fontFamily,
            fontColor,
            fontBgColor,
            italic,
            bold,
            underline,
        };

        engine.View2D.editText(textEdit.id, options);
        enqueueSnackbar(translate("TEXT_PANEL.MESSAGES.UPDATE_SUCCESS"), { variant: "success" });
    };

    const deleteText = () => {
        if (!textEdit) {
            return;
        }
        engine.View2D.deleteText(textEdit.id);

        enqueueSnackbar(translate("TEXT_PANEL.MESSAGES.DELETE_SUCCESS"), { variant: "success" });
        if (closeDrawer) {
            closeDrawer();
        }
    };

    React.useEffect(() => {
        if (textEdit) {
            setText(textEdit.text);
            setAlignType(textEdit.alignType);
            setFontSize(textEdit.fontSize);
            setFontFamily(textEdit.fontFamily);
            setFontColor(textEdit.fontColor);
            setFontBgColor(textEdit.fontBgColor);
            setItalic(textEdit.italic);
            setBold(textEdit.bold);
            setUnderline(textEdit.underline);
        }
    }, [textEdit]);

    const isEditMode = textEdit !== undefined;

    return (
        <Container sx={{ pt: 2 }}>
            <Grid container justifyContent="center" alignItems="center" spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        rows={3}
                        fullWidth
                        variant="outlined"
                        placeholder={translate("TEXT_PANEL.WRITE_TEXT")}
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        autoComplete="off"
                    />
                </Grid>
                <Grid item xs={6}>
                    <Grid container justifyContent="left" alignItems="left" spacing={2}>
                        <Grid item xs={4}>
                            <Tooltip title={translate("TEXT_PANEL.PARAMETERS.BOLD")}>
                                <IconButton size="medium" onClick={() => setBold(!bold)}>
                                    <FormatBold sx={{ fontSize: "32px", color: bold ? "black" : "unset" }} />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                        <Grid item xs={4}>
                            <Tooltip title={translate("TEXT_PANEL.PARAMETERS.UNDERLINE")}>
                                <IconButton size="medium" onClick={() => setUnderline(!underline)}>
                                    <FormatUnderlined sx={{ fontSize: "32px", color: underline ? "black" : "unset" }} />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                        <Grid item xs={4}>
                            <Tooltip title={translate("TEXT_PANEL.PARAMETERS.ITALIC")}>
                                <IconButton size="medium" onClick={() => setItalic(!italic)}>
                                    <FormatItalic sx={{ fontSize: "32px", color: italic ? "black" : "unset" }} />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={6}>
                    <Grid container justifyContent="left" alignItems="left" spacing={1}>
                        <Grid item xs={4}>
                            <Tooltip title={translate("TEXT_PANEL.PARAMETERS.ALIGN_LEFT")}>
                                <IconButton size="medium" onClick={() => setAlignType("left")}>
                                    <FormatAlignLeft
                                        sx={{ fontSize: "32px", color: alignType === "left" ? "black" : "unset" }}
                                    />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                        <Grid item xs={4}>
                            <Tooltip title={translate("TEXT_PANEL.PARAMETERS.ALIGN_CENTER")}>
                                <IconButton size="medium" onClick={() => setAlignType("center")}>
                                    <FormatAlignCenter
                                        sx={{ fontSize: "32px", color: alignType === "center" ? "black" : "unset" }}
                                    />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                        <Grid item xs={4}>
                            <Tooltip title={translate("TEXT_PANEL.PARAMETERS.ALIGN_RIGHT")}>
                                <IconButton size="medium" onClick={() => setAlignType("right")}>
                                    <FormatAlignRight
                                        sx={{ fontSize: "32px", color: alignType === "right" ? "black" : "unset" }}
                                    />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel id="room_type_select_label">
                            {translate("TEXT_PANEL.PARAMETERS.BACKGROUND_COLOR")}
                        </InputLabel>
                        <Select
                            fullWidth
                            value={fontBgColor}
                            label={translate("TEXT_PANEL.PARAMETERS.BACKGROUND_COLOR")}
                            onChange={(event) => setFontBgColor(event.target.value as string)}
                        >
                            {Colors.map((color) => (
                                <MenuItem key={color} value={color}>
                                    {translate(`TEXT_PANEL.COLORS.${color}` as keyof typeof translate)
                                        .charAt(0)
                                        .toUpperCase() +
                                        translate(`TEXT_PANEL.COLORS.${color}` as keyof typeof translate).slice(1)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel id="room_type_select_label">
                            {translate("TEXT_PANEL.PARAMETERS.FONT_COLOR")}
                        </InputLabel>
                        <Select
                            fullWidth
                            value={fontColor}
                            label={translate("TEXT_PANEL.PARAMETERS.FONT_COLOR")}
                            onChange={(event) => setFontColor(event.target.value as string)}
                        >
                            {Colors.map((color) => (
                                <MenuItem key={color} value={color}>
                                    {translate(`TEXT_PANEL.COLORS.${color}` as keyof typeof translate)
                                        .charAt(0)
                                        .toUpperCase() +
                                        translate(`TEXT_PANEL.COLORS.${color}` as keyof typeof translate).slice(1)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel id="room_type_select_label">
                            {translate("TEXT_PANEL.PARAMETERS.FONT_FAMILY")}
                        </InputLabel>
                        <Select
                            fullWidth
                            value={fontFamily}
                            label={translate("TEXT_PANEL.PARAMETERS.FONT_FAMILY")}
                            onChange={(event) => setFontFamily(event.target.value as string)}
                        >
                            {Fonts.map((color) => (
                                <MenuItem key={color} value={color}>
                                    {color.charAt(0).toUpperCase() + color.slice(1)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        type="number"
                        value={fontSize}
                        label={translate("TEXT_PANEL.PARAMETERS.FONT_SIZE")}
                        onChange={(event) => setFontSize(parseInt(event.target.value))}
                    />
                </Grid>
                {isEditMode && (
                    <>
                        <Grid item xs={12}>
                            <Button fullWidth variant="contained" color="success" onClick={updateText}>
                                {translate("TEXT_PANEL.UPDATE")}
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button fullWidth variant="contained" color="error" onClick={deleteText}>
                                {translate("TEXT_PANEL.DELETE")}
                            </Button>
                        </Grid>
                    </>
                )}
                {!isEditMode && (
                    <Grid item xs={12}>
                        <Button fullWidth variant="contained" color="success" onClick={addText}>
                            {translate("TEXT_PANEL.ADD")}
                        </Button>
                    </Grid>
                )}
            </Grid>
        </Container>
    );
};

export default WriteText;
