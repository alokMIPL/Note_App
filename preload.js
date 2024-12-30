const { contextBridge, ipcRenderer } = require('electron');

// Expose only necessary APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  save: (text) => ipcRenderer.send('save', text),
});

ipcRenderer.on('saved', (event, savedFile) => {
  console.log(`File all file saved to ${savedFile}`);
})


// window.electronAPI.onSaved((event, results) => {
//   if (results === 'success') {
//     console.log(`Note Saved Successfully ${savedFile}`);
//     textarea.style.backgroundColor = "#000000";
//   } else {
//     textarea.style.backgroundColor = "red";
//     console.log('Error saving file');
//   }
// });