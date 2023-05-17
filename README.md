<div align="center">
  <a href="http://optispace.fr/" target="blank"><img src="http://optispace.fr/assets/logo.png" width="120" alt="Optispace Logo" /></a>
</div>
<div align="center">Optispace-Engine is a work-in-progress platform for designing and modeling complex architectures</div>

## Description

Optispace-Engine is one of the core project of Optispace. It aims to be a complete platform where users can visualize and play arround with their architectural plans. It is separated in 2 services:

-   The engine: it contains the entire source code for manipulating 3D (using [ThreeJS](https://threejs.org/) and 2D (using the [CanvasRenderingContext2D](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)).
-   The interface: it contains the front-end of the engine. It uses [Material-UI V5](https://mui.com) and manipulate the engine with a dedicated SDK.

## Prerequisites

-   Node version 14 and above
-   Docker (for production testing)

## Run app

If you want to start the two services at the same time, you can use the script at the root of the repo.

First use  
`npm install`.

Then (to generate the build files for each services)  
`npm run build:dev`

And finally  
`npm run start:watch`

The interface will be available at this location:
`http://localhost:8080/`

## Questions

For questions and support please use the official Discord channel. The issue list of this repo is **exclusively** for bug reports and feature requests.

## Issues

Please make sure to read the [Issue Reporting Documentation](https://gitlab.com/optispace/optispace-engine/optispace-engine/-/blob/master/CONTRIBUTING.MD) before opening an issue. Issues not conforming to the guidelines may be closed immediately.

## License

The Optispace-Engine is unlicensed.
