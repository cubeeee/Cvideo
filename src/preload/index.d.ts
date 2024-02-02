import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      selectFile: () => Promise<Electron.OpenDialogReturnValue>,
      minimizeApp: () => Promise<void>,
      closeApp: () => Promise<void>,
      maximizeApp: () => Promise<void>,
      openFileDialog: () => Promise<string>,
      checkFolder: (folderPath: string) => Promise<string[]>,
      openFolderDialog: () => Promise<string>,
      cutVideo: (pathVideos: string[], folderPath?: string, folderName?: string, cutTime?: number) => Promise<void>,
      checkResource: () => Promise<void>
    }
  }
}
