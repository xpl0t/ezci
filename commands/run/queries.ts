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

export async function checkForVersionUpgrade(logger: Logger, initialBranch: string, targetBranch: string): Promise<void> {
  const questions = [{
    type: 'list',
    name: 'version',
    choices: [ 'no', 'yes' ],
    message: `This action will overwrite "${targetBranch}" with "${initialBranch}" and force push "${targetBranch}" to the remote.\nAre you sure to proceed?`
  }];

  const res = (await prompt(questions))['version'];
  if (res !== 'yes') {
    logger.info('Let\'s check everything first :)');
    exit(0);
  }
}
