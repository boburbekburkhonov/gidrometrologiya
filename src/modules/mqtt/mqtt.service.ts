import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mqtt from 'mqtt';
import { IMqttConnectOptions } from '../../types';
import { InfoService } from 'src/modules/info/info.service';
import { Model } from 'mongoose';
import { Data, dataDocument } from './schemas/data.schema';
import { LastData, lastDataDocument } from './schemas/lastData.schema';
import { filterDto } from './dto/filter.data.dto';
import {
  YesterdayData,
  yesterdayDataDocument,
} from './schemas/yesterdayData.schema';
import {
  YesterdayDataStatistic,
  yesterdayDataStatisticDocument,
} from './schemas/yesterdayDataStatistic.schema';

@Injectable()
export class MqttService implements OnModuleInit {
  constructor(
    private readonly infoService: InfoService,
    @InjectModel(Data.name, 'Data')
    private readonly dataModel: Model<dataDocument>,
    @InjectModel(LastData.name, 'LastData')
    private readonly lastDataModel: Model<lastDataDocument>,
    @InjectModel(YesterdayData.name, 'YesterdayData')
    private readonly yesterdayDataModel: Model<yesterdayDataDocument>,
    @InjectModel(YesterdayDataStatistic.name, 'YesterdayDataStatistic')
    private readonly yesterdayDataStatisticModel: Model<yesterdayDataStatisticDocument>,
  ) {}

  private options: IMqttConnectOptions = {
    clean: true,
    connectTimeout: 4000,
    host: '185.217.131.224',
    port: 1883,
    username: 'admin',
    password: 'public',
  };

  private topic: string = 'H/#';

  private mqttClient: any;

  // !MQTT CONNECT
  onModuleInit() {
    this.mqttClient = mqtt.connect(this.options);

    this.mqttClient.on('connect', (): void => {
      this.mqttClient.subscribe(this.topic);
      console.log('Connected');
    });

    this.mqttClient.on('error', (error: unknown): void => {
      console.log(error);
    });

    this.mqttClient.on(
      'message',
      async (topic: string, payload: string): Promise<void> => {
        try {
          const data = JSON.parse(payload);

          if (data.ts) {
            const existingInfo: any = await this.infoService.getInfoImei(
              data.i,
            );

            console.log(existingInfo);

            if (existingInfo) {
              const timeData = new Date(
                `${Number(data.t.split('/')[0]) + 2000}-${
                  data.t.split('/')[1]
                }-${data.t.split('/')[2].slice(0, 2)} ${data.t
                  .split('/')[2]
                  .slice(3, 14)}`,
              );

              timeData.setHours(timeData.getHours() + 5);

              const foundData: any = await this.dataModel.find({
                imei: data.i,
              });

              const [filterData] = foundData.filter(
                (e: any) => timeData.getTime() == e.time.getTime(),
              );

              console.log(filterData);

              if (!filterData) {
                const newData = new this.dataModel({
                  name: existingInfo.name,
                  imei: data.i,
                  time: timeData,
                  windDirection: Number(data.wd) / 10,
                  rainHeight: Number(data.rh) / 10,
                  windSpeed: Number(data.ws) / 10,
                  airHumidity: Number(data.ah) / 10,
                  airTemp: Number(data.at) / 10,
                  airPressure: Number(data.ap) / 10,
                  soilHumidity: Number(data.sh) / 10,
                  soilTemp: Number(data.st) / 10,
                  leafHumidity: Number(data.lh) / 10,
                  leafTemp: Number(data.lt) / 10,
                  typeSensor: data.ts,
                  user: existingInfo.user.toString(),
                });

                await newData.save();

                const existingLastData = await this.lastDataModel.findOne({
                  imei: data.i,
                });

                if (existingLastData) {
                  await this.lastDataModel.findOneAndUpdate(
                    { imei: data.i },
                    {
                      name: existingInfo.name,
                      imei: data.i,
                      time: timeData,
                      windDirection: Number(data.wd) / 10,
                      rainHeight: Number(data.rh) / 10,
                      windSpeed: Number(data.ws) / 10,
                      airHumidity: Number(data.ah) / 10,
                      airTemp: Number(data.at) / 10,
                      airPressure: Number(data.ap) / 10,
                      soilHumidity: Number(data.sh) / 10,
                      soilTemp: Number(data.st) / 10,
                      leafHumidity: Number(data.lh) / 10,
                      leafTemp: Number(data.lt) / 10,
                      typeSensor: data.ts,
                      user: existingInfo.user.toString(),
                    },
                  );
                } else {
                  const newLastData = new this.lastDataModel({
                    name: existingInfo.name,
                    imei: data.i,
                    time: timeData,
                    windDirection: Number(data.wd) / 10,
                    rainHeight: Number(data.rh) / 10,
                    windSpeed: Number(data.ws) / 10,
                    airHumidity: Number(data.ah) / 10,
                    airTemp: Number(data.at) / 10,
                    airPressure: Number(data.ap) / 10,
                    soilHumidity: Number(data.sh) / 10,
                    soilTemp: Number(data.st) / 10,
                    leafHumidity: Number(data.lh) / 10,
                    leafTemp: Number(data.lt) / 10,
                    typeSensor: data.ts,
                    user: existingInfo.user.toString(),
                  });

                  await newLastData.save();
                }
              }
            }
          }
        } catch (error: unknown) {
          console.log(error);
        }
      },
    );
  }

