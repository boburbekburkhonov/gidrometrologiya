import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Info, infoSchema } from '../info/schemas/info.schema';
import { InfoService } from '../info/info.service';
import { MqttService } from './mqtt.service';
import { Data, dataSchema } from './schemas/data.schema';
import { LastData, lastDataSchema } from './schemas/lastData.schema';
import { MqttController } from './mqtt.controller';
import {
  YesterdayData,
  yesterdayDataSchema,
} from './schemas/yesterdayData.schema';
import { CronService } from './cron.service';
import { ScheduleModule } from '@nestjs/schedule';
import { YesterdayDataStatistic, yesterdayDataStatisticSchema } from './schemas/yesterdayDataStatistic.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: Info.name,
          schema: infoSchema,
        },
      ],
      'Info',
    ),
    MongooseModule.forFeature(
      [
        {
          name: Data.name,
          schema: dataSchema,
        },
      ],
      'Data',
    ),
    MongooseModule.forFeature(
      [
        {
          name: LastData.name,
          schema: lastDataSchema,
        },
      ],
      'LastData',
    ),
    MongooseModule.forFeature(
      [
        {
          name: YesterdayData.name,
          schema: yesterdayDataSchema,
        },
      ],
      'YesterdayData',
    ),
    MongooseModule.forFeature(
      [
        {
          name: YesterdayDataStatistic.name,
          schema: yesterdayDataStatisticSchema,
        },
      ],
      'YesterdayDataStatistic',
    ),
    ScheduleModule.forRoot()
  ],
  providers: [InfoService, MqttService, CronService],
  controllers: [MqttController],
})

export class MqttModule {}
