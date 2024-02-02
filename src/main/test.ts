import axios from 'axios'
import fs from 'fs'
import path from 'path'

const downloadFile = async(url: string, pathFile: string): Promise<string> => {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
    })
    response.data.pipe(fs.createWriteStream(pathFile))
    return pathFile
  } catch(ex) {
    throw ex
  }
}

(async () => {
  const pathSave = path.join(__dirname, 'ffmpeg.zip')
  const ok = await downloadFile('https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip', pathSave)
  console.log('ok', ok);
})()