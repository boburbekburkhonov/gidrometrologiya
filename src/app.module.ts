import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from './config';
import { UsersModule } from './modules/users/users.module';
import { InfoModule } from './modules/info/info.module';

@Module({
  imports: [
    ConfigModule.forRoot(config),
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/n37', {
      connectionName: 'User',
    }),
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/n37', {
      connectionName: 'Info',
    }),
    UsersModule,
    InfoModule,
  ],
})
export class AppModule {}
