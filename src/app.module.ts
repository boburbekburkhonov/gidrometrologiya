import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from './config';
import { UsersModule } from './modules/users/users.module';
import { InfoModule } from './modules/info/info.module';
import { MqttModule } from './modules/mqtt/mqtt.module';

@Module({
  imports: [
    ConfigModule.forRoot(config),
    MongooseModule.forRoot(process.env.MONGO_URL, {
      connectionName: 'User',
    }),
    MongooseModule.forRoot(process.env.MONGO_URL, {
      connectionName: 'Info',
    }),
    MongooseModule.forRoot(process.env.MONGO_URL, {
      connectionName: 'Data',
    }),
    MongooseModule.forRoot(process.env.MONGO_URL, {
      connectionName: 'LastData',
    }),
    MongooseModule.forRoot(process.env.MONGO_URL, {
      connectionName: 'YesterdayData',
    }),
    MongooseModule.forRoot(process.env.MONGO_URL, {
      connectionName: 'YesterdayDataStatistic',
    }),
    MongooseModule.forRoot(process.env.MONGO_URL, {
      connectionName: 'OneYearData',
    }),
    UsersModule,
    InfoModule,
    MqttModule,
  ],
})
export class AppModule {}