  //! LASTDATA
  async getLastData(userId: string): Promise<LastData[]> {
    return await this.lastDataModel.find({ user: userId });
  }

  //! LASTDATA WITH IMEI
  async getLastDataImei(userId: string, imei: number): Promise<LastData[]> {
    return await this.lastDataModel.find({ user: userId, imei: imei });
  }

  //! DATA
  async getData(userId: string): Promise<Data[]> {
    return await this.dataModel.aggregate([
      { $match: { user: userId } },
      { $unset: ['_id'] },
    ]);
  }

  //! DATA DEVICES NAME ALL
  async getDataDeviceName(userId: string): Promise<any[]> {
    const allData = await this.dataModel.find({ user: userId });
    const devicesName: any = new Set();
    allData.filter((e) => {
      devicesName.add(e.name);
    });
    return [...devicesName];
  }

  //! DATA PRESENT DAY WITH IMEI
  async getDataImei(userId: string, imei: string): Promise<Data[]> {
    let date = new Date();
    let currentPresentDate = new Date();
    currentPresentDate.setHours(5);
    currentPresentDate.setMinutes(0);
    currentPresentDate.setSeconds(0);
    date.setHours(date.getHours() + 5);

    return await this.dataModel
      .find({
        user: userId,
        imei: imei,
        time: {
          $gte: currentPresentDate,
          $lt: date,
        },
      })
      .sort({ time: -1 });
  }

  // ! DATA PRESENT DAY
  async getDataPresentDay(userId: string): Promise<Data[]> {
    let date = new Date();
    let currentPresentDate = new Date();
    currentPresentDate.setHours(5);
    currentPresentDate.setMinutes(0);
    currentPresentDate.setSeconds(0);
    date.setHours(date.getHours() + 5);

    const dataPresent: any = await this.dataModel
      .find({
        user: userId,
        time: {
          $gte: currentPresentDate,
          $lt: date,
        },
      })
      .select(
        'imei name time windDirection rainHeight windSpeed airHumidity airTemp airPressure soilHumidity soilTemp leafHumidity leafTemp typeSensor',
      )
      .sort({ time: -1 })
      .catch((error: unknown) => console.log(error));

    return dataPresent;
  }

  // ! DATA PRESENT DAY WITH NAME
  async getDataPresentDayName(userId: string, name: string): Promise<Data[]> {
    let date = new Date();
    let currentPresentDate = new Date();
    currentPresentDate.setHours(5);
    currentPresentDate.setMinutes(0);
    currentPresentDate.setSeconds(0);
    date.setHours(date.getHours() + 5);

    let dataPresent = await this.dataModel
      .find({
        user: userId,
        name: name,
        time: {
          $gte: currentPresentDate,
          $lt: date,
        },
      })
      .sort({ time: -1 })
      .select(
        'imei name time windDirection rainHeight windSpeed airHumidity airTemp airPressure soilHumidity soilTemp leafHumidity leafTemp typeSensor',
      );

    return dataPresent;
  }

  // ! DATA PRESENT DAY WITH NAME AND VALUE
  async getDataPresentDayNameFilterObjectWithValue(
    userId: string,
    name: string,
    value: string,
  ): Promise<Data[]> {
    let date = new Date();
    let currentPresentDate = new Date();
    currentPresentDate.setHours(5);
    currentPresentDate.setMinutes(0);
    currentPresentDate.setSeconds(0);
    date.setHours(date.getHours() + 5);

    let dataPresent = await this.dataModel
      .find({
        user: userId,
        name: name,
        time: {
          $gte: currentPresentDate,
          $lt: date,
        },
      })
      .sort({ time: -1 })
      .select(
        'imei name time windDirection rainHeight windSpeed airHumidity airTemp airPressure soilHumidity soilTemp leafHumidity leafTemp typeSensor',
      );

    const data: any = [];
    const time: any = [];

    dataPresent.filter((e) => {
      data.unshift(e[value]);
      time.unshift(e.time);
    });

    return [data, time, value];
  }

