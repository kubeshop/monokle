import {existsSync, writeFile} from 'fs';
import fetch from 'node-fetch';
import util from 'util';

const writeFileAsync = util.promisify(writeFile);

export const downloadSchema = async (url: string, path: string) => {
  try {
    const res = await fetch(url);
    const body = await res.text();
    if (!existsSync(path)) {
      await writeFileAsync(path, body, {encoding: 'utf-8'});
    }
  } catch (error: any) {
    console.log(error.message);
  }
};

export const schemaExists = (path: string) => {
  return existsSync(path);
};
