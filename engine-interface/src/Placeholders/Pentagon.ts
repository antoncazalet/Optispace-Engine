export default {
    floorplan: {
        version: "1.0",
        corners: {
            "81e01389-1963-60e2-28e0-65c6a69b4143": { x: 7.087, y: 10.278, elevation: 4 },
            "b930e3c6-74a1-fdae-4c10-0a287d42e580": { x: 12.148, y: 5.428, elevation: 4 },
            "b73ad122-9290-787a-bd55-92e088dd84bb": { x: 17.359, y: 10.278, elevation: 4 },
            "adbb3cb5-9374-8862-0f4c-f935d0d55176": { x: 17.359, y: 16.829, elevation: 4 },
            "d9b3b12e-c159-0528-a15c-55ee146391d4": { x: 7.087, y: 16.829, elevation: 4 },
        },
        walls: [
            {
                corner1: "81e01389-1963-60e2-28e0-65c6a69b4143",
                corner2: "b930e3c6-74a1-fdae-4c10-0a287d42e580",
                frontTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
                backTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
            },
            {
                corner1: "b930e3c6-74a1-fdae-4c10-0a287d42e580",
                corner2: "b73ad122-9290-787a-bd55-92e088dd84bb",
                frontTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
                backTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
            },
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
        ],
        rooms: {
            "be630c22-c017-ce19-8d60-428dd429d814,8bfe0030-929c-1e0a-0372-dd7c4738682d,6f34db9a-73cf-1b36-7a5c-ee7e9f523c9d,8109c6f5-0961-275c-cb9e-f8aaf37ac9a6":
                { name: "My new room 0" },
            "81e01389-1963-60e2-28e0-65c6a69b4143,b930e3c6-74a1-fdae-4c10-0a287d42e580,b73ad122-9290-787a-bd55-92e088dd84bb,adbb3cb5-9374-8862-0f4c-f935d0d55176,d9b3b12e-c159-0528-a15c-55ee146391d4":
                { name: "My new room 0" },
        },
        wallTextures: [],
        floorTextures: {},
        newFloorTextures: {},
        units: "m",
    },
    items: [],
};
