import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import { Button, Tab, Tabs, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { DataGrid, GridActionsCellItem, GridColumns, GridRowParams, GridValueGetterParams, GridValueSetterParams } from "@mui/x-data-grid";
import React from "react";
import * as Optispace from "../Optiengine";

const TabContent = (props: { children?: React.ReactNode; index: number; value: number }) => {
    const { children, value, index } = props;

    return (
        <Box hidden={value !== index}>
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </Box>
    );
};

interface Props {
    engine: Optispace.Optiengine;
}

interface Person {
    id: number;
    firstName: string;
    lastName: string;
    team: string;
}

interface Team {
    id: number;
    name: string;
    room: string;
    members: string[];
}

const TeamsEditor = (props: Props) => {
    const { engine } = props;

    const [rowsPerson, setRowsPerson] = React.useState<Person[]>([]);
    const [rowsTeam, setRowsTeam] = React.useState<Team[]>([]);
    const [rooms, _] = React.useState<Optispace.Room[]>(engine.View2D.getAllRooms());

    const [value, setValue] = React.useState(0);

    React.useEffect(() => {
        const teamsConfig = engine.model.floorplan.teamsConfig;

        if (!teamsConfig || !teamsConfig.teams || !teamsConfig.members) {
            return;
        }

        const teams: Team[] = [];

        for (const key of Object.keys(teamsConfig.teams)) {
            const team = teamsConfig.teams[key];
            const teamRow: Team = {
                id: parseInt(key, 10),
                name: team.name,
                room: rooms.find((r) => r.roomByCornersId === team.room)?.name ?? "",
                members: team.members,
            };

            teams.push(teamRow);
        }

        const persons: Person[] = teamsConfig.members.map((member: any) => {
            return {
                id: member.id,
                firstName: member.firstName,
                lastName: member.lastName,
                team: teams.find((t) => t.members.includes(member.id))?.id ?? "",
            };
        });

        setRowsPerson(persons);
        setRowsTeam(teams);
    }, []);

    React.useEffect(() => {
        const teamsObj: Record<string, any> = {
            members: {},
            teams: {},
        };

        for (const team of rowsTeam) {
            teamsObj.teams[team.id.toString()] = {
                name: team.name,
                room: rooms.find((room) => room.name === team.room)?.roomByCornersId,
                size: rowsPerson.filter((person) => person.team === team.name).length,
                members: rowsPerson.filter((person) => person.team.toString() === team.id.toString()).map((person) => person.id),
                position: "ISLAND",
                color: "#000000",
            };
        }

        teamsObj.members = rowsPerson.map((person) => ({
            id: person.id,
            firstName: person.firstName,
            lastName: person.lastName,
            fullName: `${person.firstName} ${person.lastName}`,
        }));

        engine.model.floorplan.saveTeamsConfig(teamsObj);
    }, [rowsPerson, rowsTeam]);

    const handleChange = (_: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const columnsPersons: GridColumns<any> = [
        {
            field: "firstName",
            headerName: "First name",
            editable: true,
            flex: 1,
        },
        {
            field: "lastName",
            headerName: "Last name",
            editable: true,
            flex: 1,
        },
        {
            field: "team",
            headerName: "Team",
            type: "singleSelect",
            valueOptions: rowsTeam.map((team) => team.name),
            valueSetter: (params: GridValueSetterParams) => {
                return rowsTeam.find((team) => team.name.toString() === params.value.toString()?.id ?? "");
            },
            editable: true,
            flex: 1,
        },
        {
            field: "actions",
            type: "actions",
            flex: 1,
            renderHeader: () => (
                <Button
                    startIcon={<PeopleIcon />}
                    onClick={() => {
                        setRowsPerson([
                            ...rowsPerson,
                            {
                                id: rowsPerson.length + 1,
                                lastName: "New",
                                firstName: "User",
                                team: "",
                            },
                        ]);
                    }}
                >
                    Add person
                </Button>
            ),
            getActions: (params: GridRowParams) => [
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete"
                    onClick={() => {
                        setRowsPerson([...rowsPerson.filter((row) => row.id !== params.id)]);
                    }}
                />,
            ],
        },
    ];

    const columnsTeam: GridColumns<any> = [
        {
            field: "name",
            headerName: "Name",
            editable: true,
            flex: 1,
        },
        {
            field: "room",
            headerName: "Room assigned",
            type: "singleSelect",
            valueOptions: rooms.map((room) => room.name),
            editable: true,
            flex: 1,
        },
        {
            field: "actions",
            type: "actions",
            flex: 1,
            renderHeader: () => (
                <Button
                    startIcon={<PeopleIcon />}
                    onClick={() => {
                        setRowsTeam([
                            ...rowsTeam,
                            { id: rowsTeam.length + 1, name: "My new team", room: "", members: [] },
                        ]);
                    }}
                >
                    Add team
                </Button>
            ),
            getActions: (params: GridRowParams) => [
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete"
                    onClick={() => {
                        setRowsTeam([...rowsTeam.filter((row) => row.id !== params.id)]);
                    }}
                />,
            ],
        },
    ];

    return (
        <>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={value} onChange={handleChange} variant="fullWidth">
                    <Tab label="People" />
                    <Tab label="Teams" />
                </Tabs>
            </Box>
            <TabContent value={value} index={0}>
                <Box sx={{ height: 500, width: "100%" }}>
                    <DataGrid
                        rows={rowsPerson}
                        processRowUpdate={(newRow) => {
                            const rowsCopy = [...rowsPerson];

                            const foundRow = rowsCopy.find((row) => row.id === newRow.id);

                            if (foundRow) {
                                Object.assign(foundRow, newRow);
                            }

                            setRowsPerson(rowsCopy);
                            return newRow;
                        }}
                        columns={columnsPersons}
                        experimentalFeatures={{ newEditingApi: true }}
                        disableColumnMenu
                        isRowSelectable={() => false}
                        hideFooter
                        hideFooterPagination
                        hideFooterSelectedRowCount
                    />
                </Box>
            </TabContent>
            <TabContent value={value} index={1}>
                <Box sx={{ height: 500, width: "100%" }}>
                    <DataGrid
                        rows={rowsTeam}
                        processRowUpdate={(newRow) => {
                            const rowsCopy = [...rowsTeam];

                            const foundRow = rowsCopy.find((row) => row.id === newRow.id);

                            if (foundRow) {
                                Object.assign(foundRow, newRow);
                            }

                            setRowsTeam(rowsCopy);
                            return newRow;
                        }}
                        columns={columnsTeam}
                        experimentalFeatures={{ newEditingApi: true }}
                        disableColumnMenu
                        isRowSelectable={() => false}
                        hideFooter
                        hideFooterPagination
                        hideFooterSelectedRowCount
                    />
                </Box>
            </TabContent>
        </>
    );
};

export default TeamsEditor;
