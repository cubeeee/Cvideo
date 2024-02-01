import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  selectFile: async () => {
    return electronAPI.ipcRenderer.invoke('open-file-dialog')
  },
  minimizeApp: async () => {
    return electronAPI.ipcRenderer.invoke('minimize-app')
  },
  closeApp: async () => {
    return electronAPI.ipcRenderer.invoke('close-app')
  },
  maximizeApp: async () => {
    return electronAPI.ipcRenderer.invoke('maximize-app')
  },
  openFileDialog: async () => {
    return electronAPI.ipcRenderer.invoke('open-file-dialog')
  },
  openFolderDialog: async () => {
    return electronAPI.ipcRenderer.invoke('open-folder-dialog')
  },
  checkFolder: async (path: string) => {
    return electronAPI.ipcRenderer.invoke('check-folder', path)
  },
  cutVideo: async (pathVideos: string[], folderPath?: string, folderName?: string) => {
    return electronAPI.ipcRenderer.invoke('cut-video', {
      pathVideos,
      folderPath,
      folderName
    })
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
