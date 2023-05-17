export default {
    floorplan: {
        version: "1.0",
        corners: {
            "6f34db9a-73cf-1b36-7a5c-ee7e9f523c9d": {
                x: 25.528,
                y: 17.775,
                elevation: 4,
            },
            "8109c6f5-0961-275c-cb9e-f8aaf37ac9a6": {
                x: 15.465,
                y: 17.775,
                elevation: 4,
            },
            "be630c22-c017-ce19-8d60-428dd429d814": {
                x: 15.465,
                y: 10.811,
                elevation: 4,
            },
            "26e7973a-164b-de72-4f0b-e18ab02e734c": {
                x: 25.505,
                y: 10.825,
                elevation: 4,
            },
            "f6abf283-2ced-aba2-9b29-290630d96ced": {
                x: 7.913,
                y: 17.826,
                elevation: 4,
            },
            "8993b48f-c4ac-3c05-a5f4-e0c91f7e8f5b": {
                x: 7.866,
                y: 0.62,
                elevation: 4,
            },
            "aa72792a-bbfc-e3f2-9d67-59256ba3462c": {
                x: 15.542,
                y: 0.643,
                elevation: 4,
            },
        },
        walls: [
            {
                corner1: "6f34db9a-73cf-1b36-7a5c-ee7e9f523c9d",
                corner2: "8109c6f5-0961-275c-cb9e-f8aaf37ac9a6",
                frontTexture: {
                    url: "rooms/textures/wallmap.png",
                    stretch: true,
                    scale: 0,
                },
                backTexture: {
                    url: "rooms/textures/wallmap.png",
                    stretch: true,
                    scale: 0,
                },
            },
            {
                corner1: "8109c6f5-0961-275c-cb9e-f8aaf37ac9a6",
                corner2: "be630c22-c017-ce19-8d60-428dd429d814",
                frontTexture: {
                    url: "rooms/textures/wallmap.png",
                    stretch: true,
                    scale: 0,
                },
                backTexture: {
                    url: "rooms/textures/wallmap.png",
                    stretch: true,
                    scale: 0,
                },
            },
            {
                corner1: "be630c22-c017-ce19-8d60-428dd429d814",
                corner2: "26e7973a-164b-de72-4f0b-e18ab02e734c",
                frontTexture: {
                    url: "rooms/textures/default_wall_texture.png",
                    stretch: true,
                    scale: 0,
                },
                backTexture: {
                    url: "rooms/textures/default_wall_texture.png",
                    stretch: true,
                    scale: 0,
                },
            },
            {
                corner1: "6f34db9a-73cf-1b36-7a5c-ee7e9f523c9d",
                corner2: "26e7973a-164b-de72-4f0b-e18ab02e734c",
                frontTexture: {
                    url: "rooms/textures/default_wall_texture.png",
                    stretch: true,
                    scale: 0,
                },
                backTexture: {
                    url: "rooms/textures/default_wall_texture.png",
                    stretch: true,
                    scale: 0,
                },
            },
            {
                corner1: "8109c6f5-0961-275c-cb9e-f8aaf37ac9a6",
                corner2: "f6abf283-2ced-aba2-9b29-290630d96ced",
                frontTexture: {
                    url: "rooms/textures/default_wall_texture.png",
                    stretch: true,
                    scale: 0,
                },
                backTexture: {
                    url: "rooms/textures/default_wall_texture.png",
                    stretch: true,
                    scale: 0,
                },
            },
            {
                corner1: "f6abf283-2ced-aba2-9b29-290630d96ced",
                corner2: "8993b48f-c4ac-3c05-a5f4-e0c91f7e8f5b",
                frontTexture: {
                    url: "rooms/textures/default_wall_texture.png",
                    stretch: true,
                    scale: 0,
                },
                backTexture: {
                    url: "rooms/textures/default_wall_texture.png",
                    stretch: true,
                    scale: 0,
                },
            },
            {
                corner1: "8993b48f-c4ac-3c05-a5f4-e0c91f7e8f5b",
                corner2: "aa72792a-bbfc-e3f2-9d67-59256ba3462c",
                frontTexture: {
                    url: "rooms/textures/default_wall_texture.png",
                    stretch: true,
                    scale: 0,
                },
                backTexture: {
                    url: "rooms/textures/default_wall_texture.png",
                    stretch: true,
                    scale: 0,
                },
            },
            {
                corner1: "aa72792a-bbfc-e3f2-9d67-59256ba3462c",
                corner2: "be630c22-c017-ce19-8d60-428dd429d814",
                frontTexture: {
                    url: "rooms/textures/default_wall_texture.png",
                    stretch: true,
                    scale: 0,
                },
                backTexture: {
                    url: "rooms/textures/default_wall_texture.png",
                    stretch: true,
                    scale: 0,
                },
            },
        ],
        rooms: {
            "be630c22-c017-ce19-8d60-428dd429d814,26e7973a-164b-de72-4f0b-e18ab02e734c,6f34db9a-73cf-1b36-7a5c-ee7e9f523c9d,8109c6f5-0961-275c-cb9e-f8aaf37ac9a6":
                {
                    name: "My new room 0",
                    type: "other",
                    tags: [],
                    colorTags: [],
                    floorTexture: "rooms/textures/default_floor_texture.jpg",
                },
            "be630c22-c017-ce19-8d60-428dd429d814,8109c6f5-0961-275c-cb9e-f8aaf37ac9a6,f6abf283-2ced-aba2-9b29-290630d96ced,8993b48f-c4ac-3c05-a5f4-e0c91f7e8f5b,aa72792a-bbfc-e3f2-9d67-59256ba3462c":
                {
                    name: "My new room 1",
                    type: "other",
                    tags: [],
                    colorTags: [],
                    floorTexture: "rooms/textures/default_floor_texture.jpg",
                },
        },
        wallTextures: [],
        floorTextures: {},
        newFloorTextures: {},
        units: "m",
        labels: [],
        images: [],
    },
    items: [],
};

