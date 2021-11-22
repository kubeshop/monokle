import fs from 'fs';
import fetch from 'node-fetch';

export async function downloadFile(sourceUrl: string, destinationFilePath: string): Promise<void> {
  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(`Downdload error: ${response.status} ${response.statusText}`);
  }

  return new Promise<void>((resolve, reject) => {
    const fileStream = fs.createWriteStream(destinationFilePath);

    if (!response.body) {
      throw new Error(`Download error: missing response body.`);
    }

    response.body.pipe(fileStream);

    response.body.on('error', err => {
      fileStream.close();
      if (fs.existsSync(destinationFilePath) && fs.statSync(destinationFilePath).isFile()) {
        fs.unlinkSync(destinationFilePath);
      }
      reject(err);
    });

    fileStream.on('finish', () => {
      fileStream.close();
      resolve();
    });
  });
}
