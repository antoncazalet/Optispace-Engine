import {
    Box,
    Button,
    CircularProgress,
    createSvgIcon,
    Grid,
    IconButton,
    Tab,
    Tabs,
    Tooltip,
    Typography,
} from "@mui/material";
import React from "react";

import { Check } from "@mui/icons-material";
import FolderIcon from "@mui/icons-material/FolderOutlined";
import RectangleIcon from "@mui/icons-material/RectangleOutlined";
import SquareIcon from "@mui/icons-material/SquareOutlined";
import { useSnackbar } from "notistack";
import Requests from "../../API/Requests";

import { useLang } from "../../Context/LangProvider";
import RectangleContent from "../../Placeholders/Rectangle";
import RoomWithNoTopLeft from "../../Placeholders/RoomWithNoTopLeft";
import SquareContent from "../../Placeholders/Square";
import LetterL from "../../Placeholders/LetterL";

const TabContent = (props: { children?: React.ReactNode; index: number; value: number }) => {
    const { children, value, index } = props;

    return (
        <Box hidden={value !== index}>
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </Box>
    );
};

const LetterSVG = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.0"
        width="56"
        height="117"
    >
        <text
            x="-11"
            y="92"
            style={{ "fontSize": "120px", "fill": "rgba(0, 0, 0, 0.50)" }}
        >
            <tspan x="-11" y="92">
                L
            </tspan>
        </text>
    </svg>
);

const Placeholders = [
    {
        name: "Square",
        icon: SquareIcon,
        placeholder: SquareContent,
    },
    {
        name: "Rectangle",
        icon: RectangleIcon,
        placeholder: RectangleContent,
    },
    {
        name: "Folder",
        icon: FolderIcon,
        placeholder: RoomWithNoTopLeft,
    },
    {
        name: "L",
        icon: LetterSVG,
        placeholder: LetterL,
    },
];

const StepUploadPlanOrPlaceholder = (props: { onFinish: () => void }) => {
    const { translate } = useLang();

    const [value, setValue] = React.useState(-1);
    const [loading, setLoading] = React.useState(false);
    const [isDone, setIsDone] = React.useState(false);

    const { enqueueSnackbar } = useSnackbar();

    const uploadFile = (file: File) => {
        setLoading(true);
        const fileName = file.name;

        if (!fileName.endsWith(".dxf")) {
            enqueueSnackbar(
                translate("WELCOME_CENTER.UPLOAD_PLAN_OR_PLACEHOLDER.UPLOAD_YES.SELECT_A_FILE_WRONG_FORMAT"),
                {
                    variant: "error",
                }
            );
            setLoading(false);
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get("projectId") as string;
        const formData = new FormData();

        formData.append("file", file);

        Requests.uploadPlan(formData, projectId).then(async (response) => {
            // Wait 3 seconds
            await new Promise((r) => setTimeout(r, 3000));
            if (response.success === true) {
                enqueueSnackbar(translate("WELCOME_CENTER.UPLOAD_PLAN_OR_PLACEHOLDER.UPLOAD_YES.REQUEST_SUCCESS"), {
                    variant: "success",
                });
                setLoading(false);
                setIsDone(true);
                props.onFinish();
            } else {
                enqueueSnackbar(translate("WELCOME_CENTER.UPLOAD_PLAN_OR_PLACEHOLDER.UPLOAD_YES.REQUEST_FAILED"), {
                    variant: "error",
                });
                setLoading(false);
            }
        });
    };

    const selectPlaceholder = async (placeholder: typeof Placeholders[0]) => {
        setLoading(true);

        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get("projectId");
        const token = urlParams.get("token");

        if (projectId && token) {
            const result = await Requests.saveProject(projectId, token, JSON.stringify(placeholder.placeholder)).catch(
                () => undefined
            );

            if (result) {
                enqueueSnackbar(translate("WELCOME_CENTER.UPLOAD_PLAN_OR_PLACEHOLDER.PLACEHOLDER_NO.REQUEST_SUCCESS"), {
                    variant: "success",
                });
                setLoading(false);
                setIsDone(true);
                props.onFinish();
            } else {
                enqueueSnackbar(translate("WELCOME_CENTER.UPLOAD_PLAN_OR_PLACEHOLDER.PLACEHOLDER_NO.REQUEST_FAILED"), {
                    variant: "error",
                });
                setLoading(false);
            }
        }
    };

    return (
        <Box>
            <Box>
                <Typography>{translate("WELCOME_CENTER.UPLOAD_PLAN_OR_PLACEHOLDER.QUESTION")}</Typography>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs value={value} onChange={(_, value) => setValue(value)} variant="fullWidth">
                        <Tab
                            label={`${translate("WELCOME_CENTER.UPLOAD_PLAN_OR_PLACEHOLDER.CHOICES.1")} ✅`}
                            disabled={loading}
                        />
                        <Tab
                            label={`${translate("WELCOME_CENTER.UPLOAD_PLAN_OR_PLACEHOLDER.CHOICES.2")} ❌`}
                            disabled={loading}
                        />
                    </Tabs>
                </Box>
                <TabContent value={value} index={0}>
                    <Typography sx={{ textAlign: "left" }}>
                        {translate("WELCOME_CENTER.UPLOAD_PLAN_OR_PLACEHOLDER.UPLOAD_YES.TITLE")}
                    </Typography>
                    {loading && (
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <CircularProgress />
                        </Box>
                    )}
                    {isDone && (
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <Check sx={{ fontSize: 64, color: "green" }} />
                        </Box>
                    )}
                    {!loading && !isDone && (
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
                                <Box sx={{ p: 2 }}>
                                    {translate("WELCOME_CENTER.UPLOAD_PLAN_OR_PLACEHOLDER.UPLOAD_YES.SELECT_A_FILE")}
                                </Box>
                            </Box>
                        </Box>
                    )}
                </TabContent>
                <TabContent value={value} index={1}>
                    <Typography sx={{ textAlign: "left" }}>
                        {translate("WELCOME_CENTER.UPLOAD_PLAN_OR_PLACEHOLDER.PLACEHOLDER_NO.TITLE")}
                    </Typography>
                    {loading && (
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <CircularProgress />
                        </Box>
                    )}
                    {isDone && (
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <Check sx={{ fontSize: 64, color: "green" }} />
                        </Box>
                    )}
                    {!loading && !isDone && (
                        <Grid container spacing={2}>
                            {Placeholders.map((placeholder, index) => (
                                <Grid item xs={4} key={index}>
                                    <Tooltip title={placeholder.name}>
                                        <IconButton onClick={() => selectPlaceholder(placeholder)}>
                                            <placeholder.icon sx={{ fontSize: 64 }} />
                                        </IconButton>
                                    </Tooltip>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </TabContent>
            </Box>
        </Box>
    );
};

export default StepUploadPlanOrPlaceholder;
