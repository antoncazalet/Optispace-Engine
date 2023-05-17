import { Clear } from "@mui/icons-material";
import { Alert, Grid, IconButton, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useSnackbar } from "notistack";
import React from "react";
import { Helmet } from "react-helmet";
import Provider from "./API/Provider";
import Requests from "./API/Requests";
import AlgorithmPanel from "./Components/AlgorithmCenter/Algorithm";
import ShortcutDialog from "./Components/Dialogs/ShortcutDialog";
import CloudSaves from "./Components/Drawers/CloudSaves";
import ItemInfo from "./Components/Drawers/ConfigurationDrawer/ItemInfo";
import RoomInfo from "./Components/Drawers/ConfigurationDrawer/RoomInfo";
import PutImage from "./Components/Drawers/PutImage";
import WriteText from "./Components/Drawers/WriteText";
import Header from "./Components/Header";
import HelpCenter from "./Components/HelpCenter/HelpCenter";
import ToolBar from "./Components/ToolBar";
import WelcomeCenter from "./Components/WelcomeCenter/WelcomeCenter";
import { useDialog } from "./Context/DialogProvider";
import { useDrawer } from "./Context/DrawerProvider";
import { useKeyboardShotcut } from "./Context/KeyboardShortcutsProvider";
import { useLang } from "./Context/LangProvider";
import * as Optispace from "./Optiengine";
import { JSONFile } from "./Optiengine/types/file";
import { Project } from "./Types/Project";
import { ViewType } from "./Types/View";
import { WithEventListener } from "./Types/WithEventListener";
import { checkDeadTextureUrlInPlan } from "./Utils/Check";
import View2D from "./Views/2D";
import View3D from "./Views/3D";

