import { Divider, ListItem, ListItemText, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import React from "react";
import { LangConsumer } from "../../../Context/LangProvider";
import * as Optispace from "../../../Optiengine";

interface UnitSectionProps {
    engine: Optispace.Optiengine;
}

interface UnitSectionState {
    unit: string;
}

class UnitSection extends React.Component<UnitSectionProps, UnitSectionState> {
    constructor(props: UnitSectionProps) {
        super(props);
        this.state = {
            unit: "e",
        };
    }

    update = () => this.props.engine.View2D.view.draw();

    onUnitChange = (event: SelectChangeEvent) => {
        const unitsLabel: Record<string, "feetAndInch" | "m" | "inch" | "cm" | "mm"> = {
            a: Optispace.dimFeetAndInch,
            b: Optispace.dimInch,
            c: Optispace.dimCentiMeter,
            d: Optispace.dimMilliMeter,
            e: Optispace.dimMeter,
        };

        Optispace.Configuration.setValue(Optispace.configDimUnit, unitsLabel[event.target.value]);
        this.update();
        this.setState({ unit: event.target.value as string });
    };

    render() {
        return (
            <LangConsumer>
                {({ translate }) => (
                    <>
                        <ListItem>
                            <Typography variant="h5" sx={{ fontWeight: "bold" }} color="primary">
                                {translate("UNIT_MENU.UNIT")}
                            </Typography>
                        </ListItem>
                        <ListItem>
                            <ListItemText>{translate("UNIT_MENU.UNIT")}</ListItemText>
                            <Select
                                variant="standard"
                                id="unit-select"
                                value={this.state.unit}
                                onChange={this.onUnitChange}
                            >
                                <MenuItem value="a">{translate("UNIT_MENU.UNIT_FEETS")}</MenuItem>
                                <MenuItem value="b">{translate("UNIT_MENU.UNIT_INCHES")}</MenuItem>
                                <MenuItem value="e">{translate("UNIT_MENU.UNIT_METERS")}</MenuItem>
                                <MenuItem value="c">{translate("UNIT_MENU.UNIT_CENTIMETERS")}</MenuItem>
                                <MenuItem value="d">{translate("UNIT_MENU.UNIT_MILLIMETERS")}</MenuItem>
                            </Select>
                        </ListItem>
                        <Divider />
                    </>
                )}
            </LangConsumer>
        );
    }
}

export default UnitSection;
