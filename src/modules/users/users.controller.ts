import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  Param,
  Patch,
  Delete,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schemas/users.schema';
import { createDto } from './dto/create.dto';
import { updateDto } from './dto/update.dto';
import { loginDto } from './dto/login';
import { CustomeRequest } from 'src/types';
import { JwtGuard } from './guards/jwt.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @UseGuards(JwtGuard)
  @Get('profile')
  getUserId(@Req() request: CustomeRequest): Promise<User[]> {
    return this.service.getUserId(request.userId);
  }

  @Get('list')
  getUsers(): Promise<User[]> {
    return this.service.getUsers();
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  registerUser(@Body() body: createDto): Promise<string> {
    return this.service.registerUser(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  loginUser(@Body() body: loginDto): Promise<string> {
    return this.service.loginUser(body);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('update/profile')
  updateUserProfile(
    @Req() request: CustomeRequest,
    @Body() body: updateDto,
  ): Promise<User> {
    return this.service.updateUser(request.userId, body);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('update/:id')
  updateUser(@Param('id') id: string, @Body() body: updateDto): Promise<User> {
    return this.service.updateUser(id, body);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('delete/:id')
  deleteUser(@Param('id') id: string): Promise<User> {
    return this.service.deleteUser(id);
  }
}
