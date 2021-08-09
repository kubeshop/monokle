/**
 * For displaying alerts - any action payload containing an alert object of the below type will automatically
 * be displayed - see the alert reducer
 */

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
