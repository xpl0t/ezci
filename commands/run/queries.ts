import { Logger } from '@caporal/core';
import { confirm, select } from '@inquirer/prompts';
import { exit } from 'process';
import { getReleaseBranches } from './git';

export async function pickReleaseBranch(branchPattern: string): Promise<string> {
  const branches = await getReleaseBranches(branchPattern);
  if (branches.length === 0) {
    throw new Error('No release branches!');
  }

  return await select({
    message: 'Which branch should be pushed?',
    choices: branches.map(b => ({ value: b }))
  });
}

export async function checkForVersionUpgrade(logger: Logger, initialBranch: string, targetBranch: string): Promise<void> {
  const res = await confirm({
    message: `This action will overwrite "${targetBranch}" with "${initialBranch}" and force push "${targetBranch}" to the remote.\nAre you sure to proceed?`,
    default: true
  });

  if (!res) {
    logger.info('Aborting...');
    exit(0);
  }
}
