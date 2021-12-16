export type LoadExtensionOptions<FileContentType, ExtensionType> = {
  folderPath: string;
  targetFileName: string;
  parseFileContent: (content: string) => any;
  isFileContentValid: (x: any) => x is FileContentType;
  transformFileContentToExtension: (f: FileContentType) => ExtensionType;
};