const App: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { translate } = useLang();
    const { openDrawer, closeDrawer, isDrawerOpen } = useDrawer();
    const { openDialog, closeDialog } = useDialog();

    const [currentView, setCurrentView] = React.useState<ViewType>("3D");
    const [engine, setEngine] = React.useState<Optispace.Optiengine>();

    const [splashScreenError, setSplashScreenError] = React.useState<string>("");

    const [project, setProject] = React.useState<Project>();

    const [mode, setMode] = React.useState<number>(0);

    const [helpCenterOpen, setHelpCenterOpen] = React.useState<boolean>(false);
    const [algorithmPanelOpen, setAlgorithmPanelOpen] = React.useState<boolean>(false);

    const { subscribe, unsubscribe } = useKeyboardShotcut();

    React.useEffect(() => {
        if (!engine) {
            loadProjectFromAPI();
        }

        const interval = setInterval(() => {
            saveProject();
        }, 1000 * 60 * 5);

        return () => {
            clearInterval(interval);
        };
    }, [engine]);

    React.useEffect(() => {
        subscribe("Digit1", { ctrlKey: true }, switchTo2D);
        subscribe("Digit2", { ctrlKey: true }, switchTo3D);
        subscribe("Digit3", { ctrlKey: true }, switchTo3DOrtho);

        return () => {
            unsubscribe("Digit1", switchTo2D);
            unsubscribe("Digit2", switchTo3D);
            unsubscribe("Digit3", switchTo3DOrtho);
        };
    }, [engine, currentView]);

    const switchTo3D = () => {
        if (currentView === "3D") return;
        setCurrentView("3D");

        if (engine) {
            engine.model.floorplan.update("switchTo3D");
            engine.View3D.pauseTheRendering(false);
            engine.View3D.switchCamera(2);
            engine.View2D.resizeView();
        }
    };

    const switchTo2D = () => {
        if (currentView === "2D") return;
        setCurrentView("2D");

        if (engine) {
            engine.View3D.pauseTheRendering(true);
            engine.View2D.resizeView();
        }
    };

    const showStatus = (projectFile: JSONFile) => {
        if (projectFile.status && projectFile.status.placedWorkers && projectFile.status.remainingWorkers) {
            if (projectFile.status.remainingWorkers > 0) {
                enqueueSnackbar(
                    translate("STATUS_ALGORITHM.REMAINING_WORKERS")
                        .replace("{1}", projectFile.status.placedWorkers.toString())
                        .replace("{2}", (projectFile.status.remainingWorkers + projectFile.status.placedWorkers).toString()),
                    { variant: "info", autoHideDuration: 7000 }
                );
                return;
            }
        }
    }

    const switchTo3DOrtho = () => {
        if (currentView === "3D_ORTHO") return;
        setCurrentView("3D_ORTHO");

        if (engine) {
            engine.model.floorplan.update("switchTo3DOrtho");
            engine.View3D.pauseTheRendering(false);
            engine.View3D.switchCamera(1);
            engine.View2D.resizeView();
        }
    };

    const reloadPlan = async () => {
        if (engine) {
            const urlParams = new URLSearchParams(window.location.search);
            const projectId = urlParams.get("projectId")!;

            const projectFile = await Requests.fetchProjectFile(projectId).catch(() => undefined);
            if (!projectFile) {
                return;
            }

            await checkDeadTextureUrlInPlan(projectFile);
            engine.model.loadObject(projectFile);
            showStatus(projectFile);
        }
    };

    const loadProjectFromAPI = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get("projectId");
        const token = urlParams.get("token");

        if (!projectId) {
            setSplashScreenError(translate("ERROR_WRONG_URL"));
            return;
        }

        if (!token) {
            setSplashScreenError(translate("ERROR_TOKEN_NOT_FOUND"));
            return;
        }

        Provider.setAuthentificationToken(token);

        const project = await Requests.fetchProject(projectId).catch(() => undefined);

        if (!project) {
            setSplashScreenError(translate("ERROR_PROJECT_NOT_FOUND"));
            return;
        }

        const getPlan = async () => {
            const projectFile = await Requests.fetchProjectFile(projectId).catch(() => undefined);
            if (!projectFile) {
                enqueueSnackbar(`Fatal error no project file`, { variant: "error" });
                return;
            }
            const engine = new Optispace.Optiengine();

            try {
                await checkDeadTextureUrlInPlan(projectFile);
                engine.model.loadObject(projectFile);
                showStatus(projectFile);
            } catch (err) {
                enqueueSnackbar(`Fatal error (plan is invalid): ${err}`, { variant: "error" });
            }

            setEngine(engine);
            setProject(project.project);

            engine.model.floorplan.update("initialLoad");
            engine.View3D.pauseTheRendering(false);
            engine.View3D.switchCamera(2);
            engine.View2D.resizeView();

            engine.View3D.addEventListener(
                Optispace.EVENT_ITEM_SELECTED,
                (e: { item: WithEventListener<Optispace.Item> }) => {
                    const openItemDrawer = () =>
                        openDrawer({
                            content: <ItemInfo item={e.item} engine={engine} onDelete={closeDrawer} />,
                            headerTitle: translate("ITEM_PANEL.HEADER"),
                            width: 460,
                        });

                    if (!isDrawerOpen) {
                        openItemDrawer();
                    } else {
                        closeDrawer();
                        openItemDrawer();
                    }
                }
            );

            engine.View3D.addEventListener(Optispace.EVENT_ITEM_UNSELECTED, () => {
                closeDialog();
            });

            engine.View2D.floorplan.addEventListener(
                Optispace.EVENT_2D_TEXT_CLICKED,
                (e: { item: Optispace.TextLabelType }) => {
                    const openTextInfoDrawer = () =>
                        openDrawer({
                            content: <WriteText textEdit={e.item} engine={engine} closeDrawer={closeDrawer} />,
                            headerTitle: translate("UPDATE_TEXT"),
                            width: 460,
                        });

                    if (!isDrawerOpen) {
                        openTextInfoDrawer();
                    } else {
                        closeDrawer();
                        openTextInfoDrawer();
                    }
                }
            );

            engine.View2D.floorplan.addEventListener(
                Optispace.EVENT_2D_IMAGE_CLICKED,
                (e: { item: Optispace.ImageType }) => {
                    const openImageInfoDrawer = () =>
                        openDrawer({
                            content: <PutImage imageEdit={e.item} engine={engine} closeDrawer={closeDrawer} />,
                            headerTitle: translate("UPDATE_IMAGE"),
                            width: 460,
                        });

                    if (!isDrawerOpen) {
                        openImageInfoDrawer();
                    } else {
                        closeDrawer();
                        openImageInfoDrawer();
                    }
                }
            );

            engine.View2D.floorplan.addEventListener(Optispace.EVENT_ROOM_2D_CLICKED, (e: { room: Optispace.Room }) => {
                const openRoomInfoDrawer = () =>
                    openDrawer({
                        content: <RoomInfo room={e.room} engine={engine} />,
                        headerTitle: translate("ROOM_PANEL.HEADER"),
                        width: 460,
                    });

                if (!isDrawerOpen) {
                    openRoomInfoDrawer();
                } else {
                    closeDrawer();
                    openRoomInfoDrawer();
                }
            });

            engine.View2D.addEventListener(Optispace.EVENT_MODE_RESET, (e: { mode: number }) => {
                setMode(e.mode);
            });
        };

        const projectFile = await Requests.fetchProjectFile(projectId).catch(() => undefined);

        if (projectFile === undefined) {
            openDialog({
                content: (
                    <WelcomeCenter
                        onFinish={() => {
                            closeDialog();
                            getPlan();
                        }}
                    />
                ),
                fullScreen: false,
                fullWidth: true,
                maxWidth: "md",
                hideCancel: true,
                hideOk: true,
                disableOutsideClick: true,
            });
        } else {
            getPlan();
        }
    };

    const saveProject = async (showSnack: boolean = true) => {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get("projectId");
        const token = urlParams.get("token");

        if (engine && projectId && token) {
            const projectSave = engine.model.exportSerialized();
            const result = await Requests.saveProject(projectId, token, projectSave).catch(() => undefined);

            if (showSnack) {
                if (result) {
                    enqueueSnackbar(translate("PROJECT_SAVE_SUCCESS"), { variant: "success" });
                } else {
                    enqueueSnackbar(translate("PROJECT_SAVE_FAILED"), { variant: "error" });
                }
            }

            const saves = localStorage.getItem("saves");

            if (saves) {
                const savesJson = JSON.parse(saves);

                if (!savesJson[projectId]) {
                    savesJson[projectId] = {};
                }
                savesJson[projectId][new Date().getTime()] = projectSave;

                localStorage.setItem("saves", JSON.stringify(savesJson));
            } else {
                const savesJson: Record<string, Record<string, string>> = {};

                savesJson[projectId] = {};
                savesJson[projectId][new Date().getTime()] = projectSave;

                localStorage.setItem("saves", JSON.stringify(savesJson));
            }
            // Only allow 15 saves, delete the rest
            const savesJson = JSON.parse(localStorage.getItem("saves") as string);
            const savesProject = savesJson[projectId];
            const savesKeys = Object.keys(savesProject);

            while (savesKeys.length > 15) {
                delete savesProject[savesKeys[0]];
                savesKeys.shift();
            }
            localStorage.setItem("saves", JSON.stringify(savesJson));

            window.dispatchEvent(new Event("storage"));
        }
    };

    const openHelpCenter = () => {
        if (!helpCenterOpen) {
            openDrawer({
                content: <HelpCenter />,
                headerTitle: translate("HELP_CENTER_TAB.HEADER"),
                width: 460,
            });
            setHelpCenterOpen(true);
        } else {
            closeDrawer();
            setHelpCenterOpen(false);
        }
    };

    const openAlgorithmPanel = () => {
        if (!algorithmPanelOpen) {
            openDrawer({
                content: (
                    <AlgorithmPanel
                        parameters={project!.parameters}
                        reloadPlan={reloadPlan}
                        projectId={project!.id}
                        saveProject={() => saveProject(false)}
                    />
                ),
                headerTitle: translate("ALGORITHM_PANEL.HEADER"),
                width: 460,
            });
            setAlgorithmPanelOpen(true);
        } else {
            closeDrawer();
            setAlgorithmPanelOpen(false);
        }
    };

    const openShortcutDialog = () => {
        openDialog({
            fullScreen: false,
            fullWidth: true,
            maxWidth: "sm",
            cancelText: translate("DIALOG.CLOSE"),
            hideCancel: false,
            hideOk: true,
            content: <ShortcutDialog />,
            disableContentPadding: true,
        });
    };

    const openCloudSavesDrawer = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get("projectId");

        if (!isDrawerOpen) {
            openDrawer({
                content: <CloudSaves engine={engine!} projectId={projectId!} />,
                headerTitle: "Cloud saves",
                width: 460,
            });
        } else {
            closeDrawer();
        }
    };

    const isDisabled = project === undefined;

    return (
        <Box>
            <Helmet>
                <title>{`Optispace${project?.name ? ` - ${project.name}` : ""}`}</title>
                <link rel="icon" type="image/png" href="assets/favicon.ico" />
            </Helmet>
            <Header
                isDisabled={isDisabled}
                engine={engine!}
                projectName={project?.name}
                onSave={saveProject}
                onHelp={openHelpCenter}
                onLaunchAlgorithm={openAlgorithmPanel}
                onKeyboardShortcuts={openShortcutDialog}
                onCloudSaves={openCloudSavesDrawer}
                currentView={currentView}
            />
            <ToolBar
                isDisabled={isDisabled}
                engine={engine!}
                currentView={currentView}
                switchTo3D={switchTo3D}
                switchTo2D={switchTo2D}
                switchTo3DOrtho={switchTo3DOrtho}
            />
            <Box>
                {engine && engine.View2D.mode !== Optispace.floorplannerModes.MOVE && (
                    <Box id="errors" sx={{ left: "64px", position: "relative", zIndex: 9 }}>
                        <Alert severity="info" sx={{ justifyContent: "center", alignItems: "center" }}>
                            <Grid container direction="row" alignItems="center">
                                <Grid item>
                                    <Typography>{translate("EDITION_MODE")}</Typography>
                                </Grid>
                                <Grid item>
                                    <IconButton onClick={() => engine.View2D.setMode(Optispace.floorplannerModes.MOVE)}>
                                        <Clear />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Alert>
                    </Box>
                )}
            </Box>
            <Box id="interfaces" sx={{ display: splashScreenError ? "none" : "unset" }}>
                <View2D mode={mode} currentView={currentView} />
                <View3D currentView={currentView} />
            </Box>
            {splashScreenError && (
                <Box
                    id="errors"
                    sx={{
                        position: "relative",
                        justifyContent: "center",
                        display: "flex",
                        backgroundColor: "#ef9a9a",
                    }}
                >
                    <Alert severity="error" sx={{ backgroundColor: "#ef9a9a" }}>
                        {splashScreenError}
                    </Alert>
                </Box>
            )}
        </Box>
    );
};

export default App;
