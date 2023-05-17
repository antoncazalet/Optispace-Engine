import { Close } from "@mui/icons-material";
import { AppBar, Box, Divider, Drawer, IconButton, Toolbar, Typography } from "@mui/material";
import * as React from "react";
import { useState } from "react";

export interface IDrawerOptions {
    header?: React.ReactNode;
    headerTitle?: string;
    content?: React.ReactNode;
    footer?: React.ReactNode;
    width?: number | string;
    anchor?: "bottom" | "left" | "right" | "top";
    onClose?: () => void;
}

export interface IDrawerContext {
    openDrawer: (options: IDrawerOptions) => void;
    closeDrawer: () => void;
    isDrawerOpen: boolean;
}

const DEFAULT_CONTEXT: IDrawerContext = {
    openDrawer: (_options: IDrawerOptions) => {},
    closeDrawer: () => {},
    isDrawerOpen: false,
};

export const DEFAULT_DRAWER_OPTIONS: IDrawerOptions = {};
export const DrawerContext = React.createContext(DEFAULT_CONTEXT);
export const useDrawer = () => React.useContext(DrawerContext);

interface Props {
    children: React.ReactNode;
}

export const DrawerProvider = ({ children }: Props) => {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState(DEFAULT_DRAWER_OPTIONS);

    const { header, headerTitle, footer, content, width, anchor } = options;

    const openDrawer = (opts: IDrawerOptions) => {
        setOptions(opts);
        setOpen(true);
    };

    const closeDrawer = () => {
        if (open) {
            if (options.onClose) {
                options.onClose();
            }
            setOptions({});
        }
        setOpen(false);
    };

    const provider: IDrawerContext = {
        openDrawer,
        closeDrawer,
        isDrawerOpen: open,
    };

    return (
        <DrawerContext.Provider value={provider}>
            {children}
            <Drawer
                sx={{
                    width: width ?? 360,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        height: "calc(100% - 64px)",
                        width: width ?? 360,
                        boxSizing: "border-box",
                        top: "auto",
                        zIndex: 9,
                    },
                }}
                variant="persistent"
                anchor={anchor ?? "right"}
                open={open}
                transitionDuration={{ enter: 200, exit: 200 }}
            >
                <AppBar position="static" color="transparent" sx={{ boxShadow: 1 }}>
                    <Toolbar>
                        {headerTitle && <Typography variant="h6">{headerTitle}</Typography>}
                        <Box sx={{ flexGrow: 1 }} />
                        <IconButton edge="end" color="inherit" aria-label="menu" onClick={closeDrawer}>
                            <Close />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                {header}
                <Divider />
                <Box sx={{ flex: "auto", overflowY: "auto" }}>{content}</Box>
                {footer !== undefined ? (
                    <React.Fragment>
                        <Divider />
                        {footer}
                    </React.Fragment>
                ) : null}
            </Drawer>
        </DrawerContext.Provider>
    );
};
