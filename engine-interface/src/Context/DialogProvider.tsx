import { Close } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton } from "@mui/material";
import { Box } from "@mui/system";
import * as React from "react";
import { useState } from "react";
import Draggable, { DraggableData } from "react-draggable";
import { useLang } from "./LangProvider";

type Color = "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";
type Size = "xs" | "sm" | "md" | "lg" | "xl" | false;

export interface IDialogOptions {
    title?: string;
    content?: React.ReactNode;
    okColor?: Color;
    cancelColor?: Color;
    hideOk?: boolean;
    hideCancel?: boolean;
    okText?: string;
    cancelText?: string;
    onOk?: () => void;
    onCancel?: () => void;
    fullWidth?: boolean;
    fullScreen?: boolean;
    maxWidth?: Size;
    noContentStyle?: boolean;
    disableOutsideClick?: boolean;
    draggable?: boolean;
    scale?: number;
    disableContentPadding?: boolean;
}

export interface IDialogContext {
    openDialog: (options: IDialogOptions) => void;
    closeDialog: () => void;
}

const DEFAULT_CONTEXT: IDialogContext = {
    openDialog: (_options: IDialogOptions) => {},
    closeDialog: () => {},
};

export const DEFAULT_DIALOG_OPTIONS: IDialogOptions = {};
export const DialogContext = React.createContext(DEFAULT_CONTEXT);
export const useDialog = () => React.useContext(DialogContext);

interface Props {
    children: React.ReactNode;
}

export const DialogProvider = ({ children }: Props) => {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState(DEFAULT_DIALOG_OPTIONS);
    const { translate } = useLang();

    const {
        title,
        content,
        okColor,
        cancelColor,
        hideOk,
        hideCancel,
        okText,
        cancelText,
        onOk,
        onCancel,
        fullScreen,
        fullWidth,
        maxWidth,
        noContentStyle,
        disableOutsideClick,
        draggable,
        scale,
        disableContentPadding,
    } = options;

    const showActions = !(hideOk && hideCancel);

    const confirmHandler = (opts: IDialogOptions) => {
        setOptions(opts);
        setOpen(true);
    };

    const okHandler = () => {
        setOpen(false);
        if (onOk) {
            onOk();
        }
    };

    const closeHandler = (reason?: "backdropClick" | "escapeKeyDown") => {
        if (reason === "backdropClick" && disableOutsideClick) {
            return;
        }

        setOpen(false);
        if (onCancel) {
            onCancel();
        }
    };

    const provider: IDialogContext = {
        openDialog: confirmHandler,
        closeDialog: closeHandler,
    };

    const onStop = (_: unknown, data: DraggableData) => {
        localStorage.setItem("dialogDefaultPosition", JSON.stringify({ valueX: data.x, valueY: data.y }));
    };

    return (
        <DialogContext.Provider value={provider}>
            {children}
            <Box>
                <Draggable
                    handle="#draggable-dialog-title"
                    cancel={'[class*="MuiDialogContent-root"]'}
                    disabled={!draggable}
                    onStop={onStop}
                    {...(draggable === true
                        ? {
                              defaultPosition: {
                                  x: JSON.parse(localStorage.getItem("dialogDefaultPosition") || "{}").valueX || 0,
                                  y: JSON.parse(localStorage.getItem("dialogDefaultPosition") || "{}").valueY || 0,
                              },
                          }
                        : {})}
                >
                    <Dialog
                        fullWidth={fullWidth || false}
                        fullScreen={fullScreen || false}
                        maxWidth={maxWidth || false}
                        open={open}
                        onClose={(_, reason) => closeHandler(reason)}
                        aria-labelledby="draggable-dialog-title"
                        {...(draggable === true
                            ? {
                                  disableEnforceFocus: true,
                                  disableAutoFocus: true,
                                  hideBackdrop: true,
                                  style: {
                                      position: "absolute",
                                      bottom: 10,
                                      right: 10,
                                      height: "fit-content",
                                      width: "fit-content",
                                  },
                              }
                            : {})}
                        PaperProps={{
                            style: {
                                transform: `scale(${scale || 1})`,
                            },
                        }}
                    >
                        {title && (
                            <>
                                <DialogTitle
                                    id="draggable-dialog-title"
                                    style={{ cursor: draggable ? "move" : "default" }}
                                >
                                    {title}{" "}
                                    <IconButton
                                        aria-label="Fermer le popup"
                                        onClick={() => closeHandler()}
                                        sx={{
                                            position: "absolute",
                                            right: 8,
                                            top: 8,
                                            color: (theme) => theme.palette.grey[500],
                                        }}
                                    >
                                        <Close />
                                    </IconButton>
                                </DialogTitle>
                                <Divider />
                            </>
                        )}
                        {content && !noContentStyle && (
                            <DialogContent
                                sx={{
                                    p: disableContentPadding ? 0 : 2,
                                }}
                            >
                                <>{content}</>
                            </DialogContent>
                        )}
                        {content && noContentStyle && <>{content}</>}
                        {showActions && (
                            <>
                                <Divider />
                                <DialogActions>
                                    {!hideOk && (
                                        <Button color={okColor ?? "primary"} onClick={okHandler}>
                                            {okText || translate("DIALOG.OK")}
                                        </Button>
                                    )}
                                    {!hideCancel && (
                                        <Button color={cancelColor ?? "inherit"} onClick={() => closeHandler()}>
                                            {cancelText || translate("DIALOG.CANCEL")}
                                        </Button>
                                    )}
                                </DialogActions>
                            </>
                        )}
                    </Dialog>
                </Draggable>
            </Box>
        </DialogContext.Provider>
    );
};
