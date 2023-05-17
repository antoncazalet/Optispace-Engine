import { CloudSync, HelpCenter, Keyboard, PlayArrow, Save, Settings, Undo } from "@mui/icons-material";
import { AppBar, Box, Divider, IconButton, Link, Toolbar, Tooltip, Typography } from "@mui/material";
import React from "react";
import { useDrawer } from "../Context/DrawerProvider";
import { useLang } from "../Context/LangProvider";
import * as Optispace from "../Optiengine";
import { ViewType } from "../Types/View";
import ConfigurationDrawer from "./Drawers/ConfigurationDrawer/ConfigurationDrawer";
import LanguageSelect from "./LanguageSelect";

interface Props {
    onSave: () => void;
    onHelp: () => void;
    onLaunchAlgorithm: () => void;
    onKeyboardShortcuts: () => void;
    onCloudSaves: () => void;

    isDisabled: boolean;

    projectName?: string;
    engine: Optispace.Optiengine;
    currentView: ViewType;
}

const Header: React.FC<Props> = (props: Props) => {
    const { projectName, onSave, onHelp, onLaunchAlgorithm, onKeyboardShortcuts, onCloudSaves, isDisabled } = props;
    const { translate } = useLang();
    const { openDrawer, closeDrawer } = useDrawer();

    const openConfigDrawer = () => {
        openDrawer({
            content: <ConfigurationDrawer currentView={props.currentView} engine={props.engine} />,
            headerTitle: translate("SETTINGS"),
            onClose: () => {
                closeDrawer();
            },
        });
    };

    return (
        <AppBar position="sticky" sx={{ backgroundColor: "white", boxShadow: 1, zIndex: 9 }}>
            <Toolbar disableGutters sx={{ pr: "8px", pl: "8px" }}>
                <Box component="img" src={`${process.env.PRODUCTION ? "https" : "http"}://optispace.fr/assets/logo.png`} sx={{ height: "48px" }} />
                <Link href="#" underline="none">
                    <Typography variant="h6" sx={{ color: "black", ml: 2 }}>
                        {projectName ?? "OptiSpace"}
                    </Typography>
                </Link>
                <Box sx={{ flexGrow: 1 }} />
                <IconButton
                    sx={{
                        mr: "8px",
                        opacity: isDisabled ? 0.3 : "unset",
                        pointerEvents: isDisabled ? "none" : "unset",
                    }}
                    onClick={onLaunchAlgorithm}
                >
                    <Tooltip title={translate("ALGORITHM_PANEL.HEADER")}>
                        <PlayArrow color="primary" sx={{ fontSize: 32 }} />
                    </Tooltip>
                </IconButton>
                <IconButton
                    sx={{
                        mr: "8px",
                        opacity: isDisabled ? 0.3 : "unset",
                        pointerEvents: isDisabled ? "none" : "unset",
                    }}
                    onClick={onSave}
                >
                    <Tooltip title={translate("SAVE")}>
                        <Save color="primary" sx={{ fontSize: 32 }} />
                    </Tooltip>
                </IconButton>
                <IconButton
                    sx={{
                        mr: "8px",
                        opacity: isDisabled ? 0.3 : "unset",
                        pointerEvents: isDisabled ? "none" : "unset",
                    }}
                    onClick={onCloudSaves}
                >
                    <Tooltip title={"Saves"}>
                        <CloudSync color="primary" sx={{ fontSize: 32 }} />
                    </Tooltip>
                </IconButton>
                <Divider orientation="vertical" flexItem />
                <LanguageSelect />
                <IconButton sx={{ ml: "8px" }} onClick={onKeyboardShortcuts}>
                    <Tooltip title={translate("KEYBOARD_SHORTCUTS")}>
                        <Keyboard sx={{ fontSize: 32 }} />
                    </Tooltip>
                </IconButton>
                <IconButton sx={{ ml: "8px" }} onClick={onHelp}>
                    <Tooltip title={translate("HELP_CENTER")}>
                        <HelpCenter sx={{ fontSize: 32 }} />
                    </Tooltip>
                </IconButton>
                <IconButton sx={{ ml: "8px" }} onClick={openConfigDrawer}>
                    <Tooltip title={translate("SETTINGS")}>
                        <Settings sx={{ fontSize: 32 }} />
                    </Tooltip>
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
