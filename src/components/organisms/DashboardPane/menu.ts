export interface IMenu {
  key: string;
  label: string;
  icon?: string;
  order?: number;
  resourceCount?: number;
  errorCount?: number;
  children?: IMenu[];
}
