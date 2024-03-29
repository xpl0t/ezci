import { Logger } from '@caporal/core';
import { runCommand } from '../../shared/func';
import { getBranches, isWorkingTreeClean, checkoutBranch, getCurrentBranch, getRemoteBranches } from '../../shared/git';

export async function getReleaseBranches(branchPattern: string): Promise<string[]> {
  const branches = await getBranches();
  const remoteBranches = await getRemoteBranches();

  const allBranches = [ ...new Set([ ...branches, ...remoteBranches ]) ];
  return allBranches.filter(b => b.startsWith(branchPattern));
}

export async function checkBranchExists(branch: string, checkRemote: boolean = false): Promise<void> {
  const branches = await getBranches();

  if (checkRemote) {
    branches.push(...await getRemoteBranches());
  }

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
 * Compares the current branch with the initial branch and logs a warning if it changed (Indicates misbehaviour).
 */
export async function checkBranchChanged(logger: Logger, initialBranch: string): Promise<void> {
  const currentBranch = await getCurrentBranch();

  if (currentBranch !== initialBranch) {
    logger.warn(`Branch changed! Now on "${currentBranch}" (Previously: "${initialBranch}")`);
  }
}
