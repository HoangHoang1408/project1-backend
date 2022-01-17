import { DynamicModule, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from './../common/constants/common.constants';
import { FirebaseService } from './firebase.service';
import { FirebaseOption } from './interface/configOption.interface';

@Module({})
export class FirebaseModule {
  static forRoot(options: FirebaseOption): DynamicModule {
    return {
      module: FirebaseModule,
      global: true,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        FirebaseService,
      ],
      exports: [FirebaseService],
    };
  }
}
