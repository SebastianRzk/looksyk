import { app, BrowserWindow, globalShortcut } from 'electron';
import { spawn } from 'child_process';
import { BehaviorSubject, filter, firstValueFrom } from "rxjs";
import { ArgumentConfig, parse } from "ts-command-line-args";

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

interface Options {
    "graph-location"?: string
    port?: number
    title?: string,
    devtools?: boolean
}

function optionsToArgs(options: Options): string[]{
    const args: string[] = [];
    if(options.port){
        args.push(`--port=${options.port}`);
    }
    if(options["graph-location"]){
        args.push(`--graph-location=${options["graph-location"]}`);
    }
    if(options.title){
        args.push(`--title=${options.title}`);
    }
    return args;
}

const argumentConfig: ArgumentConfig<Options> = {
    port: {type: Number, optional: true},
    "graph-location": {type: String, optional: true},
    title: {type: String, optional: true},
    devtools: {type: Boolean, optional: true}
}

const args: Options = parse<Options>(argumentConfig, {argv: process.argv.slice(1), partial: true});
console.log("args", args);
const port: number = args.port ? args.port : 8989;


const apiServerCmd = './looksyk';
const apiServerArgs: string[] = optionsToArgs(args);
const pwd = process.env["PWD"];
console.log("apiServerArgs", apiServerArgs)
console.log("pwd", pwd)

function pollServer() {
    if (serverProcess.exitCode !== null) {
        serverUp.error("Server process exited");
        return;
    }

    console.log("poll")
    const request = new Request(
        `http://localhost:${port}/api/metainfo/`,
        {
            method: 'GET',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml'
            }
        });
    fetch(request).then((response) => {
        if (response.status === 200) {
            serverUp.next(true);
        } else {
            setTimeout(() => pollServer(), 100)
        }
    }).catch(() => {
        setTimeout(() => pollServer(), 100)
    });

}


const serverUp: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
const serverProcess = spawn(apiServerCmd, apiServerArgs, {cwd: pwd});
serverProcess.stdout.on('data', (data: unknown) => {
    console.log(`stdout: ${data}`);
});
serverProcess.stderr.on('data', (data: unknown) => {
    console.log(`stderr: ${data}`);
});


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = async (): Promise<void> => {
    pollServer();
    await firstValueFrom(serverUp.pipe(filter((up) => up)));
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        height: 800,
        width: 1600,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });
    mainWindow.on('app-command', (e, cmd) => {
        // Navigate the window back when the user hits their mouse back button
        if (cmd === 'browser-backward' && mainWindow.webContents.navigationHistory.canGoBack()) {
            mainWindow.webContents.navigationHistory.goBack();
        }
    })

    mainWindow.setMenu(null);

    // and load the index.html of the app.
    mainWindow.loadURL(`http://localhost:${port}/`);
    // Open the DevTools.
    if(args.devtools){
        mainWindow.webContents.openDevTools();
    }

    globalShortcut.register('Alt+Left', () => {
        mainWindow.webContents.navigationHistory.goBack();
    });
    globalShortcut.register('Alt+Right', () => {
        mainWindow.webContents.navigationHistory.goForward();
    });
    globalShortcut.register('Ctrl+R', () => {
        mainWindow.webContents.reload();
    });
    globalShortcut.register('Ctrl+0', () => {
        mainWindow.webContents.setZoomLevel(1);
    });
    globalShortcut.register('Ctrl+Plus', () => {
        mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() + 0.1);
    });
    globalShortcut.register('Ctrl+=', () => {
        mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() + 0.1);
    });
    globalShortcut.register('Ctrl+.', () => {
        mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() + 0.1);
    });
    globalShortcut.register('Ctrl+-', () => {
        mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() - 0.1);
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate',async () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        await createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
app.on('before-quit', () => {
    if (serverProcess) {
        serverProcess.kill();
    }
});