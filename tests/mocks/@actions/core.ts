export const info = (message: unknown): void => {
  console.log(message);
};

export const warning = (message: unknown, ...properties: unknown[]): void => {
  console.warn(message, ...properties);
};

export const error = (message: unknown, ...properties: unknown[]): void => {
  console.error(message, ...properties);
};

export const group = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  console.log(name);
  return fn();
};

export const startGroup = (name: string): void => {
  console.log(name);
};

export const endGroup = (): void => { /* empty */ };

export const setFailed = (message: unknown): void => {
  console.error(message);
};

export const setOutput = (name: string, value: unknown): void => {
  console.log(name, value);
};

export const getInput = (name: string): string => process.env[name] ?? '';
