const { app, BrowserWindow,ipcMain, dialog, webContents, Menu } = require('electron'); // Import the electron module
const path = require('path');
const fs = require('fs');

let win

let savedFile = undefined 

// For Menu and SubMenu
const menuTemplate = [ 
  ...(process.platform === 'darwin' ? [{ 
    label: app.getName(),
    submenu: [
      {role: 'appMenu' } 
    ]
  }] : []),
  {
    label: 'File',
    submenu:[
      {
        label: 'Save',
        click () {win.webContents.send('save-clicked')}
      },
      {
        label: 'Save As',
        click () {console.log("save as from menu")}
      }
    ]
  },
  { role: "editMenu" },

];


function createWindow() {
   win = new BrowserWindow({
    width:900,
    height:600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      // enableRemoteModule: false,
    }
  })

  win.webContents.openDevTools()
  win.loadFile("index.html");

  // code for menu
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

}


ipcMain.on('save', async (event, text) => {
  if(savedFile===undefined) {
    try {
    // Show Save Dialog and get the result
    const result = await dialog.showSaveDialog(win, { defaultPath: "filename.txt"});
    
    if (result.canceled) {
      console.log("User canceled the save dialog");
      return;
    }

    const fullpath = result.filePath;  // Access the file path
    console.log(fullpath);  // Now the fullpath will be shown in the console
    
    if (fullpath) {
      savedFile = fullpath;
        writeToFile(text);
    }
  }catch (err) {
    console.error("An error occurred during the save operation:", err);
  }

} else {
    writeToFile(text);
}
});


/* Now this code for file location and saveing file use more that one time. So we make a function for that.*/

function writeToFile(data){
  fs.writeFile(savedFile, data, (err) => {
    if (err) {
      console.error("There was an error saving the file:", err);
      return;
    }
    console.log("File has been saved to:", savedFile);
    win.webContents.send('saved', 'success', savedFile); 
  });
}


// Handle app ready event
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit the app when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

