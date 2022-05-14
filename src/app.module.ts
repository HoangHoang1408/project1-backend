import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ACCESS_JWT } from './common/constants/common.constants';
import { EmailModule } from './email/email.module';
import { FirebaseModule } from './firebase/firebase.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { UploadModule } from './upload/upload.module';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './src/env/.development.env',
      validationSchema: Joi.object({
        ACCESS_TOKEN_SECRET: Joi.string().required(),
        REFRESH_TOKEN_SECRET: Joi.string().required(),
        ACCESS_TOKEN_EXPIRES_IN: Joi.string().required(),
        REFRESH_TOKEN_EXPIRES_IN: Joi.string().required(),
        FIREBASE_APIKEY: Joi.string().required(),
        FIREBASE_AUTHDOMAIN: Joi.string().required(),
        FIREBASE_SOTRAGEBUCKET: Joi.string().required(),
        FIREBASE_APPID: Joi.string().required(),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.string().required(),
        DATABASE_USERNAME: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        DATABASE_SYNCHRONIZE: Joi.string().required(),
        DATABASE_LOGGING: Joi.string().required(),
      }),
    }),
    ScheduleModule.forRoot(),
    FirebaseModule.forRoot({
      apiKey: process.env.FIREBASE_APIKEY,
      storageBucket: process.env.FIREBASE_SOTRAGEBUCKET,
      authDomain: process.env.FIREBASE_AUTHDOMAIN,
      appId: process.env.FIREBASE_APPID,
    }),
    EmailModule.forRoot({
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
      from: process.env.EMAIL_FROM,
      clientDomain: process.env.CLIENT_DOMAIN,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      synchronize: process.env.DATABASE_SYNCHRONIZE === 'true' ? true : false,
      logging: process.env.DATABASE_LOGGING === 'true' ? true : false,
      autoLoadEntities: true,
    }),
    GraphQLModule.forRoot({
      cors: {
        origin: process.env.CLIENT_DOMAIN,
        credentials: true,
      },
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      subscriptions: {
        'subscriptions-transport-ws': {
          path: '/graphql',
          onConnect(params) {
            return { [ACCESS_JWT]: params[ACCESS_JWT] };
          },
        },
      },
      context: ({ req, res }) => {
        return { req, res, [ACCESS_JWT]: req.get(ACCESS_JWT) };
      },
    }),
    TypeOrmModule.forFeature([User]),
    AuthModule,
    UserModule,
    UploadModule,
    EmailModule,
    RestaurantModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
