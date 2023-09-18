
const os = require('os')
const fs = require('fs')
const path = require('path')
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const resizeImg = require('resize-img');

process.env.NODE_ENV ="production"

const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV !== "production"


// menu template
let mainWindow

// this will create the main window
function createMainWindow() {

     mainWindow = new BrowserWindow({
        title: "Image resizer",
        width: isDev ? 1000 : 700,
        height: 700,
        webPreferences:{
            contextIsolation:true,
            nodeIntegration:true,
            preload:path.join(__dirname,'preload.js')
        }
    })

    // open devtools if in dev env

    if (isDev) {
        mainWindow.webContents.openDevTools()
    }

    mainWindow.loadFile(path.join(__dirname, './App/index.html'))

}


// create about window

function createAboutWindow(){
    const aboutWindow = new BrowserWindow({
        title: "About",
        width: 300,
        height: 300
    })

    // open devtools if in dev env

    aboutWindow.loadFile(path.join(__dirname, './App/about.html'))

}

const menu = [
    ...(isMac?[{
        label:app.name,
        submenu:[
            {
                label:"About",
                click:createAboutWindow
            }
        ]
    }]:[]),
    {
        label: "File",
        submenu: [
            {
                label: 'Quit',
                click: () => app.quit(),
                accelerator: "CmdOrCtrl+w"
            }
        ]
    },
    ...(!isMac?[{
        label:"Help",
        submenu:[{
            label:"About",
            click:createAboutWindow
        }]
    }]:[])
]



// app is ready 
app.whenReady().then(() => {
    createMainWindow();
    const mainMenu = Menu.buildFromTemplate(menu)
    Menu.setApplicationMenu(mainMenu)


// remove all window from memory on close

mainWindow.on('closed', ()=>(mainWindow=null))

app.on('activate', ()=>{
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
    }
})
    







})

// responce to ipc renderer

ipcMain.on('image:resize', (e, options)=>{
    console.log(options)

    options.dest = path.join(os.homedir(), 'imageresizer')

    resizeImage(options)

})

async function resizeImage({imagPath, height, width, dest}){
    console.log('dest: ', dest);
    try {
        const newPath = await resizeImg(fs.readFileSync(imagPath), {
            width:+width,
            height:+height,

        })

        const fileName = path.basename(imagPath)
        console.log('fileName: ', fileName);

        // create dest folder if does not exist

        if(!fs.existsSync(dest)){
            fs.mkdirSync(dest)
        }
        fs.writeFileSync(path.join(dest, fileName), newPath)

// send success to rednerer

mainWindow.webContents.send('image:done')


// open the destination folder
shell.openPath(dest)

    } catch (error) {
        console.log('error: ', error);
        
    }
}


app.on('window-all-closed', () => {
    if (isMac) {
        app.quit()
    }
})