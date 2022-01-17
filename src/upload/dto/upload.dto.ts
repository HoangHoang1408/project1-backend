export class UploadFileOutput {
  fileReference: {
    fileUrl: string;
    filePath: string;
  };
}
export class UploadFilesOutput {
  fileReferences: {
    fileUrl: string;
    filePath: string;
  }[];
}
