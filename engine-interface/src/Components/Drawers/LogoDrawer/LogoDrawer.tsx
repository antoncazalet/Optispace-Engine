import React from "react";

import {
    Alert,
    Card,
    Checkbox,
    Grid,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    TextField,
    Typography,
} from "@mui/material";

import { useSnackbar } from "notistack";
import { useLang } from "../../../Context/LangProvider";
import * as OptiEngine from "../../../Optiengine";
import { Logo, LogoType } from "../../../Types/Logos";
import { loadImage } from "../../../Utils/Canvas";
import LogosCard from "./LogoCard";

interface LogosDrawerProps {
    engine: OptiEngine.Optiengine;
    close: () => void;
}

const LogosDrawer = (props: LogosDrawerProps) => {
    const { engine, close } = props;

    const [logos, setLogos] = React.useState<Logo[]>([]);
    const [logosTypes, setLogosTypes] = React.useState<LogoType[]>([]);

    const [searchedName, setSearchedName] = React.useState<string>("");
    const [searchedTypes, setSearchedTypes] = React.useState<string[]>([]);

    const { translate } = useLang();
    const { enqueueSnackbar } = useSnackbar();

    const parse = () => {
        let i = 0;
        const MAX_LIST_SIZE = 100;

        const lg = logos.filter((item) => {
            if (searchedTypes.length === 0 && searchedName.length === 0) return false;
            if (searchedTypes.length > 0 && !searchedTypes.includes(item.type)) return false;
            if (searchedName.length > 0 && !item.title.toLowerCase().includes(searchedName.toLowerCase())) return false;
            if (searchedName.length > 0 && i > MAX_LIST_SIZE) return false;
            i++;
            return true;
        });

        return lg;
    };

    const addLogo = async (logo: Logo) => {
        const img = await loadImage(logo.src);

        const options = {
            src: logo.src,
            type: "url" as "url",
            size: {
                width: img.width,
                height: img.height,
            },
        };

        engine.View2D.addImage(options);

        enqueueSnackbar("Logo added on the 2D plan", { variant: "success" });
        close();
    };

    const filteredLogos = parse();

    React.useEffect(() => {
        (async () => {
            const response: Record<string, Record<string, Omit<Logo, "type">>> = await fetch("/assets/logos.json")
                .then((response) => {
                    return response.json();
                })
                .catch((err) => {
                    console.log("Error Reading data " + err);
                });

            const array: Logo[] = [];
            Object.keys(response).forEach((key) => {
                Object.values(response[key]).forEach((logo) => {
                    array.push({
                        ...logo,
                        type: key,
                    });
                });
            });

            setLogos(array);
            setLogosTypes(
                Object.keys(response).map((key) => {
                    return { id: key, visible: true, label: key };
                })
            );
        })();
    }, []);

    return (
        <Grid container>
            <Grid item xs={12} sm={4} md={3} xl={2}>
                <Card sx={{ height: "100%" }}>
                    <List>
                        <ListItem>
                            <TextField
                                fullWidth
                                label={translate("LOGO_PANEL.SEARCH")}
                                value={searchedName}
                                onChange={(e) => setSearchedName(e.target.value)}
                            />
                        </ListItem>
                        <ListItem>
                            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                {translate("LOGO_PANEL.LOGO_TYPES")}
                            </Typography>
                        </ListItem>
                        <ListItem>
                            <List sx={{ width: "100%", margin: 0, padding: 0 }}>
                                {logosTypes
                                    .filter((type) => type.visible)
                                    .map((type) => (
                                        <ListItem key={type.id}>
                                            <ListItemText
                                                primary={translate(
                                                    `LOGO_PANEL.CATEGORIES.${type.label}` as keyof typeof translate
                                                )}
                                            />
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
                    {filteredLogos.length === 0 ? (
                        <Alert severity="warning" style={{ width: "100%", paddingRight: "0px" }}>
                            {searchedName.length > 0 && searchedTypes.length >= 0 && (
                                <>{translate("LOGO_PANEL.AFFINATE_SEARCH")}</>
                            )}
                            {searchedName.length === 0 && searchedTypes.length === 0 && (
                                <>{translate("LOGO_PANEL.SEARCH_DEFAULT")}</>
                            )}
                        </Alert>
                    ) : (
                        filteredLogos.map((logo: Logo, index) => (
                            <LogosCard addLogo={(l) => addLogo(l)} logo={logo} key={index} />
                        ))
                    )}
                </Grid>
            </Grid>
        </Grid>
    );
};

export default LogosDrawer;
