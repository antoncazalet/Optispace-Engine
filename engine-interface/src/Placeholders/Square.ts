export default {
    floorplan: {
        version: "1.0",
        corners: {
            "be630c22-c017-ce19-8d60-428dd429d814": { x: 15.811, y: 10.811, elevation: 4 },
            "8bfe0030-929c-1e0a-0372-dd7c4738682d": { x: 25.811, y: 10.811, elevation: 4 },
            "6f34db9a-73cf-1b36-7a5c-ee7e9f523c9d": { x: 25.811, y: 20.811, elevation: 4 },
            "8109c6f5-0961-275c-cb9e-f8aaf37ac9a6": { x: 15.811, y: 20.811, elevation: 4 },
        },
        walls: [
            {
                corner1: "be630c22-c017-ce19-8d60-428dd429d814",
                corner2: "8bfe0030-929c-1e0a-0372-dd7c4738682d",
                frontTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
                backTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
            },
            {
                corner1: "8bfe0030-929c-1e0a-0372-dd7c4738682d",
                corner2: "6f34db9a-73cf-1b36-7a5c-ee7e9f523c9d",
                frontTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
                backTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
            },
            {
                corner1: "6f34db9a-73cf-1b36-7a5c-ee7e9f523c9d",
                corner2: "8109c6f5-0961-275c-cb9e-f8aaf37ac9a6",
                frontTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
                backTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
            },
            {
                corner1: "8109c6f5-0961-275c-cb9e-f8aaf37ac9a6",
                corner2: "be630c22-c017-ce19-8d60-428dd429d814",
                frontTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
                backTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
            },
        ],
        rooms: {
            "ecbccaf4-9cfa-c900-7b1a-1bd8ad006808,9b5dc42e-9fae-0393-632b-d772e9bc3b1b,3893b592-562c-648d-6af0-986ed8e3cea8":
                { name: "My new room 0" },
            "be630c22-c017-ce19-8d60-428dd429d814,8bfe0030-929c-1e0a-0372-dd7c4738682d,6f34db9a-73cf-1b36-7a5c-ee7e9f523c9d,8109c6f5-0961-275c-cb9e-f8aaf37ac9a6":
                { name: "My new room 0" },
        },
        wallTextures: [],
        floorTextures: {},
        newFloorTextures: {},
        units: "m",
    },
    items: [],
};
