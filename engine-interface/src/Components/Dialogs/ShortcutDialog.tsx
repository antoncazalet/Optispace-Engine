import { Box, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { useSnackbar } from "notistack";
import React from "react";
import { useLang } from "../../Context/LangProvider";

interface Props {}

const Rows: { name: string; shortcut: string }[] = [
    {
        name: "TOGGLE_2D_VIEW",
        shortcut: "Ctrl + 1",
    },
    {
        name: "TOGGLE_3D_VIEW",
        shortcut: "Ctrl + 2",
    },
    {
        name: "TOGGLE_3D_VIEW_ORTHO",
        shortcut: "Ctrl + 3",
    },
];

const ShortcutDialog: React.FC<Props> = (props: Props) => {
    const { enqueueSnackbar } = useSnackbar();
    const { translate } = useLang();

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>{translate("KEYBOARD_SHORTCUTS")}</TableCell>
                    <TableCell align="right"></TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {Rows.map((row) => (
                    <TableRow key={row.name} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                        <TableCell component="th" scope="row">
                            {translate(`KB_SHORTCUTS.${row.name}` as keyof typeof translate)}
                        </TableCell>
                        <TableCell align="right">
                            <Box sx={{ fontWeight: "bold" }}>{row.shortcut}</Box>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default ShortcutDialog;
