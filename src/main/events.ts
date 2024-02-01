import { dialog, ipcMain, app, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import ffprobePath from 'ffprobe-static';
import ffmpegPath from 'ffmpeg-static';
import dayjs from 'dayjs';
import { getRandomDuration, parseTime } from './utils';

console.log('ffmpegPath', ffmpegPath);
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
ipcMain.handle('check-folder', async (event, folderPath) => {
  try {
    if (!fs.existsSync(folderPath)) {
      throw new Error('Đường dẫn không tồn tại')
    }
    const files = fs.readdirSync(folderPath)
    console.log('files', files);
    const result = files.filter((file) => {
      const ext = path.extname(file)
      console.log('ext', ext);
      return ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.ts'].includes(ext)
    })
    if (!result.length) {
      return new Error('Không có file video nào trong thư mục')
    }
    return Promise.resolve(result)
  } catch (error) {
    console.log(error)
  }
})

// ipcMain.handle('cut-video', async (event, { pathVideos, folderPath, folderName }: { pathVideos: string[], folderPath: string, folderName: string }) => {
//   try {
//     const command = ffmpeg()
//     // get duration video
//     console.log('pathVideos', pathVideos);
//     const duration = await new Promise((resolve, reject) => {
//       ffmpeg.ffprobe(pathVideos[0], (err, metadata) => {
//         if (err) {
//           reject(err)
//         }
//         resolve(metadata?.format?.duration)
//       })
//     })
//     console.log('duration', duration);
//     // cut video
//     pathVideos.forEach((pathVideo, index) => {
//       const name = path.basename(pathVideo)
//       const ext = path.extname(pathVideo)
//       const nameVideo = name.replace(ext, '')
//       const newPath = path.join(`C:\Users\admin\Downloads\video`, 'cut', `${nameVideo}-${index + 1}${ext}`)
//       command.input(pathVideo)
//       command.outputOptions(['-c copy', '-t 00:00:10'])
//       command.save(newPath)
//     })
//     await new Promise<void>((resolve, reject) => {
//       command.on('end', () => {
//         resolve()
//       })
//       command.on('error', (err) => {
//         reject(err)
//       })
//       command.run()
//     })
//     return Promise.resolve()
//   } catch (error) {
//     console.log(error);
//   }
// })

ipcMain.handle('cut-video', async (event, { pathVideos, folderPath, folderName }: { pathVideos: string[], folderPath: string, folderName: string }) => {
  try {
    console.log('pathVideos', pathVideos);
    const dateNow = dayjs().format('YYYY-MM-DD-HH-mm-ss');
    const outputFolder = path.join(folderPath?.length > 0 ? folderPath[0] : `C:\\Users\\admin\\Downloads`, folderName ? `${folderName}-${dateNow}` : `cut-${dateNow}`);
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder);
    }

    // Loop through each video file
    for (let index = 0; index < pathVideos.length; index++) {

      const pathVideo = pathVideos[index];
      const name = path.basename(pathVideo);
      const ext = path.extname(pathVideo);
      const nameVideo = name.replace(ext, '');
      // Use fluent-ffmpeg to cut the video
      const duration = await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(pathVideo, (err, metadata) => {
          if (err) {
            reject(err)
          }
          resolve(metadata?.format?.duration)
        })
      })
      const durationLimit = duration as number;
      const minute = 10;
      const totalChunks = Math.ceil(Number(durationLimit) / 60 / minute);
      for (let index = 0; index < totalChunks; index++) {
        const randomDuration = getRandomDuration(minute * 60, Math.min(durationLimit, (totalChunks - index) * minute * 60));
        const newPath = path.join(outputFolder, `${nameVideo}-${index + 1}${ext}`);
        await new Promise<void>((resolve, reject) => {
          ffmpeg(pathVideo, { logger: console })
            .inputOptions([`-ss ${parseTime(index * minute * 60)}`])
            .outputOptions(['-c', 'copy', '-t', parseTime(randomDuration)])
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

    return Promise.resolve();
  } catch (error) {
    console.error(error);
    throw error;
  }
});