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
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/mqtt', {
      connectionName: 'User',
    }),
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/mqtt', {
      connectionName: 'Info',
    }),
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/mqtt', {
      connectionName: 'Data',
    }),
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/mqtt', {
      connectionName: 'LastData',
    }),
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/mqtt', {
      connectionName: 'YesterdayData',
    }),
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/mqtt', {
      connectionName: 'YesterdayDataStatistic',
    }),
    UsersModule,
    InfoModule,
    MqttModule,
  ],
})
export class AppModule {}
