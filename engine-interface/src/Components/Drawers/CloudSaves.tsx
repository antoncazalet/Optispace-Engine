import { Cloud, Computer } from "@mui/icons-material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import TreeView from "@mui/lab/TreeView";
import { useSnackbar } from "notistack";
import React from "react";
import * as Optispace from "../../Optiengine";
import StyledTreeItem from "../Tree";

interface Props {
    engine: Optispace.Optiengine;
    projectId: string;
}

const CloudSaves = (props: Props) => {
    const { engine, projectId } = props;

    const [saves, setSaves] = React.useState<Record<string, string>>({});

    const { enqueueSnackbar } = useSnackbar();

    React.useEffect(() => {
        const reloadSave = () => {
            const saves = localStorage.getItem("saves");

            if (saves) {
                const savesJson = JSON.parse(saves);
                setSaves(savesJson[projectId] ?? {});
            }
        };

        window.addEventListener("storage", (event) => {
            reloadSave();
        });
        reloadSave();
    }, []);

    return (
        <>
            <TreeView
                defaultCollapseIcon={<ArrowDropDownIcon />}
                defaultExpandIcon={<ArrowRightIcon />}
                defaultEndIcon={<div style={{ width: 24 }} />}
                sx={{ flexGrow: 1, width: "100%", overflow: "hidden" }}
            >
                <StyledTreeItem nodeId="1" labelText={"Local saves"} labelIcon={Computer}>
                    {Object.keys(saves).map((save, index) => (
                        <StyledTreeItem
                            key={`save_${index}`}
                            nodeId={`save_${index}`}
                            labelText={`Sauvegarde du ${new Date(Number(save)).toLocaleString()}`}
                            labelIcon={Computer}
                            onClick={() => {
                                try {
                                    const saveJson = JSON.parse(saves[save]);
                                    engine.model.loadObject(saveJson);

                                    enqueueSnackbar("Save loaded", { variant: "success" });
                                } catch (err) {}
                            }}
                        />
                    ))}
                </StyledTreeItem>
                <StyledTreeItem nodeId="2" labelText={"Cloud saves"} labelIcon={Cloud}>
                    <StyledTreeItem nodeId="3" labelText={"Remote save"} labelIcon={Cloud} />
                </StyledTreeItem>
            </TreeView>
        </>
    );
};

export default CloudSaves;
