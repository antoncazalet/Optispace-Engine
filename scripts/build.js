const { exit } = require('process');

const Reset = "\x1b[0m";
const Bright = "\x1b[1m";
const Dim = "\x1b[2m";
const Underscore = "\x1b[4m";
const Blink = "\x1b[5m";
const Reverse = "\x1b[7m";
const Hidden = "\x1b[8m";

const FgBlack = "\x1b[30m";
const FgRed = "\x1b[31m";
const FgGreen = "\x1b[32m";
const FgYellow = "\x1b[33m";
const FgBlue = "\x1b[34m";
const FgMagenta = "\x1b[35m";
const FgCyan = "\x1b[36m";
const FgWhite = "\x1b[37m";

const BgBlack = "\x1b[40m";
const BgRed = "\x1b[41m";
const BgGreen = "\x1b[42m";
const BgYellow = "\x1b[43m";
const BgBlue = "\x1b[44m";
const BgMagenta = "\x1b[45m";
const BgCyan = "\x1b[46m";
const BgWhite = "\x1b[47m";

const Prefix = "[Optispace-Engine]";
const DIST_FOLDER = "./build";

let debug = true;

/**
 * Executes shell command as it would happen in BASH script
 * @param {string} command
 * @param {Object} [options] Object with options. Set `capture` to TRUE, to capture and return stdout. 
 *                           Set `echo` to TRUE, to echo command passed.
 * @returns {Promise<{code: number, data: string | undefined, error: Object}>}
 */
function exec(command, { capture = false, echo = false } = {}) {
    command = command.replace(/\\?\n/g, '');

    if (echo) {
        console.log(command);
    }

    const spawn = require('child_process').spawn;
    const childProcess = spawn('sh', ['-c', command], { stdio: capture ? 'pipe' : 'inherit' });

    return new Promise((resolve) => {
        let stdout = '';
        let stderr = '';

        if (capture) {
            childProcess.stdout.on('data', (data) => {
                stdout += data;
            });
            childProcess.stderr.on('data', (data) => {
                stderr += data;
            });
        }

        childProcess.on('error', function (error) {
            resolve({ code: 1, error: error });
        });

        childProcess.on('close', function (code) {
            if (code > 0) {
                if (debug) {
                    console.error(`${Prefix}: error / code ${code}\nLogs (stderr):\n${stderr}\nLogs (stdout):\n${stdout}`);
                }
                resolve({ code: code, error: 'Command failed with code ' + code });
            } else {
                resolve({ code: code, data: stdout });
            }
        });
    });
};

async function runNpmInstallAndBuild(folder) {
    const result = await exec(`cd ${folder} && npm install && npm run build`, { capture: true, echo: true });

    if (result.code !== 0) {
        throw new Error(`${Prefix}[Error] ${result.error}`);
    }
}

async function runNpmBuild(folder) {
    const result = await exec(`cd ${folder} && npm run build`, { capture: true, echo: true });

    if (result.code !== 0) {
        throw new Error(`${Prefix}[Error] ${result.error}`);
    }
}

