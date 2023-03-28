import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, userSchema } from './schemas/users.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt/dist';
import { UsersController } from './users.controller';
import { JwtStrategy } from './strategy/jwt.strategy';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: User.name,
          schema: userSchema,
        },
      ],
      'User',
    ),
    PassportModule,
    JwtModule.register({
      secret: '1q2w3e4r',
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy],
})
export class UsersModule {}
