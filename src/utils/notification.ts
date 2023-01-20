const enhanceErrorMessage = (message: string) => {
  const isUnauthorizedError = message.toLowerCase().includes('unauthorized');

  if (isUnauthorizedError) {
    return `We're sorry, it looks like you're not authorized to connect to this cluster. Please take a look at our [troubleshooting guide for cluster connections in our documentation](https://kubeshop.github.io/monokle/cluster-issues/) for steps on how to resolve this issue.\n\n
      
        Error:\n
        ${message}`;
  }

  return message;
};

export default enhanceErrorMessage;
