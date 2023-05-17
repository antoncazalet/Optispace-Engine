import React from "react";

import {
    Alert,
    Box,
    Card,
    Checkbox,
    CircularProgress,
    Grid,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    TextField,
    Typography,
} from "@mui/material";

import Requests from "../../../API/Requests";
import { useDrawer } from "../../../Context/DrawerProvider";
import { useLang } from "../../../Context/LangProvider";
import * as OptiEngine from "../../../Optiengine";
import { ItemMetadata } from "../../../Optiengine/types/file";
import Item from "../../../Types/Item";
import FurnituresCard from "./FurnitureCard";

const furnitureTypes = [
    { id: 0, visible: true, label: "FURNITURE.FURNITURE_TYPES.FURNITURE" },
    { id: 1, visible: true, label: "FURNITURE.FURNITURE_TYPES.FLOOR" },
    { id: 2, visible: true, label: "FURNITURE.FURNITURE_TYPES.WALL" },
    { id: 3, visible: true, label: "FURNITURE.FURNITURE_TYPES.DOOR_WINDOWS" },
    { id: 4, visible: true, label: "FURNITURE.FURNITURE_TYPES.CEILING" },
    { id: 5, visible: false, label: "FURNITURE.FURNITURE_TYPES.ID5" },
    { id: 6, visible: false, label: "FURNITURE.FURNITURE_TYPES.ID6" },
    { id: 7, visible: false, label: "FURNITURE.FURNITURE_TYPES.IN_WALL_FLOOR" },
    { id: 8, visible: false, label: "FURNITURE.FURNITURE_TYPES.ON_FLOOR" },
    { id: 9, visible: true, label: "FURNITURE.FURNITURE_TYPES.WALL_FLOOR" },
];

interface FurnituresDrawerProps {
    engine: OptiEngine.Optiengine;
}

const FurnituresDrawer = (props: FurnituresDrawerProps) => {
    const [furnitures, setFurnitures] = React.useState<Item[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [searchedName, setSearchedName] = React.useState<string>("");
    const [searchedTypes, setSearchedTypes] = React.useState<number[]>([]);
    const { closeDrawer } = useDrawer();
    const { translate } = useLang();

    React.useEffect(() => {
        setLoading(true);
        fetchFurnitures();
    }, []);

    const fetchFurnitures = async () => {
        const furnitures = await Requests.getFurnitures();

        if (!furnitures) {
            setLoading(false);
            return;
        }

        setFurnitures(furnitures);
        setLoading(false);
    };

    const addItem = (item: Item) => {
        const metadata: ItemMetadata = {
            itemName: item.name,
            resizable: true,
            modelUrl: `//api.optispace.fr/furnitureModel/${item.id}`,
            itemType: item.item_type,
            format: "gltf",
            rotation: 0,
            fixed: false,
        };

        const engine = props.engine;

        engine.model.scene.addItem(metadata, undefined);
        closeDrawer();
    };

    if (loading) {
        return (
            <Box sx={{ m: 8, textAlign: "center" }}>
                <CircularProgress size={128} thickness={3} sx={{ m: 4 }} />
                <Typography variant="h6" gutterBottom>
                    {translate("FURNITURE.LOADING_FURNITURES")}
                </Typography>
            </Box>
        );
    }

    const filteredFurnitures = furnitures.filter((furniture) => {
        if (furniture.item_type === 5 || furniture.item_type === 6) return false;
        if (searchedTypes.length > 0 && !searchedTypes.includes(furniture.item_type)) return false;
        if (searchedName.length > 0 && !furniture.name.toLowerCase().includes(searchedName.toLowerCase())) return false;
        return true;
    });

    return (
        <Grid container>
            <Grid item xs={12} sm={4} md={3} xl={2}>
                <Card sx={{ height: "100%" }}>
                    <List>
                        <ListItem>
                            <TextField
                                fullWidth
                                label={translate("FURNITURE.SEARCH_FURNITURES")}
                                value={searchedName}
                                onChange={(e) => setSearchedName(e.target.value)}
                            />
                        </ListItem>
                        <ListItem>
                            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                {translate("FURNITURE.FURNITURE_TYPES.TYPES")}
                            </Typography>
                        </ListItem>
                        <ListItem>
                            <List sx={{ width: "100%", margin: 0, padding: 0 }}>
                                {furnitureTypes
                                    .filter((type) => type.visible)
                                    .map((type) => (
                                        <ListItem key={type.id}>
                                            <ListItemText primary={translate(type.label as keyof typeof translate)} />
                                            <ListItemSecondaryAction>
                                                <Checkbox
                                                    edge="end"
                                                    onChange={(e) => {
                                                        const newTypes = [...searchedTypes];
                                                        if (e.target.checked) {
                                                            newTypes.push(type.id);
                                                        } else {
                                                            const index = newTypes.indexOf(type.id);
                                                            if (index > -1) {
                                                                newTypes.splice(index, 1);
                                                            }
                                                        }
                                                        setSearchedTypes(newTypes);
                                                    }}
                                                />
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                            </List>
                        </ListItem>
                    </List>
                </Card>
            </Grid>
            <Grid item xs={12} sm={8} md={9} xl={10}>
                <Grid container spacing={1} sx={{ padding: "8px" }}>
                    {filteredFurnitures.length === 0 ? (
                        <Alert severity="warning" style={{ width: "100%", paddingRight: "0px" }}>
                            {translate("FURNITURE.NO_FURNITURES")}
                        </Alert>
                    ) : (
                        filteredFurnitures.map((item: Item, index) => (
                            <FurnituresCard addItem={addItem} item={item} key={index} />
                        ))
                    )}
                </Grid>
            </Grid>
        </Grid>
    );
};

export default FurnituresDrawer;
