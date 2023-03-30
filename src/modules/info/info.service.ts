import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Info, infoDocument } from './schemas/info.schema';
import { Model } from 'mongoose';
import { createDto } from './dto/create.dto';
import { updateDto } from './dto/update.dto';
import { NotFoundException } from '@nestjs/common/exceptions';

@Injectable()
export class InfoService {
  constructor(
    @InjectModel(Info.name, 'Info')
    private readonly infoModel: Model<infoDocument>,
  ) {}

  async getInfoImei(imei: string): Promise<Info> {
    return await this.infoModel.findOne({ imei: imei });
  }

  async getInfo(): Promise<Info[]> {
    return await this.infoModel.find();
  }

  async createInfo(payload: createDto): Promise<Info> {
    const existingInfo = await this.infoModel.findOne({ imei: payload.imei });

    if (existingInfo) {
      throw new HttpException('Info already exists', HttpStatus.OK);
    }

    if (!payload.reservoirId) {
      payload.reservoirId = '';
    }

    const newInfo = new this.infoModel(payload);
    return await newInfo.save();
  }

  async updateInfo(id: string, payload: updateDto): Promise<Info> {
    const existingInfo = await this.infoModel
      .findByIdAndUpdate({ _id: id }, payload)
      .catch((err: unknown) => {
        throw new NotFoundException('Info not found');
      });

    return existingInfo;
  }

  async deleteInfo(id: string): Promise<Info> {
    const existingInfo = await this.infoModel
      .findByIdAndDelete({ _id: id })
      .catch((err: unknown) => {
        throw new NotFoundException('Info not found');
      });

    return existingInfo;
  }
}
