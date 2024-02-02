import dotenv from 'dotenv'
import fs from 'fs'
import AWS from 'aws-sdk'
dotenv.config()

export const AWS_BUCKET_NAME = 'static'

export const downloadFileS3 = async ({ fileKey, localPath }: { fileKey: string, localPath: string }): Promise<string> => {
  const s3 = new AWS.S3({
    accessKeyId: '011559f19fc3185b6e657cbf6601d32e',
    secretAccessKey: 'e9a52bad4a592278067e0a7c50c993a6b80edc0c83546798bc7dd8b696219e04',
    endpoint: 'https://d289a0bcbd0fb9441424d557fa531942.r2.cloudflarestorage.com'
  });
  const metadata = await s3.headObject({ Bucket: AWS_BUCKET_NAME, Key: fileKey }).promise();
  const totalLength = metadata.ContentLength || 0;
  const readStream = s3.getObject({ Bucket: AWS_BUCKET_NAME, Key: fileKey }).createReadStream();
  const writeStream = fs.createWriteStream(localPath);
  let downloaded = 0;
  const progressBarLength = 50;
  const progressBar = Array(progressBarLength).fill(' ');
  readStream.on('data', (chunk) => {
    downloaded += chunk.length;
    if (process.platform == 'win32') {
      const percentage = Math.round((downloaded / totalLength) * 100);
      const progress = Math.round((downloaded / totalLength) * progressBarLength);
      for (let i = 0; i < progress; i++) {
        progressBar[i] = '=';
      }
      const message = `\r[${progressBar.join('')}] ${percentage}%`;
      process.stdout.write(message);
    }
  });
  readStream.pipe(writeStream);
  return new Promise<string>((resolve, reject) => {
    writeStream.on('finish', () => {
      process.stdout.write('\n');
      resolve(localPath);
    });
    writeStream.on('error', (err: Error) => {
      reject(err);
    });
  });
}

export default downloadFileS3