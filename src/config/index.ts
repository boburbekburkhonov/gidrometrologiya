import { ConfigModuleOptions } from '@nestjs/config/dist';
import { AppConfig } from './app';

export const config: ConfigModuleOptions = {
  load: [AppConfig],
  isGlobal: true,
  cache: true,
};
