import { Logger } from '@caporal/core';
import { runCommand } from '@shared/func';
import { checkoutBranch, getBranches, getCurrentBranch, isWorkingTreeClean } from '@shared/git';
import { prompt } from 'inquirer';
import { exit } from 'process';

async function getReleaseBranches(branchPattern: string): Promise<string[]> {
  const branches = await getBranches();
  return branches.filter(b => b.startsWith(branchPattern));
}

async function pickReleaseBranch(branches: string[]): Promise<string> {
  const questions = [{
    type: 'list',
    name: 'branch',
    choices: branches,
    message: 'Which branch should be pushed?'
  }];

  return (await prompt(questions))['branch'];
}

async function checkForVersionUpgrade(logger: Logger): Promise<void> {
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

async function checkWorkingTreeClean(): Promise<void> {
  const workingTreeClean = await isWorkingTreeClean();
  
  if (!workingTreeClean) {
    throw new Error('Working tree not clean!');
  }
}

async function checkoutBranchLog(logger: Logger, branch: string): Promise<void> {
  logger.debug(`Checking out branch "${branch}"`);
  await checkoutBranch(branch);
}

async function updateTargetBranch(logger: Logger, currentBranch: string, targetBranch: string): Promise<void> {
  await checkoutBranchLog(logger, targetBranch);

  logger.info(`Overwriting branch "${targetBranch}" with "${currentBranch}"`);
  await runCommand('git', [ 'reset', '--hard', currentBranch ]);

  logger.info(`Force pushing branch ${targetBranch}`);
  await runCommand('git', [ 'push', '-f' ]);

  await checkoutBranchLog(logger, currentBranch);
}

export const runAction = async ({ logger, options }): Promise<void> => {
  const { branchPattern } = options;

  const branches = await getReleaseBranches(branchPattern);
  if (branches.length === 0) {
    throw new Error('No release branches!');
  }

  const targetBranch = await pickReleaseBranch(branches);
  const currentBranch = await getCurrentBranch();

  if (targetBranch === currentBranch) {
    throw new Error('Current branch = target branch!');
  }

  await checkForVersionUpgrade(logger);
  await checkWorkingTreeClean();

  logger.debug(`Current branch: ${currentBranch}`);
  logger.debug(`Target branch: ${targetBranch}`);

  await updateTargetBranch(logger, currentBranch, targetBranch);

  logger.info('Done :)');
};
