#!/usr/bin/env node
import { program } from '@caporal/core';
import { runAction } from '../commands/run/run';
import { description, name, version } from '../package.json';

const bootstrap = (): void => {
  program
    .name(name)
    .version(version)
    .description(description)
    .command('run', 'Run CI pipeline', {})
    .option('--branch-pattern, -p [branch-pattern]', 'Pattern of branches hooked to CI triggers', { default: 'release/' })
    .action(runAction);

  program.run();
};

bootstrap();
