import React from "react";

import PreviewIcon from "@mui/icons-material/Preview";
import { Box, Card, CardHeader, Chip, Grid, IconButton } from "@mui/material";

import { useDialog } from "../../../Context/DialogProvider";
import { useLang } from "../../../Context/LangProvider";
import Item from "../../../Types/Item";
import GLTFPreview from "../../Preview/Preview";
import GLTFPreviewNoControls from "../../Preview/PreviewNoControls";

interface FurnituresCardProps {
    addItem: (item: Item) => void;
    item: Item;
}

const FurnituresCard = (props: FurnituresCardProps) => {
    const { item } = props;
    const [showAddButton, setShowAddButton] = React.useState(false);
    const { openDialog } = useDialog();
    const { translate } = useLang();

    const addItem = () => {
        props.addItem(item);
    };

    const openPreview = (item: Item) => {
        openDialog({
            fullScreen: false,
            fullWidth: true,
            maxWidth: "lg",
            cancelText: translate("DIALOG.CLOSE"),
            hideCancel: false,
            hideOk: true,
            content: (
                <Box>
                    <GLTFPreview height="80vh" src={`//api.optispace.fr/furnitureModel/${item.id}`} />
                </Box>
            ),
        });
    };

    return (
        <Grid item xs={12} sm={4} md={4} lg={3} xl={2}>
            <Card
                sx={{ height: "100%" }}
                onMouseOver={() => setShowAddButton(true)}
                onMouseOut={() => setShowAddButton(false)}
            >
                <CardHeader
                    titleTypographyProps={{
                        variant: "subtitle1",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                    title={item.name}
                    sx={{ ".MuiCardHeader-content": { maxWidth: "80%" }, justifyContent: "space-between" }}
                    action={
                        <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => openPreview(item)}>
                            <PreviewIcon />
                        </IconButton>
                    }
                />
                <Box sx={{ cursor: "pointer", height: "100%", position: "relative" }} onClick={addItem}>
                    <GLTFPreviewNoControls src={`//api.optispace.fr/furnitureModel/${item.id}`} />
                    {showAddButton && (
                        <Chip
                            size="small"
                            label={translate("FURNITURE.ADD")}
                            color="primary"
                            sx={{
                                cursor: "pointer",
                                position: "absolute",
                                top: "55%",
                                left: "50%",
                                transform: "translateX(-50%)",
                                whiteSpace: "nowrap",
                                width: "75%",
                            }}
                        />
                    )}
                </Box>
            </Card>
        </Grid>
    );
};

export default FurnituresCard;
