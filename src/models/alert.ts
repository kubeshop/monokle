export enum AlertEnum {
  Message,
  Error
}

export type AlertType = {
  title: string,
  message: string,
  type: AlertEnum
}
