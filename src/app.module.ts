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
    MongooseModule.forRoot('mongodb://admin:password@127.0.0.1:27017/admin', {
      connectionName: 'User',
    }),
    MongooseModule.forRoot('mongodb://admin:password@127.0.0.1:27017/admin', {
      connectionName: 'Info',
    }),
    MongooseModule.forRoot('mongodb://admin:password@127.0.0.1:27017/admin', {
      connectionName: 'Data',
    }),
    MongooseModule.forRoot('mongodb://admin:password@127.0.0.1:27017/admin', {
      connectionName: 'LastData',
    }),
    MongooseModule.forRoot('mongodb://admin:password@127.0.0.1:27017/admin', {
      connectionName: 'YesterdayData',
    }),
    MongooseModule.forRoot('mongodb://admin:password@127.0.0.1:27017/admin', {
      connectionName: 'YesterdayDataStatistic',
    }),
    UsersModule,
    InfoModule,
    MqttModule,
  ],
})
export class AppModule {}
