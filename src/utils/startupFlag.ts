export enum StartupFlags {
  AUTOMATION = 'automation',
}

export class StartupFlag {
  private static _instance: StartupFlag;

  private _automationFlag = false;

  // eslint-disable-next-line no-useless-constructor,no-empty-function
  private constructor() {}

  public static getInstance(): StartupFlag {
    if (!StartupFlag._instance) {
      StartupFlag._instance = new StartupFlag();
    }

    return StartupFlag._instance;
  }

  get hasAutomationFlag(): boolean {
    return this._automationFlag;
  }

  set automationFlag(value: boolean) {
    this._automationFlag = value;
  }
}
