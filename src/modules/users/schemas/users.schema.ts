import Mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users' })
export class User {
  @Prop({
    type: Mongoose.Schema.Types.ObjectId,
  })
  readonly id: String;

  @Prop({
    type: String,
    required: true,
  })
  readonly name: string;

  @Prop({
    type: String,
    required: true,
  })
  readonly username: string;

  @Prop({
    type: String,
    required: true,
  })
  readonly email: String;

  @Prop({
    type: String,
    required: true,
  })
  readonly password: string;

  @Prop({
    type: String,
    required: true,
  })
  readonly role: string;
}

export const userSchema = SchemaFactory.createForClass(User);
