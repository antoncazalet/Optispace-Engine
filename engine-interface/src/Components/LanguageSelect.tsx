import { Language } from "@mui/icons-material";
import { Box, IconButton, Menu, MenuItem, Tooltip, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import React from "react";
import { useLang } from "../Context/LangProvider";

type Lang = {
    code: string;
    name: string;
    image: string;
};

const Langs: Lang[] = [
    { code: "en-US", name: "English", image: "/assets/images/USFlag.svg" },
    { code: "fr", name: "Français", image: "/assets/images/FrenchFlag.svg" },
];

const LanguagesSelect: React.FC = () => {
    const { translate, currentLocale, changeLocale } = useLang();
    const { enqueueSnackbar } = useSnackbar();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelectLang = (lang: Lang) => {
        if (lang.code === currentLocale) {
            return;
        }
        enqueueSnackbar(translate("LANGUAGE_CHANGE_SUCCESS", lang.code), { variant: "success" });
        setAnchorEl(null);
        changeLocale(lang.code);
    };

    return (
        <>
            <IconButton sx={{ ml: "8px" }} onClick={handleClick}>
                <Tooltip title={translate("LANGUAGES")}>
                    <Language sx={{ fontSize: 32 }} />
                </Tooltip>
            </IconButton>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    "aria-labelledby": "basic-button",
                }}
            >
                {Langs.map((lang) => (
                    <MenuItem key={lang.code} selected={currentLocale === lang.code} onClick={() => handleSelectLang(lang)}>
                        <Box sx={{ height: "16px" }} component="img" alt={`${lang.name} flag`} src={lang.image} />
                        <Typography sx={{ mx: 0.5 }}>{lang.name}</Typography>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default LanguagesSelect;
