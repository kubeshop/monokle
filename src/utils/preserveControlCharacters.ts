export function preserveControlCharacters(str: string) {
  return str.replace(/[\n\r\t]/g, cc => {
    return `\\${cc === '\n' ? 'n' : cc === '\r' ? 'r' : 't'}`;
  });
}
