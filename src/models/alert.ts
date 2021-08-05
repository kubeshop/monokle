export enum AlertEnum {
  Success,
  Info,
  Warning,
  Error,
}

export type AlertState = {
  alert?: AlertType;
};

export type AlertType = {
  title: string;
  message: string;
  type: AlertEnum;
};
