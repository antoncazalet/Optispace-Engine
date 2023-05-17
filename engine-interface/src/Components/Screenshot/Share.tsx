import { Check, Close } from "@mui/icons-material";
import { Box, Button, CircularProgress } from "@mui/material";
import { useSnackbar } from "notistack";
import React from "react";
import { match } from "ts-pattern";
import Requests from "../../API/Requests";
import { useLang } from "../../Context/LangProvider";

interface Props {
    screenshot: string;
}

const Share: React.FC<Props> = (props: Props) => {
    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState<boolean | undefined>(undefined);

    const { translate } = useLang();
    const { enqueueSnackbar } = useSnackbar();

    const uploadImageAsProjectImage = async () => {
        setLoading(true);
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get("projectId")!;

        Requests.uploadProjectImage(projectId, props.screenshot)
            .then(() => {
                setSuccess(true);
                setLoading(false);
                enqueueSnackbar(translate("SCREENSHOT_TOOL.SHARE_SET_PROJECT_IMAGE_SUCCESS"), { variant: "success" });
                return;
            })
            .catch(() => {
                setSuccess(false);
                setLoading(false);
                enqueueSnackbar(translate("SCREENSHOT_TOOL.SHARE_SET_PROJECT_IMAGE_FAILED"), { variant: "error" });
                return;
            });
    };

    const getIcon = () =>
        match(loading)
            .with(true, () => <CircularProgress size={24} />)
            .with(false, () =>
                match(success)
                    .with(true, () => <Check sx={{ fontSize: 24, color: "green" }} />)
                    .with(false, () => <Close sx={{ fontSize: 24, color: "red" }} />)
                    .with(undefined, () => <></>)
                    .exhaustive()
            )
            .exhaustive();

    return (
        <Box>
            <Button variant="outlined" onClick={uploadImageAsProjectImage} endIcon={getIcon()}>
                {translate("SCREENSHOT_TOOL.SHARE_SET_PROJECT_IMAGE")}
            </Button>
        </Box>
    );
};

export default Share;
