import { Box, Typography } from "@mui/material";
import React from "react";
import { useLang } from "../../Context/LangProvider";

const StepWelcome = () => {
    const { translate } = useLang();

    return (
        <Box>
            <Typography>{translate("WELCOME_CENTER.WELCOME_TAB.TITLE")}</Typography>
            <Box component="br" />
            <Typography variant="caption">
                <Box component="i">{translate("WELCOME_CENTER.WELCOME_TAB.SUBTITLE")}</Box>
            </Typography>
        </Box>
    );
};

export default StepWelcome;
