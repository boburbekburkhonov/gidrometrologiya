import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { CustomeRequest } from '../../types';
import { JwtGuard } from '../users/guards/jwt.guard';
import { MqttService } from './mqtt.service';
import { LastData } from './schemas/lastData.schema';
import { Data } from './schemas/data.schema';

@UseGuards(JwtGuard)
@Controller('mqtt')
export class MqttController {
  constructor(private readonly service: MqttService) {}

  @Get('lastdata')
  getLastData(@Req() request: CustomeRequest): Promise<LastData[]> {
    return this.service.getLastData(request.userId);
  }

  @Get('data')
  getData(@Req() request: CustomeRequest): Promise<Data[]> {
    return this.service.getData(request.userId);
  }

  @Get('data/statistics')
  getDataStatics(@Req() request: CustomeRequest): Promise<Data[]> {
    return this.service.getDataStatics(request.userId);
  }

  @Get('data/present')
  getDataPresentDay(@Req() request: CustomeRequest): Promise<Data[]> {
    return this.service.getDataPresentDay(request.userId);
  }

  @Get('data/three')
  getDataThreeDay(@Req() request: CustomeRequest): Promise<Data[]> {
    return this.service.getDataThreeDay(request.userId);
  }

  @Get('data/ten')
  getDataTenDay(@Req() request: CustomeRequest): Promise<Data[]> {
    return this.service.getDataTenDay(request.userId);
  }

  @Get('data/month')
  getDataMonth(@Req() request: CustomeRequest): Promise<Data[]> {
    return this.service.getDataMonth(request.userId);
  }

  @Get('data/year')
  getDataYear(@Req() request: CustomeRequest): Promise<Data[]> {
    return this.service.getDataYear(request.userId);
  }

  @Get('data/statistics/devices')
  getDataStaticsDevices(@Req() request: CustomeRequest): Promise<Data[]> {
    return this.service.getDataStaticsDevices(request.userId);
  }
}
