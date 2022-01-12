interface ExtensionEntryOptions<ExtensionEntryType> {
  entryFileName: string;
  parseEntryFileContent: (content: string) => any;
  validateEntryFileContent: (x: any) => ExtensionEntryType;
}

interface ExtensionOptions<ExtensionEntryType, ExtensionType> {
  transformEntryFileContentToExtension: (f: ExtensionEntryType) => ExtensionType;
}

export interface LoadExtensionOptions<ExtensionEntryType, ExtensionType>
  extends ExtensionEntryOptions<ExtensionEntryType>,
    ExtensionOptions<ExtensionEntryType, ExtensionType> {
  folderPath: string;
}

export interface DownloadExtensionEntryOptions<ExtensionEntryType> extends ExtensionEntryOptions<ExtensionEntryType> {
  makeExtensionFolderPath: (entry: ExtensionEntryType) => string;
  entryFileUrl: string;
}

export interface DownloadExtensionOptions<ExtensionEntryType, ExtensionType>
  extends DownloadExtensionEntryOptions<ExtensionEntryType>,
    ExtensionOptions<ExtensionEntryType, ExtensionType> {
  extensionTarballUrl: string;
}
