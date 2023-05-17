import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import React from "react";
import { useLang } from "../../Context/LangProvider";

const StepGetProjectSpecs = () => {
    const { translate } = useLang();

    return (
        <Box>
            <FormControl fullWidth>
                <InputLabel id="select-type-projec-labelt">
                    {translate("WELCOME_CENTER.GET_SPECS_INFOS.KIND_OF_PROJECT.TITLE")}
                </InputLabel>
                <Select
                    labelId="select-type-project-label"
                    id="select-type-project"
                    label={translate("WELCOME_CENTER.GET_SPECS_INFOS.KIND_OF_PROJECT.TITLE")}
                >
                    <MenuItem value={translate("WELCOME_CENTER.GET_SPECS_INFOS.KIND_OF_PROJECT.ANSWERS.1")}>
                        {translate("WELCOME_CENTER.GET_SPECS_INFOS.KIND_OF_PROJECT.ANSWERS.1")}
                    </MenuItem>
                    <MenuItem value={translate("WELCOME_CENTER.GET_SPECS_INFOS.KIND_OF_PROJECT.ANSWERS.2")}>
                        {translate("WELCOME_CENTER.GET_SPECS_INFOS.KIND_OF_PROJECT.ANSWERS.2")}
                    </MenuItem>
                    <MenuItem value={translate("WELCOME_CENTER.GET_SPECS_INFOS.KIND_OF_PROJECT.ANSWERS.3")}>
                        {translate("WELCOME_CENTER.GET_SPECS_INFOS.KIND_OF_PROJECT.ANSWERS.3")}
                    </MenuItem>
                    <MenuItem value={translate("WELCOME_CENTER.GET_SPECS_INFOS.KIND_OF_PROJECT.ANSWERS.4")}>
                        {translate("WELCOME_CENTER.GET_SPECS_INFOS.KIND_OF_PROJECT.ANSWERS.4")}
                    </MenuItem>
                    <MenuItem value={translate("WELCOME_CENTER.GET_SPECS_INFOS.KIND_OF_PROJECT.ANSWERS.5")}>
                        {translate("WELCOME_CENTER.GET_SPECS_INFOS.KIND_OF_PROJECT.ANSWERS.5")}
                    </MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
};

export default StepGetProjectSpecs;
