import { prompt } from 'inquirer';
import { Logger } from '@caporal/core';
import { exit } from 'process';

export async function pickReleaseBranch(branches: string[]): Promise<string> {
  const questions = [{
    type: 'list',
    name: 'branch',
    choices: branches,
    message: 'Which branch should be pushed?'
  }];

  return (await prompt(questions))['branch'];
}

export async function checkForVersionUpgrade(logger: Logger): Promise<void> {
  const questions = [{
    type: 'list',
    name: 'version',
    choices: [ 'no', 'yes' ],
    message: 'Did you update the version/are you sure to run the pipeline?'
  }];

  const res = (await prompt(questions))['version'];
  if (res !== 'yes') {
    logger.info('Let\'s check everything first :)');
    exit(0);
  }
}
