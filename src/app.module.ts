import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        CUSTOM_AWS_S3_BUCKET_NAME: Joi.string(),
        CUSTOM_AWS_ACCESS_KEY_ID: Joi.string(),
        CUSTOM_AWS_SECRET_ACCESS_KEY: Joi.string(),
        CUSTOM_AWS_REGION: Joi.string(),
      })
    }),
    StorageModule
  ],
  controllers: [
    //AppController
  ],
  providers: [AppService],
})
export class AppModule { }
