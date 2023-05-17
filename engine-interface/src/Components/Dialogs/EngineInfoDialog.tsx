import { Box, Button, FormControlLabel, Grid, Switch, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import React from "react";
import { useLang } from "../../Context/LangProvider";
import * as Optispace from "../../Optiengine";
import { checkDeadTextureUrlInPlan } from "../../Utils/Check";

interface Props {
    engine: Optispace.Optiengine;
}

const EngineInfoDialog: React.FC<Props> = (props: Props) => {
    const { enqueueSnackbar } = useSnackbar();
    const { translate } = useLang();

    return (
        <Box sx={{ textAlign: "center" }}>
            <Box component="img" src={`${process.env.PRODUCTION ? "https" : "http"}://optispace.fr/assets/logo.png`} sx={{ height: "64px" }} />
            <Typography variant="h5">Optispace</Typography>
            <Box sx={{ pt: 1 }}>
                <Typography variant="body1">Version {process.env.VERSION}</Typography>
                <Typography variant="body1">{process.env.HASH}</Typography>
                <Typography variant="body1">
                    {process.env.DATE} ({process.env.PRODUCTION ? "Production" : "Développement"})
                </Typography>
            </Box>
            <Box sx={{ pt: 1 }}>
                <Typography variant="caption">©2022 Optispace</Typography>
            </Box>
            <Box sx={{ pt: 1 }}>
                <FormControlLabel
                    control={
                        <Switch
                            defaultChecked={Optispace.Configuration.getValue("debugMode")}
                            onChange={(event) => {
                                Optispace.Configuration.setValue("debugMode", event.target.checked);
                                window.location.reload();
                            }}
                        />
                    }
                    label="Debug"
                />
            </Box>
            {Optispace.Configuration.getValue("debugMode") && (
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            onClick={() => {
                                const plan = props.engine.model.exportSerialized();

                                console.log(plan);
                                console.log(JSON.parse(plan));
                            }}
                        >
                            Export plan (console)
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            onClick={() => {
                                const plan = props.engine.model.exportSerialized();

                                const element = document.createElement("a");
                                const file = new Blob([JSON.stringify(JSON.parse(plan), null, 2)], {
                                    type: "text/plain",
                                });
                                element.href = URL.createObjectURL(file);
                                element.download = "plan.json";
                                document.body.appendChild(element); // Required for this to work in FireFox
                                element.click();
                            }}
                        >
                            Download plan
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            onClick={async () => {
                                const input = prompt("Input your plan");

                                if (input) {
                                    const inp = JSON.parse(input);

                                    await checkDeadTextureUrlInPlan(inp);
                                    props.engine.model.loadObject(inp);
                                    enqueueSnackbar("OK", { variant: "success" });
                                }
                            }}
                        >
                            Import plan
                        </Button>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default EngineInfoDialog;