async function runBuild(option, target) {
    if (target === "dev") {
        console.log(`${Prefix}: ${FgGreen}Building engine...${Reset}`);
        const engineBuild = await runNpmBuild("./engine");
        console.log(`${Prefix}: ${FgGreen}Engine built successfully${Reset}`);

        console.log(`${Prefix}: ${FgGreen}Cleaning all old engine-interface declarations...${Reset}`);
        const cleaningDeclarations = await exec(`rm -rf engine-interface/src/Optiengine`, { capture: true, echo: true });
        console.log(`${Prefix}: ${FgGreen}Cleaning complete${Reset}`);

        console.log(`${Prefix}: ${FgGreen}Compiling declarations...${Reset}`);
        const engineCompileDeclarationsAndCompile = await exec(`rm -rf engine-interface/src/Optiengine && cd ./engine && npm run build-declarations`, { capture: true, echo: true });
        console.log(`${Prefix}: ${FgGreen}Compilation complete${Reset}`);

        console.log(`${Prefix}: ${FgGreen}Copying engine SDK and declarations...${Reset}`);
        const engineCopyDeclarations = await exec(`cd ./engine && cp -r declarations ../engine-interface/src/Optiengine && cp build/optiengine.js ../engine-interface/src/Optiengine/index.js`, { capture: true, echo: true });
        console.log(`${Prefix}: ${FgGreen}Copying complete${Reset}`);
    } else if (target === "all") {
        console.log(`${Prefix}: ${FgGreen}Building engine...${Reset}`);
        const engineBuild = await runNpmInstallAndBuild("./engine");
        console.log(`${Prefix}: ${FgGreen}Engine built successfully${Reset}`);

        console.log(`${Prefix}: ${FgGreen}Cleaning all old engine-interface declarations...${Reset}`);
        const cleaningDeclarations = await exec(`rm -rf engine-interface/src/Optiengine`, { capture: true, echo: true });
        console.log(`${Prefix}: ${FgGreen}Cleaning complete${Reset}`);

        console.log(`${Prefix}: ${FgGreen}Compiling declarations...${Reset}`);
        const engineCompileDeclarationsAndCompile = await exec(`rm -rf engine-interface/src/Optiengine && cd ./engine && npm run build-declarations`, { capture: true, echo: true });
        console.log(`${Prefix}: ${FgGreen}Compilation complete${Reset}`);

        console.log(`${Prefix}: ${FgGreen}Copying engine SDK and declarations...${Reset}`);
        const engineCopyDeclarations = await exec(`cd ./engine && cp -r declarations ../engine-interface/src/Optiengine && cp build/optiengine.js ../engine-interface/src/Optiengine/index.js`, { capture: true, echo: true });
        console.log(`${Prefix}: ${FgGreen}Copying complete${Reset}`);

        console.log(`${Prefix}: ${FgGreen}Building engine-interface...${Reset}`);
        const engineInterfaceBuild = await runNpmInstallAndBuild("./engine-interface");
        console.log(`${Prefix}: ${FgGreen}Engine-interface built successfully${Reset}`);

        console.log(`${Prefix}: ${FgGreen}Cleaning build folder...${Reset}`);
        const cleaningDistFolder = await exec(`rm -rf ${DIST_FOLDER}`,
            { capture: true, echo: true });
        console.log(`${Prefix}: ${FgGreen}Cleaning complete${Reset}`);

        console.log(`${Prefix}: ${FgGreen}Copying build folder...${Reset}`);
        const copyDistFolder = await exec(`cp -r engine-interface/dist ${DIST_FOLDER}`,
            { capture: true, echo: true });
        console.log(`${Prefix}: ${FgGreen}Copying complete${Reset}`);

        console.log(`${Prefix}: ${FgGreen}The project has been compiled in the ${DIST_FOLDER} folder${Reset}`);
    } else if (target === "engine") {
        console.log(`${Prefix}: ${FgGreen}Building engine...${Reset}`);
        const engineBuild = await runNpmBuild("./engine");
        console.log(`${Prefix}: ${FgGreen}Engine built successfully${Reset}`);
    } else if (target === "engine-interface") {
        console.log(`${Prefix}: ${FgGreen}Building engine-interface...${Reset}`);
        const engineInterfaceBuild = await runNpmBuild("./engine-interface");
        console.log(`${Prefix}: ${FgGreen}Engine-interface built successfully${Reset}`);
    } else if (target === "declarations") {
        console.log(`${Prefix}: ${FgGreen}Compiling declarations...${Reset}`);
        const engineCompileDeclarationsAndCompile = await exec(`rm -rf engine-interface/src/Optiengine && cd ./engine && npm run build-declarations`, { capture: true, echo: true });
        console.log(`${Prefix}: ${FgGreen}Compilation complete${Reset}`);

        console.log(`${Prefix}: ${FgGreen}Copying engine SDK and declarations...${Reset}`);
        const engineCopyDeclarations = await exec(`cd ./engine && cp -r declarations ../engine-interface/src/Optiengine && cp build/optiengine.js ../engine-interface/src/Optiengine/index.js`, { capture: true, echo: true });
        console.log(`${Prefix}: ${FgGreen}Copying complete${Reset}`);
    }
}

(async function () {
    const arguments = process.argv;

    if (arguments.length < 3) {
        console.error(`${Prefix}: you need to provide an argument. Use --help flag to see available commands.`);
        return;
    }
    if (arguments.includes("--help")) {
        console.log(`${Prefix}: available commands are:\n- node build.js build [engine/engine-interface/all]\n- node build.js --help`);
        return;
    }
    if (arguments.includes("--debug")) {
        debug = true;
    }
    if (arguments.length >= 4) {
        const option = arguments[2];
        const target = arguments[3];

        if (option !== 'build') {
            console.log(`${Prefix}: build option is not supported.`);
            return;
        }

        if (target !== 'engine' && target && 'engine-interface' && target !== 'all' && target !== "dev" && target !== "declarations") {
            console.log(`${Prefix}: target option is not supported.`);
            return;
        }

        try {
            await runBuild(option, target);
        } catch (err) {
            console.error(err.toString());
            exit(84);
        }
        exit(0);
    } else {
        console.log(`${Prefix}: available commands are:\n- node build.js build [engine/engine-interface/all]\n- node build.js --help`);
        return;
    }
})();
