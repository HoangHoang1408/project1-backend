import { Module } from '@nestjs/common';
import { FirebaseModule } from './../firebase/firebase.module';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';


@Module({
  providers: [UploadService],
  controllers: [UploadController],
  imports: [FirebaseModule],
})
export class UploadModule {}
