import { getCurrentBranch } from '@shared/git';
import { checkBranchChanged, checkBranchExists, checkWorkingTreeClean, updateTargetBranch } from './git';
import { checkForVersionUpgrade, pickReleaseBranch } from './queries';

export const runAction = async ({ logger, options }): Promise<void> => {
  const currentBranch = await getCurrentBranch();
  const { branchPattern } = options;
  let { branch } = options;

  if (branch == null) {
    branch = await pickReleaseBranch(branchPattern);
  }

  if (branch === currentBranch) {
    throw new Error('Current branch = target branch!');
  }

  await checkBranchExists(branch);
  await checkForVersionUpgrade(logger);
  await checkWorkingTreeClean();

  logger.debug(`${currentBranch} ➔ ${branch}`);

  try {
    await updateTargetBranch(logger, currentBranch, branch);
  } catch (error) {
    checkBranchChanged(logger, currentBranch);
    throw error;
  }
  
  logger.info('Done :)');
};
