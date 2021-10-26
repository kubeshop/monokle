export const debounceWithPreviousArgs = (fn: Function, wait: number) => {
  let timer: any;
  let argsArray: Array<any> = [];
  return (...args: any) => {
    if (timer) {
      clearTimeout(timer);
    }
    argsArray.push({...args});
    timer = setTimeout(() => {
      fn([...argsArray]);
      argsArray = [];
    }, wait);
  };
};
