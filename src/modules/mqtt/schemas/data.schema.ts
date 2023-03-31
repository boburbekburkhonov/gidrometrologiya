import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import Mongoose, { HydratedDocument } from 'mongoose';

export type dataDocument = HydratedDocument<Data>;

@Schema({ collection: 'data' })
export class Data {
  @Prop({
    type: Mongoose.Schema.Types.UUID,
  })
  readonly id: String;

  @Prop({
    type: Number,
    required: true,
  })
  readonly imei: number;

  @Prop({
    type: Date,
    required: true,
  })
  readonly time: Date;

  @Prop({
    type: Number,
    required: true,
  })
  readonly windDirection: number;

  @Prop({
    type: Number,
    required: true,
  })
  readonly rainHeight: number;

  @Prop({
    type: Number,
    required: true,
  })
  readonly windSpeed: number;

  @Prop({
    type: Number,
    required: true,
  })
  readonly airHumidity: number;

  @Prop({
    type: Number,
    required: true,
  })
  readonly airTemp: number;

  @Prop({
    type: Number,
    required: true,
  })
  readonly airPressure: number;

  @Prop({
    type: Number,
    required: true,
  })
  readonly soilHumidity: number;

  @Prop({
    type: Number,
    required: true,
  })
  readonly soilTemp: number;

  @Prop({
    type: Number,
    required: true,
  })
  readonly leafHumidity: number;

  @Prop({
    type: Number,
    required: true,
  })
  readonly leafTemp: number;

  @Prop({
    type: String,
    required: true,
  })
  readonly typeSensor: string;

  @Prop({
    type: String,
    required: true,
  })
  readonly user: string;
}

export const dataSchema = SchemaFactory.createForClass(Data);
