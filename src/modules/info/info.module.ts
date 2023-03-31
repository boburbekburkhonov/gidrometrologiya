import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, userSchema } from '../users/schemas/users.schema';
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
        {
          name: User.name,
          schema: userSchema,
        },
      ],
      'Info',
    ),
  ],
  controllers: [InfoController],
  providers: [InfoService],
})
export class InfoModule {}
