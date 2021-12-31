import { Logger } from '@caporal/core';
import { runCommand } from '@shared/func';
import { checkoutBranch, getBranches, getCurrentBranch, isWorkingTreeClean } from '@shared/git';

export async function getReleaseBranches(branchPattern: string): Promise<string[]> {
  const branches = await getBranches();
  return branches.filter(b => b.startsWith(branchPattern));
}

export async function checkBranchExists(branch: string): Promise<void> {
  const branches = await getBranches();

  if (!branches.includes(branch)) {
    throw new Error(`"${branch}" is no known branch! Available branches: ${branches.map(b => '"' + b + '"').join(', ')}`)
  }
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

/**
 * Compares the current branch with the branch that was current, before any git operations were run
 * and logs a warning if it changed.
 */
export async function checkBranchChanged(logger: Logger, previousBranch: string): Promise<void> {
  const currentBranch = await getCurrentBranch();

  if (currentBranch !== previousBranch) {
    logger.warn(`Branch changed! Now on "${currentBranch}" (Previously: "${previousBranch}")`);
  }
}
