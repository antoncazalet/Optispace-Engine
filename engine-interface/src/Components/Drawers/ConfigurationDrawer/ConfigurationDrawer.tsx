import { List } from "@mui/material";
import React from "react";
import * as Optispace from "../../../Optiengine";
import { ViewType } from "../../../Types/View";
import Section2D from "./Section2D";
import UnitSection from "./UnitSection";

interface ConfigurationDrawerProps {
    engine: Optispace.Optiengine;
    currentView: ViewType;
}

class ConfigurationDrawer extends React.Component<ConfigurationDrawerProps> {
    constructor(props: ConfigurationDrawerProps) {
        super(props);
    }

    render() {
        const { engine, currentView } = this.props;

        return (
            <List>
                <UnitSection engine={engine} />
                {currentView === "2D" && <Section2D engine={engine} />}
            </List>
        );
    }
}

export default ConfigurationDrawer;
