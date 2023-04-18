import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Data, dataDocument } from './schemas/data.schema';
import {
  YesterdayData,
  yesterdayDataDocument,
} from './schemas/yesterdayData.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  YesterdayDataStatistic,
  yesterdayDataStatisticDocument,
} from './schemas/yesterdayDataStatistic.schema';

@Injectable()
export class CronService {
  constructor(
    @InjectModel(Data.name, 'Data')
    private readonly dataModel: Model<dataDocument>,
    @InjectModel(YesterdayData.name, 'YesterdayData')
    private readonly yesterdayDataModel: Model<yesterdayDataDocument>,
    @InjectModel(YesterdayDataStatistic.name, 'YesterdayDataStatistic')
    private readonly yesterdayDataStatisticModel: Model<yesterdayDataStatisticDocument>,
  ) {}

  @Cron('00 00 * * *')
  async yesterdayData() {
    const timePresentStart: Date = new Date();
    const timePresentEnd: Date = new Date();
    const timeYesterdayStart: Date = new Date();
    const timeYesterdayEnd: Date = new Date();

    timeYesterdayStart.setHours(5);
    timeYesterdayStart.setMinutes(0);
    timeYesterdayStart.setSeconds(0);
    timeYesterdayStart.setDate(timeYesterdayStart.getDate() - 1);
    timeYesterdayEnd.setHours(4);
    timeYesterdayEnd.setMinutes(59);
    timeYesterdayEnd.setSeconds(59);

    timePresentStart.setHours(5);
    timePresentStart.setMinutes(0);
    timePresentStart.setSeconds(0);
    timePresentEnd.setHours(4);
    timePresentEnd.setMinutes(59);
    timePresentEnd.setSeconds(59);
    timePresentEnd.setDate(timePresentEnd.getDate() + 1);

    const yesterdayAllData = await this.yesterdayDataModel.aggregate([
      {
        $group: {
          _id: '$name',
          name: { $first: '$name' },
          imei: { $first: '$imei' },
          time: { $last: '$time' },
          windDirection: {
            $avg: '$windDirection',
          },
          rainHeight: {
            $avg: '$rainHeight',
          },
          windSpeed: {
            $avg: '$windSpeed',
          },
          airHumidity: {
            $avg: '$airHumidity',
          },
          airTemp: {
            $avg: '$airTemp',
          },
          airPressure: {
            $avg: '$airPressure',
          },
          soilHumidity: {
            $avg: '$soilHumidity',
          },
          soilTemp: {
            $avg: '$soilTemp',
          },
          leafHumidity: {
            $avg: '$leafHumidity',
          },
          leafTemp: {
            $avg: '$leafTemp',
          },
          typeSensor: { $first: '$typeSensor' },
          user: { $first: '$user' },
        },
      },
    ]);

    yesterdayAllData.forEach(async (e) => {
      const yesterdayData = new this.yesterdayDataStatisticModel({
        name: e.name ? e.name : 'testing',
        imei: e.imei,
        time: e.time,
        windDirection: e.windDirection.toFixed(2),
        rainHeight: e.rainHeight.toFixed(2),
        windSpeed: e.windSpeed.toFixed(2),
        airHumidity: e.airHumidity.toFixed(2),
        airTemp: e.airTemp.toFixed(2),
        airPressure: e.airPressure.toFixed(2),
        soilHumidity: e.soilHumidity.toFixed(2),
        soilTemp: e.soilTemp.toFixed(2),
        leafHumidity: e.leafHumidity.toFixed(2),
        leafTemp: e.leafTemp.toFixed(2),
        typeSensor: e.typeSensor,
        user: e.user,
      });

      await yesterdayData.save();
    });

    await this.yesterdayDataModel.deleteMany({
      time: {
        $gte: timeYesterdayStart,
        $lt: timeYesterdayEnd,
      },
    });

    const foundPresentData = await this.dataModel.find({
      time: {
        $gte: timePresentStart,
        $lt: timePresentEnd,
      },
    });

    foundPresentData.forEach(async (e) => {
      const yesterdayData = new this.yesterdayDataModel({
        name: e.name,
        imei: e.imei,
        time: e.time,
        windDirection: e.windDirection,
        rainHeight: e.rainHeight,
        windSpeed: e.windSpeed,
        airHumidity: e.airHumidity,
        airTemp: e.airTemp,
        airPressure: e.airPressure,
        soilHumidity: e.soilHumidity,
        soilTemp: e.soilTemp,
        leafHumidity: e.leafHumidity,
        leafTemp: e.leafTemp,
        typeSensor: e.typeSensor,
        user: e.user,
      });

      await yesterdayData.save();
    });
  }
}
