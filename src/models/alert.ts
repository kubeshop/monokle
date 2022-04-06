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

export enum ExtraContentType {
  Telemetry = 1,
}

export type AlertState = {
  alert?: AlertType;
};

export type AlertType = {
  id?: string;
  title: string;
  message: string;
  type: AlertEnum;
  hasSeen?: boolean;
  createdAt?: number;
  duration?: number | null;
  extraContentType?: ExtraContentType;
};
