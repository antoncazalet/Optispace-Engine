import { Image, MapsHomeWork, TextFields, ViewInAr } from "@mui/icons-material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import TreeView from "@mui/lab/TreeView";
import { Popover } from "@mui/material";
import Box from "@mui/material/Box";
import * as React from "react";
import { useDrawer } from "../../Context/DrawerProvider";
import { useLang } from "../../Context/LangProvider";
import * as Optispace from "../../Optiengine";
import { WithEventListener } from "../../Types/WithEventListener";
import StyledTreeItem from "../Tree";
import ItemInfo from "./ConfigurationDrawer/ItemInfo";
import RoomInfo from "./ConfigurationDrawer/RoomInfo";
import PutImage from "./PutImage";
import WriteText from "./WriteText";

interface Props {
    engine: Optispace.Optiengine;
}

const ObjectLists = (props: Props) => {
    const { engine } = props;
    const [texts, setTexts] = React.useState<Optispace.TextLabelType[]>([]);
    const [images, setImages] = React.useState<Optispace.ImageType[]>([]);
    const [objects, setObjects] = React.useState<Optispace.Item[]>([]);
    const [rooms, setRooms] = React.useState<Optispace.Room[]>([]);

    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const [popoverContent, setPopoverContent] = React.useState<{ type: string; data: unknown } | undefined>(undefined);

    const { openDrawer, closeDrawer } = useDrawer();
    const { translate } = useLang();

    React.useEffect(() => {
        const texts = engine.View2D.getAllText();
        const images = engine.View2D.getAllImages();
        const objects = engine.View3D.getAllObjects();
        const rooms = engine.View2D.getAllRooms();

        setTexts(texts);
        setImages(images);
        setObjects(objects);
        setRooms(rooms);
    }, []);

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>, type: string, data: unknown) => {
        setAnchorEl(event.currentTarget);
        setPopoverContent({ type, data });
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    return (
        <>
            <TreeView
                defaultCollapseIcon={<ArrowDropDownIcon />}
                defaultExpandIcon={<ArrowRightIcon />}
                defaultEndIcon={<div style={{ width: 24 }} />}
                sx={{ flexGrow: 1, width: "100%", overflow: "hidden" }}
            >
                <StyledTreeItem nodeId="1" labelText={translate("OBJECTS_LISTS.TEXTS")} labelIcon={TextFields}>
                    {texts.map((text, index) => (
                        <StyledTreeItem
                            key={`text_${index}`}
                            nodeId={`text_${index}`}
                            labelText={`${text.text}`}
                            labelIcon={TextFields}
                            color="#e3742f"
                            bgColor="#fcefe3"
                            onClick={() => {
                                openDrawer({
                                    content: <WriteText textEdit={text} engine={engine} closeDrawer={closeDrawer} />,
                                    headerTitle: translate("UPDATE_TEXT"),
                                    width: 460,
                                });
                            }}
                        />
                    ))}
                </StyledTreeItem>
                <StyledTreeItem nodeId="2" labelText={translate("OBJECTS_LISTS.IMAGES")} labelIcon={Image}>
                    {images.map((image, index) => (
                        <StyledTreeItem
                            key={`image_${index}`}
                            nodeId={`image_${index}`}
                            labelText={`Image #${index + 1}`}
                            labelIcon={Image}
                            color="#1a73e8"
                            bgColor="#e8f0fe"
                            onClick={() => {
                                openDrawer({
                                    content: <PutImage imageEdit={image} engine={engine} closeDrawer={closeDrawer} />,
                                    headerTitle: translate("UPDATE_IMAGE"),
                                    width: 460,
                                });
                            }}
                            onMouseEnter={(event) => handlePopoverOpen(event, "IMAGE", image)}
                            onMouseLeave={() => handlePopoverClose()}
                        />
                    ))}
                </StyledTreeItem>
                <StyledTreeItem nodeId="3" labelText={translate("OBJECTS_LISTS.OBJECTS")} labelIcon={ViewInAr}>
                    {objects.map((object, index) => (
                        <StyledTreeItem
                            key={`object_${index}`}
                            nodeId={`object_${index}`}
                            labelText={object.metadata.itemName}
                            labelIcon={ViewInAr}
                            color="#1a73e8"
                            bgColor="#e8f0fe"
                            onClick={() => {
                                openDrawer({
                                    content: (
                                        <ItemInfo
                                            item={object as WithEventListener<Optispace.Item>}
                                            engine={engine}
                                            onDelete={closeDrawer}
                                        />
                                    ),
                                    headerTitle: translate("ITEM_PANEL.HEADER"),
                                    width: 460,
                                });
                            }}
                        />
                    ))}
                </StyledTreeItem>
                <StyledTreeItem nodeId="4" labelText={translate("OBJECTS_LISTS.ROOMS")} labelIcon={MapsHomeWork}>
                    {rooms.map((room, index) => (
                        <StyledTreeItem
                            key={`room_${index}`}
                            nodeId={`room_${index}`}
                            labelText={room.name}
                            labelIcon={MapsHomeWork}
                            color="#1a73e8"
                            bgColor="#e8f0fe"
                            onClick={() => {
                                openDrawer({
                                    content: <RoomInfo room={room} engine={engine} />,
                                    headerTitle: translate("ROOM_PANEL.HEADER"),
                                    width: 460,
                                });
                            }}
                        />
                    ))}
                </StyledTreeItem>
            </TreeView>
            <Popover
                sx={{
                    pointerEvents: "none",
                }}
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: "center",
                    horizontal: "center",
                }}
                transformOrigin={{
                    vertical: "center",
                    horizontal: "center",
                }}
                onClose={handlePopoverClose}
                disableRestoreFocus
            >
                {popoverContent?.type === "IMAGE" && (
                    <Box sx={{ p: 1 }}>
                        <img
                            src={(popoverContent.data as Optispace.ImageType).src}
                            alt="image"
                            style={{ width: 100 }}
                        />
                    </Box>
                )}
            </Popover>
        </>
    );
};

export default ObjectLists;
