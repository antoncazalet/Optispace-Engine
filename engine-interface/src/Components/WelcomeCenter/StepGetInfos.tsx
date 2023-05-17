import { Box, TextField } from "@mui/material";
import React from "react";
import { useLang } from "../../Context/LangProvider";

const StepGetInfos = () => {
    const { translate } = useLang();

    return (
        <Box>
            <TextField fullWidth label={translate("WELCOME_CENTER.GET_INFOS.TYPE_OF_PROJECT")} id="fullWidth" />
        </Box>
    );
};

export default StepGetInfos;
