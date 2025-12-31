export interface LoggingDataModel {
  name: string;
  email: string;
  password: string;
  isRegistring: boolean;
  confirmPassword: string;
}

export interface MsgLogin {
  message: string;
  isError: boolean;
}
