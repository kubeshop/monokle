import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

import {generateSchema} from './generate-schema';

/**
 * Example of how to run the script"
 *    npm run custom-script -- generate-schema --kind="NetworkPolicy"
 */

yargs(hideBin(process.argv))
  .command(
    'generate-schema',
    'generate ui & form schema',
    yargsCli => {
      yargsCli.option('kind', {describe: 'The kind to generate', demandOption: true});
    },
    (argv: any) => {
      generateSchema(argv.kind);
    }
  )
  .demandCommand(1)
  .parse();
