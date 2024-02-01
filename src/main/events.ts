import dayjs from 'dayjs';
import { BrowserWindow, Notification, app, dialog, ipcMain } from 'electron';
import ffmpegPath from 'ffmpeg-static';
import ffprobePath from 'ffprobe-static';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { parseTime } from './utils';

ffmpeg.setFfmpegPath(ffmpegPath as string);
ffmpeg.setFfprobePath(ffprobePath.path);


// close app
ipcMain.handle('close-app', () => {
  app.quit()
})
// minimize app
ipcMain.handle('minimize-app', () => {
  const mainWindow = BrowserWindow.getFocusedWindow();
  if (mainWindow) {
    mainWindow.minimize();
  }
})
// maximize app
ipcMain.handle('maximize-app', () => {
  const mainWindow = BrowserWindow.getFocusedWindow();
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
})


ipcMain.handle('open-file-dialog', () => {
  const filePaths = dialog.showOpenDialogSync({
    title: 'Chọn địa chỉ tải xuống',
    defaultPath: app.getPath('downloads'),
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Videos', extensions: ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'ts'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  return Promise.resolve(filePaths)
})

ipcMain.handle('open-folder-dialog', () => {
  const folderPath = dialog.showOpenDialogSync({
    title: 'Chọn thư mục chứa video',
    defaultPath: app.getPath('downloads'),
    properties: ['openDirectory']
  })
  return Promise.resolve(folderPath)
})

// viết hàm lấy các file trong thư mục
ipcMain.handle('check-folder', async (_, folderPath) => {
  try {
    if (!fs.existsSync(folderPath)) {
      throw new Error('Đường dẫn không tồn tại')
    }
    const files = fs.readdirSync(folderPath)
    const result = files.filter((file) => {
      const ext = path.extname(file)
      return ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.ts'].includes(ext)
    })
    if (!result.length) {
      return new Error('Không có file video nào trong thư mục')
    }
    return Promise.resolve(result)
  } catch (error) {
    return Promise.reject(error)
  }
})


ipcMain.handle('cut-video', async (_, { pathVideos, folderPath, folderName, cutTime }: { pathVideos: string[], folderPath: string, folderName: string, cutTime: number }) => {
  try {
    const dateNow = dayjs().format('YYYY-MM-DD-HH-mm-ss');
    for (let index = 0; index < pathVideos.length; index++) {
      const pathVideo = pathVideos[index];
      const name = path.basename(pathVideo);
      const ext = path.extname(pathVideo);
      const nameVideo = name.replace(ext, '');
      const outputFolder = path.join(folderPath?.length > 0 ? folderPath[0] : `C:\\Users\\admin\\Downloads`, folderName ? `${folderName}-${dateNow}` : `${nameVideo}-${dateNow}`);
      if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder);
      }
      const duration = await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(pathVideo, (err, metadata) => {
          if (err) {
            reject(err)
          }
          resolve(metadata?.format?.duration)
        })
      })
      const durationLimit = duration as number;
      const time = cutTime ? (cutTime * 60) : 3600;
      const step = Math.ceil(durationLimit / time);
      const durationAverage = durationLimit / step;
      for (let index = 0; index < step; index++) {  
        const newPath = path.join(outputFolder, `${nameVideo}-${index + 1}${ext}`);
        await new Promise<void>((resolve, reject) => {
          ffmpeg(pathVideo, { logger: console })
            .inputOptions([`-ss ${parseTime(index * durationAverage)}`])
            .outputOptions(['-c', 'copy', '-t', parseTime(durationAverage)])
            .on('end', () => {
              resolve();
            })
            .on('error', (err) => {
              reject(err);
            })
            .save(newPath);
        });
      }
    }
    new Notification({
      title: "Thông báo",
      body: "Cắt video thành công!"
    }).show()
    return Promise.resolve();
  } catch (error) {
    console.error(error);
    throw error;
  }
});