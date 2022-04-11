/* eslint no-promise-executor-return: "off" */

export const sleep = (ms: number) => new Promise(resolve => setTimeout(() => resolve(null), ms));
