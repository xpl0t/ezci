import { getCurrentBranch } from '@shared/git';
import { checkWorkingTreeClean, getReleaseBranches, updateTargetBranch } from './git';
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

  logger.debug(`Current branch: ${currentBranch}`);
  logger.debug(`Target branch: ${targetBranch}`);

  await updateTargetBranch(logger, currentBranch, targetBranch);

  logger.info('Done :)');
};
