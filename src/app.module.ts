import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from './config';
import { UsersModule } from './modules/users/users.module';
import { InfoModule } from './modules/info/info.module';
import { MqttModule } from './modules/mqtt/mqtt.module';
import { CronService } from './modules/mqtt/cron.service';

@Module({
  imports: [
    ConfigModule.forRoot(config),
    MongooseModule.forRoot(
      'mongodb+srv://Boburbek:boburbek0119@cluster0.1i98rks.mongodb.net/mqtt',
      {
        connectionName: 'User',
      },
    ),
    MongooseModule.forRoot(
      'mongodb+srv://Boburbek:boburbek0119@cluster0.1i98rks.mongodb.net/mqtt',
      {
        connectionName: 'Info',
      },
    ),
    MongooseModule.forRoot(
      'mongodb+srv://Boburbek:boburbek0119@cluster0.1i98rks.mongodb.net/mqtt',
      {
        connectionName: 'Data',
      },
    ),
    MongooseModule.forRoot(
      'mongodb+srv://Boburbek:boburbek0119@cluster0.1i98rks.mongodb.net/mqtt',
      {
        connectionName: 'LastData',
      },
    ),
    MongooseModule.forRoot(
      'mongodb+srv://Boburbek:boburbek0119@cluster0.1i98rks.mongodb.net/mqtt',
      {
        connectionName: 'YesterdayData',
      },
    ),
    MongooseModule.forRoot(
      'mongodb+srv://Boburbek:boburbek0119@cluster0.1i98rks.mongodb.net/mqtt',
      {
        connectionName: 'YesterdayDataStatistic',
      },
    ),
    UsersModule,
    InfoModule,
    MqttModule,
  ],
})
export class AppModule {}
