/* eslint-disable import/first */
/* eslint-disable import/order */
import moduleAlias from 'module-alias';
import additionalEnvironmentVariables from './env.json';

Object.keys(additionalEnvironmentVariables).forEach((key: string) => {
  // @ts-ignore
  process.env[key] = additionalEnvironmentVariables[key];
});

moduleAlias.addAliases({
  '@constants': `${__dirname}/../src/constants`,
  '@redux': `${__dirname}/../src/redux`,
  '@utils': `${__dirname}/../src/utils`,
  '@shared': `${__dirname}/../src/shared`,
  '@src': `${__dirname}/../src/`,
  '@root': `${__dirname}/../`,
});

/*
  NOTE: This must be imported after the aliases are created
  Prettier is disabled in this file in order to keep this import where it needs to be.
*/
import './app';
