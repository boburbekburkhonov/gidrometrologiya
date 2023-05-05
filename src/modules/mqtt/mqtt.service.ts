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

  //! DATA DEVICES NAME PRESENT
  async getDataDeviceNamePresent(userId: string): Promise<any[]> {
    let startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);

    let endDate = new Date();
    endDate.setUTCHours(23, 59, 59, 999);

    const allData = await this.dataModel.find({
      user: userId,
      time: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    const devicesName: any = new Set();
    allData.filter((e) => {
      devicesName.add(e.name);
    });
    return [...devicesName];
  }

  //! DATA WITH IMEI
  async getDataImei(userId: string, imei: string): Promise<Data[]> {
    let date = new Date();
    let currentPresentDate = new Date();
    currentPresentDate.setHours(5);
    currentPresentDate.setMinutes(0);
    currentPresentDate.setSeconds(0);
    date.setHours(date.getHours() + 5);

    return await this.dataModel.find({
      user: userId,
      imei: imei,
      time: {
        $gte: currentPresentDate,
        $lt: date,
      },
    });
  }

  // ! DATA STATISTICS
  async getDataStatics(userId: string): Promise<any> {
    // PRESENT  DAYS
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
      .catch((error: unknown) => console.log(error));

    // THREE  DAYS
    let currentThreeDate = new Date();
    let threeDaysAgoDate = new Date();
    threeDaysAgoDate.setDate(threeDaysAgoDate.getDate() - 3);
    threeDaysAgoDate.setHours(5);
    threeDaysAgoDate.setMinutes(0);
    threeDaysAgoDate.setSeconds(0);
    currentThreeDate.setHours(4);
    currentThreeDate.setMinutes(59);
    currentThreeDate.setSeconds(59);

    const dataThreeDay: any = await this.dataModel
      .find({
        user: userId,
        time: {
          $gte: threeDaysAgoDate,
          $lt: currentThreeDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    // TEN  DAYS
    let currentTenDate = new Date();
    let tenDaysAgoDate = new Date();
    tenDaysAgoDate.setDate(tenDaysAgoDate.getDate() - 10);
    tenDaysAgoDate.setHours(5);
    tenDaysAgoDate.setMinutes(0);
    tenDaysAgoDate.setSeconds(0);
    currentTenDate.setDate(currentTenDate.getDate() - 3);
    currentTenDate.setHours(4);
    currentTenDate.setMinutes(59);
    currentTenDate.setSeconds(59);

    const dataTenDay: any = await this.dataModel
      .find({
        user: userId,
        time: {
          $gte: tenDaysAgoDate,
          $lt: currentTenDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    // MONTH
    let currentMonthDate = new Date();
    let startMonthDate = new Date();

    startMonthDate.setMonth(startMonthDate.getMonth() - 1);
    startMonthDate.setDate(startMonthDate.getDate() - 11);
    startMonthDate.setHours(5);
    startMonthDate.setMinutes(0);
    startMonthDate.setSeconds(0);
    currentMonthDate.setDate(currentMonthDate.getDate() - 10);
    currentMonthDate.setHours(4);
    currentMonthDate.setMinutes(59);
    currentMonthDate.setSeconds(59);

    const dataMonthDay: any = await this.dataModel
      .find({
        user: userId,
        time: {
          $gte: startMonthDate,
          $lt: currentMonthDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    // ONE YEAR
    let currentYearDate = new Date();
    let startYearDate = new Date();

    startYearDate.setFullYear(startYearDate.getFullYear() - 1);
    startYearDate.setMonth(startYearDate.getMonth() - 1);
    startYearDate.setDate(startYearDate.getDate() - 11);
    startYearDate.setHours(5);
    startYearDate.setMinutes(0);
    startYearDate.setSeconds(0);
    currentYearDate.setMonth(currentYearDate.getMonth() - 1);
    currentYearDate.setDate(currentYearDate.getDate() - 11);
    currentYearDate.setHours(4);
    currentYearDate.setMinutes(59);
    currentYearDate.setSeconds(59);

    const dataYear: any = await this.dataModel
      .find({
        user: userId,

        time: {
          $gte: startYearDate,
          $lt: currentYearDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    let resultData = [
      {
        name: 'Bugun',
        length: dataPresent.length,
      },
      {
        name: 'Uch kunlik',
        length: dataThreeDay.length,
      },
      {
        name: "O'n kunlik",
        length: dataTenDay.length,
      },
      {
        name: 'Bir oylik',
        length: dataMonthDay.length,
      },
      {
        name: 'Bir yillik',
        length: dataYear.length,
      },
    ];

    return resultData;
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
      .select(
        'imei name time windDirection rainHeight windSpeed airHumidity airTemp airPressure soilHumidity soilTemp leafHumidity leafTemp typeSensor',
      );

    return dataPresent;
  }

  // ! DATA THREE DAY
  async getDataThreeDay(userId: string): Promise<Data[]> {
    let currentThreeDate = new Date();
    let threeDaysAgoDate = new Date();
    threeDaysAgoDate.setDate(threeDaysAgoDate.getDate() - 3);
    threeDaysAgoDate.setHours(5);
    threeDaysAgoDate.setMinutes(0);
    threeDaysAgoDate.setSeconds(0);
    currentThreeDate.setHours(4);
    currentThreeDate.setMinutes(59);
    currentThreeDate.setSeconds(59);

    const dataThreeDay: any = await this.dataModel
      .find({
        user: userId,
        time: {
          $gte: threeDaysAgoDate,
          $lt: currentThreeDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    return dataThreeDay;
  }

  // ! DATA TEN DAY
  async getDataTenDay(userId: string): Promise<Data[]> {
    let currentTenDate = new Date();
    let tenDaysAgoDate = new Date();
    tenDaysAgoDate.setDate(tenDaysAgoDate.getDate() - 10);
    tenDaysAgoDate.setHours(5);
    tenDaysAgoDate.setMinutes(0);
    tenDaysAgoDate.setSeconds(0);
    currentTenDate.setDate(currentTenDate.getDate() - 3);
    currentTenDate.setHours(4);
    currentTenDate.setMinutes(59);
    currentTenDate.setSeconds(59);

    const dataTenDay: any = await this.dataModel
      .find({
        user: userId,
        time: {
          $gte: tenDaysAgoDate,
          $lt: currentTenDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    return dataTenDay;
  }

  // ! DATA MONTH
  async getDataMonth(userId: string): Promise<Data[]> {
    let currentMonthDate = new Date();
    let startMonthDate = new Date();

    startMonthDate.setMonth(startMonthDate.getMonth() - 1);
    startMonthDate.setDate(startMonthDate.getDate() - 11);
    startMonthDate.setHours(5);
    startMonthDate.setMinutes(0);
    startMonthDate.setSeconds(0);
    currentMonthDate.setDate(currentMonthDate.getDate() - 10);
    currentMonthDate.setHours(4);
    currentMonthDate.setMinutes(59);
    currentMonthDate.setSeconds(59);

    const dataMonthDay: any = await this.dataModel
      .find({
        user: userId,
        time: {
          $gte: startMonthDate,
          $lt: currentMonthDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    return dataMonthDay;
  }

  // ! DATA ONE YEAR
  async getDataYear(userId: string): Promise<Data[]> {
    let currentYearDate = new Date();
    let startYearDate = new Date();

    startYearDate.setFullYear(startYearDate.getFullYear() - 1);
    startYearDate.setMonth(startYearDate.getMonth() - 1);
    startYearDate.setDate(startYearDate.getDate() - 11);
    startYearDate.setHours(5);
    startYearDate.setMinutes(0);
    startYearDate.setSeconds(0);
    currentYearDate.setMonth(currentYearDate.getMonth() - 1);
    currentYearDate.setDate(currentYearDate.getDate() - 11);
    currentYearDate.setHours(4);
    currentYearDate.setMinutes(59);
    currentYearDate.setSeconds(59);

    const dataYear: any = await this.dataModel
      .find({
        user: userId,
        time: {
          $gte: startYearDate,
          $lt: currentYearDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    return dataYear;
  }

  // ! DATA STATISTICS DEVICES
  async getDataStaticsDevices(userId: string): Promise<any> {
    const foundDevices: any = await this.infoService
      .getInfoUserId(userId)
      .catch((error: unknown) => console.log(error));

    // PRESENT  DAYS
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
      .catch((error: unknown) => console.log(error));

    let dataPresentDayWorkingDevices = [];

    for (let i = 0; i < foundDevices.length; i++) {
      for (let j = 0; j < dataPresent.length; j++) {
        if (foundDevices[i].imei == dataPresent[j].imei) {
          dataPresentDayWorkingDevices.push(foundDevices[i]);
          break;
        }
      }
    }

    // THREE  DAYS
    let currentThreeDate = new Date();
    let threeDaysAgoDate = new Date();
    threeDaysAgoDate.setDate(threeDaysAgoDate.getDate() - 3);
    threeDaysAgoDate.setHours(5);
    threeDaysAgoDate.setMinutes(0);
    threeDaysAgoDate.setSeconds(0);
    currentThreeDate.setHours(4);
    currentThreeDate.setMinutes(59);
    currentThreeDate.setSeconds(59);

    const dataThreeDay: any = await this.dataModel
      .find({
        user: userId,
        time: {
          $gte: threeDaysAgoDate,
          $lt: currentThreeDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    let dataThreeDayWorkingDevices = [];

    for (let i = 0; i < foundDevices.length; i++) {
      for (let j = 0; j < dataThreeDay.length; j++) {
        if (foundDevices[i].imei == dataThreeDay[j].imei) {
          dataThreeDayWorkingDevices.push(foundDevices[i]);
          break;
        }
      }
    }

    // TEN  DAYS
    let currentTenDate = new Date();
    let tenDaysAgoDate = new Date();
    tenDaysAgoDate.setDate(tenDaysAgoDate.getDate() - 10);
    tenDaysAgoDate.setHours(5);
    tenDaysAgoDate.setMinutes(0);
    tenDaysAgoDate.setSeconds(0);
    currentTenDate.setDate(currentTenDate.getDate() - 3);
    currentTenDate.setHours(4);
    currentTenDate.setMinutes(59);
    currentTenDate.setSeconds(59);

    const dataTenDay: any = await this.dataModel
      .find({
        user: userId,
        time: {
          $gte: tenDaysAgoDate,
          $lt: currentTenDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    let dataTenDayWorkingDevices = [];

    for (let i = 0; i < foundDevices.length; i++) {
      for (let j = 0; j < dataTenDay.length; j++) {
        if (foundDevices[i].imei == dataTenDay[j].imei) {
          dataTenDayWorkingDevices.push(foundDevices[i]);
          break;
        }
      }
    }

    // MONTH
    let currentMonthDate = new Date();
    let startMonthDate = new Date();

    startMonthDate.setMonth(startMonthDate.getMonth() - 1);
    startMonthDate.setDate(startMonthDate.getDate() - 11);
    startMonthDate.setHours(5);
    startMonthDate.setMinutes(0);
    startMonthDate.setSeconds(0);
    currentMonthDate.setDate(currentMonthDate.getDate() - 10);
    currentMonthDate.setHours(4);
    currentMonthDate.setMinutes(59);
    currentMonthDate.setSeconds(59);

    const dataMonthDay: any = await this.dataModel
      .find({
        user: userId,
        time: {
          $gte: startMonthDate,
          $lt: currentMonthDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    let dataMonthWorkingDevices = [];

    for (let i = 0; i < foundDevices.length; i++) {
      for (let j = 0; j < dataMonthDay.length; j++) {
        if (foundDevices[i].imei == dataMonthDay[j].imei) {
          dataMonthWorkingDevices.push(foundDevices[i]);
          break;
        }
      }
    }

    // ONE YEAR
    let currentYearDate = new Date();
    let startYearDate = new Date();

    startYearDate.setFullYear(startYearDate.getFullYear() - 1);
    startYearDate.setMonth(startYearDate.getMonth() - 1);
    startYearDate.setDate(startYearDate.getDate() - 11);
    startYearDate.setHours(5);
    startYearDate.setMinutes(0);
    startYearDate.setSeconds(0);
    currentYearDate.setMonth(currentYearDate.getMonth() - 1);
    currentYearDate.setDate(currentYearDate.getDate() - 11);
    currentYearDate.setHours(4);
    currentYearDate.setMinutes(59);
    currentYearDate.setSeconds(59);

    const dataYear: any = await this.dataModel
      .find({
        user: userId,
        time: {
          $gte: startYearDate,
          $lt: currentYearDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    let dataYearWorkingDevices = [];

    for (let i = 0; i < foundDevices.length; i++) {
      for (let j = 0; j < dataYear.length; j++) {
        if (foundDevices[i].imei == dataYear[j].imei) {
          dataYearWorkingDevices.push(foundDevices[i]);
          break;
        }
      }
    }

    return {
      presentDay: dataPresentDayWorkingDevices.length,
      dataThreeDay: dataThreeDayWorkingDevices.length,
      dataTenDay: dataTenDayWorkingDevices.length,
      dataMonthDay: dataMonthWorkingDevices.length,
      dataYear: dataYearWorkingDevices.length,
    };
  }

  // ! DATA DEVICES PRESENT DAY
  async getDataDevicesPresentDay(userId: string): Promise<Data[]> {
    const foundDevices: any = await this.infoService
      .getInfoUserId(userId)
      .catch((error: unknown) => console.log(error));

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
      .catch((error: unknown) => console.log(error));

    let dataPresentDayWorkingDevices = [];

    for (let i = 0; i < foundDevices.length; i++) {
      for (let j = 0; j < dataPresent.length; j++) {
        if (foundDevices[i].imei == dataPresent[j].imei) {
          dataPresentDayWorkingDevices.push(foundDevices[i]);
          break;
        }
      }
    }

    return dataPresentDayWorkingDevices;
  }

  // ! DATA DEVICES THREE DAY
  async getDataDevicesThreeDay(userId: string): Promise<Data[]> {
    const foundDevices: any = await this.infoService
      .getInfoUserId(userId)
      .catch((error: unknown) => console.log(error));

    let currentThreeDate = new Date();
    let threeDaysAgoDate = new Date();
    threeDaysAgoDate.setDate(threeDaysAgoDate.getDate() - 3);
    threeDaysAgoDate.setHours(5);
    threeDaysAgoDate.setMinutes(0);
    threeDaysAgoDate.setSeconds(0);
    currentThreeDate.setHours(4);
    currentThreeDate.setMinutes(59);
    currentThreeDate.setSeconds(59);

    const dataThreeDay: any = await this.dataModel
      .find({
        user: userId,
        time: {
          $gte: threeDaysAgoDate,
          $lt: currentThreeDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    let dataThreeDayWorkingDevices = [];

    for (let i = 0; i < foundDevices.length; i++) {
      for (let j = 0; j < dataThreeDay.length; j++) {
        if (foundDevices[i].imei == dataThreeDay[j].imei) {
          dataThreeDayWorkingDevices.push(foundDevices[i]);
          break;
        }
      }
    }

    return dataThreeDayWorkingDevices;
  }

  // ! DATA DEVICES TEN DAY
  async getDataDevicesTenDay(userId: string): Promise<Data[]> {
    const foundDevices: any = await this.infoService
      .getInfoUserId(userId)
      .catch((error: unknown) => console.log(error));

    let currentTenDate = new Date();
    let tenDaysAgoDate = new Date();
    tenDaysAgoDate.setDate(tenDaysAgoDate.getDate() - 10);
    tenDaysAgoDate.setHours(5);
    tenDaysAgoDate.setMinutes(0);
    tenDaysAgoDate.setSeconds(0);
    currentTenDate.setDate(currentTenDate.getDate() - 3);
    currentTenDate.setHours(4);
    currentTenDate.setMinutes(59);
    currentTenDate.setSeconds(59);

    const dataTenDay: any = await this.dataModel
      .find({
        user: userId,
        time: {
          $gte: tenDaysAgoDate,
          $lt: currentTenDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    let dataTenDayWorkingDevices = [];

    for (let i = 0; i < foundDevices.length; i++) {
      for (let j = 0; j < dataTenDay.length; j++) {
        if (foundDevices[i].imei == dataTenDay[j].imei) {
          dataTenDayWorkingDevices.push(foundDevices[i]);
          break;
        }
      }
    }

    return dataTenDayWorkingDevices;
  }

  // ! DATA DEVICES MONTH
  async getDataDevicesMonth(userId: string): Promise<Data[]> {
    const foundDevices: any = await this.infoService
      .getInfoUserId(userId)
      .catch((error: unknown) => console.log(error));

    let currentMonthDate = new Date();
    let startMonthDate = new Date();

    startMonthDate.setMonth(startMonthDate.getMonth() - 1);
    startMonthDate.setDate(startMonthDate.getDate() - 11);
    startMonthDate.setHours(5);
    startMonthDate.setMinutes(0);
    startMonthDate.setSeconds(0);
    currentMonthDate.setDate(currentMonthDate.getDate() - 10);
    currentMonthDate.setHours(4);
    currentMonthDate.setMinutes(59);
    currentMonthDate.setSeconds(59);

    const dataMonthDay: any = await this.dataModel
      .find({
        user: userId,
        time: {
          $gte: startMonthDate,
          $lt: currentMonthDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    let dataMonthWorkingDevices = [];

    for (let i = 0; i < foundDevices.length; i++) {
      for (let j = 0; j < dataMonthDay.length; j++) {
        if (foundDevices[i].imei == dataMonthDay[j].imei) {
          dataMonthWorkingDevices.push(foundDevices[i]);
          break;
        }
      }
    }

    return dataMonthWorkingDevices;
  }

  // ! DATA DEVICES YEAR
  async getDataDevicesYear(userId: string): Promise<Data[]> {
    const foundDevices: any = await this.infoService
      .getInfoUserId(userId)
      .catch((error: unknown) => console.log(error));

    let currentYearDate = new Date();
    let startYearDate = new Date();

    startYearDate.setFullYear(startYearDate.getFullYear() - 1);
    startYearDate.setMonth(startYearDate.getMonth() - 1);
    startYearDate.setDate(startYearDate.getDate() - 11);
    startYearDate.setHours(5);
    startYearDate.setMinutes(0);
    startYearDate.setSeconds(0);
    currentYearDate.setMonth(currentYearDate.getMonth() - 1);
    currentYearDate.setDate(currentYearDate.getDate() - 11);
    currentYearDate.setHours(4);
    currentYearDate.setMinutes(59);
    currentYearDate.setSeconds(59);

    const dataYear: any = await this.dataModel
      .find({
        user: userId,
        time: {
          $gte: startYearDate,
          $lt: currentYearDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    let dataYearWorkingDevices = [];

    for (let i = 0; i < foundDevices.length; i++) {
      for (let j = 0; j < dataYear.length; j++) {
        if (foundDevices[i].imei == dataYear[j].imei) {
          dataYearWorkingDevices.push(foundDevices[i]);
          break;
        }
      }
    }

    return dataYearWorkingDevices;
  }

  // ! DATA FILTER WITH START & END
  async getDataFilter(userId: string, payload: filterDto): Promise<Data[]> {
    const startDate = new Date(payload.start);
    const endDate = new Date(payload.end);

    startDate.setHours(5);
    endDate.setHours(4);
    endDate.setMinutes(59);
    endDate.setSeconds(59);

    let filterData: any;

    if (payload.deviceName == 'All') {
      filterData = await this.dataModel.find({
        user: userId,
        time: {
          $gte: startDate,
          $lt: endDate,
        },
      });
    } else {
      filterData = await this.dataModel.find({
        user: userId,
        name: payload.deviceName,
        time: {
          $gte: startDate,
          $lt: endDate,
        },
      });
    }

    return filterData;
  }

  // ! YESTERDAY DATA
  async getYesterdayData(userId: string): Promise<YesterdayData[]> {
    return await this.yesterdayDataModel
      .find({ user: userId })
      .sort({ time: 1 });
  }

  // ! YESTERDAY DATA FOUND NAME
  async getYesterdayDataFindName(userId: string, name:string): Promise<YesterdayData[]> {
    return await this.yesterdayDataModel
      .find({ user: userId, name: name })
      .sort({ time: 1 });
  }

  // ! YESTERDAY DATA STATISTICS
  async getYesterdayDataStatistics(
    userId: string,
  ): Promise<YesterdayDataStatistic[]> {
    return await this.yesterdayDataStatisticModel
      .find({ user: userId })
      .sort({ time: 1 });
  }

  // ! YESTERDAY DATA STATISTICS FOUND NAME
  async getYesterdayDataStatisticsFoundName(
    userId: string,
    name: string
  ): Promise<YesterdayDataStatistic[]> {
    return await this.yesterdayDataStatisticModel
      .find({ user: userId, name: name })
      .sort({ time: 1 });
  }

  // ! YESTERDAY DATA STATISTICS DEVICES
  async getYesterdayDataStatisticsDevices(
    userId: string,
    time: string,
  ): Promise<YesterdayDataStatistic[]> {
    const timeArray = new Date(time).toLocaleString().split('/');

    return await this.yesterdayDataStatisticModel.find({
      user: userId,
      time: {
        $gte: `${timeArray[2].slice(0, 4)}-${timeArray[0]}-${timeArray[1]}`,
        $lt: `${timeArray[2].slice(0, 4)}-${timeArray[0]}-${
          Number(timeArray[1]) + 1
        }`,
      },
    });
  }

  // ? ADMIN ----------------------------------------------------------

  //! DATA
  async getDataAdmin(): Promise<Data[]> {
    return await this.dataModel.aggregate([{ $unset: ['_id'] }]);
  }

  //! DATA DEVICES NAME PRESENT
  async getDataDeviceNamePresentAdmin(): Promise<any[]> {
    let startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);

    let endDate = new Date();
    endDate.setUTCHours(23, 59, 59, 999);

    const allData = await this.dataModel.find({
      time: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    const devicesName: any = new Set();
    allData.filter((e) => {
      devicesName.add(e.name);
    });
    return [...devicesName];
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

  //! DATA WITH IMEI
  async getDataImeiAdmin(imei: string): Promise<Data[]> {
    let date = new Date();
    let currentPresentDate = new Date();
    currentPresentDate.setHours(5);
    currentPresentDate.setMinutes(0);
    currentPresentDate.setSeconds(0);
    date.setHours(date.getHours() + 5);

    return await this.dataModel.find({
      imei: imei,
      time: {
        $gte: currentPresentDate,
        $lt: date,
      },
    });
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
      .select(
        'imei name time windDirection rainHeight windSpeed airHumidity airTemp airPressure soilHumidity soilTemp leafHumidity leafTemp typeSensor',
      )
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
      .select(
        'imei name time windDirection rainHeight windSpeed airHumidity airTemp airPressure soilHumidity soilTemp leafHumidity leafTemp typeSensor',
      );

    return dataPresent;
  }

  //! LASTDATA
  async getLastDataAdmin(): Promise<LastData[]> {
    return await this.lastDataModel.find();
  }

  //! LASTDATA WITH IMEI
  async getLastDataImeiAdmin(imei: number): Promise<LastData[]> {
    return await this.lastDataModel.find({ imei: imei });
  }

  // ! DATA STATISTICS DEVICES
  async getDataStaticsDevicesAdmin(): Promise<any> {
    const foundDevices: any = await this.infoService
      .getInfo()
      .catch((error: unknown) => console.log(error));

    // PRESENT  DAYS
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
      .catch((error: unknown) => console.log(error));

    let dataPresentDayWorkingDevices = [];

    for (let i = 0; i < foundDevices.length; i++) {
      for (let j = 0; j < dataPresent.length; j++) {
        if (foundDevices[i].imei == dataPresent[j].imei) {
          dataPresentDayWorkingDevices.push(foundDevices[i]);
          break;
        }
      }
    }

    // THREE  DAYS
    let currentThreeDate = new Date();
    let threeDaysAgoDate = new Date();
    threeDaysAgoDate.setDate(threeDaysAgoDate.getDate() - 3);
    threeDaysAgoDate.setHours(5);
    threeDaysAgoDate.setMinutes(0);
    threeDaysAgoDate.setSeconds(0);
    currentThreeDate.setHours(4);
    currentThreeDate.setMinutes(59);
    currentThreeDate.setSeconds(59);

    const dataThreeDay: any = await this.dataModel
      .find({
        time: {
          $gte: threeDaysAgoDate,
          $lt: currentThreeDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    let dataThreeDayWorkingDevices = [];

    for (let i = 0; i < foundDevices.length; i++) {
      for (let j = 0; j < dataThreeDay.length; j++) {
        if (foundDevices[i].imei == dataThreeDay[j].imei) {
          dataThreeDayWorkingDevices.push(foundDevices[i]);
          break;
        }
      }
    }

    // TEN  DAYS
    let currentTenDate = new Date();
    let tenDaysAgoDate = new Date();
    tenDaysAgoDate.setDate(tenDaysAgoDate.getDate() - 10);
    tenDaysAgoDate.setHours(5);
    tenDaysAgoDate.setMinutes(0);
    tenDaysAgoDate.setSeconds(0);
    currentTenDate.setDate(currentTenDate.getDate() - 3);
    currentTenDate.setHours(4);
    currentTenDate.setMinutes(59);
    currentTenDate.setSeconds(59);

    const dataTenDay: any = await this.dataModel
      .find({
        time: {
          $gte: tenDaysAgoDate,
          $lt: currentTenDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    let dataTenDayWorkingDevices = [];

    for (let i = 0; i < foundDevices.length; i++) {
      for (let j = 0; j < dataTenDay.length; j++) {
        if (foundDevices[i].imei == dataTenDay[j].imei) {
          dataTenDayWorkingDevices.push(foundDevices[i]);
          break;
        }
      }
    }

    // MONTH
    let currentMonthDate = new Date();
    let startMonthDate = new Date();

    startMonthDate.setMonth(startMonthDate.getMonth() - 1);
    startMonthDate.setDate(startMonthDate.getDate() - 11);
    startMonthDate.setHours(5);
    startMonthDate.setMinutes(0);
    startMonthDate.setSeconds(0);
    currentMonthDate.setDate(currentMonthDate.getDate() - 10);
    currentMonthDate.setHours(4);
    currentMonthDate.setMinutes(59);
    currentMonthDate.setSeconds(59);

    const dataMonthDay: any = await this.dataModel
      .find({
        time: {
          $gte: startMonthDate,
          $lt: currentMonthDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    let dataMonthWorkingDevices = [];

    for (let i = 0; i < foundDevices.length; i++) {
      for (let j = 0; j < dataMonthDay.length; j++) {
        if (foundDevices[i].imei == dataMonthDay[j].imei) {
          dataMonthWorkingDevices.push(foundDevices[i]);
          break;
        }
      }
    }

    // ONE YEAR
    let currentYearDate = new Date();
    let startYearDate = new Date();

    startYearDate.setFullYear(startYearDate.getFullYear() - 1);
    startYearDate.setMonth(startYearDate.getMonth() - 1);
    startYearDate.setDate(startYearDate.getDate() - 11);
    startYearDate.setHours(5);
    startYearDate.setMinutes(0);
    startYearDate.setSeconds(0);
    currentYearDate.setMonth(currentYearDate.getMonth() - 1);
    currentYearDate.setDate(currentYearDate.getDate() - 11);
    currentYearDate.setHours(4);
    currentYearDate.setMinutes(59);
    currentYearDate.setSeconds(59);

    const dataYear: any = await this.dataModel
      .find({
        time: {
          $gte: startYearDate,
          $lt: currentYearDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    let dataYearWorkingDevices = [];

    for (let i = 0; i < foundDevices.length; i++) {
      for (let j = 0; j < dataYear.length; j++) {
        if (foundDevices[i].imei == dataYear[j].imei) {
          dataYearWorkingDevices.push(foundDevices[i]);
          break;
        }
      }
    }

    return {
      presentDay: dataPresentDayWorkingDevices.length,
      dataThreeDay: dataThreeDayWorkingDevices.length,
      dataTenDay: dataTenDayWorkingDevices.length,
      dataMonthDay: dataMonthWorkingDevices.length,
      dataYear: dataYearWorkingDevices.length,
    };
  }

  // ! DATA STATISTICS
  async getDataStaticsAdmin(): Promise<any> {
    // PRESENT  DAYS
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
      .catch((error: unknown) => console.log(error));

    // THREE  DAYS
    let currentThreeDate = new Date();
    let threeDaysAgoDate = new Date();
    threeDaysAgoDate.setDate(threeDaysAgoDate.getDate() - 3);
    threeDaysAgoDate.setHours(5);
    threeDaysAgoDate.setMinutes(0);
    threeDaysAgoDate.setSeconds(0);
    currentThreeDate.setHours(4);
    currentThreeDate.setMinutes(59);
    currentThreeDate.setSeconds(59);

    const dataThreeDay: any = await this.dataModel
      .find({
        time: {
          $gte: threeDaysAgoDate,
          $lt: currentThreeDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    // TEN  DAYS
    let currentTenDate = new Date();
    let tenDaysAgoDate = new Date();
    tenDaysAgoDate.setDate(tenDaysAgoDate.getDate() - 10);
    tenDaysAgoDate.setHours(5);
    tenDaysAgoDate.setMinutes(0);
    tenDaysAgoDate.setSeconds(0);
    currentTenDate.setDate(currentTenDate.getDate() - 3);
    currentTenDate.setHours(4);
    currentTenDate.setMinutes(59);
    currentTenDate.setSeconds(59);

    const dataTenDay: any = await this.dataModel
      .find({
        time: {
          $gte: tenDaysAgoDate,
          $lt: currentTenDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    // MONTH
    let currentMonthDate = new Date();
    let startMonthDate = new Date();

    startMonthDate.setMonth(startMonthDate.getMonth() - 1);
    startMonthDate.setDate(startMonthDate.getDate() - 11);
    startMonthDate.setHours(5);
    startMonthDate.setMinutes(0);
    startMonthDate.setSeconds(0);
    currentMonthDate.setDate(currentMonthDate.getDate() - 10);
    currentMonthDate.setHours(4);
    currentMonthDate.setMinutes(59);
    currentMonthDate.setSeconds(59);

    const dataMonthDay: any = await this.dataModel
      .find({
        time: {
          $gte: startMonthDate,
          $lt: currentMonthDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    // ONE YEAR
    let currentYearDate = new Date();
    let startYearDate = new Date();

    startYearDate.setFullYear(startYearDate.getFullYear() - 1);
    startYearDate.setMonth(startYearDate.getMonth() - 1);
    startYearDate.setDate(startYearDate.getDate() - 11);
    startYearDate.setHours(5);
    startYearDate.setMinutes(0);
    startYearDate.setSeconds(0);
    currentYearDate.setMonth(currentYearDate.getMonth() - 1);
    currentYearDate.setDate(currentYearDate.getDate() - 11);
    currentYearDate.setHours(4);
    currentYearDate.setMinutes(59);
    currentYearDate.setSeconds(59);

    const dataYear: any = await this.dataModel
      .find({
        time: {
          $gte: startYearDate,
          $lt: currentYearDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    let resultData = [
      {
        name: 'Bugungi',
        length: dataPresent.length,
      },
      {
        name: 'Uch kunlik',
        length: dataThreeDay.length,
      },
      {
        name: "O'n kunlik",
        length: dataTenDay.length,
      },
      {
        name: 'Bir oylik',
        length: dataMonthDay.length,
      },
      {
        name: 'Bir yillik',
        length: dataYear.length,
      },
    ];

    return resultData;
  }

  // ! DATA DEVICES PRESENT DAY
  async getDataDevicesPresentDayAdmin(): Promise<Data[]> {
    const foundDevices: any = await this.infoService
      .getInfo()
      .catch((error: unknown) => console.log(error));

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
      .catch((error: unknown) => console.log(error));

    let dataPresentDayWorkingDevices = [];

    for (let i = 0; i < foundDevices.length; i++) {
      for (let j = 0; j < dataPresent.length; j++) {
        if (foundDevices[i].imei == dataPresent[j].imei) {
          dataPresentDayWorkingDevices.push(foundDevices[i]);
          break;
        }
      }
    }

    return dataPresentDayWorkingDevices;
  }

  // ! DATA DEVICES THREE DAY
  async getDataDevicesThreeDayAdmin(): Promise<Data[]> {
    const foundDevices: any = await this.infoService
      .getInfo()
      .catch((error: unknown) => console.log(error));

    let currentThreeDate = new Date();
    let threeDaysAgoDate = new Date();
    threeDaysAgoDate.setDate(threeDaysAgoDate.getDate() - 3);
    threeDaysAgoDate.setHours(5);
    threeDaysAgoDate.setMinutes(0);
    threeDaysAgoDate.setSeconds(0);
    currentThreeDate.setHours(4);
    currentThreeDate.setMinutes(59);
    currentThreeDate.setSeconds(59);

    const dataThreeDay: any = await this.dataModel
      .find({
        time: {
          $gte: threeDaysAgoDate,
          $lt: currentThreeDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    let dataThreeDayWorkingDevices = [];

    for (let i = 0; i < foundDevices.length; i++) {
      for (let j = 0; j < dataThreeDay.length; j++) {
        if (foundDevices[i].imei == dataThreeDay[j].imei) {
          dataThreeDayWorkingDevices.push(foundDevices[i]);
          break;
        }
      }
    }

    return dataThreeDayWorkingDevices;
  }

  // ! DATA DEVICES TEN DAY
  async getDataDevicesTenDayAdmin(): Promise<Data[]> {
    const foundDevices: any = await this.infoService
      .getInfo()
      .catch((error: unknown) => console.log(error));

    let currentTenDate = new Date();
    let tenDaysAgoDate = new Date();
    tenDaysAgoDate.setDate(tenDaysAgoDate.getDate() - 10);
    tenDaysAgoDate.setHours(5);
    tenDaysAgoDate.setMinutes(0);
    tenDaysAgoDate.setSeconds(0);
    currentTenDate.setDate(currentTenDate.getDate() - 3);
    currentTenDate.setHours(4);
    currentTenDate.setMinutes(59);
    currentTenDate.setSeconds(59);

    const dataTenDay: any = await this.dataModel
      .find({
        time: {
          $gte: tenDaysAgoDate,
          $lt: currentTenDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    let dataTenDayWorkingDevices = [];

    for (let i = 0; i < foundDevices.length; i++) {
      for (let j = 0; j < dataTenDay.length; j++) {
        if (foundDevices[i].imei == dataTenDay[j].imei) {
          dataTenDayWorkingDevices.push(foundDevices[i]);
          break;
        }
      }
    }

    return dataTenDayWorkingDevices;
  }

  // ! DATA DEVICES MONTH
  async getDataDevicesMonthAdmin(): Promise<Data[]> {
    const foundDevices: any = await this.infoService
      .getInfo()
      .catch((error: unknown) => console.log(error));

    let currentMonthDate = new Date();
    let startMonthDate = new Date();

    startMonthDate.setMonth(startMonthDate.getMonth() - 1);
    startMonthDate.setDate(startMonthDate.getDate() - 11);
    startMonthDate.setHours(5);
    startMonthDate.setMinutes(0);
    startMonthDate.setSeconds(0);
    currentMonthDate.setDate(currentMonthDate.getDate() - 10);
    currentMonthDate.setHours(4);
    currentMonthDate.setMinutes(59);
    currentMonthDate.setSeconds(59);

    const dataMonthDay: any = await this.dataModel
      .find({
        time: {
          $gte: startMonthDate,
          $lt: currentMonthDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    let dataMonthWorkingDevices = [];

    for (let i = 0; i < foundDevices.length; i++) {
      for (let j = 0; j < dataMonthDay.length; j++) {
        if (foundDevices[i].imei == dataMonthDay[j].imei) {
          dataMonthWorkingDevices.push(foundDevices[i]);
          break;
        }
      }
    }

    return dataMonthWorkingDevices;
  }

  // ! DATA DEVICES YEAR
  async getDataDevicesYearAdmin(): Promise<Data[]> {
    const foundDevices: any = await this.infoService
      .getInfo()
      .catch((error: unknown) => console.log(error));

    let currentYearDate = new Date();
    let startYearDate = new Date();

    startYearDate.setFullYear(startYearDate.getFullYear() - 1);
    startYearDate.setMonth(startYearDate.getMonth() - 1);
    startYearDate.setDate(startYearDate.getDate() - 11);
    startYearDate.setHours(5);
    startYearDate.setMinutes(0);
    startYearDate.setSeconds(0);
    currentYearDate.setMonth(currentYearDate.getMonth() - 1);
    currentYearDate.setDate(currentYearDate.getDate() - 11);
    currentYearDate.setHours(4);
    currentYearDate.setMinutes(59);
    currentYearDate.setSeconds(59);

    const dataYear: any = await this.dataModel
      .find({
        time: {
          $gte: startYearDate,
          $lt: currentYearDate,
        },
      })
      .catch((error: unknown) => console.log(error));

    let dataYearWorkingDevices = [];

    for (let i = 0; i < foundDevices.length; i++) {
      for (let j = 0; j < dataYear.length; j++) {
        if (foundDevices[i].imei == dataYear[j].imei) {
          dataYearWorkingDevices.push(foundDevices[i]);
          break;
        }
      }
    }

    return dataYearWorkingDevices;
  }

  // ! DATA FILTER WITH START & END
  async getDataFilterAdmin(payload: filterDto): Promise<Data[]> {
    const startDate = new Date(payload.start);
    const endDate = new Date(payload.end);

    startDate.setHours(5);
    endDate.setHours(4);
    endDate.setMinutes(59);
    endDate.setSeconds(59);

    let filterData: any;

    if (payload.deviceName == 'All') {
      filterData = await this.dataModel.find({
        time: {
          $gte: startDate,
          $lt: endDate,
        },
      });
    } else {
      filterData = await this.dataModel.find({
        name: payload.deviceName,
        time: {
          $gte: startDate,
          $lt: endDate,
        },
      });
    }

    return filterData;
  }

  // ! YESTERDAY DATA
  async getYesterdayDataAdmin(): Promise<YesterdayData[]> {
    return await this.yesterdayDataModel.find().sort({ time: 1 });
  }

  // ! YESTERDAY DATA FOUND NAME
  async getYesterdayDataFoundNameAdmin(name: string): Promise<YesterdayData[]> {
    return await this.yesterdayDataModel.find({ name: name }).sort({ time: 1 });
  }

  // ! YESTERDAY DATA STATISTICS
  async getYesterdayDataStatisticsAdmin(): Promise<YesterdayDataStatistic[]> {
    return await this.yesterdayDataStatisticModel.find().sort({ time: 1 });
  }

  // ! YESTERDAY DATA STATISTICS FOUND NAME
  async getYesterdayDataStatisticsFoundNameAdmin(name: string): Promise<YesterdayDataStatistic[]> {
    return await this.yesterdayDataStatisticModel
      .find({ name: name })
      .sort({ time: 1 });
  }

  // ! YESTERDAY DATA STATISTICS DEVICES
  async getYesterdayDataStatisticsDevicesAdmin(
    time: string,
  ): Promise<YesterdayDataStatistic[]> {
    const timeArray = new Date(time).toLocaleString().split('/');

    return await this.yesterdayDataStatisticModel.find({
      time: {
        $gte: `${timeArray[2].slice(0, 4)}-${timeArray[0]}-${timeArray[1]}`,
        $lt: `${timeArray[2].slice(0, 4)}-${timeArray[0]}-${
          Number(timeArray[1]) + 1
        }`,
      },
    });
  }
}
