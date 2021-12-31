import { prompt } from 'inquirer';
import { Logger } from '@caporal/core';
import { exit } from 'process';
import { getReleaseBranches } from './git';

export async function pickReleaseBranch(branchPattern: string): Promise<string> {
  const branches = await getReleaseBranches(branchPattern);
  if (branches.length === 0) {
    throw new Error('No release branches!');
  }

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
