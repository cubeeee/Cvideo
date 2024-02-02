import os from 'os';
import path from 'path';


const PATH_ROOT = path.join(os.homedir(), '.cutvideo');

export const parseTime = (seconds: number) => {
  const hh = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const mm = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const ss = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
};

export const getRandomDuration = (min, max) => {
  return Math.random() * (max - min) + min;
};

export const getFFmpegPath = (): {
  ffmpegPath: string;
  ffprobePath: string;
  ffmpegZipPath: string;
  ffmpegFolder: string;
} => {
  return {
    ffmpegPath: path.join(PATH_ROOT, 'ffmpeg', 'ffmpeg.exe'),
    ffprobePath: path.join(PATH_ROOT, 'ffmpeg', 'ffprobe.exe'),
    ffmpegZipPath: path.join(PATH_ROOT, 'ffmpeg.zip'),
    ffmpegFolder: path.join(PATH_ROOT, 'ffmpeg'),
  };
}


