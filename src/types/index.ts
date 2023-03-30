export interface CustomeRequest extends Request {
  userId: string;
}

export interface IMqttConnectOptions {
  clean: boolean;
  connectTimeout: number;
  host: string;
  port: number;
  username: string;
  password: string;
}