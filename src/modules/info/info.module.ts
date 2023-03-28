import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InfoController } from './info.controller';
import { InfoService } from './info.service';
import { Info, infoSchema } from './schemas/info.schema';

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
  ],
  controllers: [InfoController],
  providers: [InfoService],
})
export class InfoModule {}
