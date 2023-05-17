export default {
    floorplan: {
        version: "1.0",
        corners: {
            "be630c22-c017-ce19-8d60-428dd429d814": { x: 15.465, y: 10.811, elevation: 4 },
            "f76a0e79-bc48-b79f-5aa1-3b3c17477a7d": { x: 23.286, y: 10.811, elevation: 4 },
            "8bfe0030-929c-1e0a-0372-dd7c4738682d": { x: 25.528, y: 10.811, elevation: 4 },
            "fe26fa31-b372-6614-95e6-6f6673a4fe21": { x: 25.528, y: 13.055, elevation: 4 },
            "6f34db9a-73cf-1b36-7a5c-ee7e9f523c9d": { x: 25.528, y: 17.775, elevation: 4 },
            "8109c6f5-0961-275c-cb9e-f8aaf37ac9a6": { x: 15.465, y: 17.775, elevation: 4 },
            "bed6b45c-6856-1b17-5be5-923ca5eea57d": { x: 23.272, y: 13.038, elevation: 4 },
        },
        walls: [
            {
                corner1: "be630c22-c017-ce19-8d60-428dd429d814",
                corner2: "f76a0e79-bc48-b79f-5aa1-3b3c17477a7d",
                frontTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
                backTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
            },
            {
                corner1: "8bfe0030-929c-1e0a-0372-dd7c4738682d",
                corner2: "fe26fa31-b372-6614-95e6-6f6673a4fe21",
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
            {
                corner1: "f76a0e79-bc48-b79f-5aa1-3b3c17477a7d",
                corner2: "8bfe0030-929c-1e0a-0372-dd7c4738682d",
                frontTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
                backTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
            },
            {
                corner1: "f76a0e79-bc48-b79f-5aa1-3b3c17477a7d",
                corner2: "bed6b45c-6856-1b17-5be5-923ca5eea57d",
                frontTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
                backTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
            },
            {
                corner1: "bed6b45c-6856-1b17-5be5-923ca5eea57d",
                corner2: "fe26fa31-b372-6614-95e6-6f6673a4fe21",
                frontTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
                backTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
            },
            {
                corner1: "fe26fa31-b372-6614-95e6-6f6673a4fe21",
                corner2: "6f34db9a-73cf-1b36-7a5c-ee7e9f523c9d",
                frontTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
                backTexture: { url: "rooms/textures/wallmap.png", stretch: true, scale: 0 },
            },
        ],
        rooms: {
            "be630c22-c017-ce19-8d60-428dd429d814,8bfe0030-929c-1e0a-0372-dd7c4738682d,6f34db9a-73cf-1b36-7a5c-ee7e9f523c9d,8109c6f5-0961-275c-cb9e-f8aaf37ac9a6":
                { name: "My new room 0" },
            "be630c22-c017-ce19-8d60-428dd429d814,f76a0e79-bc48-b79f-5aa1-3b3c17477a7d,8bfe0030-929c-1e0a-0372-dd7c4738682d,6f34db9a-73cf-1b36-7a5c-ee7e9f523c9d,8109c6f5-0961-275c-cb9e-f8aaf37ac9a6":
                { name: "My new room 0" },
            "be630c22-c017-ce19-8d60-428dd429d814,f76a0e79-bc48-b79f-5aa1-3b3c17477a7d,bed6b45c-6856-1b17-5be5-923ca5eea57d,fe26fa31-b372-6614-95e6-6f6673a4fe21,6f34db9a-73cf-1b36-7a5c-ee7e9f523c9d,8109c6f5-0961-275c-cb9e-f8aaf37ac9a6":
                { name: "My new room 0" },
            "8bfe0030-929c-1e0a-0372-dd7c4738682d,6f34db9a-73cf-1b36-7a5c-ee7e9f523c9d,8109c6f5-0961-275c-cb9e-f8aaf37ac9a6,be630c22-c017-ce19-8d60-428dd429d814,f76a0e79-bc48-b79f-5aa1-3b3c17477a7d":
                { name: "My new room 1" },
            "6f34db9a-73cf-1b36-7a5c-ee7e9f523c9d,fe26fa31-b372-6614-95e6-6f6673a4fe21,bed6b45c-6856-1b17-5be5-923ca5eea57d,f76a0e79-bc48-b79f-5aa1-3b3c17477a7d,8bfe0030-929c-1e0a-0372-dd7c4738682d":
                { name: "My new room 2" },
            "8bfe0030-929c-1e0a-0372-dd7c4738682d,fe26fa31-b372-6614-95e6-6f6673a4fe21,bed6b45c-6856-1b17-5be5-923ca5eea57d,f76a0e79-bc48-b79f-5aa1-3b3c17477a7d":
                { name: "My new room 1" },
        },
        wallTextures: [],
        floorTextures: {},
        newFloorTextures: {},
        units: "m",
    },
    items: [],
};
