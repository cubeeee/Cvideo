import dayjs from 'dayjs';
import { BrowserWindow, Notification, app, dialog, ipcMain } from 'electron';
import ffmpeg from 'fluent-ffmpeg';
import { parseTime, getFFmpegPath } from './utils';
import fs from 'fs'
import { decompress } from './admZip'
import path from 'path'
import { downloadFileS3 } from './s3'

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

ipcMain.handle('check-resource', async() => {
  const { ffmpegPath, ffprobePath, ffmpegZipPath, ffmpegFolder } = getFFmpegPath();
  if (!fs.existsSync(ffmpegFolder)) {
    fs.mkdirSync(ffmpegFolder, {
      recursive: true
    });
  }
  if (fs.existsSync(ffmpegPath) && fs.existsSync(ffprobePath)) {
    new Notification({
      title: "Thông báo",
      body: "Tải tài nguyên thành công!"
    }).show()
    return Promise.resolve(true);
  } else {
    new Notification({
      title: "Thông báo",
      body: "Đang tải tài nguyên, vui lòng đợi trong giây lát"
    }).show()
    // download ffmpeg
    await downloadFileS3({
      fileKey: 'ffmpeg.zip',
      localPath: ffmpegZipPath
    })
    await decompress({
      inputFile: ffmpegZipPath,
      outputDir: ffmpegFolder
    });
    new Notification({
      title: "Thông báo",
      body: "Tải tài nguyên thành công!"
    }).show()
    return Promise.resolve(true);
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
    const { ffmpegPath, ffprobePath } = getFFmpegPath();
    ffmpeg.setFfmpegPath(ffmpegPath);
    ffmpeg.setFfprobePath(ffprobePath);
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