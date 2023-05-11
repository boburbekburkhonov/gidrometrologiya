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

  @Get('data/device/name/present')
  getDataDeviceNamePresent(@Req() request: CustomeRequest): Promise<Data[]> {
    return this.service.getDataDeviceNamePresent(request.userId);
  }

  @Get('data/imei/:imei')
  getDataImei(
    @Req() request: CustomeRequest,
    @Param('imei') imei: string,
  ): Promise<Data[]> {
    return this.service.getDataImei(request.userId, imei);
  }

  @Get('data/statistics')
  getDataStatics(@Req() request: CustomeRequest): Promise<Data[]> {
    return this.service.getDataStatics(request.userId);
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

  @Get('data/devices/working/present')
  getDataDevicesPresentDay(@Req() request: CustomeRequest): Promise<Data[]> {
    return this.service.getDataDevicesPresentDay(request.userId);
  }

  @Get('data/devices/working/three')
  getDataDevicesThreeDay(@Req() request: CustomeRequest): Promise<Data[]> {
    return this.service.getDataDevicesThreeDay(request.userId);
  }

  @Get('data/devices/working/ten')
  getDataDevicesTenDay(@Req() request: CustomeRequest): Promise<Data[]> {
    return this.service.getDataDevicesTenDay(request.userId);
  }

  @Get('data/devices/working/month')
  getDataDevicesMonth(@Req() request: CustomeRequest): Promise<Data[]> {
    return this.service.getDataDevicesMonth(request.userId);
  }

  @Get('data/devices/working/year')
  getDataDevicesYear(@Req() request: CustomeRequest): Promise<Data[]> {
    return this.service.getDataDevicesYear(request.userId);
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

  @Get('yesterday/data/statistics/devices/:time')
  getYesterdayDataStatisticsDevices(
    @Req() request: CustomeRequest,
    @Param('time') time: string,
  ): Promise<LastData[]> {
    return this.service.getYesterdayDataStatisticsDevices(request.userId, time);
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

  @Get('admin/data/device/name/present')
  getDataDeviceNamePresentAdmin(): Promise<Data[]> {
    return this.service.getDataDeviceNamePresentAdmin();
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

  @Get('admin/data/statistics/devices')
  getDataStaticsDevicesAdmin(): Promise<Data[]> {
    return this.service.getDataStaticsDevicesAdmin();
  }

  @Get('/admin/data/statistics')
  getDataStaticsAdmin(): Promise<Data[]> {
    return this.service.getDataStaticsAdmin();
  }

  @Get('admin/data/devices/working/present')
  getDataDevicesPresentDayAdmin(): Promise<Data[]> {
    return this.service.getDataDevicesPresentDayAdmin();
  }

  @Get('admin/data/devices/working/three')
  getDataDevicesThreeDayAdmin(): Promise<Data[]> {
    return this.service.getDataDevicesThreeDayAdmin();
  }

  @Get('admin/data/devices/working/ten')
  getDataDevicesTenDayAdmin(): Promise<Data[]> {
    return this.service.getDataDevicesTenDayAdmin();
  }

  @Get('admin/data/devices/working/month')
  getDataDevicesMonthAdmin(): Promise<Data[]> {
    return this.service.getDataDevicesMonthAdmin();
  }

  @Get('admin/data/devices/working/year')
  getDataDevicesYearAdmin(): Promise<Data[]> {
    return this.service.getDataDevicesYearAdmin();
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

  @Get('admin/yesterday/data/statistics/devices/:time')
  getYesterdayDataStatisticsDevicesAdmin(
    @Param('time') time: string,
  ): Promise<LastData[]> {
    return this.service.getYesterdayDataStatisticsDevicesAdmin(time);
  }
}
