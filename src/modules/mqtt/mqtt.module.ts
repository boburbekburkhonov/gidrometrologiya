import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Info, infoSchema } from '../info/schemas/info.schema';
import { InfoService } from '../info/info.service';
import { MqttService } from './mqtt.service';
import { Data, dataSchema } from './schemas/data.schema';
import { LastData, lastDataSchema } from './schemas/lastData.schema';
import { MqttController } from './mqtt.controller';

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
  ],
  providers: [InfoService, MqttService],
  controllers: [MqttController],
})
export class MqttModule {}
