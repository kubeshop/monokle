import * as path from 'path';

export function getRecordingPath(platform: string, fileName?: string) {
  const paths = ['test-output', platform, 'screenshots'];
  if (fileName) {
    paths.push(fileName);
  }
  return path.join(...paths);
}

export async function pause(ms: number) {
  return new Promise(f => setTimeout(f, ms));
}
