import {
    Backdrop,
    Button,
    CircularProgress,
    Divider,
    FormControl,
    InputLabel,
    ListItem,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useSnackbar } from "notistack";
import React from "react";
import Requests from "../../API/Requests";
import { useLang } from "../../Context/LangProvider";
import { Parameters } from "../../Types/Project";

interface Props {
    reloadPlan: () => void;
    saveProject: () => Promise<void>;

    parameters: Parameters;
    projectId: string;
}

const AlgorithmPanel: React.FC<Props> = (props: Props) => {
    const { reloadPlan, saveProject, parameters, projectId } = props;
    const [isLoading, setLoading] = React.useState<boolean>(false);

    const { translate } = useLang();

    const [stateParameters, setParameters] = React.useState<Parameters>({
        employeeNumber: parameters.employeeNumber || 1,
        employeeDistance: parameters.employeeDistance || 1,
        algorithmGenerationMethod: parameters.algorithmGenerationMethod || "REGENERATE",
        ["optimize.employeeNumberToAdd"]: parameters["optimize.employeeNumberToAdd"] || 1,
    });

    const { enqueueSnackbar } = useSnackbar();

    const initWSServer = () => {
        const baseURL = `${process.env.PRODUCTION ? "wss" : "ws"}://api.optispace.fr:${
            process.env.PRODUCTION ? "8086" : "8085"
        }`;

        const ws = new WebSocket(baseURL);

        ws.addEventListener("open", (event) => {
            ws.send(projectId);
        });

        ws.addEventListener("message", (event) => {
            let currentStatus: { statusCode: number; statusMessage: string };

            try {
                currentStatus = JSON.parse(event.data);
            } catch (error) {
                return;
            }

            if (currentStatus.statusCode == 200) {
                setLoading(false);
                enqueueSnackbar(translate("ALGORITHM_PANEL.RESULT_SUCCESS"), { variant: "success" });
                reloadPlan();
            } else {
                setLoading(false);
                enqueueSnackbar(translate("ALGORITHM_PANEL.RESULT_FAILED"), { variant: "error" });
                reloadPlan();
            }
        });

        ws.addEventListener("error", (error) => {
            ws.close();
        });
    };

    const launchAlgorithm = async () => {
        for (const key in parameters) {
            if (parameters[key as keyof Parameters].toString().length === 0) {
                enqueueSnackbar(translate("ALGORITHM_PANEL.PARAMETERS_INCOMPLETE"), {
                    variant: "error",
                });
                return;
            }
        }
        await saveProject();
        await updateParameters();
        setLoading(true);
        Requests.startAlgorithm(projectId);
        initWSServer();
    };

    const updateParameters = async (key?: keyof Parameters, value?: string | number) => {
        const copyParameters = parameters as Record<keyof Parameters, string | number>;

        if (key && value) {
            const nb = parseInt(value as string, 10);

            if (nb < 0) {
                value = 0;
                enqueueSnackbar(translate("ALGORITHM_PANEL.PARAMETERS.NEGATIVE_NUMBER"), { variant: "error"});
            }
            copyParameters[key] = value;
            setParameters({ ...copyParameters } as Parameters);
        }

        for (const key in copyParameters) {
            if (copyParameters[key as keyof Parameters].toString().length === 0) {
                return;
            }
        }
        await Requests.saveAlgorithmParameters(projectId, copyParameters as Record<keyof Parameters, string | number>);
    };

    return (
        <Box>
            <Box>
                <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1101 }} open={isLoading}>
                    <Stack direction="column" justifyContent="center" alignItems="center" spacing={2}>
                        <CircularProgress color="inherit" />
                        <Typography variant="h5">{translate("ALGORITHM_PANEL.LOADING_SCREEN.TITLE")}</Typography>
                        <Typography>{translate("ALGORITHM_PANEL.LOADING_SCREEN.DESCRIPTION")}</Typography>
                    </Stack>
                </Backdrop>
            </Box>
            <Box>
                <ListItem>
                    <Typography variant="h5" sx={{ fontWeight: "bold" }} color="primary">
                        {translate("ALGORITHM_PANEL.GENERATOR_SETTINGS")}
                    </Typography>
                </ListItem>
                <ListItem>
                    <TextField
                        label={translate("ALGORITHM_PANEL.PARAMETERS.EMPLOYEES_NUMBER")}
                        type="number"
                        variant="standard"
                        fullWidth
                        value={stateParameters.employeeNumber}
                        onChange={(event) => updateParameters("employeeNumber", event.target.value)}
                    />
                </ListItem>
                <ListItem>
                    <TextField
                        label={translate("ALGORITHM_PANEL.PARAMETERS.EMPLOYEES_DISTANCE")}
                        type="number"
                        variant="standard"
                        fullWidth
                        value={stateParameters.employeeDistance}
                        onChange={(event) => updateParameters("employeeDistance", event.target.value)}
                    />
                </ListItem>
                <Divider />
                <ListItem>
                    <FormControl fullWidth>
                        <InputLabel id="select_1" sx={{ transform: "translate(0, -1.5px) scale(0.75)" }}>
                            {"Algorithm generation method"}
                        </InputLabel>
                        <Select
                            labelId={"select_1"}
                            variant="standard"
                            fullWidth
                            defaultValue={stateParameters.algorithmGenerationMethod}
                            onChange={(event) => updateParameters("algorithmGenerationMethod", event.target.value)}
                        >
                            <MenuItem value={"REGENERATE"}>Regenerate the entire floorplan</MenuItem>
                            <MenuItem value={"OPTIMIZE"}>Optimize the current floorplan</MenuItem>
                        </Select>
                    </FormControl>
                </ListItem>
                {stateParameters.algorithmGenerationMethod === "OPTIMIZE" && (
                    <ListItem>
                        <TextField
                            label={"Nombre d'employée à ajouter"}
                            type="number"
                            variant="standard"
                            fullWidth
                            value={stateParameters["optimize.employeeNumberToAdd"]}
                            onChange={(event) => updateParameters("optimize.employeeNumberToAdd", event.target.value)}
                        />
                    </ListItem>
                )}
            </Box>
            <Box>
                <Box sx={{ px: 2, py: 1 }}>
                    <Button fullWidth variant="contained" color="success" onClick={launchAlgorithm}>
                        {translate("ALGORITHM_PANEL.BUTTON_SUBMIT")}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default AlgorithmPanel;
