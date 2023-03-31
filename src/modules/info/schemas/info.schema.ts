import Mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/modules/users/schemas/users.schema';

export type infoDocument = HydratedDocument<Info>;

@Schema({ collection: 'info' })
export class Info {
  @Prop({
    type: Mongoose.Schema.Types.ObjectId,
  })
  readonly id: String;

  @Prop({
    type: String,
    required: true,
  })
  readonly name: String;

  @Prop({
    type: String,
    required: true,
  })
  readonly imei: string;

  @Prop({
    type: String,
    required: true,
  })
  readonly region: string;

  @Prop({
    type: String,
    required: true,
  })
  readonly district: string;

  @Prop({
    type: String,
    required: true,
  })
  readonly lon: string;

  @Prop({
    type: String,
    required: true,
  })
  readonly lat: string;

  @Prop({
    type: String,
    required: true,
  })
  readonly phoneNumber: string;

  @Prop({
    type: String,
  })
  readonly reservoirId: string;

  @Prop({
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  readonly user: User[];
}

export const infoSchema = SchemaFactory.createForClass(Info);
