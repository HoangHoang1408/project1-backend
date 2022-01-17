import { DynamicModule, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from './../common/constants/common.constants';
import { EmailOptions } from './constants/constants';
import { EmailService } from './email.service';

@Module({})
export class EmailModule {
  static forRoot(options: EmailOptions): DynamicModule {
    return {
      module: EmailModule,
      global: true,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        EmailService,
      ],
      exports: [EmailService],
    };
  }
}
