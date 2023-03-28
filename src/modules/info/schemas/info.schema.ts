import Mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type infoDocument = HydratedDocument<Info>;

@Schema()
export class Info {
  @Prop({
    type: Mongoose.Schema.Types.UUID,
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
}

export const infoSchema = SchemaFactory.createForClass(Info);
