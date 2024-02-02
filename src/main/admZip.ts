import fs from 'fs';
import AdmZip from 'adm-zip';
import { exec } from 'child_process';

export const decompress = async({ inputFile, outputDir }: {
  inputFile: string;
  outputDir: string;
}) => {
  try {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    if (inputFile.includes('.zip')) {
      const zip = new AdmZip(inputFile);
      zip.extractAllTo(outputDir, true);
    } else {
      exec(`tar xzf ${inputFile} --directory ${outputDir}`);
    }
    return outputDir;
  } catch(ex) {
    throw ex;
  }
}

export const compress = ({ inputDir, outputFile }: {
  inputDir: string;
  outputFile: string;
}) => {
  try {
    const zip = new AdmZip();
    zip.addLocalFolder(inputDir);
    zip.writeZip(outputFile);
    return outputFile;
  } catch(ex) {
    throw ex;
  }
}