import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { Box, FormControl, Grid, Tooltip } from "@mui/material";
import React from "react";
import { useLang } from "../Context/LangProvider";

interface Props {
    onChange: (value: string[]) => void;
    value: string[];
    label: string;
}

const Tags = [
    {
        name: "red",
        color: "#FF625B",
    },
    {
        name: "orange",
        color: "#FFB021",
    },
    {
        name: "yellow",
        color: "#FFEE26",
    },
    {
        name: "green",
        color: "#37FB56",
    },
    {
        name: "blue",
        color: "#28A3FF",
    },
    {
        name: "purple",
        color: "#E37EFF",
    },
    {
        name: "gray",
        color: "#9EA0AA",
    },
];

const TagInput: React.FunctionComponent<Props> = (props: Props) => {
    const { onChange, value } = props;

    const { translate } = useLang();

    const [addTag, setAddTag] = React.useState<string[]>(value);

    React.useEffect(() => {
        setAddTag(value);
    }, [value]);

    return (
        <FormControl fullWidth>
            <Grid container justifyContent={"space-evenly"} spacing={0}>
                {Tags.map((tag) => {
                    const isCurrentTag = addTag.indexOf(tag.name) !== -1;

                    return (
                        <Grid item xs={1} key={tag.name} sx={{ display: "flex", justifyContent: "center" }}>
                            <Box
                                onClick={() => {
                                    const index = addTag.indexOf(tag.name);
                                    if (index > -1) {
                                        addTag.splice(index, 1);
                                    } else {
                                        addTag.push(tag.name);
                                    }
                                    setAddTag([...addTag]);
                                    onChange([...addTag]);
                                }}
                            >
                                <Tooltip
                                    title={`${
                                        isCurrentTag ? translate("TAGS.DELETE") : translate("TAGS.ADD")
                                    } ${translate("TAGS.COLOR_TAG")} ${tag.name}`}
                                >
                                    <FiberManualRecordIcon
                                        sx={{
                                            color: tag.color,
                                            opacity: isCurrentTag ? 1 : 0.3,
                                            fontSize: "46px",
                                            "&:hover": {
                                                cursor: "pointer",
                                                transform: "scale(1.3)",
                                            },
                                        }}
                                    />
                                </Tooltip>
                            </Box>
                        </Grid>
                    );
                })}
            </Grid>
        </FormControl>
    );
};

export default TagInput;
