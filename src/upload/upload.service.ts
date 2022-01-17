import { Injectable } from '@nestjs/common';
import { FirebaseService } from './../firebase/firebase.service';
import { IMAGES_PATH } from './constant/constant';
import { UploadFileOutput, UploadFilesOutput } from './dto';

@Injectable()
export class UploadService {
  constructor(private readonly firebaseService: FirebaseService) {}
  uploadFile(file: Express.Multer.File): Promise<UploadFileOutput> {
    return this.firebaseService.uploadFile(file, IMAGES_PATH);
  }
  uploadFiles(files: Express.Multer.File[]): Promise<UploadFilesOutput> {
    return this.firebaseService.uploadFiles(files, IMAGES_PATH);
  }
}
