export const api = (url: string, props?: any) => {
  return fetch(`https://api.github.com${url}`, {body: JSON.stringify(props)});
};
