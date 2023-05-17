import { createTheme, StyledEngineProvider, ThemeProvider } from "@mui/material";
import { blue } from "@mui/material/colors";
import { SnackbarProvider } from "notistack";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { DialogProvider } from "./Context/DialogProvider";
import { DrawerProvider } from "./Context/DrawerProvider";
import { KeyboardShortcutsProvider } from "./Context/KeyboardShortcutsProvider";
import LangProvider from "./Context/LangProvider";

const container = document.getElementById("root");
const root = createRoot(container!); // https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html

root.render(
    <BrowserRouter>
        <SnackbarProvider
            maxSnack={1}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
            }}
        >
            <LangProvider>
                <ThemeProvider
                    theme={createTheme({
                        palette: {
                            primary: {
                                main: "#3D92CE",
                            },
                            secondary: {
                                main: blue["A700"],
                            },
                        },
                    })}
                >
                    <KeyboardShortcutsProvider>
                        <DialogProvider>
                            <DrawerProvider>
                                <StyledEngineProvider injectFirst>
                                    <App />
                                </StyledEngineProvider>
                            </DrawerProvider>
                        </DialogProvider>
                    </KeyboardShortcutsProvider>
                </ThemeProvider>
            </LangProvider>
        </SnackbarProvider>
    </BrowserRouter>
);
