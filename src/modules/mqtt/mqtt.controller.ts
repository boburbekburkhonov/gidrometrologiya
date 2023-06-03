import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CustomeRequest } from '../../types';
import { JwtGuard } from '../users/guards/jwt.guard';
import { MqttService } from './mqtt.service';
import { LastData } from './schemas/lastData.schema';
import { Data } from './schemas/data.schema';
import { filterDto } from './dto/filter.data.dto';

@UseGuards(JwtGuard)
@Controller('mqtt')
export class MqttController {
  constructor(private readonly service: MqttService) {}

  // ! FOR THE USER
  @Get('lastdata')
  getLastData(@Req() request: CustomeRequest): Promise<LastData[]> {
    return this.service.getLastData(request.userId);
  }

  @Get('lastdata/:imei')
  getLastDataImei(
    @Req() request: CustomeRequest,
    @Param('imei') imei: number,
  ): Promise<LastData[]> {
    return this.service.getLastDataImei(request.userId, imei);
  }

  @Get('data')
  getData(@Req() request: CustomeRequest): Promise<Data[]> {
    return this.service.getData(request.userId);
  }

  @Get('data/device/name')
  getDataDeviceName(@Req() request: CustomeRequest): Promise<Data[]> {
    return this.service.getDataDeviceName(request.userId);
  }

  @Get('data/imei/:imei')
  getDataImei(
    @Req() request: CustomeRequest,
    @Param('imei') imei: string,
  ): Promise<Data[]> {
    return this.service.getDataImei(request.userId, imei);
  }

  @Get('data/present')
  getDataPresentDay(@Req() request: CustomeRequest): Promise<Data[]> {
    return this.service.getDataPresentDay(request.userId);
  }

  @Post('data/present/name')
  getDataPresentDayName(
    @Req() request: CustomeRequest,
    @Body() body: any,
  ): Promise<Data[]> {
    return this.service.getDataPresentDayName(request.userId, body.name);
  }

  @Post('data/present/name/value')
  getDataPresentDayNameFilterObjectWithValue(
    @Req() request: CustomeRequest,
    @Body() body: any,
  ): Promise<Data[]> {
    return this.service.getDataPresentDayNameFilterObjectWithValue(
      request.userId,
      body.name,
      body.value,
    );
  }

  @Post('data/month/name/value')
  getDataMonthNameFilterObjectWithValue(
    @Req() request: CustomeRequest,
    @Body() body: any,
  ): Promise<Data[]> {
    return this.service.getDataMonthNameFilterObjectWithValue(
      request.userId,
      body.name,
      body.value,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('/filter/data')
  getDataFilter(
    @Req() request: CustomeRequest,
    @Body() body: filterDto,
  ): Promise<Data[]> {
    return this.service.getDataFilter(request.userId, body);
  }

  @Get('yesterday/data')
  getYesterdayData(@Req() request: CustomeRequest): Promise<LastData[]> {
    return this.service.getYesterdayData(request.userId);
  }

  @Post('yesterday/data/found/name')
  getYesterdayDataFindName(
    @Req() request: CustomeRequest,
    @Body() body: any,
  ): Promise<LastData[]> {
    return this.service.getYesterdayDataFindName(request.userId, body.name);
  }

  @Get('yesterday/data/statistics')
  getYesterdayDataStatistics(
    @Req() request: CustomeRequest,
  ): Promise<LastData[]> {
    return this.service.getYesterdayDataStatistics(request.userId);
  }

  @Post('yesterday/data/statistics/found/name')
  getYesterdayDataStatisticsFoundName(
    @Req() request: CustomeRequest,
    @Body() body: any,
  ): Promise<LastData[]> {
    return this.service.getYesterdayDataStatisticsFoundName(
      request.userId,
      body.name,
    );
  }

  @Get('one/year/data/statistics')
  getOneYearDataStatistics(
    @Req() request: CustomeRequest,
  ): Promise<LastData[]> {
    return this.service.getOneYearDataStatistics(request.userId);
  }

  @Post('one/year/data/statistics/found/name')
  getOneYearDataStatisticsFoundName(
    @Req() request: CustomeRequest,
    @Body() body: any,
  ): Promise<LastData[]> {
    return this.service.getOneYearDataStatisticsFoundName(
      request.userId,
      body.name,
    );
  }

  // ! FOR THE ADMIN

  @Get('admin/data')
  getDataAdmin(): Promise<Data[]> {
    return this.service.getDataAdmin();
  }

  @Get('admin/data/device/name')
  getDataDeviceNameAdmin(): Promise<Data[]> {
    return this.service.getDataDeviceNameAdmin();
  }

  @Get('admin/data/imei/:imei')
  getDataImeiAdmin(@Param('imei') imei: string): Promise<Data[]> {
    return this.service.getDataImeiAdmin(imei);
  }

  @Get('admin/data/present')
  getDataPresentDayAdmin(): Promise<Data[]> {
    return this.service.getDataPresentDayAdmin();
  }

  @Post('admin/data/present/name/value')
  getDataPresentDayAdminNameFilterObjectWithValue(
    @Body() body: any,
  ): Promise<Data[]> {
    return this.service.getDataPresentDayAdminNameFilterObjectWithValue(
      body.name,
      body.value,
    );
  }

  @Post('admin/data/month/name/value')
  getDataMonthDataAdminNameFilterObjectWithValue(
    @Body() body: any,
  ): Promise<Data[]> {
    return this.service.getDataMonthDataAdminNameFilterObjectWithValue(
      body.name,
      body.value,
    );
  }

  @Post('admin/data/present/name')
  getDataPresentDayAdminName(@Body() body: any): Promise<Data[]> {
    return this.service.getDataPresentDayAdminName(body.name);
  }

  @Get('admin/lastdata')
  getLastDataAdmin(): Promise<LastData[]> {
    return this.service.getLastDataAdmin();
  }

  @Get('admin/lastdata/:imei')
  getLastDataImeiAdmin(@Param('imei') imei: number): Promise<LastData[]> {
    return this.service.getLastDataImeiAdmin(imei);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/admin/filter/data')
  getDataFilterAdmin(@Body() body: filterDto): Promise<Data[]> {
    return this.service.getDataFilterAdmin(body);
  }

  @Get('admin/yesterday/data')
  getYesterdayDataAdmin(): Promise<LastData[]> {
    return this.service.getYesterdayDataAdmin();
  }

  @Post('admin/yesterday/data/found/name')
  getYesterdayDataFoundNameAdmin(@Body() body: any): Promise<LastData[]> {
    return this.service.getYesterdayDataFoundNameAdmin(body.name);
  }

  @Get('admin/yesterday/data/statistics')
  getYesterdayDataStatisticsAdmin(): Promise<LastData[]> {
    return this.service.getYesterdayDataStatisticsAdmin();
  }

  @Post('admin/yesterday/data/statistics/found/name')
  getYesterdayDataStatisticsFoundNameAdmin(
    @Body() body: any,
  ): Promise<LastData[]> {
    return this.service.getYesterdayDataStatisticsFoundNameAdmin(body.name);
  }

  @Get('admin/one/year/data/statistics')
  getOneYearDataStatisticsAdmin(): Promise<LastData[]> {
    return this.service.getOneYearDataStatisticsAdmin();
  }

  @Post('admin/one/year/data/statistics/found/name')
  getOneYearDataStatisticsFoundNameAdmin(
    @Body() body: any,
  ): Promise<LastData[]> {
    return this.service.getOneYearDataStatisticsFoundNameAdmin(body.name);
  }
}