  // ! DATA MONTH WITH NAME AND VALUE
  async getDataMonthNameFilterObjectWithValue(
    userId: string,
    name: string,
    value: string,
  ): Promise<Data[]> {
    let dataPresent = await this.yesterdayDataStatisticModel
      .find({
        user: userId,
        name: name,
      })
      .sort({ time: -1 })
      .select(
        'imei name time windDirection rainHeight windSpeed airHumidity airTemp airPressure soilHumidity soilTemp leafHumidity leafTemp typeSensor',
      );

    const data: any = [];
    const time: any = [];

    dataPresent.filter((e) => {
      data.unshift(e[value]);
      time.unshift(e.time);
    });

    return [data, time, value];
  }

  // ! DATA FILTER WITH START & END
  async getDataFilter(userId: string, payload: filterDto): Promise<Data[]> {
    const startDate = new Date(payload.start);
    const endDate = new Date(payload.end);

    startDate.setHours(5);
    endDate.setHours(4);
    endDate.setMinutes(59);
    endDate.setSeconds(59);

    let filterData = await this.dataModel
      .find({
        user: userId,
        name: payload.deviceName,
        time: {
          $gte: startDate,
          $lt: endDate,
        },
      })
      .sort({ time: -1 });

    return filterData;
  }

  // ! YESTERDAY DATA
  async getYesterdayData(userId: string): Promise<YesterdayData[]> {
    return await this.yesterdayDataModel
      .find({ user: userId })
      .sort({ time: -1 });
  }

  // ! YESTERDAY DATA FOUND NAME
  async getYesterdayDataFindName(
    userId: string,
    name: string,
  ): Promise<YesterdayData[]> {
    return await this.yesterdayDataModel
      .find({ user: userId, name: name })
      .sort({ time: -1 });
  }

  // ! YESTERDAY DATA STATISTICS
  async getYesterdayDataStatistics(
    userId: string,
  ): Promise<YesterdayDataStatistic[]> {
    return await this.yesterdayDataStatisticModel
      .find({ user: userId })
      .sort({ time: -1 });
  }

  // ! YESTERDAY DATA STATISTICS FOUND NAME
  async getYesterdayDataStatisticsFoundName(
    userId: string,
    name: string,
  ): Promise<YesterdayDataStatistic[]> {
    return await this.yesterdayDataStatisticModel
      .find({ user: userId, name: name })
      .sort({ time: -1 });
  }

  // ? ADMIN ----------------------------------------------------------

  //! DATA
  async getDataAdmin(): Promise<Data[]> {
    return await this.dataModel.aggregate([{ $unset: ['_id'] }]);
  }

  //! DATA DEVICES NAME ALL
  async getDataDeviceNameAdmin(): Promise<any[]> {
    const allData = await this.dataModel.find();
    const devicesName: any = new Set();
    allData.filter((e) => {
      devicesName.add(e.name);
    });
    return [...devicesName];
  }

  //! DATA PRESENT DAY WITH IMEI
  async getDataImeiAdmin(imei: string): Promise<Data[]> {
    let date = new Date();
    let currentPresentDate = new Date();
    currentPresentDate.setHours(5);
    currentPresentDate.setMinutes(0);
    currentPresentDate.setSeconds(0);
    date.setHours(date.getHours() + 5);

    return await this.dataModel
      .find({
        imei: imei,
        time: {
          $gte: currentPresentDate,
          $lt: date,
        },
      })
      .sort({ time: -1 });
  }

  // ! DATA PRESENT DAY
  async getDataPresentDayAdmin(): Promise<Data[]> {
    let date = new Date();
    let currentPresentDate = new Date();
    currentPresentDate.setHours(5);
    currentPresentDate.setMinutes(0);
    currentPresentDate.setSeconds(0);
    date.setHours(date.getHours() + 5);

    const dataPresent: any = await this.dataModel
      .find({
        time: {
          $gte: currentPresentDate,
          $lt: date,
        },
      })
      .sort({ time: -1 })
      .select(
        'imei name time windDirection rainHeight windSpeed airHumidity airTemp airPressure soilHumidity soilTemp leafHumidity leafTemp typeSensor',
      )
      .sort({ time: -1 })
      .catch((error: unknown) => console.log(error));

    return dataPresent;
  }

