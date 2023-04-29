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
    //! PRESENT
    let startDate = new Date();
    startDate.setUTCDate(startDate.getUTCDate() - 1);
    startDate.setUTCHours(0, 0, 0, 0);

    let endDate = new Date();
    endDate.setUTCDate(endDate.getUTCDate() - 1);
    endDate.setUTCHours(23, 59, 59, 999);

    //! YESTERDAY
    let startDateYesterday = new Date();
    startDateYesterday.setUTCDate(startDateYesterday.getUTCDate() - 2);
    startDateYesterday.setUTCHours(0, 0, 0, 0);

    let endDateYesterday = new Date();
    endDateYesterday.setUTCDate(endDateYesterday.getUTCDate() - 2);
    endDateYesterday.setUTCHours(23, 59, 59, 999);

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
        $gte: startDateYesterday,
        $lt: endDateYesterday,
      },
    });

    const foundPresentData = await this.dataModel.find({
      time: {
        $gt: startDate,
        $lt: endDate,
      },
    });

    foundPresentData.forEach(async (e) => {
      const yesterdayData = new this.yesterdayDataModel({
        name: e.name ? e.name : 'testing',
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
