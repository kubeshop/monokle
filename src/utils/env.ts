// weird workaround to get all ENV values (accessing process.env directly only returns a subset)
// export const PROCESS_ENV = JSON.parse(JSON.stringify(process)).env;
export const PROCESS_ENV = process.env;
