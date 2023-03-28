import { registerAs } from '@nestjs/config';

interface IAppConfig {
  readonly host: string;
  readonly port: number;
}

export const AppConfig = registerAs(
  'app',
  (): IAppConfig => ({
    host: process.env.APP_HOST ? String(process.env.APP_HOST) : undefined,
    port: process.env.APP_PORT ? Number(process.env.APP_PORT) : undefined,
  }),
);
