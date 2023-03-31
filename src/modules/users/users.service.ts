import {
  Injectable,
  NotFoundException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createDto } from './dto/create.dto';
import { updateDto } from './dto/update.dto';
import { User, UserDocument } from './schemas/users.schema';

@Injectable()
export class UsersService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name, 'User')
    private readonly userModel: Model<UserDocument>,
  ) {}

  async getUsers(): Promise<User[]> {
    return await this.userModel.find();
  }

  async loginUser(payload: createDto): Promise<string> {
    const existingUser = await this.userModel.findOne(payload);

    if (!existingUser) {
      throw new HttpException('User not found, Register', HttpStatus.OK);
    }

    return this.jwtService.sign(existingUser._id.toString());
  }

  async registerUser(payload: createDto): Promise<string> {
    const existingUser = await this.userModel.findOne(payload);

    if (existingUser) {
      throw new HttpException('User already exists, Login', HttpStatus.OK);
    }

    const newUser = new this.userModel(payload);

    await newUser.save();

    return this.jwtService.sign(newUser._id.toString());
  }

  async updateUser(id: string, payload: updateDto): Promise<User> {
    const existingUser = await this.userModel
      .findByIdAndUpdate({ _id: id }, payload)
      .catch((err: unknown) => {
        throw new NotFoundException('User not found');
      });

    return existingUser;
  }

  async deleteUser(id: string): Promise<User> {
    const existingUser = await this.userModel
      .findByIdAndDelete({ _id: id })
      .catch((err: unknown) => {
        throw new NotFoundException('User not found');
      });

    return existingUser;
  }
}
