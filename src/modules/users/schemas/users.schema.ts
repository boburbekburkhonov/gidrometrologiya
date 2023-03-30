import Mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users' })
export class User {
  @Prop({
    type: Mongoose.Schema.Types.UUID,
  })
  readonly id: String;

  @Prop({
    type: String,
    required: true,
  })
  readonly username: String;

  @Prop({
    type: String,
    required: true,
  })
  readonly password: string;
}

export const userSchema = SchemaFactory.createForClass(User);
