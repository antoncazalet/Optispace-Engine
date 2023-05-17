export default {
    floorplan: {
        version: "1.0",
        corners: {
            "b73ad122-9290-787a-bd55-92e088dd84bb": { x: 21.068, y: 10.191, elevation: 4 },
            "adbb3cb5-9374-8862-0f4c-f935d0d55176": { x: 17.359, y: 16.829, elevation: 4 },
            "d9b3b12e-c159-0528-a15c-55ee146391d4": { x: 7.087, y: 16.829, elevation: 4 },
            "81e01389-1963-60e2-28e0-65c6a69b4143": { x: 3.449, y: 10.191, elevation: 4 },
            "28f294b3-0af3-faf7-dd17-123a5a1a0442": { x: 7.087, y: 2.322, elevation: 4 },
            "4ad45ed2-49ca-4704-aed2-304e4af19aca": { x: 17.359, y: 2.322, elevation: 4 },
        },
        walls: [
            {
                corner1: "b73ad122-9290-787a-bd55-92e088dd84bb",
                corner2: "adbb3cb5-9374-8862-0f4c-f935d0d55176",
                frontTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
                backTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
            },
            {
                corner1: "adbb3cb5-9374-8862-0f4c-f935d0d55176",
                corner2: "d9b3b12e-c159-0528-a15c-55ee146391d4",
                frontTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
                backTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
            },
            {
                corner1: "d9b3b12e-c159-0528-a15c-55ee146391d4",
                corner2: "81e01389-1963-60e2-28e0-65c6a69b4143",
                frontTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
                backTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
            },
            {
                corner1: "81e01389-1963-60e2-28e0-65c6a69b4143",
                corner2: "28f294b3-0af3-faf7-dd17-123a5a1a0442",
                frontTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
                backTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
            },
            {
                corner1: "28f294b3-0af3-faf7-dd17-123a5a1a0442",
                corner2: "4ad45ed2-49ca-4704-aed2-304e4af19aca",
                frontTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
                backTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
            },
            {
                corner1: "4ad45ed2-49ca-4704-aed2-304e4af19aca",
                corner2: "b73ad122-9290-787a-bd55-92e088dd84bb",
                frontTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
                backTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
            },
        ],
        rooms: {
            "81e01389-1963-60e2-28e0-65c6a69b4143,b930e3c6-74a1-fdae-4c10-0a287d42e580,b73ad122-9290-787a-bd55-92e088dd84bb,adbb3cb5-9374-8862-0f4c-f935d0d55176,d9b3b12e-c159-0528-a15c-55ee146391d4":
                { name: "My new room 0" },
            "81e01389-1963-60e2-28e0-65c6a69b4143,28f294b3-0af3-faf7-dd17-123a5a1a0442,4ad45ed2-49ca-4704-aed2-304e4af19aca,b73ad122-9290-787a-bd55-92e088dd84bb,adbb3cb5-9374-8862-0f4c-f935d0d55176,d9b3b12e-c159-0528-a15c-55ee146391d4":
                { name: "My new room 0" },
        },
        wallTextures: [],
        floorTextures: {},
        newFloorTextures: {},
        units: "m",
    },
    items: [],
};
