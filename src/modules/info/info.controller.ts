import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { JwtGuard } from '../users/guards/jwt.guard';
import { InfoService } from './info.service';
import { Info } from './schemas/info.schema';
import { createDto } from './dto/create.dto';
import { updateDto } from './dto/update.dto';
import { CustomeRequest } from '../../types';

@UseGuards(JwtGuard)
@Controller('info')
export class InfoController {
  constructor(private readonly service: InfoService) {}

  @Get('user')
  getInfoUserId(@Req() request: CustomeRequest): Promise<Info[]> {
    return this.service.getInfoUserId(request.userId);
  }

  @Get('list')
  getInfo(): Promise<Info[]> {
    return this.service.getInfo();
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('create')
  createInfo(
    @Req() request: CustomeRequest,
    @Body() body: createDto,
  ): Promise<Info> {
    body.user = request.userId;
    return this.service.createInfo(body);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('update/:id')
  updateInfo(@Param('id') id: string, @Body() body: updateDto): Promise<Info> {
    return this.service.updateInfo(id, body);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('delete/:id')
  deleteInfo(@Param('id') id: string): Promise<Info> {
    return this.service.deleteInfo(id);
  }
}
