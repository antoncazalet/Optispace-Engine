import { Add } from "@mui/icons-material";
import { Box } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import * as React from "react";

interface Props {
    onChange: (url: string) => void;
}

const SelectFloorTexture = (props: Props) => {
    const { onChange } = props;
    const [data, setData] = React.useState<{ url: string; name: string }[]>([]);

    React.useEffect(() => {
        (async () => {
            const response = await fetch("/assets/floor_textures_wood.json")
                .then((response) => {
                    return response.json();
                })
                .catch((err) => {
                    console.log("Error Reading data " + err);
                });
            setData(response.wood);
        })();
    }, []);

    return (
        <ImageList>
            {data.map((item) => (
                <ImageListItem key={item.url}>
                    <Box component="img" src={`${item.url}`} loading="lazy" sx={{ width: "256px", height: "256px" }} />
                    <ImageListItemBar
                        title={item.name}
                        actionIcon={
                            <IconButton
                                sx={{ color: "rgba(255, 255, 255, 0.54)" }}
                                aria-label={`Add ${item.name}`}
                                onClick={() => {
                                    onChange(item.url);
                                }}
                            >
                                <Add />
                            </IconButton>
                        }
                    />
                </ImageListItem>
            ))}
        </ImageList>
    );
};

const itemData: { img: string; title: string }[] = [
    {
        img: "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e",
        title: "Breakfast",
    },
    {
        img: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d",
        title: "Burger",
    },
    {
        img: "https://images.unsplash.com/photo-1522770179533-24471fcdba45",
        title: "Camera",
    },
    {
        img: "https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c",
        title: "Coffee",
    },
    {
        img: "https://images.unsplash.com/photo-1533827432537-70133748f5c8",
        title: "Hats",
    },
    {
        img: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62",
        title: "Honey",
    },
    {
        img: "https://images.unsplash.com/photo-1516802273409-68526ee1bdd6",
        title: "Basketball",
    },
    {
        img: "https://images.unsplash.com/photo-1518756131217-31eb79b20e8f",
        title: "Fern",
    },
    {
        img: "https://images.unsplash.com/photo-1597645587822-e99fa5d45d25",
        title: "Mushrooms",
    },
    {
        img: "https://images.unsplash.com/photo-1567306301408-9b74779a11af",
        title: "Tomato basil",
    },
    {
        img: "https://images.unsplash.com/photo-1471357674240-e1a485acb3e1",
        title: "Sea star",
    },
    {
        img: "https://images.unsplash.com/photo-1589118949245-7d38baf380d6",
        title: "Bike",
    },
];

export default SelectFloorTexture;
