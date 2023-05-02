export class Signal<T = void> {
  public promise: Promise<T>;
  public isResolved: boolean = false;
  private _resolve!: (value: T | PromiseLike<T>) => void;
  public reject!: (reason?: any) => void;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this.reject = reject;
    });
  }

  resolve(value: T | PromiseLike<T>) {
    this.isResolved = true;
    this._resolve(value);
  }
}
