import { getCurrentBranch } from '@shared/git';
import { checkBranchChanged, checkWorkingTreeClean, getReleaseBranches, updateTargetBranch } from './git';
import { checkForVersionUpgrade, pickReleaseBranch } from './queries';

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

  logger.debug(`${currentBranch} ➔ ${targetBranch}`);

  try {
    await updateTargetBranch(logger, currentBranch, targetBranch);
  } catch (error) {
    checkBranchChanged(logger, currentBranch);
    throw error;
  }
  
  logger.info('Done :)');
};
