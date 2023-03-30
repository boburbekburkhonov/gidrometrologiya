import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mqtt from 'mqtt';
import { IMqttConnectOptions } from '../../types';
import { InfoService } from 'src/modules/info/info.service';
import { Model } from 'mongoose';
import { Data, dataDocument } from './schemas/data.schema';
import { LastData, lastDataDocument } from './schemas/lastData.schema';

@Injectable()
export class MqttService implements OnModuleInit {
  constructor(
    private readonly infoService: InfoService,
    @InjectModel(Data.name, 'Data')
    private readonly dataModel: Model<dataDocument>,
    @InjectModel(LastData.name, 'LastData')
    private readonly lastDataModel: Model<lastDataDocument>,
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
        const data = JSON.parse(payload);

        if (data.ts) {
          const existingInfo = await this.infoService.getInfoImei(data.i);

          if (existingInfo) {
            const timeData = new Date(
              `${Number(data.t.split('/')[0]) + 2000}-${
                data.t.split('/')[1]
              }-${data.t.split('/')[2].slice(0, 2)} ${data.t
                .split('/')[2]
                .slice(3, 14)}`,
            );

            const foundData: any = await this.dataModel
              .find({ imei: data.i })
              .catch((error: unknown) => console.log(error));

            const [filterData] = foundData.filter(
              (e: any) => timeData.getTime() == e.time.getTime(),
            );

            if (!filterData) {
              const newData = new this.dataModel({
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
              });

              await newData
                .save()
                .catch((error: unknown) => console.log(error));

              const existingLastData = await this.lastDataModel
                .findOne({ imei: data.i })
                .catch((error: unknown) => console.log(error));

              if (existingLastData) {
                await this.lastDataModel
                  .findOneAndUpdate(
                    { imei: data.i },
                    {
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
                    },
                  )
                  .catch((error: unknown) => console.log(error));
              } else {
                const newLastData = new this.lastDataModel({
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
                });

                await newLastData
                  .save()
                  .catch((error: unknown) => console.log(error));
              }
            }
          }
        }
      },
    );
  }
}
