import { FormControl, InputLabel, ListItemText, MenuItem, Select } from "@mui/material";
import React from "react";
import {
    Chair,
    EventSeat,
    Flatware,
    FollowTheSigns,
    Grass,
    Kitchen,
    MeetingRoom,
    MoreHoriz,
    Shower,
    Warehouse,
    Wc,
} from "@mui/icons-material";
import { useLang } from "../Context/LangProvider";

interface Props {
    onChange: (value: string) => void;
    value: string;
    label: string;
}

const Rooms = [
    {
        name: "Living",
        type: "LIVING",
        icon: Chair,
    },
    {
        name: "Kitchen",
        type: "KITCHEN",
        icon: Kitchen,
    },
    {
        name: "Dining room",
        type: "DINING_ROOM",
        icon: Flatware,
    },
    {
        name: "Bathroom",
        type: "BATHROOM",
        icon: Shower,
    },
    {
        name: "Toilet",
        type: "TOILET",
        icon: Wc,
    },
    {
        name: "Office",
        type: "OFFICE",
        icon: EventSeat,
    },
    {
        name: "Meeting room",
        type: "MEETING_ROOM",
        icon: MeetingRoom,
    },
    {
        name: "Hallway",
        type: "HALLWAY",
        icon: FollowTheSigns,
    },
    {
        name: "Utility",
        type: "UTILITY",
        icon: Warehouse,
    },
    {
        name: "Terrace",
        type: "TERRACE",
        icon: Grass,
    },
    {
        name: "Other",
        type: "OTHER",
        icon: MoreHoriz,
    },
];

const RoomTypeSelect: React.FunctionComponent<Props> = (props: Props) => {
    const { onChange, value, label } = props;

    const { translate } = useLang();

    return (
        <FormControl fullWidth>
            <InputLabel id="room_type_select_label">{label}</InputLabel>
            <Select
                labelId="room_type_select_label"
                label={label}
                fullWidth
                sx={{ ".MuiSelect-select": { display: "flex", alignItems: "center" } }}
                value={value}
                onChange={(event) => onChange(event.target.value as string)}
            >
                {Rooms.map((room) => (
                    <MenuItem value={room.name.toLowerCase()} key={room.name.toLowerCase()}>
                        <room.icon fontSize="medium" />
                        <ListItemText style={{ marginLeft: "16px" }}>{translate(`ROOM_TYPE.${room.type.toUpperCase()}` as keyof typeof translate)}</ListItemText>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default RoomTypeSelect;
