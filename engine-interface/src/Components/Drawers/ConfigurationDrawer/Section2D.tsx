import { Input, ListItem, ListItemText, Switch, TextField, Typography } from "@mui/material";
import React from "react";
import { LangConsumer } from "../../../Context/LangProvider";
import * as Optispace from "../../../Optiengine";

interface Section2DProps {
    engine: Optispace.Optiengine;
}

interface Section2DState {
    showExteriorLabel: boolean;
    showInteriorLabel: boolean;
    showMidlineLabel: boolean;
    showLabels: boolean;
    exteriorLabel: string;
    interiorLabel: string;
    midlineLabel: string;
}

class Section2D extends React.Component<Section2DProps, Section2DState> {
    constructor(props: Section2DProps) {
        super(props);
        this.state = {
            showExteriorLabel: Optispace.wallInformation.exterior,
            showInteriorLabel: Optispace.wallInformation.interior,
            showMidlineLabel: Optispace.wallInformation.midline,
            showLabels: Optispace.wallInformation.labels,
            exteriorLabel: Optispace.wallInformation.exteriorlabel,
            interiorLabel: Optispace.wallInformation.interiorlabel,
            midlineLabel: Optispace.wallInformation.midlinelabel,
        };
    }

    get engine() {
        return Optispace;
    }

    update = () => {
        this.props.engine.View2D.zoom();
        this.props.engine.View2D.view.draw();
    };

    checkExteriorLabel = () => {
        Optispace.wallInformation.exterior = !this.state.showExteriorLabel;
        this.update();
        this.setState({ showExteriorLabel: !this.state.showExteriorLabel });
    };

    checkInteriorLabel = () => {
        Optispace.wallInformation.interior = !this.state.showInteriorLabel;
        this.update();
        this.setState({ showInteriorLabel: !this.state.showInteriorLabel });
    };

    checkMidlineLabel = () => {
        Optispace.wallInformation.midline = !this.state.showMidlineLabel;
        this.update();
        this.setState({ showMidlineLabel: !this.state.showMidlineLabel });
    };

    checkLabels = () => {
        Optispace.wallInformation.labels = !this.state.showLabels;
        this.update();
        this.setState({ showLabels: !this.state.showLabels });
    };

    handleMidlineLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        Optispace.wallInformation.midlinelabel = event.target.value;
        this.update();
        this.setState({ midlineLabel: event.target.value });
    };

    handleExteriorLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        Optispace.wallInformation.exteriorlabel = event.target.value;
        this.update();
        this.setState({ exteriorLabel: event.target.value });
    };

    handleInteriorLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        Optispace.wallInformation.interiorlabel = event.target.value;
        this.update();
        this.setState({ interiorLabel: event.target.value });
    };

    render() {
        return (
            <LangConsumer>
                {({ translate }) => (
                    <>
                        <ListItem>
                            <Typography variant="h6" sx={{ fontWeight: "bold" }} color="primary">
                                {translate("2D_MENU.WALL_MEASUREMENTS")}
                            </Typography>
                        </ListItem>
                        <ListItem dense button onClick={this.checkLabels}>
                            <ListItemText>{translate("2D_MENU.DISPLAY_LABELS")}</ListItemText>
                            <Switch size="small" checked={this.state.showLabels} />
                        </ListItem>
                        <ListItem dense button onClick={this.checkExteriorLabel}>
                            <ListItemText>{translate("2D_MENU.DISPLAY_EXTERIOR_LABELS")}</ListItemText>
                            <Switch size="small" checked={this.state.showExteriorLabel} />
                        </ListItem>
                        <ListItem dense button onClick={this.checkInteriorLabel}>
                            <ListItemText>{translate("2D_MENU.DISPLAY_INTERIOR_LABELS")}</ListItemText>
                            <Switch size="small" checked={this.state.showInteriorLabel} />
                        </ListItem>
                        <ListItem dense button onClick={this.checkMidlineLabel}>
                            <ListItemText>{translate("2D_MENU.DISPLAY_MIDLINE_LABELS")}</ListItemText>
                            <Switch size="small" checked={this.state.showMidlineLabel} />
                        </ListItem>
                        <ListItem dense>
                            <ListItemText>{translate("2D_MENU.EXTERIOR_LABEL")}</ListItemText>
                            <TextField
                                variant="standard"
                                value={this.state.exteriorLabel}
                                onChange={this.handleExteriorLabelChange}
                            />
                        </ListItem>
                        <ListItem dense>
                            <ListItemText>{translate("2D_MENU.INTERIOR_LABEL")}</ListItemText>
                            <TextField
                                variant="standard"
                                value={this.state.interiorLabel}
                                onChange={this.handleInteriorLabelChange}
                            />
                        </ListItem>
                        <ListItem dense>
                            <ListItemText>{translate("2D_MENU.MIDLINE_LABEL")}</ListItemText>
                            <TextField
                                variant="standard"
                                value={this.state.midlineLabel}
                                onChange={this.handleMidlineLabelChange}
                            />
                        </ListItem>
                    </>
                )}
            </LangConsumer>
        );
    }
}

export default Section2D;
