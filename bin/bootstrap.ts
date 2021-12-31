import { program } from '@caporal/core';
import { runAction } from '../commands/run/run';
import { description, name, version } from '../package.json';

export const bootstrap = async (): Promise<void> => {
  program
    .name(name)
    .version(version)
    .description(description)
    .command('run', 'Run CI pipeline', {})
    .option('--branch, -b [branch]', 'Release branch to use')
    .option('--branch-pattern, -p [branch-pattern]', 'Pattern of branches hooked to CI triggers', { default: 'release/' })
    .action(runAction);

  await program.run();
};
