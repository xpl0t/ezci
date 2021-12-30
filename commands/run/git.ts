import { Logger } from '@caporal/core';
import { runCommand } from '@shared/func';
import { checkoutBranch, getBranches, isWorkingTreeClean } from '@shared/git';

export async function getReleaseBranches(branchPattern: string): Promise<string[]> {
  const branches = await getBranches();
  return branches.filter(b => b.startsWith(branchPattern));
}

export async function checkWorkingTreeClean(): Promise<void> {
  const workingTreeClean = await isWorkingTreeClean();
  
  if (!workingTreeClean) {
    throw new Error('Working tree not clean!');
  }
}

export async function checkoutBranchLog(logger: Logger, branch: string): Promise<void> {
  logger.debug(`Checking out branch "${branch}"`);
  await checkoutBranch(branch);
}

export async function updateTargetBranch(logger: Logger, currentBranch: string, targetBranch: string): Promise<void> {
  await checkoutBranchLog(logger, targetBranch);

  logger.info(`Overwriting branch "${targetBranch}" with "${currentBranch}"`);
  await runCommand('git', [ 'reset', '--hard', currentBranch ]);

  logger.info(`Force pushing branch ${targetBranch}`);
  await runCommand('git', [ 'push', '-f' ]);

  await checkoutBranchLog(logger, currentBranch);
}
