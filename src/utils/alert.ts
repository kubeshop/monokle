import {AlertEnum, AlertType} from '@models/alert';

export function errorAlert(title: string, message?: string): AlertType {
  return createAlert(AlertEnum.Error, title, message);
}

export function successAlert(title: string, message?: string): AlertType {
  return createAlert(AlertEnum.Success, title, message);
}

export function infoAlert(title: string, message?: string): AlertType {
  return createAlert(AlertEnum.Info, title, message);
}

export function warningAlert(title: string, message?: string): AlertType {
  return createAlert(AlertEnum.Warning, title, message);
}

export function createAlert(type: AlertEnum, title: string, message?: string): AlertType {
  return {
    type,
    title,
    message: message || '',
  };
}