  // ! DATA PRESENT DAY WITH NAME
  async getDataPresentDayAdminName(name: string): Promise<Data[]> {
    let date = new Date();
    let currentPresentDate = new Date();
    currentPresentDate.setHours(5);
    currentPresentDate.setMinutes(0);
    currentPresentDate.setSeconds(0);
    date.setHours(date.getHours() + 5);

    let dataPresent = await this.dataModel
      .find({
        name: name,
        time: {
          $gte: currentPresentDate,
          $lt: date,
        },
      })
      .sort({ time: -1 })
      .select(
        'imei name time windDirection rainHeight windSpeed airHumidity airTemp airPressure soilHumidity soilTemp leafHumidity leafTemp typeSensor',
      );

    return dataPresent;
  }

  // ! DATA PRESENT DAY WITH NAME AND VALUE
  async getDataPresentDayAdminNameFilterObjectWithValue(
    name: string,
    value: string,
  ): Promise<Data[]> {
    let date = new Date();
    let currentPresentDate = new Date();
    currentPresentDate.setHours(5);
    currentPresentDate.setMinutes(0);
    currentPresentDate.setSeconds(0);
    date.setHours(date.getHours() + 5);

    let dataPresent = await this.dataModel
      .find({
        name: name,
        time: {
          $gte: currentPresentDate,
          $lt: date,
        },
      })
      .sort({ time: -1 })
      .select(
        'imei name time windDirection rainHeight windSpeed airHumidity airTemp airPressure soilHumidity soilTemp leafHumidity leafTemp typeSensor',
      );

    const data: any = [];
    const time: any = [];

    dataPresent.filter((e) => {
      data.unshift(e[value]);
      time.unshift(e.time);
    });

    return [data, time, value];
  }

  // ! MONTH DATA WITH NAME AND VALUE
  async getDataMonthDataAdminNameFilterObjectWithValue(
    name: string,
    value: string,
  ): Promise<Data[]> {
    let dataPresent = await this.yesterdayDataStatisticModel
      .find({
        name: name,
      })
      .sort({ time: -1 })
      .select(
        'imei name time windDirection rainHeight windSpeed airHumidity airTemp airPressure soilHumidity soilTemp leafHumidity leafTemp typeSensor',
      );

    const data: any = [];
    const time: any = [];

    dataPresent.filter((e) => {
      data.unshift(e[value]);
      time.unshift(e.time);
    });

    return [data, time, value];
  }

  //! LASTDATA
  async getLastDataAdmin(): Promise<LastData[]> {
    return await this.lastDataModel.find();
  }

  //! LASTDATA WITH IMEI
  async getLastDataImeiAdmin(imei: number): Promise<LastData[]> {
    return await this.lastDataModel.find({ imei: imei });
  }

  // ! DATA FILTER WITH START & END
  async getDataFilterAdmin(payload: filterDto): Promise<Data[]> {
    const startDate = new Date(payload.start);
    const endDate = new Date(payload.end);

    startDate.setHours(5);
    endDate.setHours(4);
    endDate.setMinutes(59);
    endDate.setSeconds(59);

    let filterData = await this.dataModel
      .find({
        name: payload.deviceName,
        time: {
          $gte: startDate,
          $lt: endDate,
        },
      })
      .sort({ time: -1 });

    return filterData;
  }

  // ! YESTERDAY DATA
  async getYesterdayDataAdmin(): Promise<YesterdayData[]> {
    return await this.yesterdayDataModel.find().sort({ time: -1 });
  }

  // ! YESTERDAY DATA FOUND NAME
  async getYesterdayDataFoundNameAdmin(name: string): Promise<YesterdayData[]> {
    return await this.yesterdayDataModel
      .find({ name: name })
      .sort({ time: -1 });
  }

  // ! YESTERDAY DATA STATISTICS
  async getYesterdayDataStatisticsAdmin(): Promise<YesterdayDataStatistic[]> {
    return await this.yesterdayDataStatisticModel.find().sort({ time: -1 });
  }

  // ! YESTERDAY DATA STATISTICS FOUND NAME
  async getYesterdayDataStatisticsFoundNameAdmin(
    name: string,
  ): Promise<YesterdayDataStatistic[]> {
    return await this.yesterdayDataStatisticModel
      .find({ name: name })
      .sort({ time: -1 });
  }
}
