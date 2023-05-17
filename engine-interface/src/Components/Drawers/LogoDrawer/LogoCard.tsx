import React from "react";

import { Box, Card, CardHeader, CardMedia, Chip, Grid } from "@mui/material";
import { useLang } from "../../../Context/LangProvider";
import { Logo } from "../../../Types/Logos";

interface LogosCardProps {
    addLogo: (logo: Logo) => void;
    logo: Logo;
}

const LogosCard = (props: LogosCardProps) => {
    const { logo, addLogo } = props;

    const [showAddButton, setShowAddButton] = React.useState(false);
    const { translate } = useLang();

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
                    title={logo.title}
                    sx={{ ".MuiCardHeader-content": { maxWidth: "80%" }, justifyContent: "space-between" }}
                />
                <Box sx={{ cursor: "pointer", height: "100%", position: "relative" }} onClick={() => addLogo(logo)}>
                    <CardMedia
                        component="img"
                        alt={logo.title}
                        height="140"
                        image={logo.src}
                        sx={{ objectFit: "contain" }}
                    />
                    {showAddButton && (
                        <Chip
                            size="small"
                            label={translate("LOGO_PANEL.ADD_LOGO")}
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

export default LogosCard;
